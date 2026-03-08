"use client";

import type { ConflictActor } from "@/lib/conflicts";

const TYPE_STYLES: Record<string, string> = {
  state: "border-white/20 bg-white/5",
  "non-state": "border-white/10 bg-white/[0.02] border-dashed",
  proxy: "border-white/10 bg-white/[0.02] border-dotted",
  "international-org": "border-blue-500/20 bg-blue-500/5",
};

const TYPE_LABELS: Record<string, string> = {
  state: "State",
  "non-state": "Non-State",
  proxy: "Proxy",
  "international-org": "Int'l Org",
};

// Assign distinct colors to sides based on their role keywords
const SIDE_COLORS: { pattern: RegExp; color: string; bg: string; border: string }[] = [
  { pattern: /aggressor|invad|junta|military/i, color: "text-red-400", bg: "bg-red-500/8", border: "border-l-red-500/50" },
  { pattern: /defend|resist|democrat|opposition/i, color: "text-blue-400", bg: "bg-blue-500/8", border: "border-l-blue-500/50" },
  { pattern: /palestin|hamas|axis|hezbollah|houthi/i, color: "text-orange-400", bg: "bg-orange-500/8", border: "border-l-orange-500/50" },
  { pattern: /israel|government|SAF/i, color: "text-sky-400", bg: "bg-sky-500/8", border: "border-l-sky-500/50" },
  { pattern: /paramilitar|RSF|rebel|insurgent/i, color: "text-amber-400", bg: "bg-amber-500/8", border: "border-l-amber-500/50" },
  { pattern: /mediator|neutral|peacekeeper/i, color: "text-emerald-400", bg: "bg-emerald-500/8", border: "border-l-emerald-500/50" },
  { pattern: /support|ally|aligned|backer/i, color: "text-purple-400", bg: "bg-purple-500/8", border: "border-l-purple-500/50" },
  { pattern: /ethnic|armed|brotherhood/i, color: "text-teal-400", bg: "bg-teal-500/8", border: "border-l-teal-500/50" },
];

// Fallback colors by side index
const FALLBACK_COLORS = [
  { color: "text-blue-400", bg: "bg-blue-500/8", border: "border-l-blue-500/50" },
  { color: "text-red-400", bg: "bg-red-500/8", border: "border-l-red-500/50" },
  { color: "text-emerald-400", bg: "bg-emerald-500/8", border: "border-l-emerald-500/50" },
  { color: "text-amber-400", bg: "bg-amber-500/8", border: "border-l-amber-500/50" },
  { color: "text-purple-400", bg: "bg-purple-500/8", border: "border-l-purple-500/50" },
  { color: "text-teal-400", bg: "bg-teal-500/8", border: "border-l-teal-500/50" },
];

function getSideColor(side: string, index: number) {
  for (const s of SIDE_COLORS) {
    if (s.pattern.test(side)) return s;
  }
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export default function ActorsPanel({ actors }: { actors: ConflictActor[] }) {
  const sides = [...new Set(actors.map((a) => a.side))];

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {sides.map((side, sideIdx) => {
        const sideColor = getSideColor(side, sideIdx);
        return (
          <div key={side}>
            <h4 className={`mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider ${sideColor.color}`}>
              <span className="h-2.5 w-0.5 rounded-full" style={{ backgroundColor: "currentColor" }} />
              {side}
            </h4>
            <div className="space-y-2">
              {actors
                .filter((a) => a.side === side)
                .map((a) => (
                  <div
                    key={a.name}
                    className={`rounded-lg border border-l-2 px-3 py-2.5 ${TYPE_STYLES[a.type] || TYPE_STYLES.state} ${sideColor.border}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold">{a.name}</span>
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                        {TYPE_LABELS[a.type] || a.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">{a.objectives}</p>
                    {a.strength && (
                      <p className="text-[10px] text-muted-foreground/70 mt-1">{a.strength}</p>
                    )}
                    {a.backedBy && a.backedBy.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <span className="text-[9px] text-muted-foreground/50">Backed by:</span>
                        {a.backedBy.map((b) => (
                          <span key={b} className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-muted-foreground">
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
