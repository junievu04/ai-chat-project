import { cx } from "@/vendors/styled-system/css";
import { styled, type HTMLStyledProps } from "@/vendors/styled-system/jsx";
import type { ReactNode } from "react";
import { textRecipe } from "./text.recipe";

export type TextVariant =
  | "heading-1"
  | "heading-2"
  | "body-1"
  | "body-2"
  | "caption"
  | "metric";

export type TextTone =
  | "primary"
  | "secondary"
  | "faint"
  | "inverse"
  | "brand"
  | "error"
  | "inherit";

const variantTag: Record<TextVariant, "h1" | "h2" | "p" | "span"> = {
  "heading-1": "h1",
  "heading-2": "h2",
  "body-1": "p",
  "body-2": "p",
  caption: "span",
  metric: "span",
};

const StyledText = styled("span", textRecipe);

export type TextProps = HTMLStyledProps<"span"> & {
  variant?: TextVariant;
  weight?: "normal" | "medium" | "semibold" | "bold";
  tone?: TextTone;
  align?: "left" | "center" | "right";
  htmlTag?: "h1" | "h2" | "h3" | "p" | "span" | "label";
  className?: string;
  children?: ReactNode;
};

export function Text({
  variant = "body-2",
  weight = "normal",
  tone = "primary",
  align = "left",
  htmlTag,
  className,
  children,
  ...rest
}: TextProps) {
  return (
    <StyledText
      as={htmlTag ?? variantTag[variant]}
      variant={variant}
      weight={weight}
      tone={tone}
      align={align}
      className={cx(className)}
      {...rest}
    >
      {children}
    </StyledText>
  );
}
