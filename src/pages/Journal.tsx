import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { supabase, USER_ID } from "@/lib/supabase";
import { useCheckIn } from "@/hooks/useCheckIn";
import GlassCard from "@/components/GlassCard";
import { cn } from "@/lib/utils";
import type { CheckIn } from "@/lib/types";

export default function Journal() {
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const { checkIn, patch } = useCheckIn(today);
  const [past, setPast] = useState<CheckIn[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let q = supabase
      .from("check_ins")
      .select("*")
      .eq("user_id", USER_ID)
      .neq("date", today)
      .order("date", { ascending: false })
      .limit(120);
    if (from) q = q.gte("date", from);
    if (to) q = q.lte("date", to);
    void q.then((r) => {
      if (r.data) setPast(r.data as CheckIn[]);
    });
  }, [today, from, to, checkIn]);

  return (
    <div className="space-y-5">
      <header className="pt-1">
        <h1 className="font-display gradient-text text-4xl leading-none">JOURNAL</h1>
        <div className="mt-1 font-mono text-xs uppercase tracking-widest text-white/45">
          Honest notes, every day
        </div>
      </header>

      <GlassCard brackets bracketColor="#7B3FE4">
        <div className="font-mono text-xs uppercase tracking-wide text-white/45">
          Today · {format(new Date(), "EEE d MMM")}
        </div>

        <div className="mt-4 space-y-5">
          <Scale
            label="Mood"
            value={checkIn?.mood ?? null}
            onChange={(v) => patch({ mood: v } as Partial<CheckIn>)}
          />
          <Scale
            label="Energy"
            value={checkIn?.energy ?? null}
            onChange={(v) => patch({ energy: v } as Partial<CheckIn>)}
          />
          <div>
            <div className="mb-2 font-mono text-xs uppercase tracking-wide text-white/50">
              Notes
            </div>
            <textarea
              rows={4}
              value={checkIn?.notes ?? ""}
              autoCapitalize="sentences"
              onChange={(e) => patch({ notes: e.target.value } as Partial<CheckIn>)}
              placeholder="How today actually went. No filter."
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white placeholder:text-white/30 focus:border-purple focus:outline-none"
            />
          </div>
          <div>
            <div className="mb-2 font-mono text-xs uppercase tracking-wide text-white/50">
              Triggers spotted
            </div>
            <input
              value={checkIn?.triggers_spotted ?? ""}
              autoCapitalize="sentences"
              onChange={(e) =>
                patch({ triggers_spotted: e.target.value } as Partial<CheckIn>)
              }
              placeholder="What nearly got you today"
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white placeholder:text-white/30 focus:border-purple focus:outline-none"
            />
          </div>
        </div>
      </GlassCard>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-white/45">
            Past entries
          </span>
        </div>
        <div className="mb-3 flex gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="min-h-[44px] flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/80 focus:outline-none"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="min-h-[44px] flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/80 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          {past
            .filter((e) => e.notes || e.triggers_spotted || e.mood || e.energy)
            .map((e) => {
              const open = openId === e.id;
              return (
                <div
                  key={e.id}
                  className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : e.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="text-sm text-white/80">
                      {format(new Date(e.date), "EEE d MMM yyyy")}
                    </span>
                    <span className="flex items-center gap-3 font-mono text-xs text-white/40">
                      {e.mood ? `M${e.mood}` : ""} {e.energy ? `E${e.energy}` : ""}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition",
                          open && "rotate-180",
                        )}
                      />
                    </span>
                  </button>
                  {open && (
                    <div className="space-y-2 px-4 pb-4 text-sm text-white/70">
                      {e.notes && <p className="whitespace-pre-wrap">{e.notes}</p>}
                      {e.triggers_spotted && (
                        <p className="text-white/45">
                          Triggers: {e.triggers_spotted}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          {past.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/40">
              Nothing logged yet. Start tonight.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Scale({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wide text-white/50">
          {label}
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
