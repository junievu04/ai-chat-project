export interface Attachment {
  url: string;
  publicId: string;
  type: "image" | "pdf" | "file";
  name: string;
}

export interface Message {
  _id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  attachments: Attachment[];
  createdAt: string;
}

export interface Session {
  _id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatState {
  messages: Record<string, Message[]>;
}

export interface SessionMessagesPage {
  session: Session;
  messages: Message[];
  next: string | null;
}

export interface SearchParams {
  next?: string | null;
}
