import { Box, type BoxProps } from "@/vendors/styled-system/jsx";
import type { ReactNode } from "react";

export type StatusIconProps = BoxProps & {
  children: ReactNode;
  tone?: "default" | "error";
};

export function StatusIcon({
  children,
  tone = "default",
  ...props
}: StatusIconProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      w="20"
      h="20"
      borderRadius="lg"
      bg={tone === "error" ? "danger-light" : "bg.subtle"}
      borderWidth="1px"
      borderStyle="solid"
      borderColor={tone === "error" ? "danger-border" : "border"}
      {...props}
    >
      {children}
    </Box>
  );
}
