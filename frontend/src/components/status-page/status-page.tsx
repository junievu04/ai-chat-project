import { Flex, type FlexProps } from "@/vendors/styled-system/jsx";
import type { ReactNode } from "react";

export type StatusPageProps = FlexProps & {
  children: ReactNode;
  minH?: FlexProps["minH"];
};

export function StatusPage({
  children,
  minH = "100vh",
  ...props
}: StatusPageProps) {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      gap="6"
      px="4"
      py="8"
      textAlign="center"
      bg="bg"
      color="text"
      minH={minH}
      {...props}
    >
      {children}
    </Flex>
  );
}
