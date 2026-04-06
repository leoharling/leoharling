"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronDown, LayoutGrid, Building2 } from "lucide-react";
import { AI_MODELS, MODELS_LAST_UPDATED, type AIModel, type ModelType } from "@/lib/ai-models";

// ── Constants ──────────────────────────────────────────────────────────────

const MODALITY_COLORS: Record<string, string> = {
  text:  "#94a3b8",
  image: "#a855f7",
  video: "#f97316",
  audio: "#22c55e",
  code:  "#3b82f6",
};

const BENCHMARK_META = {
  mmlu:     { label: "MMLU",      color: "#f59e0b", desc: "General knowledge across 57 subjects (0–100%)" },
  gpqa:     { label: "GPQA",      color: "#3b82f6", desc: "PhD-level science reasoning (0–100%)" },
  sweBench: { label: "SWE-Bench", color: "#22c55e", desc: "Solving real GitHub issues with code (0–100%)" },
} as const;

type BenchKey = keyof typeof BENCHMARK_META;

const QUICK_FILTERS = [
  { label: "Best for Coding", tag: "Best for Coding" },
  { label: "Cheapest",        tag: "Cheapest" },
  { label: "Fastest",         tag: "Fastest" },
  { label: "Largest Context", tag: "Largest Context" },
  { label: "Reasoning",       tag: "Reasoning" },
];

// ChatGPT public launch — timeline start
const TIMELINE_START = new Date("2022-11-30");

const PROVIDER_ORDER = [
  "Anthropic", "OpenAI", "Google", "Meta", "xAI",
  "DeepSeek", "Alibaba", "Mistral", "NVIDIA", "AWS", "Microsoft",
];

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtCost(n: number): string {
  if (n === 0) return "Self-hosted";
  if (n < 1) return `$${n.toFixed(2)}`;
  return `$${n}`;
}

function fmtContext(k: number): string {
  if (k >= 1000) return `${k / 1000}M`;
  return `${k}K`;
}

// ── BenchmarkBar ────────────────────────────────────────────────────────────

