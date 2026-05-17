"use client";

import { MessageBubble } from "@/modules/chat/message-bubble";
import type { Message } from "@/types";
import { css } from "@/vendors/styled-system/css";
import { Box, Flex } from "@/vendors/styled-system/jsx";
import { useEffect, useRef } from "react";
import TypingIndicator from "./typing-indicator";

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
