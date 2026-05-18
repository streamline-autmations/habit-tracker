import type { Quote } from "./types";

function dayHash(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = (h * 31 + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Deterministic per-day pick so the anchor quote rotates daily but is stable
// across reloads on the same day.
export function dailyQuote(
  quotes: Quote[],
  category: string,
  dateStr: string,
): Quote | null {
  const pool =
    category && category !== "all"
      ? quotes.filter((q) => q.category === category)
      : quotes;
  const list = pool.length ? pool : quotes;
  if (!list.length) return null;
  return list[dayHash(dateStr) % list.length];
}
