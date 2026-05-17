"use client";

import { Button, buttonRecipe } from "@/components/button";
import { Text } from "@/components/text";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useChatContext } from "@/contexts/ChatContext";
import { useSessionContext } from "@/contexts/SessionContext";
import { deleteSession } from "@/lib/api";
import { css, cx } from "@/vendors/styled-system/css";
import { Box, Flex, Stack, styled } from "@/vendors/styled-system/jsx";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV_TOP = [
  { icon: "solar:home-2-bold-duotone", label: "Home", href: "/" },
  { icon: "solar:document-bold-duotone", label: "Document" },
  { icon: "solar:pen-new-square-bold-duotone", label: "Design" },
  { icon: "solar:presentation-graph-bold-duotone", label: "Presentation" },
  { icon: "solar:gallery-bold-duotone", label: "Image" },
  { icon: "solar:video-library-bold-duotone", label: "Video" },
  { icon: "solar:widget-bold-duotone", label: "More" },
];

const NAV_BOTTOM = [
  { icon: "solar:layers-minimalistic-bold-duotone", label: "Templates" },
  { icon: "solar:crown-bold-duotone", label: "Brand" },
  { icon: "solar:folder-bold-duotone", label: "Projects" },
];

const sidebarStyles = css({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
  flexShrink: 0,
  width: "72px",
  borderRightWidth: "1px",
  borderColor: "border",
  bg: "bg",
  transition: "width 0.2s ease",
  _hover: {
    width: "220px",
    "& [data-expand]": { opacity: 1, pointerEvents: "auto" },
    "& [data-brand-text]": { opacity: 1 },
    "& [data-brand-icon]": { opacity: 0 },
  },
});

const expandHidden = css({
  opacity: 0,
  pointerEvents: "none",
  transition: "opacity 0.15s ease",
  whiteSpace: "nowrap",
});

const navItemClass = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  width: "100%",
  px: "3",
  py: "2.5",
  borderRadius: "lg",
  fontSize: "sm",
  color: "text.muted",
  cursor: "pointer",
  transition: "background 0.15s ease, color 0.15s ease",
  _hover: { bg: "bg.hover", color: "text" },
});

const SessionLink = styled(Link, {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "2",
    px: "3",
    py: "2",
    borderRadius: "lg",
    fontSize: "xs",
    color: "text.muted",
    transition: "background 0.15s ease, color 0.15s ease",
    overflow: "hidden",
    _hover: { bg: "bg.hover", color: "text" },
  },
  variants: {
    active: {
      true: { bg: "brand-muted", color: "brand" },
      false: {},
    },
  },
});

export function SidebarNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { sessions, setSessions } = useSessionContext();
  const { dispatch } = useChatContext();
  const [expanded, setExpanded] = useState(false);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s._id !== id));
    dispatch({ type: "CLEAR_SESSION", sessionId: id });
    await deleteSession(id).catch(console.error);
    if (pathname === `/chat/${id}`) router.push("/chat");
  };

  const activeId = pathname.startsWith("/chat/")
    ? pathname.split("/")[2]
    : null;

  return (
    <Box as="aside" className={sidebarStyles}>
      <Flex
        alignItems="center"
        h="14"
        px="4"
        flexShrink={0}
        overflow="hidden"
        borderBottomWidth="1px"
        borderColor="border"
        position="relative"
      >
        <Text
          weight="bold"
          tone="brand"
          variant="body-2"
          className={css({
            opacity: 0,
            transition: "opacity 0.15s",
          })}
          data-brand-text
        >
          <strong>TEMPLATE</strong>.NET
        </Text>
        <Box
          position="absolute"
          left="4"
          data-brand-icon
          className={css({ transition: "opacity 0.15s" })}
        >
          <Icon
            icon="solar:chat-round-bold-duotone"
            width={24}
            color="#3B3BFF"
          />
        </Box>
      </Flex>

      <Stack gap="0" py="2" flexShrink={0}>
        {NAV_TOP.map((item) =>
          item.href ? (
            <Link key={item.label} href={item.href} className={navItemClass}>
              <Icon icon={item.icon} width={20} />
              <span className={expandHidden} data-expand>
                {item.label}
              </span>
            </Link>
          ) : (
            <Button
              key={item.label}
              variant="ghost"
              size="sm"
              className={navItemClass}
            >
              <Icon icon={item.icon} width={20} />
              <span className={expandHidden} data-expand>
                {item.label}
              </span>
            </Button>
          ),
        )}
      </Stack>

      <Box mx="3" my="1" h="1px" bg="border" flexShrink={0} />

      <Box px="2" py="1" flexShrink={0}>
        <Link
          href="/chat"
          className={cx(
            buttonRecipe({ variant: "dashed", size: "sm", fullWidth: true }),
            expandHidden,
          )}
          data-expand
        >
          <Flex alignItems="center" gap="2" justifyContent="center">
            <Icon icon="solar:add-square-bold" width={16} />
            New Chat
          </Flex>
        </Link>
      </Box>

      <Stack
        flex="1"
        overflowY="auto"
        px="2"
        py="1"
        gap="0.5"
        className={css({ scrollbarWidth: "thin" })}
      >
        {sessions.slice(0, expanded ? undefined : 8).map((s) => (
          <SessionLink
            key={s._id}
            href={`/chat/${s._id}`}
            active={activeId === s._id}
            className={expandHidden}
            data-expand
          >
            <Icon icon="solar:chat-line-linear" width={16} />
            <Box flex="1" truncate>
              {s.title}
            </Box>
            <Button
              variant="none"
              size="sm"
              onClick={(e) => handleDelete(s._id, e)}
              aria-label="Delete"
              _groupHover={{ opacity: 1 }}
              color="text.faint"
              _hover={{ color: "danger" }}
            >
              <Icon icon="solar:trash-bin-trash-linear" width={16} />
            </Button>
          </SessionLink>
        ))}

        {sessions.length > 8 && (
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => setExpanded((v) => !v)}
            className={expandHidden}
            data-expand
            justifyContent="flex-start"
            color="text.faint"
          >
            {expanded ? "↑ Show less" : `+${sessions.length - 8} more`}
          </Button>
        )}
      </Stack>

      <Box flexShrink={0} borderTopWidth="1px" borderColor="border">
        <Stack gap="0" py="1">
          {NAV_BOTTOM.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              size="sm"
              className={navItemClass}
            >
              <Icon icon={item.icon} width={20} />
              <span className={expandHidden} data-expand>
                {item.label}
              </span>
            </Button>
          ))}
        </Stack>

        <Stack gap="1" px="2" pb="2">
          <Button variant="ghost" size="sm" className={navItemClass}>
            <Icon icon="solar:login-2-bold-duotone" width={20} />
            <span className={expandHidden} data-expand>
              Sign In
            </span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            fullWidth
            className={expandHidden}
            data-expand
            leftIcon={<Icon icon="solar:crown-bold" width={16} />}
          >
            Upgrade
          </Button>

          <Box className={expandHidden} data-expand>
            <ThemeToggle />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
