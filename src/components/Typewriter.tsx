import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Slow-typed rotating lines. Types out, holds, fades, rotates.
export default function Typewriter({ lines }: { lines: string[] }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    const full = lines[idx] ?? "";
    if (reduce) {
      setText(full);
      const hold = window.setTimeout(
        () => setIdx((i) => (i + 1) % lines.length),
        7000,
      );
      return () => window.clearTimeout(hold);
    }
    setText("");
    let char = 0;
    const type = window.setInterval(() => {
      char += 1;
      setText(full.slice(0, char));
      if (char >= full.length) {
        window.clearInterval(type);
      }
    }, 38);
    const next = window.setTimeout(
      () => setIdx((i) => (i + 1) % lines.length),
      full.length * 38 + 4500,
    );
    return () => {
      window.clearInterval(type);
      window.clearTimeout(next);
    };
  }, [idx, lines, reduce]);

  return (
    <div className="flex min-h-[88px] items-center justify-center px-2">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center text-base leading-relaxed text-white/75"
        >
          {text}
          {!reduce && text.length < (lines[idx]?.length ?? 0) && (
            <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-accent align-middle" />
          )}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
