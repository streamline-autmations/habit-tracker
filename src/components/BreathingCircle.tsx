import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const IN = 4000;
const HOLD = 7000;
const OUT = 8000;
const CYCLE = IN + HOLD + OUT;

type Phase = "in" | "hold" | "out";

// 4-7-8 breathing. Visual paces the breath; label tracks the phase.
export default function BreathingCircle() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("in");

  useEffect(() => {
    if (reduce) return;
    let t1: number, t2: number;
    const run = () => {
      setPhase("in");
      t1 = window.setTimeout(() => setPhase("hold"), IN);
      t2 = window.setTimeout(() => setPhase("out"), IN + HOLD);
    };
    run();
    const loop = window.setInterval(run, CYCLE);
    return () => {
      window.clearInterval(loop);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reduce]);

  const label = phase === "in" ? "Breathe in" : phase === "hold" ? "Hold" : "Breathe out";

  return (
    <div className="relative flex h-64 w-64 items-center justify-center">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 256,
          height: 256,
          background:
            "radial-gradient(circle, rgba(123,63,228,0.35) 0%, rgba(255,107,43,0.12) 60%, transparent 75%)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
        animate={
          reduce
            ? { scale: 1.15, opacity: 0.8 }
            : { scale: [0.62, 0.95, 0.95, 0.62], opacity: [0.6, 1, 1, 0.6] }
        }
        transition={
          reduce
            ? { duration: 4, repeat: Infinity, repeatType: "reverse" }
            : {
                duration: CYCLE / 1000,
                times: [0, IN / CYCLE, (IN + HOLD) / CYCLE, 1],
                ease: ["easeOut", "linear", "easeIn", "linear"],
                repeat: Infinity,
              }
        }
      />
      <div className="z-10 text-center">
        <div className="font-display text-3xl tracking-wide text-white">{label}</div>
        <div className="mt-1 font-mono text-xs text-white/40">
          {reduce ? "in 4 · hold 7 · out 8" : phase === "in" ? "4" : phase === "hold" ? "7" : "8"}
        </div>
      </div>
    </div>
  );
}
