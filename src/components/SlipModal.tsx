import { useEffect, useState } from "react";
import Sheet from "./Sheet";
import { supabase, USER_ID } from "@/lib/supabase";
import { writeThrough } from "@/lib/offlineQueue";
import { useAppData } from "@/state/AppData";
import { HABIT_LABELS, type Habit, type HabitName } from "@/lib/types";
import { cn } from "@/lib/utils";

// No "are you sure". Slipping is logged as data, not shamed.
export default function SlipModal({
  open,
  onClose,
  habits,
  defaultHabit,
}: {
  open: boolean;
  onClose: () => void;
  habits: Habit[];
  defaultHabit?: HabitName;
}) {
  const { resetStreak } = useAppData();
  const enabled = habits.filter((h) => h.enabled);
  const [habit, setHabit] = useState<HabitName>(defaultHabit ?? "smoking");
  const [reason, setReason] = useState("");
  const [different, setDifferent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setHabit(defaultHabit ?? enabled[0]?.name ?? "smoking");
      setReason("");
      setDifferent("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submit() {
    setSaving(true);
    const slip = {
      user_id: USER_ID,
      habit,
      reason: reason.trim() || null,
      what_will_be_different: different.trim() || null,
    };
    await writeThrough(
      () => supabase.from("slips").insert(slip) as unknown as Promise<{ error: unknown }>,
      { kind: "insert", table: "slips", payload: slip },
    );
    const craving = {
      user_id: USER_ID,
      habit,
      resolution: "slipped",
      notes: reason.trim() || null,
    };
    await writeThrough(
      () => supabase.from("cravings").insert(craving) as unknown as Promise<{ error: unknown }>,
      { kind: "insert", table: "cravings", payload: craving },
    );
    await resetStreak(habit);
    setSaving(false);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="You slipped">
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-white/55">
          No shame here. This is just data. The clock resets and you keep going —
          that's the whole game.
        </p>

        <div>
          <div className="mb-2 font-mono text-xs uppercase tracking-wide text-white/50">
            Which one
          </div>
          <div className="flex flex-wrap gap-2">
            {enabled.map((h) => (
              <button
                key={h.name}
                type="button"
                onClick={() => setHabit(h.name)}
                className={cn(
                  "min-h-[44px] rounded-full border px-4 text-sm transition active:scale-95",
                  habit === h.name
                    ? "border-danger bg-danger/15 text-white"
                    : "border-white/10 bg-white/5 text-white/60",
                )}
              >
                {HABIT_LABELS[h.name]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 font-mono text-xs uppercase tracking-wide text-white/50">
            Why (brief)
          </div>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoCapitalize="sentences"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white placeholder:text-white/30 focus:border-purple focus:outline-none"
            placeholder="Stressed, end of a long day…"
          />
        </div>

        <div>
          <div className="mb-2 font-mono text-xs uppercase tracking-wide text-white/50">
            What will be different next time
          </div>
          <input
            value={different}
            onChange={(e) => setDifferent(e.target.value)}
            autoCapitalize="sentences"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white placeholder:text-white/30 focus:border-purple focus:outline-none"
            placeholder="Walk instead of stepping outside for one…"
          />
        </div>

        <button
          onClick={submit}
          disabled={saving}
          className="min-h-[52px] w-full rounded-2xl border border-white/15 bg-white/5 text-base font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? "Logging…" : "Log it and reset the clock"}
        </button>
      </div>
    </Sheet>
  );
}
