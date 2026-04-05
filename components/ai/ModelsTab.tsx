"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronDown, LayoutGrid, Building2 } from "lucide-react";
import { AI_MODELS, MODELS_LAST_UPDATED, type AIModel, type ModelType } from "@/lib/ai-models";

const MODALITY_COLORS: Record<string, string> = {
  text:  "#94a3b8",
  image: "#a855f7",
  video: "#f97316",
  audio: "#22c55e",
  code:  "#3b82f6",
};

const QUICK_FILTERS = [
  { label: "Best for Coding", tag: "Best for Coding" },
  { label: "Cheapest",        tag: "Cheapest" },
  { label: "Fastest",         tag: "Fastest" },
  { label: "Largest Context", tag: "Largest Context" },
  { label: "Reasoning",       tag: "Reasoning" },
];

const FRONTIER_FIRST_DATE = new Date("2020-06-11"); // GPT-3 release

function fmtCost(n: number): string {
  if (n === 0) return "Self-hosted";
  if (n < 1) return `$${n.toFixed(2)}`;
  return `$${n}`;
}

function fmtContext(k: number): string {
  if (k >= 1000) return `${k / 1000}M`;
  return `${k}K`;
}

function BenchmarkCell({ label, value }: { label: string; value?: number }) {
  return (
    <div className="text-center">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-foreground mt-0.5">
        {value != null ? `${value}%` : "—"}
      </div>
    </div>
  );
}

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

  return (
    <div
      ref={cardRef}
      className={`glass-card p-4 flex flex-col gap-3 transition-all duration-300 ${
        highlighted ? "ring-2 ring-accent/70 bg-accent/5" : ""
      } ${faded ? "opacity-30" : "opacity-100"}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Only show provider badge in flat (non-grouped) view */}
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
        {/* Modalities */}
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
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-white/[0.03] px-3 py-2">
        <BenchmarkCell label="MMLU" value={model.mmlu} />
        <BenchmarkCell label="GPQA" value={model.gpqa} />
        <BenchmarkCell label="SWE-Bench" value={model.sweBench} />
      </div>

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

// ── Provider section for grouped view ──────────────────────────────────────

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
      {/* Section header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ background: color }}
        />
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

      {/* Models grid */}
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
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                >
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

// ── Provider order (determines display order in grouped view) ──────────────
const PROVIDER_ORDER = [
  "Anthropic", "OpenAI", "Google", "Meta", "xAI",
  "DeepSeek", "Alibaba", "Mistral", "NVIDIA", "AWS", "Microsoft",
];

export interface ModelsTabProps {
  highlightModelId?: string | null;
  onHighlightClear?: () => void;
}

export default function ModelsTab({ highlightModelId, onHighlightClear }: ModelsTabProps) {
  const [typeFilter, setTypeFilter] = useState<"all" | ModelType>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [timelineValue, setTimelineValue] = useState(100); // 0–100 percentage
  const [groupByCompany, setGroupByCompany] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Auto-clear highlight after 2.5s
  useEffect(() => {
    if (!highlightModelId) return;
    const t = setTimeout(() => onHighlightClear?.(), 2500);
    return () => clearTimeout(t);
  }, [highlightModelId, onHighlightClear]);

  const timelineDate = useMemo(() => {
    if (!mounted) return new Date();
    const start = FRONTIER_FIRST_DATE.getTime();
    const end = Date.now();
    return new Date(start + (timelineValue / 100) * (end - start));
  }, [timelineValue, mounted]);

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

  // Group filtered models by provider
  const groupedModels = useMemo(() => {
    const map = new Map<string, { color: string; models: AIModel[] }>();
    for (const m of filtered) {
      if (!map.has(m.provider)) {
        map.set(m.provider, { color: m.providerColor, models: [] });
      }
      map.get(m.provider)!.models.push(m);
    }
    // Sort providers by preferred order, then alphabetically
    return [...map.entries()].sort(([a], [b]) => {
      const ai = PROVIDER_ORDER.indexOf(a);
      const bi = PROVIDER_ORDER.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [filtered]);

  // Timeline year markers
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const startMs = FRONTIER_FIRST_DATE.getTime();
  const endMs = mounted ? Date.now() : new Date("2026-04-05").getTime();
  const totalMs = endMs - startMs;

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

      {/* Controls */}
      <div className="flex flex-col gap-3">
        {/* Type toggle + view toggle + search */}
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

          {/* View mode toggle */}
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

        {/* Quick filter tags */}
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
        /* ── Grouped by company ── */
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
        /* ── Flat grid ── */
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

      {/* Timeline */}
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

        {/* Slider track */}
        <div className="relative pt-2 pb-5">
          {/* Year tick marks */}
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

          {/* Model dots on track */}
          <div className="relative h-2 bg-white/5 rounded-full mb-2">
            <div
              className="absolute h-full bg-accent/30 rounded-full"
              style={{ width: `${timelineValue}%` }}
            />
            {AI_MODELS.map((m) => {
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
          <span className="ml-auto">Drag slider to explore model evolution →</span>
        </div>
      </div>

      {/* Benchmark glossary */}
      <div className="glass-card p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Benchmark Guide</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div><span className="text-foreground font-medium">MMLU</span> — Massive Multitask Language Understanding. 57 academic subjects. General knowledge proxy.</div>
          <div><span className="text-foreground font-medium">GPQA Diamond</span> — Graduate-level expert questions in biology, chemistry, physics. Hard reasoning test.</div>
          <div><span className="text-foreground font-medium">SWE-Bench</span> — Real GitHub issues. Model must write code that passes tests. Best coding proxy.</div>
        </div>
      </div>
    </div>
  );
}
