import type { CravingTrigger, Tactic } from "./types";

// SOS rotating messages — calm, direct, older-brother voice. Not from the
// quotes table; these are crisis-specific.
export const SOS_MESSAGES: string[] = [
  "Most cravings peak and fall in 10 minutes. Sit with it.",
  "Day 3 is the worst day. You've already done harder.",
  "You said you wanted to move to Stellenbosch by year-end. Today's the day you mean it.",
  "Your baseline gets higher every day you hold the line.",
  "You're not weak. You're fighting chemistry. Chemistry loses when you keep showing up.",
  "No temptation has overtaken you except what is common to mankind. And God is faithful. — 1 Cor 10:13",
  "Like a city whose walls are broken through is a person who lacks self-control. — Prov 25:28",
];

export const SOS_TACTICS: { tactic: Tactic; label: string }[] = [
  { tactic: "water", label: "Drink water" },
  { tactic: "walk", label: "Walk outside for 5 min" },
  { tactic: "pushups", label: "20 pushups" },
  { tactic: "prayer", label: "Pray" },
  { tactic: "cold", label: "Cold rinse" },
  { tactic: "read", label: "Read something" },
];

export const TRIGGERS: { value: CravingTrigger; label: string }[] = [
  { value: "stress", label: "Stress" },
  { value: "meal", label: "After a meal" },
  { value: "boredom", label: "Boredom" },
  { value: "social", label: "Social" },
  { value: "morning", label: "Morning" },
  { value: "other", label: "Other" },
];

export const QUOTE_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "biblical", label: "Biblical" },
  { value: "stoic", label: "Stoic" },
  { value: "recovery", label: "Recovery" },
  { value: "identity", label: "Identity" },
];