function BenchmarkBar({ bench, value }: { bench: BenchKey; value?: number }) {
  const { label, color } = BENCHMARK_META[bench];
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground font-medium">{label}</span>
        <span className="text-[10px] font-semibold text-foreground">
          {value != null ? `${value}%` : "—"}
        </span>
      </div>
      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
        {value != null && (
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${value}%`, background: color }}
          />
        )}
      </div>
    </div>
  );
}

// ── ModelCard ──────────────────────────────────────────────────────────────

interface ModelCardProps {
  model: AIModel;
  highlighted: boolean;
  faded: boolean;
  grouped?: boolean;
}

function ModelCard({ model, highlighted, faded, grouped }: ModelCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (highlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlighted]);

  const hasBenchmarks = model.mmlu != null || model.gpqa != null || model.sweBench != null;

  return (
    <div
      ref={cardRef}
      className={`glass-card p-4 flex flex-col gap-3 transition-all duration-300 ${
        highlighted ? "ring-2 ring-accent/70 bg-accent/5" : ""
      } ${faded ? "opacity-30" : "opacity-100"}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {!grouped && (
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{ background: `${model.providerColor}20`, color: model.providerColor }}
              >
                {model.provider}
              </span>
            )}
            <span className={`text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
              model.type === "frontier"
                ? "bg-accent/15 text-accent"
                : "bg-emerald-500/10 text-emerald-400"
            }`}>
              {model.type === "frontier" ? "Frontier" : "Open Source"}
            </span>
          </div>
          <h3 className="text-sm font-bold text-foreground mt-1.5">{model.name}</h3>
          <div className="text-[10px] text-muted-foreground">
            {new Date(model.releaseDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </div>
        </div>
        <div className="flex gap-1 shrink-0 mt-1">
          {model.modalities.map((m) => (
            <span
              key={m}
              title={m}
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: MODALITY_COLORS[m] }}
            />
          ))}
        </div>
      </div>

      {/* Benchmarks */}
      {hasBenchmarks ? (
        <div className="rounded-lg bg-white/[0.03] px-3 py-2.5 flex flex-col gap-2">
          <BenchmarkBar bench="mmlu"     value={model.mmlu} />
          <BenchmarkBar bench="gpqa"     value={model.gpqa} />
          <BenchmarkBar bench="sweBench" value={model.sweBench} />
        </div>
      ) : (
        <div className="rounded-lg bg-white/[0.03] px-3 py-2 text-[10px] text-muted-foreground/50 italic text-center">
          No benchmark data published
        </div>
      )}

      {/* Context + cost */}
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="text-muted-foreground">Context </span>
          <span className="font-semibold text-foreground">{fmtContext(model.contextK)}</span>
        </div>
        <div className="text-right">
          <div>
            <span className="text-muted-foreground">In </span>
            <span className="font-semibold text-foreground">{fmtCost(model.costInput)}</span>
            {model.costInput > 0 && <span className="text-muted-foreground">/1M</span>}
          </div>
          {model.costInput > 0 && (
            <div>
              <span className="text-muted-foreground">Out </span>
              <span className="font-semibold text-foreground">{fmtCost(model.costOutput)}</span>
              <span className="text-muted-foreground">/1M</span>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {model.tags.map((tag) => (
          <span
            key={tag}
            className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      {model.notes && (
        <p className="text-[10px] text-muted-foreground/70 italic leading-snug">{model.notes}</p>
      )}
    </div>
  );
}

// ── ProviderSection (grouped view) ─────────────────────────────────────────

interface ProviderSectionProps {
  provider: string;
  color: string;
  models: AIModel[];
  highlightModelId?: string | null;
  timelineDate: Date;
  mounted: boolean;
}

function ProviderSection({ provider, color, models, highlightModelId, timelineDate, mounted }: ProviderSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
        <span className="font-semibold text-foreground text-sm">{provider}</span>
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full ml-1"
          style={{ background: `${color}20`, color }}
        >
          {models.length} {models.length === 1 ? "model" : "models"}
        </span>
        <ChevronDown
          size={14}
          className={`ml-auto text-muted-foreground transition-transform duration-200 ${collapsed ? "-rotate-90" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 pt-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              style={{ borderTop: `1px solid ${color}18` }}
            >
              {models.map((model) => (
                <motion.div key={model.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
                  <ModelCard
                    model={model}
                    highlighted={highlightModelId === model.id}
                    faded={mounted && new Date(model.releaseDate) > timelineDate}
                    grouped
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── BenchmarkTrendsChart ────────────────────────────────────────────────────

interface TooltipState {
  x: number;
  y: number;
  model: AIModel;
  bench: BenchKey;
  value: number;
}

function BenchmarkTrendsChart() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [activeBenches, setActiveBenches] = useState<Set<BenchKey>>(
    new Set(["mmlu", "gpqa", "sweBench"])
  );
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 800;
  const H = 220;
  const PAD = { top: 16, right: 24, bottom: 32, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const startMs = TIMELINE_START.getTime();
  const endMs = new Date("2026-04-06").getTime();
  const totalMs = endMs - startMs;

  function xOf(dateStr: string) {
    const t = new Date(dateStr).getTime();
    return PAD.left + ((t - startMs) / totalMs) * chartW;
  }
  function yOf(score: number) {
    return PAD.top + chartH - (score / 100) * chartH;
  }

  // Build per-benchmark sorted data points
  const series = useMemo(() => {
    const result: Record<BenchKey, { model: AIModel; value: number }[]> = {
      mmlu: [], gpqa: [], sweBench: [],
    };
    for (const m of AI_MODELS) {
      if (new Date(m.releaseDate) < TIMELINE_START) continue;
      if (m.mmlu     != null) result.mmlu.push({ model: m, value: m.mmlu });
      if (m.gpqa     != null) result.gpqa.push({ model: m, value: m.gpqa });
      if (m.sweBench != null) result.sweBench.push({ model: m, value: m.sweBench });
    }
    for (const key of Object.keys(result) as BenchKey[]) {
      result[key].sort((a, b) =>
        new Date(a.model.releaseDate).getTime() - new Date(b.model.releaseDate).getTime()
      );
    }
    return result;
  }, []);

  // Frontier line: running maximum over time per benchmark
  function frontierPath(points: { model: AIModel; value: number }[]) {
    if (points.length === 0) return "";
    let best = 0;
    const segments: string[] = [];
    for (const { model, value } of points) {
      const x = xOf(model.releaseDate);
      if (value > best) {
        if (best > 0) {
          // horizontal line to this x at old best, then jump up
          segments.push(`L ${x} ${yOf(best)}`);
        }
        best = value;
        segments.push(`L ${x} ${yOf(best)}`);
      }
    }
    // extend to right edge
    segments.push(`L ${PAD.left + chartW} ${yOf(best)}`);
    const first = points[0];
    return `M ${xOf(first.model.releaseDate)} ${yOf(first.value)} ${segments.join(" ")}`;
  }

  // Year ticks
  const years = [2023, 2024, 2025, 2026];

  function toggleBench(b: BenchKey) {
    setActiveBenches((prev) => {
      const next = new Set(prev);
      if (next.has(b)) { if (next.size > 1) next.delete(b); }
      else next.add(b);
      return next;
    });
  }

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Benchmark Progress
          </div>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">
            Frontier line shows the best-ever score at each point in time — illustrating how fast AI has improved.
          </p>
        </div>
        {/* Legend / toggles */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(BENCHMARK_META) as BenchKey[]).map((b) => {
            const { label, color } = BENCHMARK_META[b];
            const active = activeBenches.has(b);
            return (
              <button
                key={b}
                onClick={() => toggleBench(b)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium border transition-all ${
                  active
                    ? "border-transparent text-foreground"
                    : "border-white/10 text-muted-foreground/40"
                }`}
                style={active ? { background: `${color}20`, borderColor: `${color}40`, color } : {}}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: active ? color : "#ffffff20" }} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minWidth: 320 }}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((pct) => (
            <g key={pct}>
              <line
                x1={PAD.left} y1={yOf(pct)}
                x2={PAD.left + chartW} y2={yOf(pct)}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 4} y={yOf(pct) + 3}
                textAnchor="end"
                fontSize={9}
                fill="rgba(255,255,255,0.25)"
              >
                {pct}%
              </text>
            </g>
          ))}

          {/* Year ticks */}
          {years.map((y) => {
            const x = xOf(`${y}-01-01`);
            if (x < PAD.left || x > PAD.left + chartW) return null;
            return (
              <g key={y}>
                <line
                  x1={x} y1={PAD.top}
                  x2={x} y2={PAD.top + chartH}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <text
                  x={x} y={H - 8}
                  textAnchor="middle"
                  fontSize={9}
                  fill="rgba(255,255,255,0.3)"
                >
                  {y}
                </text>
              </g>
            );
          })}

          {/* Per-benchmark: frontier line + scatter dots */}
          {(Object.keys(BENCHMARK_META) as BenchKey[]).map((bench) => {
            if (!activeBenches.has(bench)) return null;
            const { color } = BENCHMARK_META[bench];
            const points = series[bench];
            const path = frontierPath(points);
            return (
              <g key={bench}>
                {/* Frontier line */}
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  strokeOpacity={0.5}
                  strokeDasharray="4 2"
                />
                {/* Scatter dots */}
                {points.map(({ model, value }) => {
                  const cx = xOf(model.releaseDate);
                  const cy = yOf(value);
                  const isHovered = tooltip?.model.id === model.id && tooltip?.bench === bench;
                  return (
                    <circle
                      key={model.id}
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 5 : 3.5}
                      fill={color}
                      fillOpacity={isHovered ? 1 : 0.75}
                      stroke={isHovered ? "#fff" : "rgba(0,0,0,0.4)"}
                      strokeWidth={isHovered ? 1.5 : 1}
                      style={{ cursor: "pointer", transition: "r 0.1s" }}
                      onMouseEnter={(e) => {
                        const svg = svgRef.current;
                        if (!svg) return;
                        const rect = svg.getBoundingClientRect();
                        const scaleX = rect.width / W;
                        const scaleY = rect.height / H;
                        setTooltip({
                          x: cx * scaleX + rect.left - (rect.left + rect.width / 2 > window.innerWidth / 2 ? 160 : 0),
                          y: cy * scaleY + rect.top,
                          model,
                          bench,
                          value,
                        });
                      }}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Tooltip (portal-style, positioned relative to viewport) */}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none px-2.5 py-2 rounded-lg text-xs shadow-xl border border-white/10 bg-background/95 backdrop-blur-sm"
            style={{ left: tooltip.x + 12, top: tooltip.y - 40, minWidth: 140 }}
          >
            <div
              className="font-semibold text-foreground"
              style={{ color: BENCHMARK_META[tooltip.bench].color }}
            >
              {BENCHMARK_META[tooltip.bench].label}: {tooltip.value}%
            </div>
            <div className="text-muted-foreground mt-0.5">{tooltip.model.name}</div>
            <div className="text-muted-foreground/60 text-[10px]">
              {new Date(tooltip.model.releaseDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </div>
          </div>
        )}
      </div>

      {/* Benchmark descriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-white/[0.04]">
        {(Object.keys(BENCHMARK_META) as BenchKey[]).map((b) => {
          const { label, color, desc } = BENCHMARK_META[b];
          return (
            <div key={b} className="flex gap-2 items-start">
              <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: color }} />
              <div className="text-[10px] text-muted-foreground">
                <span className="font-medium" style={{ color }}>{label}</span>
                {" — "}{desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ModelsTab ──────────────────────────────────────────────────────────

export interface ModelsTabProps {
  highlightModelId?: string | null;
  onHighlightClear?: () => void;
}

export default function ModelsTab({ highlightModelId, onHighlightClear }: ModelsTabProps) {
  const [typeFilter, setTypeFilter] = useState<"all" | ModelType>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [timelineValue, setTimelineValue] = useState(100);
  const [groupByCompany, setGroupByCompany] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!highlightModelId) return;
    const t = setTimeout(() => onHighlightClear?.(), 2500);
    return () => clearTimeout(t);
  }, [highlightModelId, onHighlightClear]);

  const startMs = TIMELINE_START.getTime();
  const endMs = useMemo(() => mounted ? Date.now() : new Date("2026-04-06").getTime(), [mounted]);
  const totalMs = endMs - startMs;

  const timelineDate = useMemo(() => {
    if (!mounted) return new Date();
    return new Date(startMs + (timelineValue / 100) * totalMs);
  }, [timelineValue, mounted, startMs, totalMs]);

  const filtered = useMemo(() => {
    return AI_MODELS.filter((m) => {
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      if (activeTag && !m.tags.includes(activeTag)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!m.name.toLowerCase().includes(q) && !m.provider.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [typeFilter, activeTag, search]);

  const groupedModels = useMemo(() => {
    const map = new Map<string, { color: string; models: AIModel[] }>();
    for (const m of filtered) {
      if (!map.has(m.provider)) map.set(m.provider, { color: m.providerColor, models: [] });
      map.get(m.provider)!.models.push(m);
    }
    return [...map.entries()].sort(([a], [b]) => {
      const ai = PROVIDER_ORDER.indexOf(a), bi = PROVIDER_ORDER.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [filtered]);

  const years = [2023, 2024, 2025, 2026];

  function yearToPercent(year: number) {
    return ((new Date(`${year}-01-01`).getTime() - startMs) / totalMs) * 100;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">AI Model Comparison</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Frontier and open-source models ranked by benchmarks, cost, and capability. Updated {MODELS_LAST_UPDATED}.
        </p>
      </div>

      {/* Benchmark Trends Chart */}
      <BenchmarkTrendsChart />

      {/* Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "frontier", "open-source"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all capitalize ${
                typeFilter === t
                  ? "bg-accent text-white shadow-sm"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {t === "all" ? "All Models" : t === "frontier" ? "Frontier" : "Open Source"}
            </button>
          ))}

          <div className="flex items-center rounded-lg bg-white/5 p-0.5 ml-1">
            <button
              onClick={() => setGroupByCompany(false)}
              title="Grid view"
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
                !groupByCompany ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid size={12} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setGroupByCompany(true)}
              title="Group by company"
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
                groupByCompany ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 size={12} />
              <span className="hidden sm:inline">By Company</span>
            </button>
          </div>

          <div className="relative ml-auto">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search models..."
              className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-8 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/40 w-44"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground self-center mr-1">Quick filter:</span>
          {QUICK_FILTERS.map(({ label, tag }) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                activeTag === tag
                  ? "bg-accent/20 text-accent border border-accent/30"
                  : "bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Model content */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No models match the current filters.</div>
      ) : groupByCompany ? (
        <div className="space-y-3">
          {groupedModels.map(([provider, { color, models }]) => (
            <ProviderSection
              key={provider}
              provider={provider}
              color={color}
              models={models}
              highlightModelId={highlightModelId}
              timelineDate={timelineDate}
              mounted={mounted}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((model) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ModelCard
                model={model}
                highlighted={highlightModelId === model.id}
                faded={mounted && new Date(model.releaseDate) > timelineDate}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Timeline slider */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Model Timeline
          </div>
          <div className="text-xs text-muted-foreground">
            Showing models released before:{" "}
            <span className="text-foreground font-medium">
              {mounted
                ? timelineDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
                : "—"}
            </span>
          </div>
        </div>

        <div className="relative pt-2 pb-5">
          <div className="relative h-4 mb-2">
            {years.map((y) => {
              const pct = yearToPercent(y);
              if (pct < 0 || pct > 100) return null;
              return (
                <div
                  key={y}
                  className="absolute -translate-x-1/2 text-[9px] text-muted-foreground"
                  style={{ left: `${pct}%` }}
                >
                  {y}
                </div>
              );
            })}
          </div>

          <div className="relative h-2 bg-white/5 rounded-full mb-2">
            <div className="absolute h-full bg-accent/30 rounded-full" style={{ width: `${timelineValue}%` }} />
            {AI_MODELS.filter(m => new Date(m.releaseDate) >= TIMELINE_START).map((m) => {
              const pct = ((new Date(m.releaseDate).getTime() - startMs) / totalMs) * 100;
              if (pct < 0 || pct > 100) return null;
              const color = m.type === "frontier" ? "#3b82f6" : "#22c55e";
              const active = new Date(m.releaseDate) <= timelineDate;
              return (
                <div
                  key={m.id}
                  title={m.name}
                  className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 w-2 h-2 rounded-full border border-background transition-opacity"
                  style={{ left: `${pct}%`, background: color, opacity: active ? 1 : 0.25 }}
                />
              );
            })}
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={timelineValue}
            onChange={(e) => setTimelineValue(Number(e.target.value))}
            className="w-full accent-accent"
            style={{ margin: 0 }}
          />
        </div>

        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent inline-block" /> Frontier
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Open Source
          </span>
          <span className="ml-auto">Drag to explore model evolution →</span>
        </div>
      </div>
    </div>
  );
}
