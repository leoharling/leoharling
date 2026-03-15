"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Loader2,
  Star,
  CheckCircle2,
  XCircle,
  Rocket,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
} from "lucide-react";

interface PastLaunch {
  id: string;
  slug: string;
  name: string;
  net: string;
  status: { id: number; name: string; abbrev: string };
  launch_service_provider: { name: string; type: { name: string } };
  rocket: { configuration: { name: string; full_name: string } };
  mission?: {
    name?: string;
    description?: string;
    type?: string;
    orbit?: { name?: string; abbrev?: string } | null;
  } | null;
  pad: {
    name: string;
    location: {
      name: string;
      country?: { name: string; alpha_2_code: string } | null;
    };
  };
  image?: { image_url?: string } | null;
}

const NOTABLE_PATTERNS: {
  pattern: RegExp;
  label: string;
  color: string;
}[] = [
  { pattern: /Webb|JWST/, label: "JWST", color: "text-amber-400" },
  { pattern: /Starship|IFT/i, label: "Starship", color: "text-sky-400" },
  { pattern: /Artemis/i, label: "Artemis", color: "text-purple-400" },
  { pattern: /Chandrayaan/i, label: "Moon Landing", color: "text-emerald-400" },
  { pattern: /Europa Clipper/i, label: "Flagship", color: "text-orange-400" },
  { pattern: /\bDART\b/, label: "Planetary Defence", color: "text-red-400" },
  { pattern: /Perseverance|Mars 2020/i, label: "Mars Rover", color: "text-orange-400" },
  { pattern: /Parker Solar/i, label: "Solar Mission", color: "text-yellow-400" },
  { pattern: /Crew Dragon.*Demo|DM-2/i, label: "Historic Crew", color: "text-sky-400" },
  { pattern: /New Glenn/i, label: "First Flight", color: "text-teal-400" },
  { pattern: /Vulcan.*Cert|Vulcan.*Flight 1/i, label: "First Flight", color: "text-teal-400" },
  { pattern: /Ariane 6.*Flight|VA262/i, label: "First Flight", color: "text-teal-400" },
];

function getNotable(name: string) {
  for (const n of NOTABLE_PATTERNS) {
    if (n.pattern.test(name)) return n;
  }
  return null;
}

function getCountry(l: PastLaunch): string {
  return l.pad.location.country?.name || "Unknown";
}

type AggKey = "provider" | "country" | "orbit" | "vehicle" | "status" | "year";

const AGG_TABS: { key: AggKey; label: string }[] = [
  { key: "provider", label: "By Provider" },
  { key: "country", label: "By Country" },
  { key: "orbit", label: "By Orbit" },
  { key: "vehicle", label: "By Vehicle" },
  { key: "status", label: "By Outcome" },
  { key: "year", label: "By Year" },
];

function getLaunchAggValue(l: PastLaunch, key: AggKey): string {
  switch (key) {
    case "provider":
      return l.launch_service_provider.name;
    case "country":
      return getCountry(l);
    case "orbit":
      return l.mission?.orbit?.name || "Unknown";
    case "vehicle":
      return l.rocket.configuration.name;
    case "status":
      return l.status.id === 3
        ? "Success"
        : l.status.id === 4
          ? "Failure"
          : l.status.abbrev || l.status.name;
    case "year":
      return new Date(l.net).getFullYear().toString();
  }
}

function aggregate(launches: PastLaunch[], key: AggKey) {
  const counts: Record<string, number> = {};
  for (const l of launches) {
    const val = getLaunchAggValue(l, key);
    counts[val] = (counts[val] || 0) + 1;
  }
  const entries = Object.entries(counts);
  if (key === "year") {
    entries.sort((a, b) => b[0].localeCompare(a[0]));
  } else {
    entries.sort((a, b) => b[1] - a[1]);
  }
  return entries.slice(0, key === "year" ? 100 : 20);
}

function launchUrl(slug: string) {
  return `https://www.spacelaunchschedule.com/launch/${slug}/`;
}

