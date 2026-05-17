import { cva } from "@/vendors/styled-system/css";

export const buttonRecipe = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2",
    borderRadius: "full",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "transparent",
    fontWeight: "semibold",
    transition: "all 0.15s ease",
    cursor: "pointer",
    _disabled: {
      opacity: 0.5,
      cursor: "not-allowed",
      pointerEvents: "none",
    },
    "& svg": {
      flexShrink: 0,
    },
  },
  variants: {
    variant: {
      primary: {
        bg: "brand",
        color: "white",
        boxShadow: "brand",
        _hover: { opacity: 0.9, transform: "translateY(-1px)" },
      },
      secondary: {
        bg: "bg.subtle",
        color: "text",
        borderColor: "border",
        _hover: { opacity: 0.85 },
      },
      ghost: {
        bg: "transparent",
        color: "text.muted",
        _hover: { bg: "bg.hover", color: "text" },
      },
      dashed: {
        bg: "transparent",
        color: "brand",
        borderStyle: "dashed",
        borderColor: "brand",
        _hover: { bg: "brand-muted" },
      },
      danger: {
        bg: "danger",
        color: "white",
        _hover: { opacity: 0.9 },
      },
      none: {
        bg: "transparent",
        border: "none",
        minH: "auto",
        p: 0,
      },
    },
    size: {
      sm: { fontSize: "xs", px: "3", py: "1.5", minH: "8" },
      md: { fontSize: "sm", px: "4", py: "2", minH: "9" },
      lg: { fontSize: "sm", px: "5", py: "2.5", minH: "10" },
    },
    fullWidth: {
      true: { w: "full" },
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    fullWidth: false,
  },
});
