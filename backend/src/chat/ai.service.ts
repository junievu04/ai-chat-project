import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Groq from "groq-sdk";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_INSTRUCTION =
  "You are a helpful AI assistant. Respond clearly and concisely. Use markdown when appropriate.";

@Injectable()
export class AiService {
  private readonly client: Groq;
  private readonly model: string;

  constructor(private config: ConfigService) {
    this.client = new Groq({
      apiKey: this.config.getOrThrow<string>("GROQ_API_KEY"),
    });
    this.model = this.config.get<string>(
      "GROQ_MODEL",
      "llama-3.3-70b-versatile",
    );
  }

  generateResponseStream(
    history: ChatMessage[],
    prompt: string,
  ): AsyncGenerator<string, void, undefined> {
    return this.streamFromGroq(history, prompt);
  }

  private async *streamFromGroq(
    history: ChatMessage[],
    prompt: string,
  ): AsyncGenerator<string, void, undefined> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        ...history.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      top_p: 1,
      max_completion_tokens: 1500,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }
  }
}
