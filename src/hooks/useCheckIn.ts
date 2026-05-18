import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, USER_ID } from "@/lib/supabase";
import { writeThrough } from "@/lib/offlineQueue";
import type { CheckIn } from "@/lib/types";

const BLANK = {
  water_glasses: 0,
  steps: 0,
  sunlight: false,
  cold_shower: false,
  gym: false,
  prayer_reading: false,
  coffee_count: 0,
  mood: null as number | null,
  energy: null as number | null,
  notes: null as string | null,
  triggers_spotted: null as string | null,
};

export function useCheckIn(date: string) {
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const timer = useRef<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await supabase
      .from("check_ins")
      .select("*")
      .eq("user_id", USER_ID)
      .eq("date", date)
      .maybeSingle();
    if (res.data) {
      setCheckIn(res.data as CheckIn);
      setLoading(false);
      return;
    }
    const ins = await supabase
      .from("check_ins")
      .insert({ user_id: USER_ID, date, ...BLANK })
      .select("*")
      .single();
    if (!ins.error && ins.data) {
      setCheckIn(ins.data as CheckIn);
    } else {
      const retry = await supabase
        .from("check_ins")
        .select("*")
        .eq("user_id", USER_ID)
        .eq("date", date)
        .maybeSingle();
      if (retry.data) setCheckIn(retry.data as CheckIn);
    }
    setLoading(false);
  }, [date]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = useCallback(
    (p: Partial<CheckIn>) => {
      setCheckIn((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...p };
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
          const fields = { ...p };
          void writeThrough(
            () =>
              supabase.from("check_ins").update(fields).eq("id", next.id) as unknown as Promise<{
                error: unknown;
              }>,
            { kind: "update", table: "check_ins", payload: fields, match: { id: next.id } },
          );
        }, 500);
        return next;
      });
    },
    [],
  );

  return { checkIn, loading, patch, reload: load };
}
