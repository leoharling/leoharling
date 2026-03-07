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

type AggKey = "provider" | "country" | "orbit" | "vehicle" | "status";

const AGG_TABS: { key: AggKey; label: string }[] = [
  { key: "provider", label: "By Provider" },
  { key: "country", label: "By Country" },
  { key: "orbit", label: "By Orbit" },
  { key: "vehicle", label: "By Vehicle" },
  { key: "status", label: "By Outcome" },
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
  }
}

function aggregate(launches: PastLaunch[], key: AggKey) {
  const counts: Record<string, number> = {};
  for (const l of launches) {
    const val = getLaunchAggValue(l, key);
    counts[val] = (counts[val] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
}

function launchUrl(slug: string) {
  return `https://www.spacelaunchschedule.com/launch/${slug}/`;
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 2005 }, (_, i) => currentYear - i);

export default function PastLaunchesTab() {
  const [launches, setLaunches] = useState<PastLaunch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(currentYear);
  const [aggTab, setAggTab] = useState<AggKey>("provider");
  const [activeFilter, setActiveFilter] = useState<{ key: AggKey; value: string } | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  const fetchYear = useCallback((y: number) => {
    setLoading(true);
    setError(null);
    setActiveFilter(null);
    setShowAll(false);
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

  const aggData = useMemo(() => aggregate(launches, aggTab), [launches, aggTab]);
  const maxCount = aggData.length ? aggData[0][1] : 1;

  const filteredLaunches = useMemo(() => {
    if (!activeFilter) return launches;
    return launches.filter(
      (l) => getLaunchAggValue(l, activeFilter.key) === activeFilter.value
    );
  }, [launches, activeFilter]);

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
    <div className="space-y-8">
      {/* Year selector */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setYearOpen(!yearOpen)}
            className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium transition-all hover:bg-white/10"
          >
            {year}
            <ChevronDown size={14} className={`text-muted-foreground transition-transform ${yearOpen ? "rotate-180" : ""}`} />
          </button>
          {yearOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 max-h-64 w-28 overflow-y-auto rounded-lg border border-white/10 bg-card shadow-xl">
              {YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => {
                    setYear(y);
                    setYearOpen(false);
                  }}
                  className={`block w-full px-4 py-2 text-left text-sm transition-all hover:bg-white/10 ${
                    y === year ? "bg-accent/20 text-accent" : "text-muted-foreground"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Showing launches from <span className="text-foreground font-medium">{year}</span>
          {launches.length > 0 && (
            <span className="text-muted-foreground"> ({launches.length} most recent{launches.length === 100 ? "+" : ""})</span>
          )}
        </p>
      </div>

      {/* Summary stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Total Launches", value: stats.total },
            { label: "Successful", value: stats.success },
            { label: "Failed", value: stats.fail },
            { label: "Providers", value: stats.providers },
            { label: "Countries", value: stats.countries },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{s.value}</p>
              {s.label === "Successful" && stats.total > 0 && (
                <p className="text-xs text-emerald-400">
                  {((stats.success / stats.total) * 100).toFixed(1)}% rate
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Aggregation panel */}
      <div className="glass-card p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Launch Activity Breakdown
        </h3>
        <div className="mb-6 flex flex-wrap gap-2">
          {AGG_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setAggTab(t.key);
                if (activeFilter && activeFilter.key !== t.key) {
                  setActiveFilter(null);
                }
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                aggTab === t.key
                  ? "bg-accent text-white"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {aggData.map(([label, count]) => {
            const isActive = activeFilter?.key === aggTab && activeFilter?.value === label;
            return (
              <button
                key={label}
                onClick={() => handleBarClick(aggTab, label)}
                className={`group flex w-full items-center gap-3 rounded-lg px-1 py-0.5 text-left transition-all ${
                  isActive
                    ? "bg-accent/10"
                    : activeFilter && activeFilter.key === aggTab
                      ? "opacity-40 hover:opacity-70"
                      : "hover:bg-white/[0.03]"
                }`}
              >
                <span className="w-32 shrink-0 truncate text-right text-sm text-muted-foreground sm:w-44">
                  {label}
                </span>
                <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-white/5">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-md transition-all duration-500 ${
                      isActive ? "bg-accent/60" : "bg-accent/40"
                    }`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                  <span className="relative z-10 flex h-full items-center px-2 text-xs font-medium tabular-nums">
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
      </div>

      {/* Active filter indicator */}
      {activeFilter && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtered by:</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            {activeFilter.value}
            <button
              onClick={() => setActiveFilter(null)}
              className="rounded-full p-0.5 hover:bg-accent/20"
            >
              <X size={10} />
            </button>
          </span>
          <span className="text-xs text-muted-foreground">
            ({filteredLaunches.length} launch{filteredLaunches.length !== 1 ? "es" : ""})
          </span>
        </div>
      )}

      {/* Past launches list */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {activeFilter ? `Filtered Launches` : `Recent Launches`}
        </h3>
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
