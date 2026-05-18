import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase, USER_ID } from "@/lib/supabase";
import { useAppData } from "@/state/AppData";
import { useNow } from "@/hooks/useNow";
import {
  MILESTONES,
  streakSeconds,
  formatStreak,
  moneySaved,
  minutesReclaimed,
  formatRand,
  formatHours,
} from "@/lib/streaks";
import { HABIT_LABELS } from "@/lib/types";
import GlassCard from "@/components/GlassCard";
import Heatmap from "@/components/Heatmap";
import type { Craving, Slip } from "@/lib/types";

const PIE_COLORS = ["#7B3FE4", "#FF6B2B", "#22C55E", "#EF4444", "#38BDF8", "#A1A1AA"];

export default function Progress() {
  const { habits, settings } = useAppData();
  const now = useNow(30000);
  const [cravings, setCravings] = useState<Craving[]>([]);
  const [slips, setSlips] = useState<Slip[]>([]);

  useEffect(() => {
    void supabase
      .from("cravings")
      .select("*")
      .eq("user_id", USER_ID)
      .order("created_at", { ascending: true })
      .limit(1000)
      .then((r) => r.data && setCravings(r.data as Craving[]));
    void supabase
      .from("slips")
      .select("*")
      .eq("user_id", USER_ID)
      .limit(1000)
      .then((r) => r.data && setSlips(r.data as Slip[]));
  }, []);

  const trend = useMemo(() => {
    const byDay = new Map<string, { sum: number; n: number }>();
    for (const c of cravings) {
      if (c.intensity == null) continue;
      const d = format(new Date(c.created_at), "MM-dd");
      const e = byDay.get(d) ?? { sum: 0, n: 0 };
      e.sum += c.intensity;
      e.n += 1;
      byDay.set(d, e);
    }
    return Array.from(byDay.entries()).map(([d, v]) => ({
      d,
      intensity: Math.round((v.sum / v.n) * 10) / 10,
    }));
  }, [cravings]);

  const triggerPie = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cravings) {
      const k = c.trigger ?? "other";
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [cravings]);

  const slipsByHabit = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const s of slips) {
      const set = m.get(s.habit) ?? new Set<string>();
      set.add(format(new Date(s.created_at), "yyyy-MM-dd"));
      m.set(s.habit, set);
    }
    return m;
  }, [slips]);

  const enabled = habits.filter((h) => h.enabled);

  return (
    <div className="space-y-5">
      <header className="pt-1">
        <h1 className="font-display gradient-text text-4xl leading-none">PROGRESS</h1>
        <div className="mt-1 font-mono text-xs uppercase tracking-widest text-white/45">
          The data. No fake numbers.
        </div>
      </header>

      {enabled.map((h) => {
        const secs = streakSeconds(h.current_streak_start, now);
        const longest = Math.max(h.longest_streak_seconds ?? 0, secs);
        return (
          <GlassCard key={h.id}>
            <div className="flex items-center justify-between">
              <div className="font-display text-xl tracking-wide text-white">
                {HABIT_LABELS[h.name].toUpperCase()}
              </div>
              <div className="font-mono text-xs text-white/45">
                now {formatStreak(secs)} · best {formatStreak(longest)}
              </div>
            </div>
            <div className="mt-3 overflow-x-auto scroll-touch">
              <Heatmap
                slipDates={slipsByHabit.get(h.name) ?? new Set()}
                startDate={h.started_at}
              />
            </div>
            {h.name === "smoking" && (
              <div className="mt-3 font-mono text-xs text-white/55">
                Saved ·{" "}
                <span className="text-white/85">
                  {formatRand(moneySaved(secs, settings?.smoking_cost_per_day ?? 45))}
                </span>
              </div>
            )}
            {h.name === "social_media" && (
              <div className="mt-3 font-mono text-xs text-white/55">
                Reclaimed ·{" "}
                <span className="text-white/85">
                  {formatHours(
                    minutesReclaimed(secs, settings?.social_minutes_per_day ?? 90),
                  )}
                </span>
              </div>
            )}
          </GlassCard>
        );
      })}

      <GlassCard>
        <div className="mb-3 font-mono text-xs uppercase tracking-wide text-white/45">
          Craving intensity over time
        </div>
        {trend.length > 1 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trend} margin={{ left: -24, right: 8, top: 4 }}>
              <XAxis dataKey="d" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
              <YAxis
                domain={[0, 10]}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#0b0b12",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="intensity"
                stroke="#7B3FE4"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Empty>Log a few cravings and the trend shows here — it should fall.</Empty>
        )}
      </GlassCard>

      <GlassCard>
        <div className="mb-3 font-mono text-xs uppercase tracking-wide text-white/45">
          What triggers you
        </div>
        {triggerPie.length ? (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={160}>
              <PieChart>
                <Pie
                  data={triggerPie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={36}
                  outerRadius={64}
                  paddingAngle={2}
                >
                  {triggerPie.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <ul className="flex-1 space-y-1.5">
              {triggerPie.map((t, i) => (
                <li key={t.name} className="flex items-center gap-2 text-xs text-white/65">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="capitalize">{t.name}</span>
                  <span className="ml-auto font-mono text-white/40">{t.value}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <Empty>No cravings logged yet.</Empty>
        )}
      </GlassCard>

      <GlassCard brackets bracketColor="#FF6B2B">
        <div className="mb-3 font-mono text-xs uppercase tracking-wide text-white/45">
          Milestones — smoke-free
        </div>
        <ul className="space-y-2">
          {(() => {
            const smoking = habits.find((h) => h.name === "smoking");
            const secs = smoking
              ? streakSeconds(smoking.current_streak_start, now)
              : 0;
            return MILESTONES.map((m) => {
              const reached = secs >= m.seconds;
              return (
                <li
                  key={m.key}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.06] p-3"
                  style={{
                    background: reached ? "rgba(34,197,94,0.06)" : "transparent",
                  }}
                >
                  <span
                    className={`mt-0.5 font-mono text-xs ${
                      reached ? "text-success" : "text-white/35"
                    }`}
                  >
                    {m.label}
                  </span>
                  <span
                    className={`flex-1 text-sm ${
                      reached ? "text-white/80" : "text-white/40"
                    }`}
                  >
                    {m.benefit}
                  </span>
                </li>
              );
            });
          })()}
        </ul>
      </GlassCard>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/40">
      {children}
    </div>
  );
}
