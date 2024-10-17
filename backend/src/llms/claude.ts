import { Prompt } from "../types/prompt";
import { NoResponse, PromptResponse } from "../types/prompt-response";
import { LLM } from "./llm.interface";
import Anthropic from "@anthropic-ai/sdk";
import { TextBlock } from "@anthropic-ai/sdk/resources";

// todo: fix code duplication

export class Claude implements LLM {
    anthropic: Anthropic;
    constructor() {
        const apiKey = process.env.CLAUDE_API_KEY;

        this.anthropic = new Anthropic({
            apiKey: apiKey,
        });
    }

    async ask(prompt: Prompt): Promise<PromptResponse> {
        try {
            const response = await this.anthropic.messages.create({
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 1024,
                messages: [{ role: "user", content: prompt.message }],
            });
            if (response.content.length === 0) {
                console.error("No response from Claude", response);
                return NoResponse;
            }
            const msg = (response.content[0] as TextBlock).text;
            return {
                response: msg,
            };
        } catch (error) {
            console.error("error while generating claude response", error);
            return NoResponse;
        }
    }

    async *askStream(prompt: Prompt): AsyncGenerator<PromptResponse> {
        try {
            const response = this.anthropic.messages.stream({
                model: "claude-3-5-sonnet-20240620",
                messages: [{ role: "user", content: prompt.message }],
                max_tokens: 1024,
                stream: true,
            });

            for await (const chunk of response) {
                if (chunk.type === "content_block_delta") {
                    const text = (chunk as any).delta.text;
                    yield {
                        response: text,
                    };
                }
            }
        } catch (error) {
            console.error("error while generating claude response", error);
            return NoResponse;
        }
    }
}
