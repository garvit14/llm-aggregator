import { Prompt } from "../types/prompt";
import { NoResponse, PromptResponse } from "../types/prompt-response";
import { LLM } from "./llm.interface";
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { Readable } from "stream"

export class Gemini implements LLM {
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


  private initModel(): GenerativeModel {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      return model
  }
}

