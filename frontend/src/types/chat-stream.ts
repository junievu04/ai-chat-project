import type { Message } from "@/types";

export interface ChatStreamMeta {
  sessionId: string;
  userMessage: Message;
}

export interface ChatStreamDone {
  aiMessage: Message;
}

export type ChatStreamHandlers = {
  onMeta: (data: ChatStreamMeta) => void;
  onChunk: (text: string) => void;
  onDone: (data: ChatStreamDone) => void;
  onError?: (message: string) => void;
};
