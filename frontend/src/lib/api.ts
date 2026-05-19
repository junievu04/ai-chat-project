import { formatChatError } from "@/lib/format-chat-error";
import { parseSseBuffer } from "@/lib/parse-sse";
import type { Attachment, Message, Session, SessionMessagesPage } from "@/types";
import type { ChatStreamHandlers } from "@/types/chat-stream";

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

export const fetchSession = (sessionId: string): Promise<Session> =>
  apiFetch<Session>(`/api/sessions/${sessionId}`);

export const fetchSessionMessages = (
  sessionId: string,
  next?: string,
): Promise<SessionMessagesPage> => {
  const params = new URLSearchParams();
  if (next) params.set("next", next);
  const qs = params.toString();
  return apiFetch(
    `/api/sessions/${sessionId}/messages${qs ? `?${qs}` : ""}`,
  );
};

export const deleteSession = (sessionId: string): Promise<void> =>
  apiFetch(`/api/sessions/${sessionId}`, { method: "DELETE" });

export async function sendChatMessage(
  prompt: string,
  sessionId: string | null,
  attachments: Attachment[],
  handlers: ChatStreamHandlers,
  signal?: AbortSignal,
): Promise<{ sessionId: string; userMessage: Message; aiMessage: Message }> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ prompt, sessionId, attachments }),
    signal,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    const message =
      typeof error?.message === "string"
        ? error.message
        : `API error ${res.status}`;
    throw new Error(message);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";
  let sessionIdOut = "";
  let userMessage: Message | null = null;
  let aiMessage: Message | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const { events, rest } = parseSseBuffer(buffer);
    buffer = rest;

    for (const { event, data } of events) {
      const payload = JSON.parse(data) as Record<string, unknown>;

      switch (event) {
        case "meta": {
          const meta = payload as {
            sessionId: string;
            userMessage: Message;
          };
          sessionIdOut = meta.sessionId;
          userMessage = meta.userMessage;
          handlers.onMeta(meta);
          break;
        }
        case "chunk":
          handlers.onChunk(String((payload as { text?: string }).text ?? ""));
          break;
        case "done": {
          const donePayload = payload as { aiMessage: Message };
          aiMessage = donePayload.aiMessage;
          handlers.onDone(donePayload);
          break;
        }
        case "error": {
          const message = formatChatError(
            String((payload as { message?: string }).message ?? ""),
          );
          handlers.onError?.(message);
          throw new Error(message);
        }
      }
    }
  }

  if (!sessionIdOut || !userMessage || !aiMessage) {
    throw new Error("Stream ended without a complete response");
  }

  return { sessionId: sessionIdOut, userMessage, aiMessage };
}

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
