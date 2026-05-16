import { buttonRecipe } from "@/components/button/button.recipe";
import { StatusIcon, StatusPage } from "@/components/status-page";
import { Text } from "@/components/text";
import { Flex } from "@/vendors/styled-system/jsx";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function NotFound() {
  return (
    <StatusPage>
      <StatusIcon>
        <Icon icon="solar:ghost-bold-duotone" width={40} style={{ color: "#3B3BFF" }} />
      </StatusIcon>

      <Flex direction="column" gap="2" alignItems="center">
        <Text variant="metric" tone="brand">
          404
        </Text>
        <Text variant="heading-2" weight="bold">
          Page not found
        </Text>
        <Text tone="secondary" maxW="xs">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Text>
      </Flex>

      <Link href="/chat" className={buttonRecipe({ variant: "primary", size: "md" })}>
        <Flex alignItems="center" gap="2">
          <Icon icon="solar:arrow-left-linear" width={18} />
          Back to Chat
        </Flex>
      </Link>
    </StatusPage>
  );
}
