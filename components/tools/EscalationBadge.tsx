"use client";

import { TrendingUp, Minus, TrendingDown, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { EscalationIndicator } from "@/lib/conflicts";

const LEVEL_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-500" },
  high: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-500" },
  elevated: { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-500" },
  moderate: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-500" },
  low: { bg: "bg-green-500/10", text: "text-green-400", dot: "bg-green-500" },
};

const TREND_ICON = {
  escalating: TrendingUp,
  stable: Minus,
  "de-escalating": TrendingDown,
};

export default function EscalationBadge({ data }: { data: EscalationIndicator }) {
  const [open, setOpen] = useState(false);
  const style = LEVEL_STYLES[data.level];
  const TrendIcon = TREND_ICON[data.trend];

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-3 rounded-lg ${style.bg} px-4 py-2.5 transition-colors hover:brightness-110 w-full text-left`}
      >
        <span className={`h-2 w-2 rounded-full ${style.dot} ${data.level === "critical" ? "animate-pulse" : ""}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>
              {data.level} risk
            </span>
            <span className={`flex items-center gap-1 text-[11px] ${style.text} opacity-75`}>
              <TrendIcon size={11} />
              {data.trend}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{data.summary}</p>
        </div>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {data.factors.map((f) => (
            <div key={f.label} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
              <span className={`text-[10px] ${f.direction === "up" ? "text-red-400" : f.direction === "down" ? "text-green-400" : "text-muted-foreground"}`}>
                {f.direction === "up" ? "\u2191" : f.direction === "down" ? "\u2193" : "\u2192"}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium">{f.label}</p>
                {f.detail && <p className="text-[10px] text-muted-foreground line-clamp-1">{f.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
