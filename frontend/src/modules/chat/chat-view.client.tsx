"use client";

import { Button } from "@/components/button";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useMessagePagination } from "@/hooks/use-message-pagination";
import { useSendMessage } from "@/hooks/useSendMessage";
import { EmptyState } from "@/modules/chat/empty-state";
import { InputBar } from "@/modules/chat/input-bar";
import { MessageBubble } from "@/modules/chat/message-bubble";
import TypingIndicator from "@/modules/chat/typing-indicator";
import { css } from "@/vendors/styled-system/css";
import { Box, Flex } from "@/vendors/styled-system/jsx";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface Props {
  sessionId: string | null;
}

export default function ChatViewClient({ sessionId: routeSessionId }: Props) {
  const router = useRouter();
  const elementScrollRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadOlder, setShouldLoadOlder] = useState(false);
  const { send, isTyping, sessionId } = useSendMessage(routeSessionId);
  const { messages, showEmptyState, isLoadingMore } = useMessagePagination(
    sessionId,
    shouldLoadOlder,
  );

  useChatScroll(elementScrollRef, {
    sessionId,
    setShouldLoadOlder,
    lastMessageId: messages.at(-1)?._id,
    messageCount: messages.length,
    isLoadingMore,
  });

  return (
    <Flex direction="column" h="full" overflow="hidden" bg="bg">
      {sessionId && (
        <Flex
          display={{ base: "flex", md: "none" }}
          alignItems="center"
          gap="2"
          px="4"
          py="3"
          flexShrink={0}
          borderBottomWidth="1px"
          borderColor="border"
        >
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Icon icon="solar:arrow-left-linear" width={18} />}
            onClick={() => router.back()}
          >
            Back
          </Button>
        </Flex>
      )}

      {showEmptyState ? (
        <EmptyState />
      ) : (
        <Flex
          ref={elementScrollRef}
          flex="1"
          direction="column"
          overflowY="auto"
          px="4"
          py="6"
          gap="2"
          className={css({ scrollbarWidth: "thin" })}
        >
          {isLoadingMore && (
            <Flex
              justifyContent="center"
              py="2"
              color="textMuted"
              fontSize="xs"
            >
              Loading older messages…
            </Flex>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg._id} message={msg} />
          ))}

          {isTyping && <TypingIndicator />}
        </Flex>
      )}

      <Box
        flexShrink={0}
        px="4"
        pb="5"
        pt="2"
        borderTopWidth="1px"
        borderColor="border"
        bg="bg"
      >
        <InputBar onSend={send} isTyping={isTyping} />
      </Box>
    </Flex>
  );
}
