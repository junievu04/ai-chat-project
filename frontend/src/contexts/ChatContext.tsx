"use client";

import { chatReducer, type ChatAction } from "@/store/chatReducer";
import type { ChatState, Message } from "@/types";
import { loadPersisted, savePersisted } from "@/lib/storage";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";

interface ChatCtx {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
}

const ChatContext = createContext<ChatCtx | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const persisted = loadPersisted();
  const [state, dispatch] = useReducer(chatReducer, {
    messages: persisted?.chatState.messages ?? {},
  });

  useEffect(() => {
    const cur = loadPersisted();
    savePersisted({
      chatState: state,
      sessionList: cur?.sessionList ?? [],
    });
  }, [state]);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be inside ChatProvider");
  return ctx;
}

export function useMessages(sessionId: string | null): Message[] {
  const { state } = useChatContext();
  if (!sessionId) return [];
  return state.messages[sessionId] ?? [];
}
