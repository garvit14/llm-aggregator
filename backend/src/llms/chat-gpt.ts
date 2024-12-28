import { Content, GoogleGenerativeAIFetchError } from "@google/generative-ai";
import { Prompt, PromptRole } from "../types/prompt";
import { NoResponse, PromptResponse } from "../types/prompt-response";
import { LLM } from "./llm.interface";
import OpenAI from "openai";

import { LLMEnum } from "../types/llm";
import { Message, Repo } from "../db/repo";
import { ChatterLLMTemplate } from "./chatter-llm-template";

// todo: remove code duplication

// const apiKey = process.env.CHATGPT_API_KEY;

// const client = new OpenAI({
//   apiKey: apiKey,
// });

export const CHATGPT_VERSIONS = ["gpt-4o"];
export const CHATGPT_DEFAULT_VERSION = "gpt-4o";

export class ChatGPT implements LLM {
    private llmName = LLMEnum.CHATGPT;
    private client: OpenAI;
    private chatterLLMTemplate: ChatterLLMTemplate;
    private readonly version: string;

    constructor(repo: Repo, version: string) {
        const apiKey = process.env.CHATGPT_API_KEY;
        this.client = new OpenAI({
            apiKey: apiKey,
        });
        this.chatterLLMTemplate = new ChatterLLMTemplate(repo);
        this.version = version;
    }

    async ask(prompt: Prompt): Promise<PromptResponse> {
        try {
            const chatCompletion = await this.client.chat.completions.create({
                messages: [{ role: "user", content: prompt.message }],
                model: this.version,
            });
            if (
                chatCompletion.choices.length === 0 ||
                chatCompletion.choices[0].message.content === undefined
            ) {
                return NoResponse;
            }
            return {
                response: chatCompletion.choices[0].message.content,
            };
        } catch (error) {
            console.error("error while generating chatGPT response", error);
            return NoResponse;
        }
    }

    async *askStream(prompt: Prompt): AsyncGenerator<PromptResponse> {
        try {
            const stream = await this.client.chat.completions.create({
                messages: [{ role: "user", content: prompt.message }],
                model: this.version,
                stream: true,
            });
            for await (const completion of stream) {
                if (completion.choices.length === 0) {
                    return {
                        response: "",
                    };
                }
                const response = completion.choices[0].delta.content;
                yield {
                    response: response,
                };
            }
        } catch (error) {
            console.error("error while generating chatGPT response", error);
            return NoResponse;
        }
    }

    async *chatStream(
        prompt: Prompt,
        chatID?: string,
    ): AsyncGenerator<PromptResponse> {
        const client = this.client;
        const getAPIRole = (role: PromptRole): "system" | "user" => {
            switch (role) {
                case PromptRole.MODEL:
                    return "system";
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

                    const stream = await client.chat.completions.create({
                        messages: messages,
                        model: version,
                        stream: true,
                    });
                    for await (const completion of stream) {
                        if (completion.choices.length === 0) {
                            return {
                                response: "",
                            };
                        }
                        const response = completion.choices[0].delta.content;
                        yield {
                            response: response,
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
