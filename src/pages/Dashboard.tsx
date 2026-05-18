import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { format } from "date-fns";
import {
  Droplet,
  Footprints,
  Sun,
  Snowflake,
  Dumbbell,
  BookOpen,
  Minus,
  Plus,
} from "lucide-react";
import { useAppData } from "@/state/AppData";
import { useCheckIn } from "@/hooks/useCheckIn";
import { useNow } from "@/hooks/useNow";
import { dailyQuote } from "@/lib/quotes";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/GlassCard";
import StreakCard from "@/components/StreakCard";
import CravingModal from "@/components/CravingModal";
import type { CheckIn } from "@/lib/types";

const WATER_TARGET = 8;
const STEPS_TARGET = 8000;

export default function Dashboard() {
  const { habits, settings, quotes, loading, error } = useAppData();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const now = useNow();
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const { checkIn, patch } = useCheckIn(today);
  const [cravingOpen, setCravingOpen] = useState(false);

  const quote = useMemo(
    () => dailyQuote(quotes, settings?.quote_category ?? "all", today),
    [quotes, settings, today],
  );

  const enabled = habits.filter((h) => h.enabled);
  const quitHabits = enabled.filter((h) => h.type === "quit");
  const coffee = enabled.find((h) => h.name === "coffee");

  return (
    <div className="space-y-5">
      <header className="pt-1">
        <h1 className="font-display gradient-text text-5xl leading-none">BASELINE</h1>
        <div className="mt-1 font-mono text-xs uppercase tracking-widest text-white/45">
          {format(new Date(), "EEE d MMM yyyy")}
        </div>
        {quote && (
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            “{quote.content}”
            {quote.reference && (
              <span className="text-white/35"> — {quote.reference}</span>
            )}
          </p>
        )}
      </header>

      {error && (
        <GlassCard className="border-danger/30">
          <div className="text-sm text-white/70">
            Couldn’t reach your data: {error}
          </div>
          <div className="mt-1 text-xs text-white/40">
            Run the schema in Supabase if you haven’t — see supabase/schema.sql.
          </div>
        </GlassCard>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {quitHabits.map((h) => (
            <StreakCard
              key={h.id}
              habit={h}
              now={now}
              smokingCost={settings?.smoking_cost_per_day ?? 45}
              socialMinutes={settings?.social_minutes_per_day ?? 90}
            />
          ))}

          {coffee && (
            <GlassCard brackets bracketColor="#FF6B2B">
              <div className="flex items-start justify-between">
                <div className="font-display text-2xl tracking-wide text-white">
                  COFFEE
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                  {settings?.coffee_mode === "quit" ? "quitting" : "budget"}
                </div>
              </div>
              <div className="mt-3 flex items-end gap-3">
                <div className="font-mono text-4xl font-semibold tabular-nums text-white">
                  {checkIn?.coffee_count ?? 0}
                  {settings?.coffee_mode === "budget" && (
                    <span className="text-white/35">
                      {" "}
                      / {settings?.coffee_daily_max ?? 1}
                    </span>
                  )}
                </div>
                <span className="pb-1 font-mono text-xs text-white/45">today</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Stepper
                  onDec={() =>
                    patch({
                      coffee_count: Math.max(0, (checkIn?.coffee_count ?? 0) - 1),
                    })
                  }
                  onInc={() =>
                    patch({ coffee_count: (checkIn?.coffee_count ?? 0) + 1 })
                  }
                />
              </div>
            </GlassCard>
          )}
        </div>
      )}

      <motion.button
        type="button"
        onClick={() => navigate("/sos")}
        animate={reduce ? {} : { opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative min-h-[84px] w-full overflow-hidden rounded-2xl text-left active:scale-[0.99]"
        style={{
          background: "linear-gradient(110deg, #7B3FE4 0%, #FF6B2B 100%)",
          boxShadow: "0 0 40px -8px rgba(123,63,228,0.6)",
        }}
      >
        <div className="px-5 py-5">
          <div className="font-display text-3xl leading-none text-white">
            I'M GETTING THE URGE
          </div>
          <div className="mt-1.5 font-mono text-xs text-white/80">
            Tap. Don't think. We'll walk it back together.
          </div>
        </div>
      </motion.button>

      <section>
        <div className="mb-2 font-mono text-xs uppercase tracking-widest text-white/45">
          Today's replacements
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CounterTile
            icon={<Droplet className="h-5 w-5" />}
            label="Water"
            value={checkIn?.water_glasses ?? 0}
            target={WATER_TARGET}
            unit="glasses"
            onTap={() =>
              patch({ water_glasses: (checkIn?.water_glasses ?? 0) + 1 })
            }
            onLong={() =>
              patch({
                water_glasses: Math.max(0, (checkIn?.water_glasses ?? 0) - 1),
              })
            }
          />
          <NumberTile
            icon={<Footprints className="h-5 w-5" />}
            label="Steps"
            value={checkIn?.steps ?? 0}
            target={STEPS_TARGET}
            onChange={(v) => patch({ steps: v })}
          />
          <ToggleTile
            icon={<Sun className="h-5 w-5" />}
            label="Sunlight"
            hint="10+ min outside"
            active={!!checkIn?.sunlight}
            onToggle={() => patch({ sunlight: !checkIn?.sunlight })}
          />
          <ToggleTile
            icon={<Snowflake className="h-5 w-5" />}
            label="Cold shower"
            active={!!checkIn?.cold_shower}
            onToggle={() => patch({ cold_shower: !checkIn?.cold_shower })}
          />
          <ToggleTile
            icon={<Dumbbell className="h-5 w-5" />}
            label="Gym"
            active={!!checkIn?.gym}
            onToggle={() => patch({ gym: !checkIn?.gym })}
          />
          <ToggleTile
            icon={<BookOpen className="h-5 w-5" />}
            label="Prayer / reading"
            active={!!checkIn?.prayer_reading}
            onToggle={() => patch({ prayer_reading: !checkIn?.prayer_reading })}
          />
        </div>

        <GlassCard className="mt-3">
          <MoodSlider
            value={checkIn?.mood ?? null}
            onChange={(v) => patch({ mood: v } as Partial<CheckIn>)}
          />
        </GlassCard>
      </section>

      <button
        type="button"
        onClick={() => setCravingOpen(true)}
        className="min-h-[48px] w-full rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white/60 transition active:scale-[0.99]"
      >
        Log a craving
      </button>

      <CravingModal
        open={cravingOpen}
        onClose={() => setCravingOpen(false)}
        habits={habits}
      />
    </div>
  );
}

function Stepper({ onDec, onInc }: { onDec: () => void; onInc: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onDec}
        className="flex h-12 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white active:scale-95"
      >
        <Minus className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onInc}
        className="flex h-12 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white active:scale-95"
      >
        <Plus className="h-5 w-5" />
      </button>
    </>
  );
}

