"use client";

import { css } from "@/vendors/styled-system/css";
import { Box, Flex, styled } from "@/vendors/styled-system/jsx";
import type { Attachment, Message } from "@/types";
import { Icon } from "@iconify/react";
import ReactMarkdown from "react-markdown";

interface Props {
  message: Message;
}

const Row = styled(Flex, {
  base: {
    gap: "3",
    alignItems: "flex-start",
    animation: "fadeSlide 0.2s ease forwards",
  },
  variants: {
    role: {
      user: { flexDirection: "row-reverse" },
      assistant: {},
    },
  },
});

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <Row role={isUser ? "user" : "assistant"}>
      <Flex
        alignItems="center"
        justifyContent="center"
        w="8"
        h="8"
        borderRadius="full"
        flexShrink={0}
        mt="0.5"
        bg={isUser ? "bg.subtle" : "brand"}
        color={isUser ? "text.muted" : "white"}
        borderWidth={isUser ? "1px" : "0"}
        borderColor="border"
      >
        <Icon
          icon={isUser ? "solar:user-bold" : "solar:stars-bold"}
          width={isUser ? 16 : 14}
        />
      </Flex>

      <Flex
        direction="column"
        gap="1.5"
        maxW="75%"
        alignItems={isUser ? "flex-end" : "flex-start"}
      >
        {message.attachments?.length > 0 && (
          <Flex
            flexWrap="wrap"
            gap="2"
            justifyContent={isUser ? "flex-end" : "flex-start"}
          >
            {message.attachments.map((att: Attachment, i: number) =>
              att.type === "image" ? (
                <img
                  key={i}
                  src={att.url}
                  alt={att.name}
                  className={css({
                    maxW: "200px",
                    maxH: "150px",
                    borderRadius: "xl",
                    objectFit: "cover",
                    borderWidth: "1px",
                    borderColor: "border",
                  })}
                />
              ) : (
                <a
                  key={i}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={css({
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5",
                    px: "3",
                    py: "2",
                    borderRadius: "xl",
                    fontSize: "xs",
                    borderWidth: "1px",
                    borderColor: "border",
                    bg: "bg.subtle",
                    color: "text.muted",
                  })}
                >
                  <Icon icon="solar:file-bold-duotone" width={14} />
                  {att.name}
                </a>
              ),
            )}
          </Flex>
        )}

        <Box
          px="4"
          py="3"
          fontSize="sm"
          lineHeight="relaxed"
          borderRadius="xl"
          borderBottomRightRadius={isUser ? "sm" : "xl"}
          borderBottomLeftRadius={isUser ? "xl" : "sm"}
          bg={isUser ? "brand" : "bg.subtle"}
          color={isUser ? "white" : "text"}
          borderWidth={isUser ? "0" : "1px"}
          borderColor="border"
        >
          {isUser ? (
            <Box whiteSpace="pre-wrap" wordBreak="break-word">
              {message.content}
            </Box>
          ) : (
            <Box className="ai-prose">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </Box>
          )}
        </Box>

        <Box fontSize="10px" px="1" color="text.faint">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Box>
      </Flex>
    </Row>
  );
}
