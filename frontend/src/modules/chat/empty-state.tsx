"use client";

import { Text } from "@/components/text";
import { css } from "@/vendors/styled-system/css";
import { Box, Flex, Stack } from "@/vendors/styled-system/jsx";
import { Icon } from "@iconify/react";

const SUGGESTIONS = [
  "✍️ Write a blog post",
  "📊 Create a report",
  "🎨 Design ideas",
  "💡 Brainstorm topics",
  "📝 Draft an email",
];

export function EmptyState() {
  return (
    <Flex
      flex="1"
      direction="column"
      alignItems="center"
      justifyContent="center"
      gap="5"
      px="4"
      textAlign="center"
    >
      <Flex
        alignItems="center"
        justifyContent="center"
        w="16"
        h="16"
        borderRadius="lg"
        bg="bg.subtle"
        borderWidth="1px"
        borderColor="border"
      >
        <Icon icon="solar:stars-bold-duotone" width={40} color="#3B3BFF" />
      </Flex>

      <Stack gap="1.5">
        <Text variant="heading-2" weight="semibold">
          Ask template.net
        </Text>
        <Text tone="secondary" maxW="sm">
          Generate documents, designs, presentations and more with AI.
        </Text>
      </Stack>

      <Flex flexWrap="wrap" justifyContent="center" gap="2">
        {SUGGESTIONS.map((s) => (
          <Box
            key={s}
            px="3"
            py="1.5"
            borderRadius="full"
            fontSize="xs"
            borderWidth="1px"
            borderColor="border"
            color="text.muted"
            bg="bg.subtle"
          >
            {s}
          </Box>
        ))}
      </Flex>
    </Flex>
  );
}
