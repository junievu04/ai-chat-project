"use client";

import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  compact?: boolean;
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";
  const icon = (
    <Icon
      icon={isDark ? "solar:sun-bold-duotone" : "solar:moon-bold-duotone"}
      width={20}
      height={20}
    />
  );

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        flexShrink={0}
        minW="9"
        minH="9"
        w="9"
        h="9"
        p="0"
        mx="auto"
        borderRadius="lg"
        title={isDark ? "Light mode" : "Dark mode"}
      >
        {icon}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      fullWidth
      justifyContent="flex-start"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      leftIcon={icon}
    >
      <Text tone="secondary" variant="body-2">
        {isDark ? "Light mode" : "Dark mode"}
      </Text>
    </Button>
  );
}
