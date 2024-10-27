import { LLM } from "../llms/llm.interface";
import { LLMEnum } from "../types/llm";
import { PromptRole } from "../types/prompt";
import { connect, Database } from "./connect";
import { v4 as uuidv4 } from "uuid";

export enum TableNames {
    CHAT = "chat",
    CHAT_MESSAGE = "chat_message",
}

export interface Chat {
    id: string;
    llm: LLMEnum;
}

export interface Message {
    id: string;
    chat_id: string;
    message: string;
    role: PromptRole;
    is_liked: boolean;
    is_disliked: boolean;
}

export class Repo {
    private db: Database;

    constructor() {
        this.db = connect();
    }

    async checkConnection() {
        await this.db.select(1);
    }

    async newChat(llm: LLMEnum): Promise<string> {
        const chat: Chat = {
            id: uuidv4(),
            llm,
        };
        const resp = await this.db(TableNames.CHAT)
            .insert(chat)
            .returning("id");
        return resp[0].id;
    }

    async getChat(chatId: string): Promise<Chat> {
        return this.db<Chat>(TableNames.CHAT).where({ id: chatId }).first();
    }

    async newMessage(
        chatId: string,
        message: string,
        role: PromptRole,
        messageID?: string,
    ): Promise<string> {
        if (!messageID) {
            messageID = uuidv4();
        }
        const messageEntity: Message = {
            id: messageID,
            chat_id: chatId,
            message,
            role,
            is_liked: false,
            is_disliked: false,
        };
        await this.db(TableNames.CHAT_MESSAGE).insert(messageEntity);
        return messageID;
    }

    async likeMessage(messageId: string) {
        await this.db<Message>(TableNames.CHAT_MESSAGE)
            .where({ id: messageId })
            .update({ is_liked: true, is_disliked: false });
    }

    async dislikeMessage(messageId: string) {
        await this.db<Message>(TableNames.CHAT_MESSAGE)
            .where({ id: messageId })
            .update({ is_disliked: true, is_liked: false });
    }

    async getMessages(chatId: string): Promise<Message[]> {
        return this.db<Message>(TableNames.CHAT_MESSAGE)
            .where({ chat_id: chatId })
            .orderBy("created_at", "asc");
    }
}
