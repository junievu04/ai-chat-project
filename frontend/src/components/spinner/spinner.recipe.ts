import { cva } from "@/vendors/styled-system/css";

export const spinnerContainerRecipe = cva({
  base: {
    display: "inline-block",
    animation: "spin 1.4s linear infinite",
  },
});

export const spinnerSvgRecipe = cva({
  base: { w: "100%", h: "100%" },
});

export const spinnerCircleRecipe = cva({
  base: {
    strokeDasharray: "80px, 200px",
    strokeDashoffset: "0",
    animation: "spinnerDash 1.4s ease-in-out infinite",
    strokeLinecap: "round",
    fill: "none",
  },
  variants: {
    tone: {
      default: { stroke: "brand" },
      inherit: { stroke: "currentColor" },
      muted: { stroke: "text.muted" },
      inverse: { stroke: "white" },
    },
  },
  defaultVariants: { tone: "default" },
});
