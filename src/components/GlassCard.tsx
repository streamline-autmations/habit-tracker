import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import LBrackets from "./LBrackets";

export default function GlassCard({
  children,
  className,
  brackets,
  bracketColor,
}: {
  children: ReactNode;
  className?: string;
  brackets?: boolean;
  bracketColor?: string;
}) {
  return (
    <div
      className={cn(
        "glass relative rounded-2xl p-4",
        className,
      )}
    >
      {brackets && <LBrackets color={bracketColor} />}
      {children}
    </div>
  );
}
