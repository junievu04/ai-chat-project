"use client";

import { MessageBubble } from "@/modules/chat/message-bubble";
import type { Message } from "@/types";
import { css } from "@/vendors/styled-system/css";
import { Box, Flex } from "@/vendors/styled-system/jsx";
import { Icon } from "@iconify/react";
import { useEffect, useRef } from "react";

interface Props {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  return (
    <Flex
      flex="1"
      direction="column"
      overflowY="auto"
      px="4"
      py="6"
      gap="2"
      className={css({
        scrollbarWidth: "thin",
      })}
    >
      {messages.map((msg) => (
        <MessageBubble key={msg._id} message={msg} />
      ))}

      {isLoading && <TypingIndicator />}

      <Box ref={bottomRef} />
    </Flex>
  );
}

function TypingIndicator() {
  return (
    <Flex gap="3" alignItems="flex-start" animation="fadeSlide">
      <Flex
        alignItems="center"
        justifyContent="center"
        w="8"
        h="8"
        borderRadius="full"
        flexShrink={0}
        bg="brand"
        color="white"
      >
        <Icon icon="solar:stars-bold" width={14} />
      </Flex>
      <Flex
        alignItems="center"
        gap="1.5"
        px="4"
        py="3.5"
        borderRadius="xl"
        borderBottomLeftRadius="sm"
        bg="bg.subtle"
        borderWidth="1px"
        borderColor="border"
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            w="2"
            h="2"
            borderRadius="full"
            bg="text.muted"
            className={css({
              animation: "bounceDot 1.3s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            })}
          />
        ))}
      </Flex>
    </Flex>
  );
}
