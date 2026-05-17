"use client";

import { useMessages } from "@/contexts/ChatContext";
import { fetchSessionMessages } from "@/lib/api";
import type { Message } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { DRAFT_SESSION_KEY } from "./useSendMessage";

export function useMessagePagination(
  sessionId: string | null,
  shouldLoadOlder: boolean,
) {
  const liveKey = sessionId ?? DRAFT_SESSION_KEY;
  const live = useMessages(liveKey);
  const consumedRef = useRef(false);

  const query = useInfiniteQuery({
    queryKey: ["session-messages", sessionId],
    queryFn: ({ pageParam }) =>
      fetchSessionMessages(sessionId!, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.next ?? undefined,
    enabled: !!sessionId,
  });

  useEffect(() => {
    consumedRef.current = false;
  }, [sessionId]);

  useEffect(() => {
    if (!shouldLoadOlder) {
      consumedRef.current = false;
      return;
    }
    if (
      !sessionId ||
      query.isLoading ||
      query.isFetchingNextPage ||
      !query.hasNextPage ||
      consumedRef.current
    )
      return;

    consumedRef.current = true;
    query.fetchNextPage();
  }, [
    sessionId,
    shouldLoadOlder,
    query.isLoading,
    query.isFetchingNextPage,
    query.hasNextPage,
    query.fetchNextPage,
  ]);

  const fetched = useMemo(() => {
    const pages = query.data?.pages;
    if (!pages?.length) return [];
    return pages
      .slice()
      .reverse()
      .flatMap((p) => p.messages);
  }, [query.data]);

  const messages = useMemo(() => mergeMessages(fetched, live), [fetched, live]);
  const isInitialLoading = !!sessionId && query.isLoading;

  return {
    messages,
    isLoadingMore: query.isFetchingNextPage,
    showEmptyState: messages.length === 0 && !isInitialLoading,
  };
}

function mergeMessages(fetched: Message[], live: Message[]): Message[] {
  if (!live.length) return fetched;
  const map = new Map(fetched.map((m) => [m._id, m]));
  for (const m of live) map.set(m._id, m);
  return [...map.values()].sort(
    (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
  );
}
