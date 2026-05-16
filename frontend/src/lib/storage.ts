import type { ChatState, Message, Session } from "@/types";

const KEY = "AI_CHAT";

export interface PersistedData {
  chatState: ChatState;
  sessionList: Session[];
}

export function loadPersisted(): PersistedData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PersistedData) : null;
  } catch {
    return null;
  }
}

export function savePersisted(data: PersistedData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* quota or private mode */
  }
}

export function getStoredMessages(sessionId: string): Message[] | null {
  const data = loadPersisted();
  return data?.chatState.messages[sessionId] ?? null;
}

export function getStoredSessionList(): Session[] | null {
  return loadPersisted()?.sessionList ?? null;
}

export function removeStoredSession(sessionId: string): void {
  const data = loadPersisted();
  if (!data) return;
  const { [sessionId]: _, ...rest } = data.chatState.messages;
  savePersisted({
    chatState: { messages: rest },
    sessionList: data.sessionList.filter((s) => s._id !== sessionId),
  });
}
