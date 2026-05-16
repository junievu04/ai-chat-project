import type { Attachment, ChatResponse, Message, Session } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error?.message || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const fetchSessions = (): Promise<Session[]> =>
  apiFetch<Session[]>("/api/sessions");

export const fetchSessionMessages = (
  sessionId: string,
): Promise<{ session: Session; messages: Message[] }> =>
  apiFetch(`/api/sessions/${sessionId}/messages`);

export const createSession = (): Promise<Session> =>
  apiFetch<Session>("/api/sessions", {
    method: "POST",
    body: JSON.stringify({}),
  });

export const deleteSession = (sessionId: string): Promise<void> =>
  apiFetch(`/api/sessions/${sessionId}`, { method: "DELETE" });

export const sendChatMessage = (
  prompt: string,
  sessionId: string | null,
  attachments: Attachment[],
): Promise<ChatResponse> =>
  apiFetch<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ prompt, sessionId, attachments }),
  });

export const uploadFile = async (file: File): Promise<Attachment> => {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
};
