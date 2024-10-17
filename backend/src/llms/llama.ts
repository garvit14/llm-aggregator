import { Prompt } from "../types/prompt";
import { NoResponse, PromptResponse } from "../types/prompt-response";
import { LLM } from "./llm.interface";
import ollama from 'ollama'

// todo: remove code duplication
export class Llama implements LLM {
  async ask(prompt: Prompt): Promise<PromptResponse> {
    try {
      const response = await ollama.chat({
        model: 'llama3.2',
        messages: [{ role: 'user', content: prompt.message }],
      })
      return {
        response: response.message.content,
      };
    } catch (error) {
      console.error("error while generating ollama response", error);
      return NoResponse;
    }
  }

  async *askStream(prompt: Prompt): AsyncGenerator<PromptResponse> {
    try {
      const response = await ollama.chat({
        model: 'llama3.2',
        messages: [{ role: 'user', content: prompt.message }],
        stream: true,
      })
      for await (const resp of response) {
        yield {
          response: resp.message.content,
        };
      }
    } catch (error) {
      console.error("error while generating ollama response", error);
      return NoResponse;
    }
  }
}
