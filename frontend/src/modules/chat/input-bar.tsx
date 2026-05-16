"use client";

import { Button } from "@/components/button";
import { uploadFile } from "@/lib/api";
import type { Attachment } from "@/types";
import { css } from "@/vendors/styled-system/css";
import { Box, Flex, styled } from "@/vendors/styled-system/jsx";
import { Icon } from "@iconify/react";
import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

interface Props {
  onSend: (prompt: string, attachments: Attachment[]) => void;
  isLoading: boolean;
}

const ACCEPTED =
  "image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain";

const InputShell = styled(Box, {
  base: {
    maxW: "3xl",
    mx: "auto",
    borderRadius: "xl",
    bg: "surface",
    borderWidth: "1px",
    borderColor: "border.strong",
    boxShadow: "sm",
    transition: "box-shadow 0.15s ease",
    _focusWithin: {
      borderColor: "brand",
      boxShadow: "0 0 0 3px rgba(59, 59, 255, 0.12)",
    },
  },
});

const HiddenInput = styled("input", {
  base: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    border: 0,
  },
});

const TextArea = styled("textarea", {
  base: {
    flex: 1,
    resize: "none",
    bg: "transparent",
    outline: "none",
    fontSize: "sm",
    lineHeight: "relaxed",
    color: "text",
    minH: "22px",
    maxH: "200px",
    fontFamily: "sans",
    _placeholder: { color: "text.faint" },
    _disabled: { opacity: 0.6 },
  },
});

export function InputBar({ onSend, isLoading }: Props) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";
      setUploading(true);
      try {
        const att = await uploadFile(file);
        setAttachments((prev) => [...prev, att]);
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  const removeAttachment = (idx: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!text.trim() || isLoading || uploading) return;
    onSend(text.trim(), attachments);
    setText("");
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = text.trim().length > 0 && !isLoading && !uploading;

  return (
    <InputShell>
      {attachments.length > 0 && (
        <Flex
          flexWrap="wrap"
          gap="2"
          px="4"
          pt="3"
          pb="2"
          borderBottomWidth="1px"
          borderColor="border"
        >
          {attachments.map((att, i) => (
            <Flex
              key={i}
              alignItems="center"
              gap="1.5"
              px="2.5"
              py="1.5"
              borderRadius="lg"
              fontSize="xs"
              borderWidth="1px"
              borderColor="border"
              bg="bg.subtle"
              maxW="180px"
            >
              {att.type === "image" ? (
                <img
                  src={att.url}
                  alt={att.name}
                  className={css({
                    w: "5",
                    h: "5",
                    objectFit: "cover",
                    borderRadius: "sm",
                  })}
                />
              ) : (
                <Icon icon="solar:file-bold-duotone" width={16} color="#3B3BFF" />
              )}
              <Box truncate color="text.muted">
                {att.name}
              </Box>
              <Button
                variant="none"
                size="sm"
                onClick={() => removeAttachment(i)}
                aria-label="Remove attachment"
                color="text.faint"
                _hover={{ color: "danger" }}
              >
                <Icon icon="solar:close-circle-bold" width={14} />
              </Button>
            </Flex>
          ))}
        </Flex>
      )}

      <Flex alignItems="flex-end" gap="2" px="3" py="2.5">
        <HiddenInput
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          onChange={handleFileChange}
          disabled={uploading}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          minH="9"
          w="9"
          p="0"
          borderWidth="1px"
          borderColor="border.strong"
          borderRadius="full"
          title="Attach file"
        >
          {uploading ? (
            <Icon
              icon="solar:refresh-circle-bold-duotone"
              width={20}
              className={css({ animation: "spin 1s linear infinite" })}
            />
          ) : (
            <Icon icon="solar:add-square-bold-duotone" width={20} />
          )}
        </Button>

        <TextArea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            autoResize();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask template.net"
          rows={1}
          disabled={isLoading}
        />

        <Button
          variant={canSend ? "primary" : "secondary"}
          size="md"
          onClick={handleSubmit}
          disabled={!canSend}
          leftIcon={<Icon icon="solar:stars-bold" width={16} />}
        >
          Generate Free
        </Button>
      </Flex>
    </InputShell>
  );
}
