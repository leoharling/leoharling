"use client";

import type { ConflictActor } from "@/lib/conflicts";

const TYPE_STYLES: Record<string, string> = {
  state: "border-white/20 bg-white/5",
  "non-state": "border-white/10 bg-white/[0.02] border-dashed",
  proxy: "border-white/10 bg-white/[0.02] border-dotted",
  "international-org": "border-blue-500/20 bg-blue-500/5",
};

export default function ActorsPanel({ actors }: { actors: ConflictActor[] }) {
  const sides = [...new Set(actors.map((a) => a.side))];

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {sides.map((side) => (
        <div key={side}>
          <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {side}
          </h4>
          <div className="space-y-2">
            {actors
              .filter((a) => a.side === side)
              .map((a) => (
                <div
                  key={a.name}
                  className={`rounded-lg border px-3 py-2.5 ${TYPE_STYLES[a.type] || TYPE_STYLES.state}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold">{a.name}</span>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                      {a.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{a.objectives}</p>
                  {a.strength && (
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{a.strength}</p>
                  )}
                  {a.backedBy && a.backedBy.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
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
      ))}
    </div>
  );
}
