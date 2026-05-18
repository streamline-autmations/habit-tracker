import { pad2 } from "./utils";
import type { HabitName } from "./types";

const H = 3600;
const D = 86400;

export interface Milestone {
  key: string;
  label: string;
  seconds: number;
  benefit: string;
}

// Smoking-recovery timeline (medically grounded).
export const SMOKING_MILESTONES: Milestone[] = [
  { key: "24h", label: "24h", seconds: 24 * H, benefit: "Nicotine starting to clear your system" },
  { key: "72h", label: "72h", seconds: 72 * H, benefit: "Nicotine gone. The chemical part is done — the rest is mental." },
  { key: "7d", label: "7 days", seconds: 7 * D, benefit: "Brain dopamine receptors beginning to recover" },
  { key: "14d", label: "14 days", seconds: 14 * D, benefit: "Cravings noticeably weaker. Circulation improving." },
  { key: "21d", label: "21 days", seconds: 21 * D, benefit: "New baseline forming — the habit loop is breaking" },
  { key: "30d", label: "30 days", seconds: 30 * D, benefit: "1 month. Lung function measurably better." },
  { key: "60d", label: "60 days", seconds: 60 * D, benefit: "You're a different person now" },
  { key: "90d", label: "90 days", seconds: 90 * D, benefit: "Brain chemistry largely reset" },
  { key: "180d", label: "6 months", seconds: 182 * D, benefit: "Statistically past the relapse danger zone" },
  { key: "270d", label: "9 months", seconds: 273 * D, benefit: "Lung cilia regrown — less coughing, more breath" },
  { key: "365d", label: "1 year", seconds: 365 * D, benefit: "Heart-disease risk roughly halved vs a smoker" },
  { key: "730d", label: "2 years", seconds: 730 * D, benefit: "Heart-attack risk close to someone who never smoked" },
];

// Off-the-feed timeline (attention / dopamine / mood).
export const SOCIAL_MILESTONES: Milestone[] = [
  { key: "24h", label: "24h", seconds: 24 * H, benefit: "First day you didn't reach for it on reflex" },
  { key: "72h", label: "72h", seconds: 72 * H, benefit: "The phantom-buzz, check-the-phone reflex starts fading" },
  { key: "7d", label: "7 days", seconds: 7 * D, benefit: "Attention span stretching — you can sit and read again" },
  { key: "14d", label: "14 days", seconds: 14 * D, benefit: "Comparison spiral goes quiet. Your mood is your own." },
  { key: "21d", label: "21 days", seconds: 21 * D, benefit: "Boredom stops feeling like an emergency" },
  { key: "30d", label: "30 days", seconds: 30 * D, benefit: "1 month. ~45 hours reclaimed — a full work week." },
  { key: "60d", label: "60 days", seconds: 60 * D, benefit: "Real conversations feel easier than the feed" },
  { key: "90d", label: "90 days", seconds: 90 * D, benefit: "Your brain's default setting is calm, not scrolling" },
  { key: "180d", label: "6 months", seconds: 182 * D, benefit: "You barely remember the pull to check" },
  { key: "365d", label: "1 year", seconds: 365 * D, benefit: "You're the person who's actually present. That's just you now." },
];

// Together — only counts while BOTH smoking & scrolling are held.
// These are the ones to look forward to: identity + real rewards.
export const TOGETHER_MILESTONES: Milestone[] = [
  { key: "3d", label: "3 days", seconds: 3 * D, benefit: "Both held 3 days — the worst of each is behind you at once" },
  { key: "7d", label: "1 week", seconds: 7 * D, benefit: "A clean week on both. This is what your normal can look like." },
  { key: "14d", label: "2 weeks", seconds: 14 * D, benefit: "Two weeks. The hours you got back — that's the Stellenbosch fund, in time." },
  { key: "30d", label: "1 month", seconds: 30 * D, benefit: "One month on both. Spend some of the smoke money on something real — you earned it." },
  { key: "60d", label: "2 months", seconds: 60 * D, benefit: "Two months. People around you have noticed, even if they haven't said it." },
  { key: "90d", label: "90 days", seconds: 90 * D, benefit: "90 days clean on both. This is the guy who actually makes the move." },
  { key: "180d", label: "6 months", seconds: 182 * D, benefit: "Half a year. Whatever you feared you'd lose by quitting — you didn't." },
  { key: "365d", label: "1 year", seconds: 365 * D, benefit: "One year. You're not 'quitting' anything anymore. This is who you are." },
];

// Back-compat default (smoking ladder).
export const MILESTONES = SMOKING_MILESTONES;

export function milestonesFor(name: HabitName): Milestone[] {
  if (name === "social_media") return SOCIAL_MILESTONES;
  return SMOKING_MILESTONES;
}

export function streakSeconds(startISO: string, now = Date.now()): number {
  const start = new Date(startISO).getTime();
  return Math.max(0, Math.floor((now - start) / 1000));
}

// Min of the given streak-second values — the "together" clock. Resets to
// the lower one whenever either habit resets. 0 if none.
export function combinedSeconds(secondsList: number[]): number {
  const vals = secondsList.filter((n) => Number.isFinite(n));
  return vals.length ? Math.min(...vals) : 0;
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

export function milestoneProgress(
  seconds: number,
  list: Milestone[] = SMOKING_MILESTONES,
): MilestoneProgress {
  let prev = 0;
  for (const m of list) {
    if (seconds < m.seconds) {
      const span = m.seconds - prev;
      return { next: m, prevSeconds: prev, fraction: span > 0 ? (seconds - prev) / span : 1 };
    }
    prev = m.seconds;
  }
  return { next: null, prevSeconds: prev, fraction: 1 };
}

export function reachedMilestones(
  seconds: number,
  list: Milestone[] = SMOKING_MILESTONES,
): Milestone[] {
  return list.filter((m) => seconds >= m.seconds);
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
