import { Message, Repo } from "../db/repo";
import { LLMEnum } from "../types/llm";
import { Prompt, PromptRole } from "../types/prompt";
import { ChatPromptResponse, PromptResponse } from "../types/prompt-response";

export interface LLM {
    ask(prompt: Prompt): Promise<PromptResponse>;
    askStream(prompt: Prompt): AsyncGenerator<PromptResponse>;
    chatStream(prompt: Prompt, chatID?: string): AsyncGenerator<PromptResponse>;
}
