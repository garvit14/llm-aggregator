import { Message, Repo } from "../db/repo";
import { LLMEnum } from "../types/llm";
import { Prompt, PromptRole } from "../types/prompt";
import {
    ChatPromptResponse,
    NoResponse,
    PromptResponse,
} from "../types/prompt-response";
import { LLM } from "./llm.interface";
import {
    GenerativeModel,
    GoogleGenerativeAI,
    Content,
} from "@google/generative-ai";
import { Readable } from "stream";
import { ChatterLLMTemplate } from "./chatter-llm-template";

export class Gemini implements LLM {
    private llmName = LLMEnum.GEMINI;
    private repo: Repo;
    private chatterLLMTemplate: ChatterLLMTemplate;
    constructor(repo: Repo) {
        this.repo = repo;
        this.chatterLLMTemplate = new ChatterLLMTemplate(repo);
    }

    async ask(prompt: Prompt): Promise<PromptResponse> {
        const model = this.initModel();
        try {
            const result = await model.generateContent(prompt.message);
            const response = result.response.text();
            return {
                response: response,
            };
        } catch (error) {
            console.error("error while generating gemini response", error);
            return NoResponse;
        }
    }

    // generator function
    async *askStream(prompt: Prompt): AsyncGenerator<PromptResponse> {
        const model = this.initModel();
        try {
            const result = await model.generateContentStream(prompt.message);
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                yield {
                    response: chunkText,
                };
            }
        } catch (error) {
            console.error("error while generating gemini response", error);
            return NoResponse;
        }
    }

    // private async *executeChatAPI(history: Message[]) AsyncGenerator<PromptResponse> {

    // }

    async *chatStream(
        prompt: Prompt,
        chatID?: string,
    ): AsyncGenerator<ChatPromptResponse> {
        const initModel = this.initModel;
        const streamResponse = await this.chatterLLMTemplate.chatStream(
            this.llmName,
            prompt,
            {
                execute: async function* (
                    history: Message[],
                ): AsyncGenerator<PromptResponse> {
                    const historyForAPI: Content[] = history.map((msg) => ({
                        role: msg.role,
                        parts: [{ text: msg.message }],
                    }));
                    const model = initModel();
                    const chat = model.startChat({ history: historyForAPI });
                    const result = await chat.sendMessageStream(prompt.message);
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        yield { response: chunkText };
                    }
                },
            },
            chatID,
        );
        for await (const response of streamResponse) {
            yield response;
        }
    }

    private initModel(): GenerativeModel {
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        return model;
    }
}
