import ChatViewClient from "@/modules/chat/chat-view.client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Chat" };

export default function NewChatPage() {
  return <ChatViewClient sessionId={null} />;
}
