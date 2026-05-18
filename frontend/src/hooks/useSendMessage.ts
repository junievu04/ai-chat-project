"use client";

import { useChatContext, useSessionError } from "@/contexts/ChatContext";
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
  const [sessionId, setSessionId] = useState(routeSessionId);
  const abortRef = useRef<AbortController | null>(null);
  const skipAbortRef = useRef(false);

  const errorKey = routeSessionId ?? sessionId ?? DRAFT_SESSION_KEY;
  const sendError = useSessionError(errorKey);

  useEffect(() => {
    setSessionId(routeSessionId);
  }, [routeSessionId]);

  useEffect(() => {
    if (!routeSessionId) return;
    dispatch({ type: "CLEAR_SESSION", sessionId: DRAFT_SESSION_KEY });
  }, [routeSessionId, dispatch]);

  useEffect(() => {
    return () => {
      if (skipAbortRef.current) {
        skipAbortRef.current = false;
        return;
      }
      abortRef.current?.abort();
    };
  }, []);

  const setSendError = useCallback(
    (key: string, message: string | null) => {
      if (message) {
        dispatch({ type: "SET_SESSION_ERROR", sessionId: key, message });
      } else {
        dispatch({ type: "CLEAR_SESSION_ERROR", sessionId: key });
      }
    },
    [dispatch],
  );

  const storageKey = sessionId ?? DRAFT_SESSION_KEY;

  const send = useCallback(
    async (prompt: string, attachments: Attachment[]) => {
      if (!prompt.trim() || isLoading) return;

      setSendError(storageKey, null);
      if (sessionId && sessionId !== storageKey) {
        setSendError(sessionId, null);
      }

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

      const reportError = (raw: string) => {
        setSendError(activeKey, formatChatError(raw));
      };

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
                skipAbortRef.current = true;
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
              setSendError(activeKey, null);
            },
            onError: reportError,
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
        reportError(err instanceof Error ? err.message : "");
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [sessionId, dispatch, isLoading, router, storageKey, setSendError],
  );

  const clearSendError = useCallback(() => {
    setSendError(errorKey, null);
  }, [errorKey, setSendError]);

  return {
    send,
    isTyping: isLoading || isStreaming,
    sessionId,
    sendError,
    clearSendError,
  };
}
