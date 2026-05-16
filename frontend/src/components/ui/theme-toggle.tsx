"use client";

import { Text } from "@/components/text";
import { Button } from "@/components/button";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      fullWidth
      justifyContent="flex-start"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      leftIcon={
        <Icon
          icon={isDark ? "solar:sun-bold-duotone" : "solar:moon-bold-duotone"}
          width={20}
        />
      }
    >
      <Text tone="secondary" variant="body-2">
        {isDark ? "Light mode" : "Dark mode"}
      </Text>
    </Button>
  );
}
