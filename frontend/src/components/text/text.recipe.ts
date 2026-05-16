import { cva } from "@/vendors/styled-system/css";

export const textRecipe = cva({
  base: {
    lineHeight: "1.6",
  },
  variants: {
    variant: {
      "heading-1": { fontSize: "xl", fontWeight: "semibold" },
      "heading-2": { fontSize: "lg", fontWeight: "semibold" },
      "body-1": { fontSize: "md" },
      "body-2": { fontSize: "sm" },
      caption: { fontSize: "xs" },
      metric: { fontSize: "3rem", fontWeight: "bold" },
    },
    weight: {
      normal: { fontWeight: "normal" },
      medium: { fontWeight: "medium" },
      semibold: { fontWeight: "semibold" },
      bold: { fontWeight: "bold" },
    },
    tone: {
      primary: { color: "text" },
      secondary: { color: "text.muted" },
      faint: { color: "text.faint" },
      inverse: { color: "white" },
      brand: { color: "brand" },
      error: { color: "danger" },
      inherit: { color: "inherit" },
    },
    align: {
      left: { textAlign: "left" },
      center: { textAlign: "center" },
      right: { textAlign: "right" },
    },
  },
  defaultVariants: {
    variant: "body-2",
    weight: "normal",
    tone: "primary",
    align: "left",
  },
});
