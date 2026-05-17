"use client";

import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { Box, Center, Flex } from "@/vendors/styled-system/jsx";
import { useEffect, useRef } from "react";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <Center
      role="presentation"
      position="fixed"
      inset="0"
      zIndex={50}
      p="4"
      bg="rgba(0,0,0,0.45)"
      onClick={onCancel}
    >
      <Box
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? "confirm-dialog-desc" : undefined}
        bg="bg"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border"
        boxShadow="md"
        w="full"
        maxW="sm"
        p="6"
        onClick={(e) => e.stopPropagation()}
      >
        <Text
          id="confirm-dialog-title"
          variant="heading-2"
          weight="semibold"
          mb={description ? "2" : "5"}
        >
          {title}
        </Text>
        {description && (
          <Text
            id="confirm-dialog-desc"
            tone="secondary"
            variant="body-2"
            mb="5"
          >
            {description}
          </Text>
        )}
        <Flex gap="2" justifyContent="flex-end">
          <Button
            ref={cancelRef}
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            size="md"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </Flex>
      </Box>
    </Center>
  );
}
