"use client";

import { Text } from "@/components/text";
import { css } from "@/vendors/styled-system/css";
import { Box, Flex, styled } from "@/vendors/styled-system/jsx";
import type { Attachment, Message } from "@/types";
import { Icon } from "@iconify/react";
import ReactMarkdown from "react-markdown";

interface Props {
  message: Message;
}

const UserRow = styled(Flex, {
  base: {
    justifyContent: "flex-end",
    animation: "fadeSlide 0.2s ease forwards",
  },
});

const AssistantBlock = styled(Box, {
  base: {
    maxW: "full",
    animation: "fadeSlide 0.2s ease forwards",
  },
});

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <UserRow>
        <Flex direction="column" gap="1.5" alignItems="flex-end" maxW="85%">
          {message.attachments?.length > 0 && (
            <Flex flexWrap="wrap" gap="2" justifyContent="flex-end">
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
                      bg: "bg",
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
            py="2.5"
            fontSize="sm"
            lineHeight="relaxed"
            borderRadius="2xl"
            bg="userBubble.bg"
            color="userBubble.fg"
            maxW="fit-content"
          >
            <Box whiteSpace="pre-wrap" wordBreak="break-word">
              {message.content}
            </Box>
          </Box>
        </Flex>
      </UserRow>
    );
  }

  return (
    <AssistantBlock>
      <Flex direction="column" gap="3" maxW="full">
        {message.attachments?.length > 0 && (
          <Flex flexWrap="wrap" gap="2">
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
                    bg: "bg",
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

        <Text variant="body-1" weight="bold">
          Template.net
        </Text>

        <Box className="ai-prose" fontSize="sm" lineHeight="relaxed" color="text">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </Box>
      </Flex>
    </AssistantBlock>
  );
}
