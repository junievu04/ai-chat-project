import { ChatProvider } from "@/contexts/ChatContext";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "src/vendors/tanstack-query/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AI Chat", template: "%s | AI Chat" },
  description: "AI-powered chat assistant powered by Gemini",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="h-full antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <ChatProvider>{children}</ChatProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
