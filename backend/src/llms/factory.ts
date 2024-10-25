import { Repo } from "../db/repo";
import { LLMEnum } from "../types/llm";
import { ChatGPT } from "./chat-gpt";
import { Claude } from "./claude";
import { Gemini } from "./gemini";
import { Llama } from "./llama";
import { LLM } from "./llm.interface";

export class LLMFactory {
    private repo: Repo;
    constructor() {
        this.repo = new Repo();
    }

    createLLM(llmType: LLMEnum): LLM {
        switch (llmType) {
            case LLMEnum.GEMINI:
                return new Gemini(this.repo);
            case LLMEnum.CHATGPT:
                return new ChatGPT(this.repo);
            case LLMEnum.CLAUDE:
                return new Claude(this.repo);
            case LLMEnum.LLAMA:
                return new Llama(this.repo);
            default:
                throw new Error("Invalid LLM type");
        }
    }
}
