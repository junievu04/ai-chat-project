"use client";

import { useChatContext } from "@/contexts/ChatContext";
import { sendChatMessage } from "@/lib/api";
import type { Attachment, Message } from "@/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const DRAFT_SESSION_KEY = "__draft__";

export function useSendMessage(routeSessionId: string | null) {
  const router = useRouter();
  const { dispatch } = useChatContext();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(routeSessionId);

  useEffect(() => {
    setSessionId(routeSessionId);
  }, [routeSessionId]);

  useEffect(() => {
    if (!routeSessionId) return;
    dispatch({ type: "CLEAR_SESSION", sessionId: DRAFT_SESSION_KEY });
  }, [routeSessionId, dispatch]);

  const storageKey = sessionId ?? DRAFT_SESSION_KEY;

  const send = useCallback(
    async (prompt: string, attachments: Attachment[]) => {
      if (!prompt.trim() || isLoading) return;

      const tempId = `temp-${Date.now()}`;
      const tempUserMsg: Message = {
        _id: tempId,
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

      try {
        const data = await sendChatMessage(prompt, sessionId, attachments);
        const targetId = data.sessionId;

        if (sessionId) {
          dispatch({
            type: "REPLACE_OPTIMISTIC",
            sessionId,
            tempId,
            messages: [data.userMessage, data.aiMessage],
          });
        } else {
          setSessionId(targetId);
          dispatch({
            type: "SET_MESSAGES",
            sessionId: targetId,
            messages: [data.userMessage, data.aiMessage],
          });
          window.dispatchEvent(new Event("session:created"));
          router.replace(`/chat/${targetId}`);
        }
      } catch (err) {
        dispatch({
          type: "REMOVE",
          sessionId: storageKey,
          messageId: tempId,
        });
        console.error("[useSendMessage] send failed", err);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, dispatch, isLoading, router, storageKey],
  );

  return { send, isTyping: isLoading, sessionId };
}
