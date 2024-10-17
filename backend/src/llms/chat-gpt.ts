import { GoogleGenerativeAIFetchError } from "@google/generative-ai";
import { Prompt } from "../types/prompt";
import { NoResponse, PromptResponse } from "../types/prompt-response";
import { LLM } from "./llm.interface";
import OpenAI from "openai";

// todo: remove code duplication

// const apiKey = process.env.CHATGPT_API_KEY;

// const client = new OpenAI({
//   apiKey: apiKey,
// });

export class ChatGPT implements LLM {

  client: OpenAI

  constructor() {
    const apiKey = process.env.CHATGPT_API_KEY;
    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  async ask(prompt: Prompt): Promise<PromptResponse> {
    try {
      const chatCompletion = await this.client.chat.completions.create({
        messages: [{ role: "user", content: prompt.message }],
        model: "gpt-4o",
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
        model: "gpt-4o",
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
}
