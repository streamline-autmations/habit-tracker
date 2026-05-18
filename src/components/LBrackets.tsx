import { cn } from "@/lib/utils";

// Decorative L-bracket corners. 16px arms, 1px stroke.
export default function LBrackets({
  color = "#FF6B2B",
  className,
}: {
  color?: string;
  className?: string;
}) {
  const arm = "absolute h-4 w-4";
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      <span className={cn(arm, "left-0 top-0 border-l border-t")} style={{ borderColor: color }} />
      <span className={cn(arm, "right-0 top-0 border-r border-t")} style={{ borderColor: color }} />
      <span className={cn(arm, "bottom-0 left-0 border-b border-l")} style={{ borderColor: color }} />
      <span className={cn(arm, "bottom-0 right-0 border-b border-r")} style={{ borderColor: color }} />
    </div>
  );
}
