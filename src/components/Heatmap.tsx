import { addDays, format, startOfDay } from "date-fns";

// 90-day grid. green = held, red = slip, grey = before start / untracked.
export default function Heatmap({
  days = 91,
  slipDates,
  startDate,
}: {
  days?: number;
  slipDates: Set<string>;
  startDate: string | null;
}) {
  const today = startOfDay(new Date());
  const start = addDays(today, -(days - 1));
  const startMs = startDate ? startOfDay(new Date(startDate)).getTime() : 0;

  const cells: { key: string; state: "held" | "slip" | "off" }[] = [];
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    const key = format(d, "yyyy-MM-dd");
    let state: "held" | "slip" | "off" = "off";
    if (slipDates.has(key)) state = "slip";
    else if (startMs && d.getTime() >= startMs) state = "held";
    cells.push({ key, state });
  }

  return (
    <div className="grid grid-flow-col grid-rows-7 gap-1">
      {cells.map((c) => (
        <div
          key={c.key}
          title={c.key}
          className="h-3 w-3 rounded-[3px]"
          style={{
            background:
              c.state === "held"
                ? "rgba(34,197,94,0.65)"
                : c.state === "slip"
                  ? "rgba(239,68,68,0.7)"
                  : "rgba(255,255,255,0.06)",
          }}
        />
      ))}
    </div>
  );
}
