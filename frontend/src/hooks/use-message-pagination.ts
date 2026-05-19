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

/**
 * Merges paginated history with in-flight messages from ChatContext.
 * Live tail keeps reducer order (user → assistant) instead of re-sorting by
 * createdAt, which breaks when server user timestamps differ from client placeholders.
 */
function mergeMessages(fetched: Message[], live: Message[]): Message[] {
  if (!live.length) return sortByCreatedAt(fetched);

  const byId = new Map(fetched.map((m) => [m._id, m]));
  for (const m of live) byId.set(m._id, m);

  const liveIds = new Set(live.map((m) => m._id));
  const historical = sortByCreatedAt(fetched)
    .filter((m) => !liveIds.has(m._id))
    .map((m) => byId.get(m._id)!);
  const liveBlock = live.map((m) => byId.get(m._id)!);

  return [...historical, ...liveBlock];
}

function sortByCreatedAt(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => {
    const diff = +new Date(a.createdAt) - +new Date(b.createdAt);
    if (diff !== 0) return diff;
    if (a.role !== b.role) return a.role === "user" ? -1 : 1;
    return a._id.localeCompare(b._id);
  });
}
