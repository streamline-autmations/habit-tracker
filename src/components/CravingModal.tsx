import { useEffect, useState } from "react";
import Sheet from "./Sheet";
import { supabase, USER_ID } from "@/lib/supabase";
import { writeThrough } from "@/lib/offlineQueue";
import { TRIGGERS, SOS_TACTICS } from "@/lib/constants";
import { HABIT_LABELS, type CravingTrigger, type Habit, type HabitName, type Tactic } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function CravingModal({
  open,
  onClose,
  habits,
  defaultHabit,
  defaultTactic,
  onLogged,
}: {
  open: boolean;
  onClose: () => void;
  habits: Habit[];
  defaultHabit?: HabitName;
  defaultTactic?: Tactic;
  onLogged?: () => void;
}) {
  const enabled = habits.filter((h) => h.enabled);
  const [habit, setHabit] = useState<HabitName>(defaultHabit ?? "smoking");
  const [intensity, setIntensity] = useState(5);
  const [trigger, setTrigger] = useState<CravingTrigger | null>(null);
  const [tactic, setTactic] = useState<Tactic | null>(defaultTactic ?? null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setHabit(defaultHabit ?? enabled[0]?.name ?? "smoking");
      setIntensity(5);
      setTrigger(null);
      setTactic(defaultTactic ?? null);
      setNotes("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submit() {
    setSaving(true);
    const payload = {
      user_id: USER_ID,
      habit,
      intensity,
      trigger,
      resolution: "resisted",
      tactic_used: tactic,
      notes: notes.trim() || null,
    };
    await writeThrough(
      () => supabase.from("cravings").insert(payload) as unknown as Promise<{ error: unknown }>,
      { kind: "insert", table: "cravings", payload },
    );
    setSaving(false);
    onLogged?.();
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Log a craving">
      <div className="space-y-5">
        <Field label="Habit">
          <div className="flex flex-wrap gap-2">
            {enabled.map((h) => (
              <Chip key={h.name} active={habit === h.name} onClick={() => setHabit(h.name)}>
                {HABIT_LABELS[h.name]}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label={`Intensity — ${intensity}/10`}>
          <input
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent"
          />
        </Field>

        <Field label="Trigger">
          <div className="flex flex-wrap gap-2">
            {TRIGGERS.map((t) => (
              <Chip key={t.value} active={trigger === t.value} onClick={() => setTrigger(t.value)}>
                {t.label}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="What did you do instead? (optional)">
          <div className="flex flex-wrap gap-2">
            {SOS_TACTICS.map((t) => (
              <Chip
                key={t.tactic}
                active={tactic === t.tactic}
                onClick={() => setTactic(tactic === t.tactic ? null : t.tactic)}
              >
                {t.label}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Notes (optional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            autoCapitalize="none"
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white placeholder:text-white/30 focus:border-purple focus:outline-none"
            placeholder="Where were you, what set it off…"
          />
        </Field>

        <button
          onClick={submit}
          disabled={saving}
          className="min-h-[52px] w-full rounded-2xl bg-purple text-base font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Log it — you resisted"}
        </button>
      </div>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 font-mono text-xs uppercase tracking-wide text-white/50">{label}</div>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[44px] rounded-full border px-4 text-sm transition active:scale-95",
        active
          ? "border-purple bg-purple/20 text-white"
          : "border-white/10 bg-white/5 text-white/60",
      )}
    >
      {children}
    </button>
  );
}
