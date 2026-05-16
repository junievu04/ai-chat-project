"use client";

import { Button } from "@/components/button";
import { buttonRecipe } from "@/components/button/button.recipe";
import { StatusIcon, StatusPage } from "@/components/status-page";
import { Text } from "@/components/text";
import { cx } from "@/vendors/styled-system/css";
import { Flex, Stack } from "@/vendors/styled-system/jsx";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SessionError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[SessionError]", error);
  }, [error]);

  return (
    <StatusPage minH="100%">
      <StatusIcon tone="error">
        <Icon icon="solar:chat-round-dots-bold-duotone" width={32} color="#ef4444" />
      </StatusIcon>

      <Stack gap="1.5" alignItems="center">
        <Text variant="heading-2" weight="semibold">
          Failed to load chat
        </Text>
        <Text tone="secondary" maxW="xs" variant="body-2">
          {error.message ||
            "Could not load this conversation. It may have been deleted."}
        </Text>
      </Stack>

      <Flex gap="3">
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Icon icon="solar:restart-bold" width={16} />}
          onClick={reset}
        >
          Retry
        </Button>
        <Link href="/chat" className={cx(buttonRecipe({ variant: "secondary", size: "sm" }))}>
          <Flex alignItems="center" gap="2">
            <Icon icon="solar:add-square-linear" width={16} />
            New chat
          </Flex>
        </Link>
      </Flex>
    </StatusPage>
  );
}
