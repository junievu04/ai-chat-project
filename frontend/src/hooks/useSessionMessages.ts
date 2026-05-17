"use client";

import { useChatContext, useMessages } from "@/contexts/ChatContext";
import { DRAFT_SESSION_KEY } from "@/hooks/useSendMessage";
import type { Message } from "@/types";
import { useEffect } from "react";

export function useSessionMessages(
  sessionId: string | null,
  initialMessages: Message[],
) {
  const { dispatch } = useChatContext();
  const storageKey = sessionId ?? DRAFT_SESSION_KEY;
  const messages = useMessages(storageKey);

  useEffect(() => {
    if (!sessionId || !initialMessages.length) return;
    dispatch({ type: "SET_MESSAGES", sessionId, messages: initialMessages });
  }, [sessionId, initialMessages, dispatch]);

  return messages;
}
