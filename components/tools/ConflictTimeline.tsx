"use client";

import { useRef, useState, useMemo, useEffect, useCallback } from "react";
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

// Layout constants (px)
const TRACK_Y = 34;   // axis line y-position
const TOTAL_H = 62;   // total timeline container height
const DOT_MAJOR = 20; // major milestone dot diameter
const DOT_MINOR = 14; // minor milestone dot diameter
const SLIDER_R = 7;   // slider circle radius (circle = 14px)
const NEAR_PCT = 3;   // near-milestone threshold during drag (%)
const SNAP_PCT = 1.5; // near-milestone threshold at rest (%)

function toTimestamp(d: string) { return new Date(d).getTime(); }

export default function ConflictTimeline({
  phases,
  milestones,
  startDate,
  selectedTime,
  onTimeChange,
}: {
  phases: TimelinePhase[];
  milestones: TimelineMilestone[];
  startDate: string;
  selectedTime?: number | null;
  onTimeChange?: (time: number | null) => void;
}) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [nearMilestone, setNearMilestone] = useState<TimelineMilestone | null>(null);
  const isDragging = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  const range = useMemo(() => {
    const start = toTimestamp(startDate);
    const now = Date.now();
    return { start, end: now, span: now - start };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, mounted]);

  const pct = useCallback((date: string) => {
    const t = toTimestamp(date);
    return Math.max(0, Math.min(100, ((t - range.start) / range.span) * 100));
  }, [range]);

  const pctFromTimestamp = useCallback((t: number) => {
    return Math.max(0, Math.min(100, ((t - range.start) / range.span) * 100));
  }, [range]);

  const timestampFromPct = useCallback((p: number) => {
    return range.start + (p / 100) * range.span;
  }, [range]);

  const sliderPct = useMemo(() => {
    if (selectedTime == null) return 100;
    return pctFromTimestamp(selectedTime);
  }, [selectedTime, pctFromTimestamp]);

  // Milestone that's currently "active" — during drag: nearest within NEAR_PCT; at rest: nearest within SNAP_PCT
  const activeMilestone = useMemo(() => {
    if (dragging) return nearMilestone;
    if (selectedTime == null) return null;
    const sp = pctFromTimestamp(selectedTime);
    let best: TimelineMilestone | null = null;
    let bestDist = SNAP_PCT;
    for (const m of milestones) {
      const dist = Math.abs(pct(m.date) - sp);
      if (dist < bestDist) { bestDist = dist; best = m; }
    }
    return best;
  }, [dragging, nearMilestone, selectedTime, pctFromTimestamp, milestones, pct]);

  const pointerToPercent = useCallback((clientX: number) => {
    const el = timelineRef.current;
    if (!el) return 100;
    const rect = el.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current || !onTimeChange) return;
    const p = pointerToPercent(e.clientX);
    if (p >= 97) {
      onTimeChange(null);
    } else {
      onTimeChange(timestampFromPct(p));
    }
    const near = milestones.find((m) => Math.abs(pct(m.date) - p) < NEAR_PCT) ?? null;
    setNearMilestone(near);
  }, [onTimeChange, pointerToPercent, timestampFromPct, milestones, pct]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    setDragging(false);
    setNearMilestone(null);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!onTimeChange) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    setDragging(true);
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }, [onTimeChange, handlePointerMove, handlePointerUp]);

  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (!onTimeChange) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const p = pointerToPercent(e.clientX);
    if (p >= 97) {
      onTimeChange(null);
    } else {
      onTimeChange(timestampFromPct(p));
    }
  }, [onTimeChange, pointerToPercent, timestampFromPct]);

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const handleMilestoneClick = useCallback((m: TimelineMilestone) => {
    if (onTimeChange) onTimeChange(toTimestamp(m.date));
  }, [onTimeChange]);

  if (!mounted) return <div style={{ minHeight: 80 }} />;

  const isAtNow = selectedTime == null;

  return (
    <div>
      {/* Timeline */}
      <div
        ref={timelineRef}
        className="relative cursor-pointer select-none"
        style={{ height: TOTAL_H, touchAction: "none" }}
        onClick={handleTimelineClick}
      >
        {/* Phase bands */}
        {phases.map((p) => {
          const left = pct(p.startDate);
          const right = p.endDate ? pct(p.endDate) : 100;
          return (
            <div
              key={p.id}
              className="absolute rounded-sm"
              style={{
                left: `${left}%`,
                width: `${Math.max(right - left, 1)}%`,
                top: 0,
                height: 18,
                backgroundColor: ESCALATION_COLORS[p.escalationLevel],
                opacity: 0.10,
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
              className="absolute text-[8px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap pointer-events-none"
              style={{ left: `${mid}%`, top: 3, transform: "translateX(-50%)" }}
            >
              {p.label}
            </span>
          );
        })}

        {/* Track background */}
        <div
          className="absolute left-0 right-0 bg-white/[0.07] rounded-full"
          style={{ top: TRACK_Y, height: 2 }}
        />

        {/* Progress fill */}
        {!isAtNow && (
          <div
            className="absolute bg-accent/50 rounded-full"
            style={{ top: TRACK_Y, left: 0, width: `${sliderPct}%`, height: 2 }}
          />
        )}

        {/* Year markers */}
        {(() => {
          const startYear = new Date(range.start).getFullYear();
          const endYear = new Date(range.end).getFullYear();
          const years: number[] = [];
          for (let y = startYear; y <= endYear; y++) years.push(y);
          return years.map((y) => (
            <span
              key={y}
              className="absolute text-[9px] text-white/20 pointer-events-none"
              style={{ left: `${pct(`${y}-01-01`)}%`, top: TRACK_Y + 12 }}
            >
              {y}
            </span>
          ));
        })()}

        {/* Milestone dots */}
        {milestones.map((m, i) => {
          const Icon = CATEGORY_ICONS[m.category] || Crosshair;
          const isActive = activeMilestone === m;
          const isDragActive = dragging && isActive;
          const dotSize = m.significance === "major" ? DOT_MAJOR : DOT_MINOR;
          const dotTop = TRACK_Y - dotSize / 2;
          const scale = isDragActive ? 1.65 : isActive ? 1.3 : 1;

          return (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                handleMilestoneClick(m);
              }}
              className={`absolute flex items-center justify-center rounded-full border transition-all duration-100 ${
                isDragActive
                  ? "border-white/60 bg-white/30 z-20"
                  : isActive
                  ? "border-white/25 bg-white/12 z-10"
                  : "border-white/10 bg-white/5 hover:bg-white/10 hover:scale-110"
              }`}
              style={{
                left: `${pct(m.date)}%`,
                top: dotTop,
                width: dotSize,
                height: dotSize,
                transform: `translateX(-50%) scale(${scale})`,
              }}
              title={m.title}
            >
              <Icon
                size={m.significance === "major" ? 10 : 7}
                className={isActive ? "text-white/85" : "text-muted-foreground"}
              />
            </button>
          );
        })}

        {/* Slider */}
        <div
          className="absolute z-20"
          style={{ left: `${sliderPct}%`, top: 0, transform: "translateX(-50%)", height: TOTAL_H }}
          onPointerDown={handlePointerDown}
        >
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: 0,
              width: 1.5,
              height: TOTAL_H,
              background: isAtNow ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.28)",
            }}
          />
          <div
            className={`absolute left-1/2 -translate-x-1/2 rounded-full border transition-all duration-100 ${
              isAtNow
                ? "bg-white/15 border-white/20 animate-pulse"
                : dragging
                ? "bg-white border-white/70 shadow-md shadow-white/20"
                : "bg-white/80 border-white/50 shadow-sm"
            }`}
            style={{
              top: TRACK_Y - SLIDER_R,
              width: SLIDER_R * 2,
              height: SLIDER_R * 2,
              cursor: dragging ? "grabbing" : "grab",
            }}
          />
        </div>

        {/* "Now" indicator */}
        {!isAtNow && (
          <button
            className="absolute right-0 flex items-center gap-1 group"
            style={{ top: TRACK_Y - 5 }}
            onClick={(e) => {
              e.stopPropagation();
              onTimeChange?.(null);
            }}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-white/15 group-hover:bg-white/35 transition-colors" />
            <span className="text-[8px] text-muted-foreground group-hover:text-white/60 transition-colors leading-none">Now</span>
          </button>
        )}
      </div>

      {/* Unified info area — grid animation prevents layout shifts when appearing/disappearing */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: isAtNow ? "0fr" : "1fr",
          transition: "grid-template-rows 0.2s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          {/* Fixed minHeight so milestone card ↔ date text swap never shifts the map */}
          <div className="mt-2" style={{ minHeight: 96 }}>
            {!isAtNow && (activeMilestone ? (
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(activeMilestone.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="text-white/15 text-[10px]">·</span>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                      {activeMilestone.category}
                    </span>
                    <span className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[9px] text-muted-foreground/60">
                      {activeMilestone.phase}
                    </span>
                  </div>
                  <button
                    onClick={() => onTimeChange?.(null)}
                    className="shrink-0 text-[10px] text-white/40 hover:text-white/70 underline underline-offset-2 transition-colors"
                  >
                    Return to Now
                  </button>
                </div>
                <p className="mt-2 text-sm font-semibold">{activeMilestone.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{activeMilestone.description}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">
                  Viewing: {new Date(selectedTime!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <button
                  onClick={() => onTimeChange?.(null)}
                  className="text-[10px] text-white/40 hover:text-white/70 underline underline-offset-2 transition-colors"
                >
                  Return to Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
