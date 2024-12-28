import Anthropic from "@anthropic-ai/sdk";
import { Message, Repo } from "../db/repo";
import { LLMEnum } from "../types/llm";
import { Prompt, PromptRole } from "../types/prompt";
import { NoResponse, PromptResponse } from "../types/prompt-response";
import { ChatterLLMTemplate } from "./chatter-llm-template";
import { LLM } from "./llm.interface";
import ollama from "ollama";

export const LLAMA_VERSIONS = ["llama3.2"];
export const LLAMA_DEFAULT_VERSION = "llama3.2";

// todo: remove code duplication
export class Llama implements LLM {
    private llmName = LLMEnum.LLAMA;
    private anthropic: Anthropic;
    private chatterLLMTemplate: ChatterLLMTemplate;
    private readonly version: string;

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
            const response = await ollama.chat({
                model: this.version,
                messages: [{ role: "user", content: prompt.message }],
            });
            return {
                response: response.message.content,
            };
        } catch (error) {
            console.error("error while generating ollama response", error);
            return NoResponse;
        }
    }

    async *askStream(prompt: Prompt): AsyncGenerator<PromptResponse> {
        try {
            const response = await ollama.chat({
                model: this.version,
                messages: [{ role: "user", content: prompt.message }],
                stream: true,
            });
            for await (const resp of response) {
                yield {
                    response: resp.message.content,
                };
            }
        } catch (error) {
            console.error("error while generating ollama response", error);
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

                    const response = await ollama.chat({
                        model: version,
                        messages: messages,
                        stream: true,
                    });
                    for await (const resp of response) {
                        yield {
                            response: resp.message.content,
                        };
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
