"use client";

import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useChatContext } from "@/contexts/ChatContext";
import { useSessionContext } from "@/contexts/SessionContext";
import { deleteSession } from "@/lib/api";
import type { Session } from "@/types";
import { css, cx } from "@/vendors/styled-system/css";
import { Box, Center, Flex, Stack } from "@/vendors/styled-system/jsx";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_TOP = [
  { icon: "solar:home-2-bold-duotone", label: "Home", href: "/chat" },
  { icon: "solar:document-bold-duotone", label: "Document" },
  { icon: "solar:pen-new-square-bold-duotone", label: "Design" },
  { icon: "solar:presentation-graph-bold-duotone", label: "Presentation" },
  { icon: "solar:gallery-bold-duotone", label: "Image" },
  { icon: "solar:video-library-bold-duotone", label: "Video" },
  { icon: "solar:widget-bold-duotone", label: "More" },
];

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

const navItemBase = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5",
  flexShrink: 0,
  py: "2",
  px: "1",
  borderRadius: "lg",
  fontSize: "12px",
  lineHeight: "1.3",
  fontWeight: "500",
  color: "text.muted",
  cursor: "pointer",
  transition: "background 0.15s ease, color 0.15s ease",
  _hover: { bg: "bg.hover", color: "text" },
});

const navItemExpanded = css({
  flexDirection: "row",
  justifyContent: "flex-start",
  gap: "2.5",
  px: "3",
  py: "2.5",
  fontSize: "md",
  lineHeight: "1.4",
});

const navItemActive = css({
  bg: "bg",
  color: "text",
  boxShadow: "sm",
});

const historyRowBase = css({
  display: "flex",
  alignItems: "center",
  gap: "1",
  flexShrink: 0,
  borderRadius: "lg",
  transition: "background 0.15s ease",
  _hover: { bg: "bg.hover" },
});

const historyRowActive = css({
  bg: "bg",
  boxShadow: "sm",
});

const historyLinkBase = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  flex: 1,
  minW: 0,
  px: "2.5",
  py: "2",
  borderRadius: "lg",
  fontSize: "sm",
  color: "text.muted",
  transition: "color 0.15s ease",
  _hover: { color: "text" },
});

const historyLinkActive = css({
  color: "brand",
  fontWeight: "500",
});

const deleteBtnClass = css({
  flexShrink: 0,
  opacity: 0,
  transition: "opacity 0.15s ease",
  ".group:hover &": { opacity: 1 },
  ".group:focus-within &": { opacity: 1 },
});

function NavItem({
  icon,
  label,
  href,
  active,
  expanded,
}: {
  icon: string;
  label: string;
  href?: string;
  active?: boolean;
  expanded: boolean;
}) {
  const className = cx(
    navItemBase,
    expanded && navItemExpanded,
    active && navItemActive,
  );
  const content = (
    <>
      <Icon icon={icon} width={20} height={20} />
      {expanded ? (
        <span>{label}</span>
      ) : (
        <span
          className={css({
            maxW: "full",
            textAlign: "center",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          })}
        >
          {label}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        title={!expanded ? label : undefined}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <Button
      variant="none"
      size="sm"
      className={className}
      title={!expanded ? label : undefined}
    >
      {content}
    </Button>
  );
}

function SessionHistoryItem({
  session,
  isActive,
  expanded,
  onDeleteClick,
}: {
  session: Session;
  isActive: boolean;
  expanded: boolean;
  onDeleteClick: (session: Session) => void;
}) {
  const title = session.title || "Untitled chat";

  if (!expanded) {
    return (
      <Flex
        className={cx(
          historyRowBase,
          "group",
          isActive && historyRowActive,
          css({ justifyContent: "center", px: "1" }),
        )}
      >
        <Link
          href={`/chat/${session._id}`}
          title={title}
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: "2",
            px: "2",
            borderRadius: "lg",
            color: isActive ? "brand" : "text.muted",
            _hover: { color: isActive ? "brand" : "text" },
          })}
          aria-current={isActive ? "page" : undefined}
        >
          <Icon
            icon="solar:chat-round-line-bold-duotone"
            width={18}
            height={18}
          />
        </Link>
        <Button
          variant="none"
          size="sm"
          className={deleteBtnClass}
          onClick={() => onDeleteClick(session)}
          aria-label={`Delete ${title}`}
          minH="6"
          w="6"
          p="0"
          color="text.faint"
          _hover={{ color: "danger" }}
        >
          <Icon icon="solar:trash-bin-trash-linear" width={16} height={16} />
        </Button>
      </Flex>
    );
  }

  return (
    <Flex className={cx(historyRowBase, "group", isActive && historyRowActive)}>
      <Link
        href={`/chat/${session._id}`}
        className={cx(historyLinkBase, isActive && historyLinkActive)}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon
          icon="solar:chat-round-line-bold-duotone"
          width={16}
          height={16}
          className={css({ flexShrink: 0 })}
        />
        <Box flex="1" truncate>
          {title}
        </Box>
      </Link>
      <Button
        variant="none"
        size="sm"
        className={cx(deleteBtnClass, css({ mr: "1", opacity: 1 }))}
        onClick={() => onDeleteClick(session)}
        aria-label={`Delete ${title}`}
        minH="7"
        w="7"
        p="0"
        color="text.faint"
        _hover={{ color: "danger" }}
      >
        <Icon icon="solar:trash-bin-trash-linear" width={16} height={16} />
      </Button>
    </Flex>
  );
}

