export function formatChatError(raw: string): string {
  const lower = raw.toLowerCase();

  if (
    lower.includes("googlegenerativeai") ||
    lower.includes("generativelanguage") ||
    lower.includes("quota") ||
    lower.includes("429") ||
    lower.includes("too many requests")
  ) {
    return "Quota exceeded. Try again later.";
  }

  if (raw.length > 80) {
    return "Something went wrong. Try again.";
  }

  return raw.trim() || "Something went wrong. Try again.";
}
