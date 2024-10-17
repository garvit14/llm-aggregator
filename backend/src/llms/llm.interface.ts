import { Prompt } from "../types/prompt";
import { PromptResponse } from "../types/prompt-response";

export interface LLM {
    ask(prompt: Prompt): Promise<PromptResponse>
    askStream(prompt: Prompt): AsyncGenerator<PromptResponse>
}