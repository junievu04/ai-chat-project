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

  const { showScrollDown, scrollToBottom } = useChatScroll(elementScrollRef, {
    sessionId,
    setShouldLoadOlder,
    lastMessageId: messages.at(-1)?._id,
    messageCount: messages.length,
    isLoadingMore,
  });

  return (
    <Flex direction="column" flex="1" minH="0" overflow="hidden" bg="bg.subtle">
      {sessionId && (
        <Flex
          alignItems="center"
          gap="2"
          px="5"
          py="3"
          flexShrink={0}
          bg="bg.subtle"
        >
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Icon icon="solar:alt-arrow-left-linear" width={18} />}
            onClick={() => router.push("/chat")}
            color="text.muted"
            fontWeight="normal"
          >
            Back
          </Button>
        </Flex>
      )}

      {showEmptyState ? (
        <EmptyState />
      ) : (
        <Box position="relative" flex="1" minH="0" overflow="hidden">
          <Flex
            ref={elementScrollRef}
            position="absolute"
            inset="0"
            direction="column"
            overflowY="auto"
            px="5"
            py="4"
            gap="6"
            className={css({ scrollbarWidth: "thin" })}
          >
            <Box maxW="3xl" mx="auto" w="full">
              {isLoadingMore && (
                <Flex
                  justifyContent="center"
                  py="2"
                  color="text.muted"
                  fontSize="xs"
                >
                  Loading older messages…
                </Flex>
              )}

              <Flex direction="column" gap="6">
                {messages.map((msg) => (
                  <MessageBubble key={msg._id} message={msg} />
                ))}

                {isTyping && <TypingIndicator />}
              </Flex>
            </Box>
          </Flex>

          {showScrollDown && (
            <Button
              variant="secondary"
              size="sm"
              aria-label="Scroll to bottom"
              onClick={() => scrollToBottom()}
              position="absolute"
              bottom="4"
              left="50%"
              zIndex="1"
              minH="9"
              w="9"
              p="0"
              borderRadius="full"
              boxShadow="md"
              className={css({ transform: "translateX(-50%)" })}
            >
              <Icon icon="solar:arrow-down-linear" width={20} height={20} />
            </Button>
          )}
        </Box>
      )}

      <Box flexShrink={0} px="5" pb="6" pt="2" bg="bg.subtle">
        <InputBar onSend={send} isTyping={isTyping} />
      </Box>
    </Flex>
  );
}
