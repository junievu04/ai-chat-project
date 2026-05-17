"use client";

import { type RefObject, useEffect, useRef } from "react";

const TOP_OFFSET = 200;

export function useChatScroll(
  containerRef: RefObject<HTMLElement | null>,
  {
    sessionId,
    setShouldLoadOlder,
    lastMessageId,
    messageCount,
    isLoadingMore,
  }: {
    sessionId: string | null;
    setShouldLoadOlder: (value: boolean) => void;
    lastMessageId: string | undefined;
    messageCount: number;
    isLoadingMore: boolean;
  },
) {
  const anchorRef = useRef<{ top: number; height: number } | null>(null);
  const prevLastMessageIdRef = useRef<string | undefined>(undefined);
  const readyRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;

    readyRef.current = false;
    prevLastMessageIdRef.current = undefined;
    setShouldLoadOlder(false);

    if (!el || !sessionId) return;

    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight <= TOP_OFFSET;
      if (!readyRef.current) {
        if (atBottom) readyRef.current = true;
        return;
      }
      setShouldLoadOlder(el.scrollTop <= TOP_OFFSET);
    };

    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(check, 200);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [sessionId, containerRef.current, setShouldLoadOlder]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (isLoadingMore) {
      anchorRef.current = { top: el.scrollTop, height: el.scrollHeight };
      return;
    }

    const anchor = anchorRef.current;
    if (anchor) {
      const diff = el.scrollHeight - anchor.height;
      if (diff > 0) el.scrollTop = anchor.top + diff;
      anchorRef.current = null;
      return;
    }

    if (lastMessageId && prevLastMessageIdRef.current !== lastMessageId) {
      prevLastMessageIdRef.current = lastMessageId;
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [lastMessageId, messageCount, isLoadingMore]);
}