function tileBase(active: boolean) {
  return cn(
    "relative flex min-h-[96px] flex-col justify-between rounded-2xl border p-3 text-left transition active:scale-[0.98]",
    active
      ? "border-success/40 bg-success/[0.07] shadow-[0_0_24px_-10px_rgba(34,197,94,0.6)]"
      : "border-white/10 bg-white/[0.03]",
  );
}

function ToggleTile({
  icon,
  label,
  hint,
  active,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button type="button" onClick={onToggle} className={tileBase(active)}>
      <span className={active ? "text-success" : "text-white/50"}>{icon}</span>
      <span>
        <span className="block text-sm font-medium text-white">{label}</span>
        {hint && <span className="block text-[11px] text-white/40">{hint}</span>}
      </span>
    </button>
  );
}

function CounterTile({
  icon,
  label,
  value,
  target,
  unit,
  onTap,
  onLong,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  target: number;
  unit: string;
  onTap: () => void;
  onLong: () => void;
}) {
  const done = value >= target;
  return (
    <button
      type="button"
      onClick={onTap}
      onContextMenu={(e) => {
        e.preventDefault();
        onLong();
      }}
      className={tileBase(done)}
    >
      <span className={done ? "text-success" : "text-white/50"}>{icon}</span>
      <span>
        <span className="block text-sm font-medium text-white">{label}</span>
        <span className="font-mono text-xs text-white/45">
          {value}/{target} {unit} · tap +1
        </span>
      </span>
    </button>
  );
}

function NumberTile({
  icon,
  label,
  value,
  target,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  target: number;
  onChange: (v: number) => void;
}) {
  const done = value >= target;
  return (
    <div className={tileBase(done)}>
      <span className={done ? "text-success" : "text-white/50"}>{icon}</span>
      <div>
        <span className="block text-sm font-medium text-white">{label}</span>
        <input
          type="number"
          inputMode="numeric"
          value={value || ""}
          placeholder="0"
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="mt-0.5 w-full bg-transparent font-mono text-xs text-white/70 placeholder:text-white/30 focus:outline-none"
        />
        <span className="font-mono text-[10px] text-white/35">
          target {target.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function MoodSlider({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wide text-white/50">
          Mood today
        </span>
        <span className="font-mono text-sm text-white/80">
          {value ? `${value}/10` : "—"}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value ?? 5}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-purple"
      />
    </div>
  );
}
