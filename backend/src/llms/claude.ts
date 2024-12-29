import { TextBlock } from "@anthropic-ai/sdk/resources";
import { Message, Repo } from "../db/repo";
import { LLMEnum } from "../types/llm";
import { Prompt, PromptRole } from "../types/prompt";
import { NoResponse, PromptResponse } from "../types/prompt-response";
import { ChatterLLMTemplate } from "./chatter-llm-template";
import { LLM } from "./llm.interface";
import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_VERSIONS = [
    "claude-3-5-sonnet-20240620",
    "claude-3-opus-20240229",
];
export const CLAUDE_DEFAULT_VERSION = "claude-3-5-sonnet-20240620";

// todo: fix code duplication
export class Claude implements LLM {
    private llmName = LLMEnum.CLAUDE;
    private anthropic: Anthropic;
    private chatterLLMTemplate: ChatterLLMTemplate;
    private version: string;

    constructor(repo: Repo, version: string) {
        const apiKey = process.env.CLAUDE_API_KEY;
        this.anthropic = new Anthropic({
            apiKey: apiKey,
        });
        this.chatterLLMTemplate = new ChatterLLMTemplate(repo);
        this.version = version;
    }

    async ask(prompt: Prompt): Promise<PromptResponse> {
        try {
            const response = await this.anthropic.messages.create({
                model: this.version,
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
                model: this.version,
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

    async *chatStream(
        prompt: Prompt,
        chatID?: string,
    ): AsyncGenerator<PromptResponse> {
        const getAPIRole = (role: PromptRole): "assistant" | "user" => {
            switch (role) {
                case PromptRole.MODEL:
                    return "assistant";
                case PromptRole.USER:
                    return "user";
                default:
                    throw new Error("Invalid role");
            }
        };
        const version = this.version;
        const client = this.anthropic;
        const streamResponse = await this.chatterLLMTemplate.chatStream(
            this.llmName,
            prompt,
            {
                execute: async function* (
                    history: Message[],
                ): AsyncGenerator<PromptResponse> {
                    const messages = history.map((msg) => {
                        return {
                            role: getAPIRole(msg.role),
                            content: msg.message,
                        };
                    });

                    // append latest prompt
                    messages.push({
                        role: getAPIRole(PromptRole.USER),
                        content: prompt.message,
                    });

                    const response = client.messages.stream({
                        model: version,
                        messages: messages,
                        stream: true,
                        max_tokens: 4096,
                    });
                    for await (const chunk of response) {
                        if (chunk.type === "content_block_delta") {
                            const text = (chunk as any).delta.text;
                            yield {
                                response: text,
                            };
                        }
                    }
                },
            },
            chatID,
        );
        for await (const response of streamResponse) {
            yield response;
        }
    }
}
