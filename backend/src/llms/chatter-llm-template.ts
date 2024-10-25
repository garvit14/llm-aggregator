import { Message, Repo } from "../db/repo";
import { LLMEnum } from "../types/llm";
import { Prompt, PromptRole } from "../types/prompt";
import { PromptResponse, ChatPromptResponse } from "../types/prompt-response";
import { v4 as uuidv4 } from "uuid";

export interface ChatAPIExecutor {
    execute: (history: Message[]) => AsyncGenerator<PromptResponse>;
}

export class ChatterLLMTemplate {
    constructor(private repo: Repo) {}

    async *chatStream(
        llm: LLMEnum,
        prompt: Prompt,
        apiExecutor: ChatAPIExecutor,
        chatID?: string,
    ): AsyncGenerator<ChatPromptResponse> {
        // TODO: should also validate chatID and LLM combination is valid
        if (chatID === undefined) {
            chatID = await this.repo.newChat(llm);
        }
        const history = await this.repo.getMessages(chatID);

        const responseMessageID = uuidv4();

        // store message in DB
        await this.repo.newMessage(chatID, prompt.message, PromptRole.USER);

        let completeOutput = "";
        const apiResponse = await apiExecutor.execute(history);
        for await (const response of apiResponse) {
            completeOutput += response.response;
            yield {
                response: response.response,
                chatID,
                messageID: responseMessageID,
            };
        }
        // write complete output in DB
        await this.repo.newMessage(
            chatID,
            completeOutput,
            PromptRole.MODEL,
            responseMessageID,
        );
    }
}