export function SidebarNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { sessions, setSessions } = useSessionContext();
  const { dispatch } = useChatContext();
  const [expanded, setExpanded] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<Session | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored !== null) setExpanded(stored !== "true");
  }, []);

  const toggleSidebar = () => {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "false" : "true");
      return next;
    });
  };

  const isChatRoute = pathname === "/chat" || pathname.startsWith("/chat/");
  const activeId = pathname.startsWith("/chat/")
    ? pathname.split("/")[2]
    : null;

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete._id;
    setIsDeleting(true);
    try {
      setSessions((prev) => prev.filter((s) => s._id !== id));
      dispatch({ type: "CLEAR_SESSION", sessionId: id });
      await deleteSession(id);
      if (pathname === `/chat/${id}`) router.push("/chat");
      setPendingDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteTitle = pendingDelete?.title || "Untitled chat";

  return (
    <>
      <Box
        as="aside"
        display="flex"
        flexDirection="column"
        h="full"
        flexShrink={0}
        overflow="hidden"
        borderRightWidth="1px"
        borderColor="border"
        bg="bg.subtle"
        w={expanded ? "248px" : "84px"}
        transition="width 0.2s ease"
        p="2"
      >
        <Flex
          alignItems="center"
          justifyContent={expanded ? "space-between" : "center"}
          px={expanded ? "2.5" : "2"}
          py="2"
          flexShrink={0}
          gap="2"
        >
          <Link
            href="/chat"
            title="Template.net"
            className={css({
              display: expanded ? "flex" : "none",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              w: "8",
              h: "8",
              borderRadius: "md",
              bg: "brand",
              color: "white",
              fontSize: "md",
              fontWeight: "bold",
              lineHeight: "1",
              fontFamily: "sans",
              transition: "transform 0.15s ease",
              _hover: { transform: "scale(1.04)" },
            })}
          >
            T
          </Link>
          {expanded && <Box flex="1" />}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={expanded}
            flexShrink={0}
            minW="9"
            minH="9"
            w="9"
            h="9"
            p="0"
            borderRadius="lg"
            title={expanded ? "Collapse" : "Expand"}
          >
            <Icon
              icon={
                expanded
                  ? "solar:sidebar-minimalistic-linear"
                  : "solar:sidebar-minimalistic-bold-duotone"
              }
              width={20}
              height={20}
            />
          </Button>
        </Flex>

        <Stack
          flex="1"
          minH="0"
          overflowY="auto"
          gap="0"
          className={css({ scrollbarWidth: "thin" })}
        >
          <Stack gap="0" py="1" flexShrink={0}>
            {NAV_TOP.map((item) => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={!!item.href && item.href === "/chat" && isChatRoute}
                expanded={expanded}
              />
            ))}
          </Stack>

          <Box
            mx={expanded ? "4" : "3"}
            my="2"
            h="1px"
            bg="border"
            flexShrink={0}
          />

          <Box flexShrink={0} px={expanded ? "3" : "1"} pb="2">
            {expanded ? (
              <Flex alignItems="center" justifyContent="space-between" mb="2">
                <Text variant="body-2" tone="secondary" weight="semibold">
                  Chat history
                </Text>
                <Link
                  href="/chat"
                  className={css({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    w: "7",
                    h: "7",
                    borderRadius: "md",
                    color: "brand",
                    _hover: { bg: "brand-muted" },
                  })}
                  title="New chat"
                >
                  <Icon icon="solar:add-square-bold" width={22} height={22} />
                </Link>
              </Flex>
            ) : (
              <Flex justifyContent="center" mb="2">
                <Link
                  href="/chat"
                  className={css({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    w: "8",
                    h: "8",
                    borderRadius: "lg",
                    color: "brand",
                    _hover: { bg: "brand-muted" },
                  })}
                  title="New chat"
                >
                  <Icon icon="solar:add-square-bold" width={18} height={18} />
                </Link>
              </Flex>
            )}

            <Stack gap="0.5" display={expanded ? "flex" : "none"}>
              {sessions.length === 0
                ? expanded && (
                    <Text variant="body-2" tone="secondary" py="1">
                      No chats yet
                    </Text>
                  )
                : sessions.map((s) => (
                    <SessionHistoryItem
                      key={s._id}
                      session={s}
                      isActive={activeId === s._id}
                      expanded={expanded}
                      onDeleteClick={setPendingDelete}
                    />
                  ))}
            </Stack>
          </Box>
        </Stack>

        <Center
          flexShrink={0}
          borderTopWidth="1px"
          borderColor="border"
          px={expanded ? "2" : "1"}
          py="2"
        >
          <ThemeToggle compact={!expanded} />
        </Center>
      </Box>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this chat?"
        description={`"${deleteTitle}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => !isDeleting && setPendingDelete(null)}
      />
    </>
  );
}
