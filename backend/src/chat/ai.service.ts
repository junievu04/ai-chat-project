import { Content, GoogleGenerativeAI } from "@google/generative-ai";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

@Injectable()
export class AiService {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(private config: ConfigService) {
    this.client = new GoogleGenerativeAI(
      this.config.getOrThrow<string>("GEMINI_API_KEY"),
    );
    // fallback to gemini-2.0-flash if GEMINI_MODEL not set
    this.model = this.config.get<string>("GEMINI_MODEL", "gemini-2.0-flash");
  }

  async generateResponse(
    history: ChatMessage[],
    prompt: string,
  ): Promise<string> {
    const gemini = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction:
        "You are a helpful AI assistant. Respond clearly and concisely. Use markdown when appropriate.",
    });

    // Gemini uses 'user' | 'model' roles (not 'assistant')
    const geminiHistory: Content[] = history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = gemini.startChat({ history: geminiHistory });

    const result = await chat.sendMessage(prompt);
    return result.response.text();
  }
}
