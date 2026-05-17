import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  jsxFramework: "react",
  include: [
    "./src/components/**/*.{ts,tsx}",
    "./src/modules/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  exclude: [],
  importMap: "@/vendors/styled-system",
  outdir: "./src/vendors/styled-system",

  conditions: {
    dark: ".dark &",
  },

  globalCss: {
    extend: {
      html: { height: "100%" },
      body: {
        height: "100%",
        fontFamily: "sans",
        bg: "bg",
        color: "text",
        WebkitFontSmoothing: "antialiased",
      },
      "*, *::before, *::after": { boxSizing: "border-box" },
      a: { color: "inherit", textDecoration: "none" },
      button: {
        cursor: "pointer",
        border: "none",
        bg: "transparent",
        font: "inherit",
        color: "inherit",
      },
    },
  },

  theme: {
    extend: {
      tokens: {
        colors: {
          brand: { value: "#3B3BFF" },
          "brand-hover": { value: "#2a2ae0" },
          "brand-muted": { value: "rgba(59, 59, 255, 0.08)" },
          danger: { value: "#ef4444" },
          "danger-light": { value: "#fff0f0" },
          "danger-border": { value: "#fecaca" },
        },
        fonts: {
          sans: {
            value:
              'var(--font-geist-sans, "Inter"), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          },
          mono: {
            value:
              'var(--font-geist-mono, "Geist Mono"), "Fira Code", monospace',
          },
        },
        radii: {
          sm: { value: "8px" },
          md: { value: "12px" },
          lg: { value: "16px" },
          xl: { value: "24px" },
        },
        shadows: {
          sm: { value: "0 1px 4px rgba(0,0,0,0.06)" },
          md: { value: "0 4px 16px rgba(0,0,0,0.10)" },
          brand: { value: "0 2px 8px rgba(59,59,255,0.3)" },
        },
        sizes: {
          sidebar: { value: "72px" },
          "sidebar-expanded": { value: "220px" },
        },
      },
      semanticTokens: {
        colors: {
          bg: {
            DEFAULT: { value: { base: "#ffffff", _dark: "#0d0d0d" } },
            subtle: { value: { base: "#f9f9f9", _dark: "#161616" } },
            hover: { value: { base: "#f2f2f2", _dark: "#1e1e1e" } },
          },
          surface: {
            DEFAULT: { value: { base: "#ffffff", _dark: "#181818" } },
          },
          border: {
            DEFAULT: { value: { base: "#e5e5e5", _dark: "#2a2a2a" } },
            strong: { value: { base: "#d0d0d0", _dark: "#3a3a3a" } },
          },
          text: {
            DEFAULT: { value: { base: "#111111", _dark: "#f0f0f0" } },
            muted: { value: { base: "#888888", _dark: "#888888" } },
            faint: { value: { base: "#bbbbbb", _dark: "#444444" } },
          },
          userBubble: {
            bg: { value: { base: "#e8ecf4", _dark: "#3b3bff" } },
            fg: { value: { base: "#111111", _dark: "#ffffff" } },
          },
        },
      },
      keyframes: {
        bounceDot: {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: 0.45 },
          "30%": { transform: "translateY(-6px)", opacity: 1 },
        },
        fadeSlide: {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        spinnerDash: {
          "0%": { strokeDasharray: "1px, 200px", strokeDashoffset: 0 },
          "50%": { strokeDasharray: "100px, 200px", strokeDashoffset: -15 },
          "100%": { strokeDasharray: "100px, 200px", strokeDashoffset: -125 },
        },
        typingBounce: {
          "0%, 60%, 100%": { transform: " translateY(0)" },
          "30%": { transform: "translateY(-5px)" },
        },
      },
    },
  },
});
