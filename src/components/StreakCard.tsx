import GlassCard from "./GlassCard";
import {
  formatStreak,
  streakSeconds,
  milestoneProgress,
  milestonesFor,
  moneySaved,
  minutesReclaimed,
  formatRand,
  formatHours,
} from "@/lib/streaks";
import { HABIT_LABELS, type Habit } from "@/lib/types";

export default function StreakCard({
  habit,
  now,
  smokingCost,
  socialMinutes,
}: {
  habit: Habit;
  now: number;
  smokingCost: number;
  socialMinutes: number;
}) {
  const secs = streakSeconds(habit.current_streak_start, now);
  const { next, prevSeconds, fraction } = milestoneProgress(
    secs,
    milestonesFor(habit.name),
  );
  const longest = Math.max(habit.longest_streak_seconds ?? 0, secs);

  let stat: { label: string; value: string } | null = null;
  if (habit.name === "smoking") {
    stat = { label: "Saved", value: formatRand(moneySaved(secs, smokingCost)) };
  } else if (habit.name === "social_media") {
    stat = {
      label: "Reclaimed",
      value: formatHours(minutesReclaimed(secs, socialMinutes)),
    };
  }

  const pct = Math.round(Math.min(1, Math.max(0, fraction)) * 100);

  return (
    <GlassCard brackets bracketColor="#7B3FE4" className="overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="font-display text-2xl tracking-wide text-white">
          {HABIT_LABELS[habit.name].toUpperCase()}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">
          {habit.type === "quit" ? "clean" : "in control"}
        </div>
      </div>

      <div className="mt-3 font-mono text-4xl font-semibold tabular-nums text-white sm:text-5xl">
        {formatStreak(secs)}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-white/55">
        <span>Longest&nbsp;·&nbsp;{formatStreak(longest)}</span>
        {stat && (
          <span>
            {stat.label}&nbsp;·&nbsp;
            <span className="text-white/80">{stat.value}</span>
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-white/40">
          <span>{next ? `Next · ${next.label}` : "All milestones cleared"}</span>
          <span>{next ? `${pct}%` : "100%"}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7B3FE4] to-[#FF6B2B] transition-[width] duration-700"
            style={{ width: `${next ? pct : 100}%` }}
          />
        </div>
        {next && (
          <div className="mt-1 font-mono text-[10px] text-white/30">
            {formatStreak(next.seconds - prevSeconds === 0 ? 0 : Math.max(0, next.seconds - secs))}{" "}
            to go
          </div>
        )}
      </div>
    </GlassCard>
  );
}
