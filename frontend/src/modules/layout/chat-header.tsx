"use client";

import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { Flex } from "@/vendors/styled-system/jsx";
import { Icon } from "@iconify/react";

export function ChatHeader() {
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      h="14"
      px="5"
      flexShrink={0}
      borderBottomWidth="1px"
      borderColor="border"
      bg="bg"
    >
      <Text weight="bold" tone="brand" variant="body-1">
        <strong>TEMPLATE</strong>.NET
      </Text>

      <Flex alignItems="center" gap="2">
        <Button
          variant="ghost"
          size="sm"
          aria-label="Search"
          flexShrink={0}
          minW="9"
          minH="9"
          w="9"
          h="9"
          p="0"
          borderRadius="full"
        >
          <Icon icon="solar:magnifer-linear" width={20} height={20} />
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Icon icon="solar:crown-bold" width={14} />}
        >
          Pricing
        </Button>
      </Flex>
    </Flex>
  );
}
