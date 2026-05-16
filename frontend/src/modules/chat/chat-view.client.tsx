"use client";

import { Button } from "@/components/button";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useSessionMessages } from "@/hooks/useSessionMessages";
import { EmptyState } from "@/modules/chat/empty-state";
import { InputBar } from "@/modules/chat/input-bar";
import { MessageList } from "@/modules/chat/message-list";
import type { Message } from "@/types";
import { css } from "@/vendors/styled-system/css";
import { Box, Flex } from "@/vendors/styled-system/jsx";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

interface Props {
  sessionId: string | null;
  initialMessages: Message[];
}

export default function ChatViewClient({ sessionId, initialMessages }: Props) {
  const router = useRouter();
  const messages = useSessionMessages(sessionId, initialMessages);
  const { send, isLoading, currentSessionId } = useSendMessage(sessionId);

  return (
    <Flex direction="column" h="full" overflow="hidden" bg="bg">
      {currentSessionId && (
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

      {messages.length === 0 && !isLoading ? (
        <EmptyState />
      ) : (
        <MessageList messages={messages} isLoading={isLoading} />
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
        <InputBar onSend={send} isLoading={isLoading} />
      </Box>
    </Flex>
  );
}
