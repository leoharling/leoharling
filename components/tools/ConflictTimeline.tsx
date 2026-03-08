"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Crosshair, Scale, Heart, Map, Handshake } from "lucide-react";
import type { TimelinePhase, TimelineMilestone } from "@/lib/conflicts";

const ESCALATION_COLORS = ["", "#22c55e", "#3b82f6", "#eab308", "#f97316", "#ef4444"];

const CATEGORY_ICONS: Record<string, typeof Crosshair> = {
  military: Crosshair,
  political: Scale,
  humanitarian: Heart,
  territorial: Map,
  diplomatic: Handshake,
};

function toTimestamp(d: string) { return new Date(d).getTime(); }

export default function ConflictTimeline({
  phases,
  milestones,
  startDate,
}: {
  phases: TimelinePhase[];
  milestones: TimelineMilestone[];
  startDate: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<TimelineMilestone | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const range = useMemo(() => {
    const start = toTimestamp(startDate);
    const now = Date.now();
    return { start, end: now, span: now - start };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, mounted]);

  const pct = (date: string) => {
    const t = toTimestamp(date);
    return Math.max(0, Math.min(100, ((t - range.start) / range.span) * 100));
  };

  if (!mounted) return <div style={{ minHeight: 80 }} />;

  return (
    <div>
      {/* Scrollable timeline */}
      <div ref={scrollRef} className="relative overflow-x-auto pb-2" style={{ minHeight: 80 }}>
        <div className="relative" style={{ minWidth: 600, height: 64 }}>
          {/* Phase bands */}
          {phases.map((p) => {
            const left = pct(p.startDate);
            const right = p.endDate ? pct(p.endDate) : 100;
            const width = right - left;
            return (
              <div
                key={p.id}
                className="absolute top-0 h-6 rounded-sm"
                style={{
                  left: `${left}%`,
                  width: `${Math.max(width, 1)}%`,
                  backgroundColor: ESCALATION_COLORS[p.escalationLevel],
                  opacity: 0.12,
                }}
                title={p.label}
              />
            );
          })}

          {/* Phase labels */}
          {phases.map((p) => {
            const left = pct(p.startDate);
            const right = p.endDate ? pct(p.endDate) : 100;
            const mid = left + (right - left) / 2;
            return (
              <span
                key={`label-${p.id}`}
                className="absolute text-[9px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap pointer-events-none"
                style={{ left: `${mid}%`, top: 2, transform: "translateX(-50%)" }}
              >
                {p.label}
              </span>
            );
          })}

          {/* Timeline axis */}
          <div className="absolute top-[28px] left-0 right-0 h-px bg-white/10" />

          {/* Milestone dots */}
          {milestones.map((m, i) => {
            const Icon = CATEGORY_ICONS[m.category] || Crosshair;
            const isSelected = selected === m;
            return (
              <button
                key={i}
                onClick={() => setSelected(isSelected ? null : m)}
                className={`absolute flex items-center justify-center rounded-full border transition-all ${
                  isSelected
                    ? "border-white/30 bg-white/20 scale-125 z-10"
                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:scale-110"
                }`}
                style={{
                  left: `${pct(m.date)}%`,
                  top: m.significance === "major" ? 18 : 22,
                  width: m.significance === "major" ? 20 : 14,
                  height: m.significance === "major" ? 20 : 14,
                  transform: "translateX(-50%)",
                }}
                title={m.title}
              >
                <Icon size={m.significance === "major" ? 10 : 7} className="text-muted-foreground" />
              </button>
            );
          })}

          {/* Now indicator */}
          <div className="absolute right-0 top-[22px] flex flex-col items-center">
            <span className="h-3 w-3 rounded-full bg-white/20 animate-pulse" />
            <span className="mt-1 text-[8px] text-muted-foreground">Now</span>
          </div>

          {/* Year markers */}
          {(() => {
            const startYear = new Date(range.start).getFullYear();
            const endYear = new Date(range.end).getFullYear();
            const years = [];
            for (let y = startYear; y <= endYear; y++) {
              years.push(y);
            }
            return years.map((y) => (
              <span
                key={y}
                className="absolute text-[9px] text-white/20 pointer-events-none"
                style={{ left: `${pct(`${y}-01-01`)}%`, top: 46 }}
              >
                {y}
              </span>
            ));
          })()}
        </div>
      </div>

      {/* Selected milestone detail */}
      {selected && (
        <div className="mt-2 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-muted-foreground">
              {new Date(selected.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
              {selected.category}
            </span>
          </div>
          <p className="text-sm font-medium">{selected.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{selected.description}</p>
        </div>
      )}
    </div>
  );
}
