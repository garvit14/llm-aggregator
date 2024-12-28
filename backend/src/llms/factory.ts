import { Repo } from "../db/repo";
import { LLMEnum } from "../types/llm";
import { ChatGPT, CHATGPT_DEFAULT_VERSION } from "./chat-gpt";
import { Claude, CLAUDE_DEFAULT_VERSION } from "./claude";
import { Gemini, GEMINI_DEFAULT_VERSION } from "./gemini";
import { Llama, LLAMA_DEFAULT_VERSION } from "./llama";
import { LLM } from "./llm.interface";

export class LLMFactory {
    private repo: Repo;
    constructor() {
        this.repo = new Repo();
    }

    // version is kept optional for backward compatibility
    createLLM(llmType: LLMEnum, version?: string): LLM {
        switch (llmType) {
            case LLMEnum.GEMINI:
                return new Gemini(this.repo, version ?? GEMINI_DEFAULT_VERSION);
            case LLMEnum.CHATGPT:
                return new ChatGPT(
                    this.repo,
                    version ?? CHATGPT_DEFAULT_VERSION,
                );
            case LLMEnum.CLAUDE:
                return new Claude(this.repo, version ?? CLAUDE_DEFAULT_VERSION);
            case LLMEnum.LLAMA:
                return new Llama(this.repo, version ?? LLAMA_DEFAULT_VERSION);
            default:
                throw new Error(`Invalid LLM type: ${llmType}`);
        }
    }
}
