export type HabitName = "smoking" | "social_media" | "coffee";

export interface Habit {
  id: string;
  user_id: string;
  name: HabitName;
  type: "quit" | "limit";
  started_at: string;
  current_streak_start: string;
  longest_streak_seconds: number;
  cost_per_day: number;
  enabled: boolean;
  created_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  date: string;
  water_glasses: number;
  steps: number;
  sunlight: boolean;
  cold_shower: boolean;
  gym: boolean;
  prayer_reading: boolean;
  coffee_count: number;
  mood: number | null;
  energy: number | null;
  notes: string | null;
  triggers_spotted: string | null;
  created_at: string;
}

export type CravingTrigger =
  | "stress"
  | "meal"
  | "boredom"
  | "social"
  | "morning"
  | "other";

export type Tactic =
  | "water"
  | "walk"
  | "pushups"
  | "prayer"
  | "cold"
  | "read"
  | "timer";

export interface Craving {
  id: string;
  user_id: string;
  habit: HabitName;
  intensity: number | null;
  trigger: CravingTrigger | null;
  resolution: "resisted" | "slipped" | null;
  tactic_used: Tactic | null;
  notes: string | null;
  created_at: string;
}

export interface Slip {
  id: string;
  user_id: string;
  habit: HabitName;
  reason: string | null;
  what_will_be_different: string | null;
  created_at: string;
}

export interface Quote {
  id: string;
  category: string | null;
  content: string;
  reference: string | null;
}

export interface Settings {
  id: string;
  user_id: string;
  smoking_cost_per_day: number;
  reminder_time: string;
  quote_category: string;
  coffee_mode: "quit" | "budget";
  coffee_daily_max: number;
  social_minutes_per_day: number;
  created_at: string;
}

export const HABIT_LABELS: Record<HabitName, string> = {
  smoking: "Smoke-free",
  social_media: "Off the feed",
  coffee: "Coffee",
};
