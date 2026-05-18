import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useAppData } from "@/state/AppData";
import { QUOTE_CATEGORIES } from "@/lib/constants";
import { HABIT_LABELS, type HabitName } from "@/lib/types";
import GlassCard from "@/components/GlassCard";
import { cn } from "@/lib/utils";

type BIPEvent = Event & { prompt: () => void };

export default function Settings() {
  const {
    habits,
    settings,
    updateSettings,
    setHabitEnabled,
    setStreakStart,
  } = useAppData();
  const [installEvt, setInstallEvt] = useState<BIPEvent | null>(null);

  useEffect(() => {
    const h = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  const smoking = habits.find((h) => h.name === "smoking");
  const startValue = smoking
    ? format(new Date(smoking.current_streak_start), "yyyy-MM-dd'T'HH:mm")
    : "";

  if (!settings) {
    return (
      <div className="space-y-3 pt-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="pt-1">
        <h1 className="font-display gradient-text text-4xl leading-none">SETTINGS</h1>
        <div className="mt-1 font-mono text-xs uppercase tracking-widest text-white/45">
          Tune it to your life
        </div>
      </header>

      <GlassCard>
        <Row label="Smoking cost per day (R)">
          <input
            type="number"
            inputMode="numeric"
            value={settings.smoking_cost_per_day}
            onChange={(e) =>
              updateSettings({ smoking_cost_per_day: Number(e.target.value) || 0 })
            }
            className="w-24 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-right font-mono text-base text-white focus:outline-none"
          />
        </Row>
        <Row label="Est. social minutes / day">
          <input
            type="number"
            inputMode="numeric"
            value={settings.social_minutes_per_day}
            onChange={(e) =>
              updateSettings({
                social_minutes_per_day: Number(e.target.value) || 0,
              })
            }
            className="w-24 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-right font-mono text-base text-white focus:outline-none"
          />
        </Row>
        <Row label="Daily reminder time">
          <input
            type="time"
            value={settings.reminder_time?.slice(0, 5) ?? "21:00"}
            onChange={(e) => updateSettings({ reminder_time: e.target.value })}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-base text-white focus:outline-none"
          />
        </Row>
        <Row label="Quit start (date + time)">
          <input
            type="datetime-local"
            value={startValue}
            onChange={(e) => {
              if (!e.target.value) return;
              const iso = new Date(e.target.value).toISOString();
              habits
                .filter((h) => h.enabled && h.type === "quit")
                .forEach((h) => void setStreakStart(h.name, iso));
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-base text-white focus:outline-none"
          />
        </Row>
        <Row label="Currency">
          <span className="font-mono text-sm text-white/50">ZAR</span>
        </Row>
      </GlassCard>

      <GlassCard>
        <div className="mb-3 font-mono text-xs uppercase tracking-wide text-white/45">
          Quote tone
        </div>
        <div className="flex flex-wrap gap-2">
          {QUOTE_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => updateSettings({ quote_category: c.value })}
              className={cn(
                "min-h-[44px] rounded-full border px-4 text-sm transition active:scale-95",
                settings.quote_category === c.value
                  ? "border-purple bg-purple/20 text-white"
                  : "border-white/10 bg-white/5 text-white/55",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="mb-3 font-mono text-xs uppercase tracking-wide text-white/45">
          Coffee
        </div>
        <div className="flex gap-2">
          {(["quit", "budget"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => updateSettings({ coffee_mode: m })}
              className={cn(
                "min-h-[44px] flex-1 rounded-xl border text-sm capitalize transition active:scale-95",
                settings.coffee_mode === m
                  ? "border-accent bg-accent/15 text-white"
                  : "border-white/10 bg-white/5 text-white/55",
              )}
            >
              {m === "quit" ? "Quit completely" : "Budget mode"}
            </button>
          ))}
        </div>
        {settings.coffee_mode === "budget" && (
          <Row label="Max cups / day" className="mt-3">
            <input
              type="number"
              inputMode="numeric"
              value={settings.coffee_daily_max}
              onChange={(e) =>
                updateSettings({ coffee_daily_max: Number(e.target.value) || 0 })
              }
              className="w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-right font-mono text-base text-white focus:outline-none"
            />
          </Row>
        )}
      </GlassCard>

      <GlassCard>
        <div className="mb-3 font-mono text-xs uppercase tracking-wide text-white/45">
          Tracked habits
        </div>
        <div className="space-y-2">
          {(["smoking", "social_media", "coffee"] as HabitName[]).map((name) => {
            const h = habits.find((x) => x.name === name);
            const on = h?.enabled ?? false;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setHabitEnabled(name, !on)}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 active:scale-[0.99]"
              >
                <span className="text-sm text-white/80">{HABIT_LABELS[name]}</span>
                <span
                  className={cn(
                    "relative h-6 w-11 rounded-full transition",
                    on ? "bg-success/70" : "bg-white/15",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
                      on ? "left-[22px]" : "left-0.5",
                    )}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {installEvt && (
        <button
          type="button"
          onClick={() => {
            installEvt.prompt();
            setInstallEvt(null);
          }}
          className="min-h-[52px] w-full rounded-2xl bg-purple text-base font-semibold text-white active:scale-[0.98]"
        >
          Add Baseline to home screen
        </button>
      )}

      <p className="px-1 pb-2 text-center text-xs text-white/30">
        Single-user. Your data only. No accounts, no sharing.
      </p>
    </div>
  );
}

function Row({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-white/[0.06] py-3 last:border-0",
        className,
      )}
    >
      <span className="text-sm text-white/70">{label}</span>
      {children}
    </div>
  );
}
