import { SessionProvider } from "@/contexts/SessionContext";
import { fetchSessions } from "@/lib/api";
import { SidebarNav } from "@/modules/layout/sidebar-nav";
import { Flex } from "@/vendors/styled-system/jsx";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Chat" };

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessions = await fetchSessions().catch(() => []);

  return (
    <SessionProvider initialSessions={sessions}>
      <Flex h="100vh" overflow="hidden" bg="bg">
        <SidebarNav />
        <Flex direction="column" flex="1" minW="0" overflow="hidden">
          {children}
        </Flex>
      </Flex>
    </SessionProvider>
  );
}
