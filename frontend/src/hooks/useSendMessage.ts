"use client";

import { useChatContext } from "@/contexts/ChatContext";
import { sendChatMessage } from "@/lib/api";
import type { Attachment, Message } from "@/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const DRAFT_SESSION_KEY = "__draft__";

export function useSendMessage(sessionId: string | null) {
  const router = useRouter();
  const { dispatch } = useChatContext();
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);

  useEffect(() => {
    setCurrentSessionId(sessionId);
  }, [sessionId]);

  const storageKey = currentSessionId ?? DRAFT_SESSION_KEY;

  const send = useCallback(
    async (prompt: string, attachments: Attachment[]) => {
      if (!prompt.trim() || isLoading) return;

      const tempId = `temp-${Date.now()}`;
      const tempUserMsg: Message = {
        _id: tempId,
        sessionId: currentSessionId || "",
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
        const data = await sendChatMessage(
          prompt,
          currentSessionId,
          attachments,
        );

        const targetId = data.sessionId;

        if (currentSessionId) {
          dispatch({
            type: "REPLACE_OPTIMISTIC",
            sessionId: currentSessionId,
            tempId,
            messages: [data.userMessage, data.aiMessage],
          });
        } else {
          dispatch({ type: "CLEAR_SESSION", sessionId: DRAFT_SESSION_KEY });
          dispatch({
            type: "SET_MESSAGES",
            sessionId: targetId,
            messages: [data.userMessage, data.aiMessage],
          });
          setCurrentSessionId(targetId);
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
    [currentSessionId, dispatch, isLoading, router, storageKey],
  );

  return { send, isLoading, currentSessionId };
}
