"use client";

import { cx } from "@/vendors/styled-system/css";
import { Box, type BoxProps } from "@/vendors/styled-system/jsx";
import { forwardRef } from "react";
import {
  spinnerCircleRecipe,
  spinnerContainerRecipe,
  spinnerSvgRecipe,
} from "./spinner.recipe";

export type SpinnerTone = "default" | "inherit" | "muted" | "inverse";

export type SpinnerProps = BoxProps & {
  tone?: SpinnerTone;
  thickness?: number;
};

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ tone = "default", thickness = 3.6, className, w, h, ...props }, ref) => {
    const radius = 22 - thickness / 2;

    return (
      <Box
        ref={ref}
        role="progressbar"
        aria-label="Loading"
        className={cx(spinnerContainerRecipe(), className)}
        w={w ?? "8"}
        h={h ?? "8"}
        {...props}
      >
        <svg className={spinnerSvgRecipe()} viewBox="22 22 44 44">
          <circle
            className={spinnerCircleRecipe({ tone })}
            cx="44"
            cy="44"
            r={radius}
            style={{ strokeWidth: thickness }}
          />
        </svg>
      </Box>
    );
  },
);

Spinner.displayName = "Spinner";
