import { pad2 } from "./utils";

const H = 3600;
const D = 86400;

export interface Milestone {
  key: string;
  label: string;
  seconds: number;
  benefit: string;
}

// Smoking-recovery timeline. The ladder itself is used generically for the
// progress bar on every habit; the benefit copy is shown on Progress.
export const MILESTONES: Milestone[] = [
  { key: "24h", label: "24h", seconds: 24 * H, benefit: "Nicotine starting to clear your system" },
  { key: "72h", label: "72h", seconds: 72 * H, benefit: "Nicotine gone. The chemical part is done — rest is mental." },
  { key: "7d", label: "7 days", seconds: 7 * D, benefit: "Brain dopamine receptors beginning to recover" },
  { key: "14d", label: "14 days", seconds: 14 * D, benefit: "Cravings significantly weaker" },
  { key: "21d", label: "21 days", seconds: 21 * D, benefit: "New baseline forming" },
  { key: "30d", label: "30 days", seconds: 30 * D, benefit: "1 month. Lung function measurably better." },
  { key: "60d", label: "60 days", seconds: 60 * D, benefit: "You're a different person now" },
  { key: "90d", label: "90 days", seconds: 90 * D, benefit: "Brain chemistry largely reset" },
  { key: "6mo", label: "6 months", seconds: 182 * D, benefit: "Statistically, you're past the relapse danger zone" },
  { key: "1yr", label: "1 year", seconds: 365 * D, benefit: "Risk profile approaches a non-smoker" },
];

export function streakSeconds(startISO: string, now = Date.now()): number {
  const start = new Date(startISO).getTime();
  return Math.max(0, Math.floor((now - start) / 1000));
}

// "3d 14h 22m" — under a day shows calmly as "00h 00m" style, no days, no red.
export function formatStreak(seconds: number): string {
  const d = Math.floor(seconds / D);
  const h = Math.floor((seconds % D) / H);
  const m = Math.floor((seconds % H) / 60);
  if (d > 0) return `${d}d ${pad2(h)}h ${pad2(m)}m`;
  return `${pad2(h)}h ${pad2(m)}m`;
}

export interface MilestoneProgress {
  next: Milestone | null;
  prevSeconds: number;
  fraction: number; // 0..1 toward next
}

export function milestoneProgress(seconds: number): MilestoneProgress {
  let prev = 0;
  for (const m of MILESTONES) {
    if (seconds < m.seconds) {
      const span = m.seconds - prev;
      return { next: m, prevSeconds: prev, fraction: span > 0 ? (seconds - prev) / span : 1 };
    }
    prev = m.seconds;
  }
  return { next: null, prevSeconds: prev, fraction: 1 };
}

export function reachedMilestones(seconds: number): Milestone[] {
  return MILESTONES.filter((m) => seconds >= m.seconds);
}

export function moneySaved(seconds: number, costPerDay: number): number {
  return (seconds / D) * costPerDay;
}

export function minutesReclaimed(seconds: number, minutesPerDay: number): number {
  return Math.round((seconds / D) * minutesPerDay);
}

export function formatRand(n: number): string {
  return `R${Math.round(n).toLocaleString("en-ZA")}`;
}

export function formatHours(minutes: number): string {
  const h = Math.round(minutes / 60);
  if (h < 48) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}
