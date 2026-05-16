"use client";

import { Button } from "@/components/button";
import { buttonRecipe } from "@/components/button/button.recipe";
import { StatusIcon, StatusPage } from "@/components/status-page";
import { Text } from "@/components/text";
import { cx, css } from "@/vendors/styled-system/css";
import { Flex, Stack } from "@/vendors/styled-system/jsx";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className={css({ m: 0 })}>
        <StatusPage>
          <StatusIcon tone="error">
            <Icon icon="solar:danger-triangle-bold-duotone" width={40} color="#ef4444" />
          </StatusIcon>

          <Stack gap="2" alignItems="center">
            <Text variant="heading-2" weight="bold">
              Something went wrong
            </Text>
            <Text tone="secondary" maxW="sm">
              {error.message || "An unexpected error occurred. Please try again."}
            </Text>
            {error.digest && (
              <Text variant="caption" tone="faint" className={css({ fontFamily: "mono" })}>
                Error ID: {error.digest}
              </Text>
            )}
          </Stack>

          <Flex gap="3" flexWrap="wrap" justifyContent="center">
            <Button
              variant="primary"
              leftIcon={<Icon icon="solar:restart-bold" width={18} />}
              onClick={reset}
            >
              Try again
            </Button>
            <Link
              href="/chat"
              className={cx(buttonRecipe({ variant: "secondary", size: "md" }))}
            >
              <Flex alignItems="center" gap="2">
                <Icon icon="solar:home-2-linear" width={18} />
                Go home
              </Flex>
            </Link>
          </Flex>
        </StatusPage>
      </body>
    </html>
  );
}
