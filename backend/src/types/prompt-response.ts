export class PromptResponse {
    response: string;
}

export class ChatPromptResponse extends PromptResponse {
    chatID: string;
    messageID: string;
}

export const NoResponse: PromptResponse = {
    response: "No response",
};
