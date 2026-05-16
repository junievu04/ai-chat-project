import { fetchSessionMessages } from "@/lib/api";
import withErrorBoundary from "@/lib/withErrorBoundary";
import ChatViewClient from "@/modules/chat/chat-view.client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sessionId } = await params;
  const data = await fetchSessionMessages(sessionId).catch(() => null);
  return { title: data?.session?.title || "Chat" };
}

const SessionPage = async ({ params }: Props) => {
  const { sessionId } = await params;
  const data = await fetchSessionMessages(sessionId).catch(() => null);
  if (!data) notFound();

  return (
    <ChatViewClient
      sessionId={sessionId}
      initialMessages={data.messages}
    />
  );
};

export default withErrorBoundary(SessionPage);
