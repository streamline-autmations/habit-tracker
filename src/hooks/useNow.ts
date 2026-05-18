import { useEffect, useState } from "react";

// Ticks frequently enough that the minute on streak counters rolls over
// promptly, without jarring per-second jumps.
export function useNow(intervalMs = 15000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
