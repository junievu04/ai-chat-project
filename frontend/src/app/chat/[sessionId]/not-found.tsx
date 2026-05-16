import { buttonRecipe } from "@/components/button/button.recipe";
import { StatusIcon, StatusPage } from "@/components/status-page";
import { Text } from "@/components/text";
import { Flex, Stack } from "@/vendors/styled-system/jsx";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function SessionNotFound() {
  return (
    <StatusPage minH="100%">
      <StatusIcon>
        <Icon icon="solar:ghost-bold-duotone" width={32} style={{ color: "#3B3BFF" }} />
      </StatusIcon>

      <Stack gap="1.5" alignItems="center">
        <Text variant="heading-2" weight="semibold">
          Chat not found
        </Text>
        <Text tone="secondary" maxW="xs">
          This conversation doesn&apos;t exist or has been deleted.
        </Text>
      </Stack>

      <Link href="/chat" className={buttonRecipe({ variant: "primary", size: "md" })}>
        <Flex alignItems="center" gap="2">
          <Icon icon="solar:add-square-bold" width={16} />
          Start new chat
        </Flex>
      </Link>
    </StatusPage>
  );
}
