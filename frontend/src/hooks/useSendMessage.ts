"use client";

import { useChatContext } from "@/contexts/ChatContext";
import { sendChatMessage } from "@/lib/api";
import { formatChatError } from "@/lib/format-chat-error";
import type { Attachment, Message } from "@/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export const DRAFT_SESSION_KEY = "__draft__";

export function useSendMessage(routeSessionId: string | null) {
  const router = useRouter();
  const { dispatch } = useChatContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState(routeSessionId);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setSessionId(routeSessionId);
  }, [routeSessionId]);

  useEffect(() => {
    if (!routeSessionId) return;
    dispatch({ type: "CLEAR_SESSION", sessionId: DRAFT_SESSION_KEY });
  }, [routeSessionId, dispatch]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const storageKey = sessionId ?? DRAFT_SESSION_KEY;

  const send = useCallback(
    async (prompt: string, attachments: Attachment[]) => {
      if (!prompt.trim() || isLoading) return;

      setSendError(null);

      const tempUserId = `temp-user-${Date.now()}`;
      const tempAiId = `temp-ai-${Date.now()}`;

      const tempUserMsg: Message = {
        _id: tempUserId,
        sessionId: sessionId || "",
        role: "user",
        content: prompt,
        attachments,
        createdAt: new Date().toISOString(),
      };

      dispatch({
        type: "APPEND",
        sessionId: storageKey,
        messages: [tempUserMsg],
      });

      setIsLoading(true);
      setIsStreaming(false);

      const controller = new AbortController();
      abortRef.current = controller;

      let activeKey = storageKey;
      const streamAiId = tempAiId;
      let accumulated = "";
      let streamStarted = false;

      try {
        await sendChatMessage(
          prompt,
          sessionId,
          attachments,
          {
            onMeta: ({ sessionId: sid, userMessage }) => {
              const tempAssistant: Message = {
                _id: tempAiId,
                sessionId: sid,
                role: "assistant",
                content: "",
                attachments: [],
                createdAt: new Date().toISOString(),
              };

              if (!sessionId) {
                activeKey = sid;
                setSessionId(sid);
                dispatch({
                  type: "SET_MESSAGES",
                  sessionId: sid,
                  messages: [userMessage, tempAssistant],
                });
                dispatch({
                  type: "CLEAR_SESSION",
                  sessionId: DRAFT_SESSION_KEY,
                });
                window.dispatchEvent(new Event("session:created"));
                router.replace(`/chat/${sid}`);
              } else {
                dispatch({
                  type: "REPLACE_OPTIMISTIC",
                  sessionId: activeKey,
                  tempId: tempUserId,
                  messages: [userMessage, tempAssistant],
                });
              }

              streamStarted = true;
              setIsStreaming(true);
            },
            onChunk: (text) => {
              accumulated += text;
              dispatch({
                type: "UPDATE_MESSAGE_CONTENT",
                sessionId: activeKey,
                messageId: streamAiId,
                content: accumulated,
              });
            },
            onDone: ({ aiMessage }) => {
              dispatch({
                type: "REPLACE_MESSAGE",
                sessionId: activeKey,
                messageId: streamAiId,
                message: aiMessage,
              });
            },
            onError: (message) => setSendError(formatChatError(message)),
          },
          controller.signal,
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;

        if (!streamStarted) {
          dispatch({
            type: "REMOVE",
            sessionId: activeKey,
            messageId: tempUserId,
          });
        } else {
          dispatch({
            type: "REMOVE",
            sessionId: activeKey,
            messageId: streamAiId,
          });
        }
        setSendError(
          formatChatError(
            err instanceof Error ? err.message : "",
          ),
        );
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [sessionId, dispatch, isLoading, router, storageKey],
  );

  const clearSendError = useCallback(() => setSendError(null), []);

  return {
    send,
    isTyping: isLoading || isStreaming,
    sessionId,
    sendError,
    clearSendError,
  };
}
