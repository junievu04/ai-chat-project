"use client";

import { Spinner } from "@/components/spinner";
import { styled, type HTMLStyledProps } from "@/vendors/styled-system/jsx";
import { forwardRef, type ReactNode } from "react";
import { buttonRecipe } from "./button.recipe";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "dashed"
  | "danger"
  | "none";

export type ButtonSize = "sm" | "md" | "lg";

const StyledButton = styled("button", buttonRecipe);

export type ButtonProps = HTMLStyledProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <StyledButton
        ref={ref}
        type="button"
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner w="4" h="4" tone="inherit" />
            {loadingText ?? children}
          </>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </StyledButton>
    );
  },
);

Button.displayName = "Button";
