export function toAiErrorMessage(err: unknown): string {
  const raw =
    err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const lower = raw.toLowerCase();

  if (
    lower.includes("googlegenerativeai") ||
    lower.includes("quota") ||
    lower.includes("429") ||
    lower.includes("too many requests")
  ) {
    return "Quota exceeded. Try again later.";
  }

  return "Something went wrong. Try again.";
}
