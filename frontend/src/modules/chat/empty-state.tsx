"use client";

import { Text } from "@/components/text";
import { Flex, Stack } from "@/vendors/styled-system/jsx";
import { Icon } from "@iconify/react";

const SUGGESTIONS = [
  { label: "Write a blog post", icon: "solar:pen-bold-duotone" },
  { label: "Create a report", icon: "solar:chart-bold-duotone" },
  { label: "Design ideas", icon: "solar:palette-bold-duotone" },
  { label: "Brainstorm topics", icon: "solar:lightbulb-bold-duotone" },
  { label: "Draft an email", icon: "solar:letter-bold-duotone" },
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
          <Flex
            key={s.label}
            alignItems="center"
            gap="1.5"
            px="3"
            py="1.5"
            borderRadius="full"
            fontSize="xs"
            borderWidth="1px"
            borderColor="colorPalette.300"
            color="colorPalette.600"
            bg="colorPalette.50"
            colorPalette="blue"
          >
            <Icon icon={s.icon} width={14} />
            {s.label}
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}
