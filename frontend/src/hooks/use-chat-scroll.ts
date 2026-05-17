"use client";

import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const TOP_OFFSET = 200;

function getScrollBottom(el: HTMLElement) {
  return el.scrollHeight - el.scrollTop - el.clientHeight;
}

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
  const [showScrollDown, setShowScrollDown] = useState(false);
  const anchorRef = useRef<{ top: number; height: number } | null>(null);
  const prevLastMessageIdRef = useRef<string | undefined>(undefined);
  const readyRef = useRef(false);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const el = containerRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior });
    },
    [containerRef],
  );

  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el || !sessionId) return;

    const scrollBottom = getScrollBottom(el);
    const atBottom = scrollBottom <= TOP_OFFSET;

    if (!readyRef.current) {
      if (atBottom) readyRef.current = true;
    } else {
      setShouldLoadOlder(el.scrollTop <= TOP_OFFSET);
    }

    setShowScrollDown(scrollBottom > 0 && messageCount > 0);
  }, [containerRef, sessionId, messageCount, setShouldLoadOlder]);

  useEffect(() => {
    const el = containerRef.current;

    readyRef.current = false;
    prevLastMessageIdRef.current = undefined;
    setShouldLoadOlder(false);
    setShowScrollDown(false);

    if (!el || !sessionId) return;

    el.scrollTop = el.scrollHeight;

    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(updateScrollState, 200);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    updateScrollState();

    return () => {
      el.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [sessionId, updateScrollState, setShouldLoadOlder]);

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
      updateScrollState();
      return;
    }

    if (lastMessageId && prevLastMessageIdRef.current !== lastMessageId) {
      prevLastMessageIdRef.current = lastMessageId;
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      return;
    }

    updateScrollState();
  }, [lastMessageId, messageCount, isLoadingMore, updateScrollState]);

  return { showScrollDown, scrollToBottom };
}