/* ── Year Bar Chart ── */
function YearChart({
  launches,
  activeYear,
  onClickYear,
}: {
  launches: PastLaunch[];
  activeYear: string | null;
  onClickYear: (year: string) => void;
}) {
  const yearData = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of launches) {
      const yr = new Date(l.net).getFullYear().toString();
      map.set(yr, (map.get(yr) || 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([year, count]) => ({ year, count }));
  }, [launches]);

  if (yearData.length === 0) {
    return <p className="text-sm text-muted-foreground">No data available.</p>;
  }

  const maxCount = Math.max(...yearData.map((d) => d.count));
  const niceMax = Math.ceil(maxCount / 10) * 10 || 10;

  const W = 800;
  const H = 220;
  const PAD = { top: 12, right: 12, bottom: 32, left: 36 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;
  const baseline = PAD.top + ch;

  const slotW = cw / yearData.length;
  const barW = Math.max(Math.min(slotW * 0.65, 28), 2);
  const getX = (i: number) => PAD.left + slotW * i + slotW / 2;
  const getY = (val: number) => PAD.top + ch - (val / niceMax) * ch;

  const gridCount = 4;
  const yTicks = Array.from({ length: gridCount + 1 }, (_, i) => {
    const val = Math.round((niceMax / gridCount) * i);
    return { val, y: getY(val) };
  });

  const labelEvery = Math.max(1, Math.ceil(yearData.length / 20));

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[400px]" preserveAspectRatio="xMidYMid meet">
        {/* Grid */}
        {yTicks.map(({ val, y }) => (
          <g key={val}>
            {val > 0 && <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="white" strokeOpacity={0.05} />}
            <text x={PAD.left - 6} y={y + 3} textAnchor="end" fill="white" fillOpacity={0.25} fontSize={9}>
              {val}
            </text>
          </g>
        ))}

        {/* Bars */}
        {yearData.map((d, i) => {
          const x = getX(i);
          const yTop = getY(d.count);
          const barH = baseline - yTop;
          const isActive = activeYear === d.year;

          return (
            <g key={d.year} onClick={() => onClickYear(d.year)} className="cursor-pointer">
              <rect x={x - slotW / 2} y={PAD.top} width={slotW} height={ch} fill="transparent" />

              <rect
                x={x - barW / 2}
                y={yTop}
                width={barW}
                height={barH}
                rx={Math.min(barW / 2, 2)}
                fill="white"
                fillOpacity={isActive ? 0.7 : 0.15}
              />

              {isActive && (
                <text x={x} y={yTop - 5} textAnchor="middle" fontSize={10} fontWeight={600} fill="white" fillOpacity={0.9}>
                  {d.count}
                </text>
              )}

              {i % labelEvery === 0 && (
                <text x={x} y={H - 6} textAnchor="middle" fontSize={9} fill="white" fillOpacity={isActive ? 0.8 : 0.25} fontWeight={isActive ? 600 : 400}>
                  {d.year}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1956 }, (_, i) => currentYear - i);

export default function PastLaunchesTab({
  vehicleFilter,
  onClearVehicleFilter,
  yearHint,
}: {
  vehicleFilter?: string | null;
  onClearVehicleFilter?: () => void;
  yearHint?: number | "all";
}) {
  const [launches, setLaunches] = useState<PastLaunch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<number | "all">(yearHint || currentYear);
  const [aggTab, setAggTab] = useState<AggKey | null>(null);
  const [activeFilter, setActiveFilter] = useState<{ key: AggKey; value: string } | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  useEffect(() => {
    if (yearHint !== undefined) {
      setYear(yearHint);
    }
  }, [yearHint]);

  const fetchYear = useCallback((y: number | "all") => {
    setLoading(true);
    setError(null);
    setActiveFilter(null);
    setShowAll(false);
    if (y !== "all") setAggTab((prev) => prev === "year" ? null : prev);
    fetch(`/api/launches?type=past&year=${y}`)
      .then((res) => {
        if (res.status === 429) throw new Error("rate-limit");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setLaunches(data.results || []);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setLaunches([]);
        setError(
          err.message === "rate-limit"
            ? "Data is being synced. Please try again in a few minutes."
            : "Failed to load launch data. Please try again later."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchYear(year);
  }, [year, fetchYear]);

  const stats = useMemo(() => {
    if (!launches.length) return null;
    const success = launches.filter((l) => l.status.id === 3).length;
    const fail = launches.filter((l) => l.status.id === 4).length;
    const providers = new Set(launches.map((l) => l.launch_service_provider.name)).size;
    const countries = new Set(launches.map((l) => getCountry(l))).size;
    return { total: launches.length, success, fail, providers, countries };
  }, [launches]);

  const aggData = useMemo(() => aggTab ? aggregate(launches, aggTab) : [], [launches, aggTab]);
  const maxCount = aggData.length ? aggData[0][1] : 1;

  const filteredLaunches = useMemo(() => {
    let result = launches;
    if (vehicleFilter) {
      result = result.filter((l) => {
        const configName = l.rocket.configuration.name.toLowerCase().replace(/-/g, " ");
        const filterName = vehicleFilter.toLowerCase().replace(/-/g, " ");
        return configName.includes(filterName);
      });
    }
    if (activeFilter) {
      result = result.filter(
        (l) => getLaunchAggValue(l, activeFilter.key) === activeFilter.value
      );
    }
    return result;
  }, [launches, activeFilter, vehicleFilter]);

  const displayedLaunches = showAll ? filteredLaunches : filteredLaunches.slice(0, 30);

  function handleBarClick(key: AggKey, value: string) {
    if (activeFilter?.key === key && activeFilter?.value === value) {
      setActiveFilter(null);
    } else {
      setActiveFilter({ key, value });
      setShowAll(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-accent" />
        <span className="ml-3 text-muted-foreground">Loading {year} launches...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card mx-auto max-w-lg px-6 py-12 text-center">
        <p className="text-sm text-amber-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header: year nav + inline stats */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {/* All Time toggle */}
        <button
          onClick={() => setYear(year === "all" ? currentYear : "all")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            year === "all"
              ? "bg-accent text-white"
              : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
          }`}
        >
          All Time
        </button>

        <div className="h-5 w-px bg-white/10" />

        {/* Year stepper */}
        <div className="flex items-center">
          <button
            onClick={() => {
              const current = typeof year === "number" ? year : currentYear;
              if (current > 1957) setYear(current - 1);
            }}
            className="rounded-l-lg bg-white/5 p-2 text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="relative">
            <button
              onClick={() => setYearOpen(!yearOpen)}
              className={`flex items-center gap-1.5 bg-white/5 px-4 py-2 text-sm font-semibold tabular-nums transition-all hover:bg-white/10 ${
                year === "all" ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              {typeof year === "number" ? year : currentYear}
              <ChevronDown size={12} className={`text-muted-foreground transition-transform ${yearOpen ? "rotate-180" : ""}`} />
            </button>
            {yearOpen && (
              <div className="absolute left-1/2 top-full z-20 mt-1 max-h-64 w-24 -translate-x-1/2 overflow-y-auto rounded-lg border border-white/10 bg-card shadow-xl">
                {YEARS.map((y) => (
                  <button
                    key={y}
                    onClick={() => {
                      setYear(y);
                      setYearOpen(false);
                    }}
                    className={`block w-full px-4 py-1.5 text-center text-sm tabular-nums transition-all hover:bg-white/10 ${
                      y === year ? "bg-accent/20 text-accent" : "text-muted-foreground"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              const current = typeof year === "number" ? year : currentYear;
              if (current < currentYear) setYear(current + 1);
            }}
            className="rounded-r-lg bg-white/5 p-2 text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Inline stats */}
        {stats && (
          <div className="ml-auto flex items-center gap-3 text-xs tabular-nums text-muted-foreground">
            <span><strong className="text-foreground">{stats.total}</strong> launches</span>
            <span className="text-white/10">|</span>
            <span><strong className="text-emerald-400">{stats.success}</strong> ok</span>
            {stats.fail > 0 && (
              <>
                <span className="text-white/10">|</span>
                <span><strong className="text-rose-400">{stats.fail}</strong> failed</span>
              </>
            )}
            {stats.total > 0 && (
              <>
                <span className="text-white/10">|</span>
                <span>{((stats.success / stats.total) * 100).toFixed(1)}%</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Active filters */}
      {(vehicleFilter || activeFilter) && (
        <div className="flex flex-wrap items-center gap-2">
          {vehicleFilter && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Rocket size={10} />
              {vehicleFilter}
              <button onClick={onClearVehicleFilter} className="ml-0.5 rounded-full p-0.5 hover:bg-white/10 hover:text-foreground">
                <X size={10} />
              </button>
            </span>
          )}
          {activeFilter && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              {activeFilter.value}
              <button onClick={() => setActiveFilter(null)} className="ml-0.5 rounded-full p-0.5 hover:bg-accent/20">
                <X size={10} />
              </button>
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {filteredLaunches.length} result{filteredLaunches.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Breakdown */}
      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          {AGG_TABS.filter((t) => t.key !== "year" || year === "all").map((t) => (
            <button
              key={t.key}
              onClick={() => {
                if (aggTab === t.key) {
                  setAggTab(null);
                  setActiveFilter(null);
                } else {
                  setAggTab(t.key);
                  if (activeFilter && activeFilter.key !== t.key) {
                    setActiveFilter(null);
                  }
                }
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                aggTab === t.key
                  ? "bg-white/15 text-foreground"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {aggTab === "year" ? (
          <YearChart
            launches={launches}
            activeYear={activeFilter?.key === "year" ? activeFilter.value : null}
            onClickYear={(yr) => handleBarClick("year", yr)}
          />
        ) : aggTab ? (
          <div className="space-y-1">
            {aggData.map(([label, count]) => {
              const isActive = activeFilter?.key === aggTab && activeFilter?.value === label;
              return (
                <button
                  key={label}
                  onClick={() => handleBarClick(aggTab, label)}
                  className={`flex w-full items-center gap-3 rounded-lg px-1 py-0.5 text-left transition-all ${
                    isActive
                      ? "bg-white/[0.04]"
                      : activeFilter && activeFilter.key === aggTab
                        ? "opacity-30 hover:opacity-60"
                        : "hover:bg-white/[0.02]"
                  }`}
                >
                  <span className="w-32 shrink-0 truncate text-right text-xs text-muted-foreground sm:w-40">
                    {label}
                  </span>
                  <div className="relative h-5 flex-1 overflow-hidden rounded bg-white/[0.03]">
                    <div
                      className={`absolute inset-y-0 left-0 rounded transition-all duration-500 ${
                        isActive ? "bg-white/25" : "bg-white/10"
                      }`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                    <span className="relative z-10 flex h-full items-center px-2 text-[11px] tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
            {aggData.length === 0 && (
              <p className="text-sm text-muted-foreground">No data available.</p>
            )}
          </div>
        ) : null}
      </div>

      {/* Launches */}
      <div>
        <div className="space-y-2">
          {displayedLaunches.map((l) => {
            const notable = getNotable(l.name);
            const isSuccess = l.status.id === 3;
            const isFail = l.status.id === 4;
            return (
              <a
                key={l.id}
                href={launchUrl(l.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className={`glass-card flex items-center gap-4 px-4 py-3 transition-all hover:bg-white/[0.04] ${
                  notable ? "border-amber-500/20" : ""
                }`}
              >
                {/* Status indicator */}
                <div className="shrink-0">
                  {isSuccess ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : isFail ? (
                    <XCircle size={16} className="text-red-400" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-muted" />
                  )}
                </div>

                {/* Date */}
                <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                  {new Date(l.net).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "2-digit",
                  })}
                </span>

                {/* Name + notable badge */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{l.name}</span>
                    {notable && (
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${notable.color}`}
                      >
                        <Star size={10} />
                        {notable.label}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{l.launch_service_provider.name}</span>
                    <span className="text-white/20">|</span>
                    <span>{l.rocket.configuration.name}</span>
                    {l.mission?.orbit?.abbrev && (
                      <>
                        <span className="text-white/20">|</span>
                        <span>{l.mission.orbit.abbrev}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Provider badge + link icon */}
                <span className="hidden shrink-0 rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-medium text-accent sm:inline-block">
                  {l.launch_service_provider.name}
                </span>
                <ExternalLink size={12} className="shrink-0 text-muted-foreground/50" />
              </a>
            );
          })}
        </div>

        {filteredLaunches.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No launches found{activeFilter ? ` for "${activeFilter.value}"` : ""}.
          </div>
        )}

        {/* Show more/less */}
        {filteredLaunches.length > 30 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mx-auto mt-4 flex items-center gap-1 rounded-full bg-white/5 px-4 py-2 text-sm text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground"
          >
            {showAll ? (
              <>
                Show less <ChevronUp size={14} />
              </>
            ) : (
              <>
                Show all {filteredLaunches.length} launches <ChevronDown size={14} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
