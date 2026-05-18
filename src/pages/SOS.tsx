import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Check } from "lucide-react";
import { useAppData } from "@/state/AppData";
import { supabase, USER_ID } from "@/lib/supabase";
import { writeThrough } from "@/lib/offlineQueue";
import { SOS_MESSAGES, SOS_TACTICS } from "@/lib/constants";
import BreathingCircle from "@/components/BreathingCircle";
import Typewriter from "@/components/Typewriter";
import SlipModal from "@/components/SlipModal";
import type { Tactic } from "@/lib/types";

export default function SOS() {
  const navigate = useNavigate();
  const { habits } = useAppData();
  const [used, setUsed] = useState<Tactic | null>(null);
  const [slipOpen, setSlipOpen] = useState(false);
  const [timer, setTimer] = useState(false);

  function logTactic(tactic: Tactic) {
    setUsed(tactic);
    const primary = habits.find((h) => h.enabled && h.type === "quit");
    const payload = {
      user_id: USER_ID,
      habit: primary?.name ?? "smoking",
      resolution: "resisted",
      tactic_used: tactic,
    };
    void writeThrough(
      () => supabase.from("cravings").insert(payload) as unknown as Promise<{ error: unknown }>,
      { kind: "insert", table: "cravings", payload },
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-base">
      <div className="absolute inset-0 bg-black/40" />
      <div className="safe-top relative flex items-center px-4 pt-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex h-11 items-center gap-1 rounded-full px-3 text-sm text-white/40 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
          back
        </button>
      </div>

      <div className="relative flex flex-1 flex-col items-center px-5 pb-10">
        <div className="mt-6 flex flex-col items-center">
          <BreathingCircle />
        </div>

        <div className="mt-6 w-full max-w-sm">
          <Typewriter lines={SOS_MESSAGES} />
        </div>

        <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3">
          {SOS_TACTICS.map((t) => {
            const active = used === t.tactic;
            return (
              <button
                key={t.tactic}
                type="button"
                onClick={() => logTactic(t.tactic)}
                className={`flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border px-3 text-sm transition active:scale-95 ${
                  active
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-white/10 bg-white/[0.04] text-white/80"
                }`}
              >
                {active && <Check className="h-4 w-4" />}
                {t.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setTimer(true)}
          className="mt-4 min-h-[56px] w-full max-w-sm rounded-2xl border border-white/15 bg-white/[0.04] text-base font-medium text-white active:scale-[0.98]"
        >
          Start a 10-minute timer
        </button>

        <button
          type="button"
          onClick={() => setSlipOpen(true)}
          className="mt-10 text-sm text-danger/70 underline-offset-4 active:underline"
        >
          I slipped
        </button>
      </div>

      <SlipModal open={slipOpen} onClose={() => setSlipOpen(false)} habits={habits} />
      <AnimatePresence>
        {timer && <TimerOverlay onClose={() => setTimer(false)} />}
      </AnimatePresence>
    </div>
  );
}

function TimerOverlay({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [left, setLeft] = useState(600);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.current) / 1000);
      setLeft(Math.max(0, 600 - elapsed));
    }, 250);
    return () => window.clearInterval(id);
  }, []);

  const done = left <= 0;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: done ? "#0a1f12" : "#050508" }}
    >
      {done ? (
        <>
          <div className="font-display text-4xl text-success">YOU WON THIS ROUND</div>
          <p className="mt-3 text-center text-sm text-white/60">
            The urge passed and you're still here. That's the whole thing.
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/");
            }}
            className="mt-8 min-h-[52px] w-full max-w-xs rounded-2xl bg-success/20 text-base font-semibold text-success active:scale-[0.98]"
          >
            Back to dashboard
          </button>
        </>
      ) : (
        <>
          <div className="font-mono text-7xl font-semibold tabular-nums text-white">
            {mm}:{ss}
          </div>
          <p className="mt-4 text-center text-sm text-white/50">
            Don't decide anything until this hits zero. Just wait it out.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-10 text-sm text-white/35 active:underline"
          >
            Close
          </button>
        </>
      )}
    </motion.div>
  );
}
