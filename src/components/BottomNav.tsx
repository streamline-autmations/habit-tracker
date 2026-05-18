import { NavLink } from "react-router-dom";
import { Home, Activity, BarChart3, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Home", Icon: Home, end: true },
  { to: "/progress", label: "Progress", Icon: BarChart3, end: false },
  { to: "/sos", label: "SOS", Icon: Activity, end: false, accent: true },
  { to: "/journal", label: "Journal", Icon: BookOpen, end: false },
  { to: "/settings", label: "Settings", Icon: Settings, end: false },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-base/85 backdrop-blur-xl">
      <div className="safe-bottom mx-auto grid max-w-md grid-cols-5">
        {ITEMS.map(({ to, label, Icon, end, accent }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 pb-1 pt-2 text-[11px] transition active:scale-95",
                isActive ? "text-white" : "text-white/45",
                accent && !isActive && "text-accent/80",
                accent && isActive && "text-accent",
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span className="font-mono leading-none">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
