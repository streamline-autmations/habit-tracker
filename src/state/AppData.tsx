import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase, USER_ID } from "@/lib/supabase";
import { initOfflineSync } from "@/lib/offlineQueue";
import { streakSeconds } from "@/lib/streaks";
import type { Habit, HabitName, Quote, Settings } from "@/lib/types";

interface AppDataValue {
  loading: boolean;
  error: string | null;
  habits: Habit[];
  settings: Settings | null;
  quotes: Quote[];
  reload: () => Promise<void>;
  resetStreak: (name: HabitName) => Promise<void>;
  setHabitEnabled: (name: HabitName, enabled: boolean) => Promise<void>;
  setStreakStart: (name: HabitName, iso: string) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
}

const Ctx = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const [h, s, q] = await Promise.all([
        supabase.from("habits").select("*").eq("user_id", USER_ID).order("created_at"),
        supabase.from("settings").select("*").eq("user_id", USER_ID).maybeSingle(),
        supabase.from("quotes").select("*"),
      ]);
      if (h.error) throw h.error;
      if (q.error) throw q.error;
      setHabits((h.data ?? []) as Habit[]);
      setSettings((s.data as Settings) ?? null);
      setQuotes((q.data ?? []) as Quote[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initOfflineSync();
    void reload();
  }, [reload]);

  const resetStreak = useCallback(
    async (name: HabitName) => {
      const habit = habits.find((x) => x.name === name);
      if (!habit) return;
      const elapsed = streakSeconds(habit.current_streak_start);
      const longest = Math.max(habit.longest_streak_seconds ?? 0, elapsed);
      const nowIso = new Date().toISOString();
      setHabits((prev) =>
        prev.map((x) =>
          x.id === habit.id
            ? { ...x, current_streak_start: nowIso, longest_streak_seconds: longest }
            : x,
        ),
      );
      await supabase
        .from("habits")
        .update({ current_streak_start: nowIso, longest_streak_seconds: longest })
        .eq("id", habit.id);
    },
    [habits],
  );

  const setHabitEnabled = useCallback(
    async (name: HabitName, enabled: boolean) => {
      const habit = habits.find((x) => x.name === name);
      if (!habit) return;
      setHabits((prev) =>
        prev.map((x) => (x.id === habit.id ? { ...x, enabled } : x)),
      );
      await supabase.from("habits").update({ enabled }).eq("id", habit.id);
    },
    [habits],
  );

  const setStreakStart = useCallback(
    async (name: HabitName, iso: string) => {
      const habit = habits.find((x) => x.name === name);
      if (!habit) return;
      setHabits((prev) =>
        prev.map((x) =>
          x.id === habit.id
            ? { ...x, current_streak_start: iso, started_at: iso }
            : x,
        ),
      );
      await supabase
        .from("habits")
        .update({ current_streak_start: iso, started_at: iso })
        .eq("id", habit.id);
    },
    [habits],
  );

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      if (!settings) return;
      setSettings({ ...settings, ...patch });
      await supabase.from("settings").update(patch).eq("user_id", USER_ID);
    },
    [settings],
  );

  const value = useMemo<AppDataValue>(
    () => ({
      loading,
      error,
      habits,
      settings,
      quotes,
      reload,
      resetStreak,
      setHabitEnabled,
      setStreakStart,
      updateSettings,
    }),
    [
      loading,
      error,
      habits,
      settings,
      quotes,
      reload,
      resetStreak,
      setHabitEnabled,
      setStreakStart,
      updateSettings,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData(): AppDataValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppData must be used within AppDataProvider");
  return v;
}
