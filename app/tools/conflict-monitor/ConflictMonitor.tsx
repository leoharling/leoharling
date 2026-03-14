"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { conflicts, getDaysSince } from "@/lib/conflicts";
import type { TerritorySnapshot } from "@/lib/conflicts";
import FadeIn from "@/components/ui/FadeIn";
import EscalationBadge from "@/components/tools/EscalationBadge";
import ConflictTimeline from "@/components/tools/ConflictTimeline";
import ActorsPanel from "@/components/tools/ActorsPanel";
import DiplomaticTracker from "@/components/tools/DiplomaticTracker";
import HumanitarianDashboard from "@/components/tools/HumanitarianDashboard";
import type { LiveEvent } from "@/components/tools/ConflictMap";
import {
  ExternalLink,
  AlertTriangle,
  Activity,
  Globe,
  RefreshCw,
  Users,
  Handshake,
  Crosshair,
  Heart,
  Radio,
} from "lucide-react";

const ConflictMap = dynamic(
  () => import("@/components/tools/ConflictMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] items-center justify-center rounded-xl bg-white/5">
        <p className="animate-pulse text-sm text-muted-foreground">
          Loading map...
        </p>
      </div>
    ),
  }
);

interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  conflict: string;
  snippet: string;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  strike: "#ef4444",
  battle: "#f97316",
  humanitarian: "#facc15",
  political: "#60a5fa",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  strike: "Strike",
  battle: "Battle",
  humanitarian: "Humanitarian",
  political: "Political",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// No client-side polling — CDN caching handles freshness (s-maxage on API routes)

type InfoTab = "situations" | "actors" | "diplomacy";
type SidebarTab = "kpis" | "humanitarian";

export default function ConflictMonitor() {
  const [selectedId, setSelectedId] = useState("ukraine");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<InfoTab>("situations");
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("kpis");
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Timeline slider state
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [territorySnapshots, setTerritorySnapshots] = useState<TerritorySnapshot[]>([]);

  // Live data from external APIs
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [liveGeoJSON, setLiveGeoJSON] = useState<object | null>(null);
  const [unhcrStats, setUnhcrStats] = useState<{ refugees: number; asylum_seekers: number; idps: number; year: number } | null>(null);
  const [liveDataLoading, setLiveDataLoading] = useState(false);
  const [liveDataFetched, setLiveDataFetched] = useState<string | null>(null);

  const selected = useMemo(
    () => conflicts.find((c) => c.id === selectedId)!,
    [selectedId]
  );

  // Reset tabs and timeline on conflict change
  useEffect(() => {
    setActiveTab("situations");
    setSidebarTab("kpis");
    setFocusLocation(null);
    setSelectedTime(null);
  }, [selectedId]);

  // Fetch historical territory snapshots
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/conflict-territories?id=${selectedId}`);
        if (res.ok) {
          const data = await res.json();
          setTerritorySnapshots(data.snapshots || []);
        }
      } catch {
        setTerritorySnapshots([]);
      }
    })();
  }, [selectedId]);

  // Fetch live conflict data (ACLED events, UNHCR, ReliefWeb, DeepState)
  const fetchLiveData = useCallback(async (conflictId: string) => {
    setLiveDataLoading(true);
    try {
      const res = await fetch(`/api/conflict-data?id=${conflictId}`);
      if (!res.ok) throw new Error("Failed to fetch live data");
      const data = await res.json();
      setLiveEvents(data.liveEvents || []);
      setLiveGeoJSON(data.deepStateGeoJSON || null);
      setUnhcrStats(data.unhcr || null);
      setLiveDataFetched(conflictId);
    } catch {
      // keep existing data
    } finally {
      setLiveDataLoading(false);
    }
  }, []);

  // Fetch live data when conflict changes
  useEffect(() => {
    fetchLiveData(selectedId);
  }, [selectedId, fetchLiveData]);

  const fetchNews = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const r = await fetch("/api/conflict-news");
      const data = await r.json();
      setNews(data.articles || []);
      setLastUpdated(new Date());
    } catch {
      // keep existing data
    } finally {
      setNewsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filteredNews = useMemo(
    () => news.filter((n) => n.conflict === selectedId).slice(0, 10),
    [news, selectedId]
  );

  // Filter UCDP events by timeline slider position
  const filteredEvents = useMemo(() => {
    if (!liveEvents.length) return [];
    if (selectedTime == null) return liveEvents;
    return liveEvents.filter((ev) => {
      if (!ev.dateISO) return true;
      return new Date(ev.dateISO).getTime() <= selectedTime;
    });
  }, [liveEvents, selectedTime]);

  const days = getDaysSince(selected.startDate);

  const globalStats = [
    { label: "Active Conflicts", value: String(conflicts.length) },
    { label: "Countries Affected", value: "20+" },
    { label: "People Displaced", value: "~35M" },
    { label: "Status", value: "Live" },
  ];

  // Build available tabs
  const infoTabs: { id: InfoTab; label: string; icon: typeof Crosshair; available: boolean }[] = [
    { id: "situations", label: `Situations${filteredEvents.length > 0 ? ` (${filteredEvents.length})` : ""}`, icon: Crosshair, available: liveEvents.length > 0 },
    { id: "actors", label: "Key Actors", icon: Users, available: !!(selected.actors?.length) },
    { id: "diplomacy", label: "Diplomacy", icon: Handshake, available: !!selected.diplomatic },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-24">
      {/* Header */}
      <FadeIn>
        <div className="mb-2 flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-red-400">
            Live
          </span>
          {lastUpdated && (
            <span className="text-[11px] text-muted-foreground">
              Updated {timeAgo(lastUpdated.toISOString())}
            </span>
          )}
          <button
            onClick={() => { fetchNews(true); fetchLiveData(selectedId); }}
            disabled={refreshing}
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Global Conflict Monitor
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Real-time tracking of active armed conflicts worldwide. Aggregated
          news, key metrics, and geographic context.
        </p>
      </FadeIn>

      {/* Global Stats */}
      <FadeIn delay={0.1}>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {globalStats.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <p className="text-2xl font-bold font-mono">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Conflict Selector */}
      <FadeIn delay={0.15}>
        <div className="mt-8 flex flex-wrap gap-2">
          {conflicts.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedId === c.id
                  ? "bg-white/10 text-foreground"
                  : "bg-white/[0.03] text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.shortName}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Selected Conflict Header + Escalation */}
      <FadeIn delay={0.2}>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold">{selected.name}</h2>
          <span
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: selected.color + "15", color: selected.color }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: selected.color }} />
            {selected.statusLabel}
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            Day {new Intl.NumberFormat("en-US").format(days)}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {selected.parties[0]} vs {selected.parties[1]} &mdash; {selected.description}
        </p>

        {/* Escalation Badge */}
        {selected.escalation && <EscalationBadge data={selected.escalation} />}
      </FadeIn>

      {/* Timeline */}
      {selected.timeline && (
        <FadeIn delay={0.22}>
          <div className="mt-6">
            <ConflictTimeline
              phases={selected.timeline.phases}
              milestones={selected.timeline.milestones}
              startDate={selected.startDate}
              selectedTime={selectedTime}
              onTimeChange={setSelectedTime}
            />
          </div>
        </FadeIn>
      )}

      {/* Map + Sidebar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Map */}
        <div className="lg:col-span-2">
          <FadeIn delay={0.25}>
            <div className="conflict-map-wrapper overflow-hidden rounded-xl border border-white/5">
              <ConflictMap
                conflict={selected}
                allConflicts={conflicts}
                onSelectConflict={setSelectedId}
                focusLocation={focusLocation}
                onFocused={() => setFocusLocation(null)}
                liveEvents={liveDataFetched === selectedId ? liveEvents : undefined}
                liveGeoJSON={selectedId === "ukraine" ? liveGeoJSON : undefined}
                selectedTime={selectedTime}
                territorySnapshots={territorySnapshots}
              />
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm border border-white/10" style={{ backgroundColor: selected.color, opacity: 0.25 }} />
                Controlled territory
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Capital
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                City
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Hotspot
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Event
              </span>
            </div>
          </FadeIn>
        </div>

        {/* Sidebar — tabbed KPIs / Humanitarian */}
        <div>
          <FadeIn delay={0.3}>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              {/* Sidebar tabs */}
              {selected.humanitarian && (
                <div className="mb-4 flex gap-1 rounded-lg bg-white/[0.03] p-1">
                  {([
                    { id: "kpis" as SidebarTab, label: "Key Figures", icon: Activity },
                    { id: "humanitarian" as SidebarTab, label: "Humanitarian", icon: Heart },
                  ]).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSidebarTab(t.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                        sidebarTab === t.id
                          ? "bg-white/10 text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <t.icon size={11} />
                      {t.label}
                    </button>
                  ))}
                </div>
              )}

              {sidebarTab === "kpis" ? (
                <>
                  {!selected.humanitarian && (
                    <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Activity size={14} />
                      Key Figures
                    </h3>
                  )}
                  <div className="space-y-5">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Duration</p>
                      <p className="text-2xl font-bold font-mono">
                        {new Intl.NumberFormat("en-US").format(days)}{" "}
                        <span className="text-sm font-normal text-muted-foreground">days</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Since {new Date(selected.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    {selected.kpis.map((kpi) => (
                      <div key={kpi.label}>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
                        <p className="text-2xl font-bold font-mono">{kpi.value}</p>
                        {kpi.subtext && <p className="text-[11px] text-muted-foreground">{kpi.subtext}</p>}
                      </div>
                    ))}

                  </div>
                </>
              ) : (
                selected.humanitarian && <HumanitarianDashboard data={selected.humanitarian} unhcr={unhcrStats} />
              )}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Info Tabs — Situations / Actors / Diplomacy */}
      {infoTabs.some((t) => t.available) && (
        <FadeIn delay={0.32}>
          <div className="mt-8">
            {/* Tab bar */}
            <div className="mb-4 flex gap-1 rounded-lg bg-white/[0.03] p-1 w-fit">
              {infoTabs.filter((t) => t.available).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium transition-colors ${
                    activeTab === t.id
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <t.icon size={13} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "situations" && (
              <div>
                {filteredEvents.length > 0 && (
                  <>
                    <div className="mb-3 flex items-center gap-2">
                      <Radio size={12} className="text-green-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-green-400">
                        Significant Events (UCDP)
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {filteredEvents.length} events{selectedTime != null ? " (filtered)" : ""}
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 max-h-[500px] overflow-y-auto">
                      {filteredEvents.map((ev, i) => {
                        const isActive = focusLocation?.lat === ev.lat && focusLocation?.lng === ev.lng;
                        const isFeatured = ev.tier === "featured";
                        return (
                          <button
                            key={`ev-${i}`}
                            onClick={() => {
                              setFocusLocation({ lat: ev.lat, lng: ev.lng });
                            }}
                            className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-all hover:bg-white/[0.05] ${
                              isActive ? "border-white/20 bg-white/[0.04]" : "border-white/5 bg-white/[0.02]"
                            }`}
                          >
                            <span
                              className={`mt-1 shrink-0 rounded-full ${isFeatured ? "h-2.5 w-2.5" : "h-2 w-2"}`}
                              style={{
                                backgroundColor: EVENT_TYPE_COLORS[ev.type] || "#ef4444",
                                boxShadow: isFeatured ? `0 0 8px ${EVENT_TYPE_COLORS[ev.type] || "#ef4444"}` : undefined,
                              }}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`leading-tight ${isFeatured ? "text-xs font-semibold" : "text-[11px] font-medium"}`}>{ev.title}</p>
                                <span
                                  className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
                                  style={{
                                    backgroundColor: (EVENT_TYPE_COLORS[ev.type] || "#ef4444") + "18",
                                    color: EVENT_TYPE_COLORS[ev.type] || "#ef4444",
                                  }}
                                >
                                  {EVENT_TYPE_LABELS[ev.type] || ev.type}
                                </span>
                                {ev.date && (
                                  <span className="shrink-0 text-[9px] text-muted-foreground">{ev.date}</span>
                                )}
                              </div>
                              <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug line-clamp-2">{ev.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {liveDataLoading && liveEvents.length === 0 && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <RefreshCw size={12} className="animate-spin" />
                    Loading events...
                  </div>
                )}
              </div>
            )}

            {activeTab === "actors" && selected.actors && (
              <ActorsPanel actors={selected.actors} />
            )}

            {activeTab === "diplomacy" && selected.diplomatic && (
              <DiplomaticTracker data={selected.diplomatic} />
            )}
          </div>
        </FadeIn>
      )}

      {/* News Feed */}
      <FadeIn delay={0.35}>
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Globe size={18} />
              Latest Developments
            </h3>
            {filteredNews.length > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {filteredNews.length} articles
              </span>
            )}
          </div>

          {newsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center text-sm text-muted-foreground">
              No recent articles found for this conflict. News is aggregated
              from BBC, Al Jazeera, NY Times, and The Guardian.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNews.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-medium">
                        {item.source}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {timeAgo(item.pubDate)}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-snug transition-colors group-hover:text-accent">
                      {item.title}
                    </p>
                    {item.snippet && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {item.snippet}
                      </p>
                    )}
                  </div>
                  <ExternalLink size={14} className="mt-1 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ))}
            </div>
          )}

        </div>
      </FadeIn>

      {/* Disclaimer */}
      <FadeIn delay={0.4}>
        <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
          <p className="text-[11px] text-muted-foreground">
            <AlertTriangle size={11} className="mr-1 inline-block" />
            Conflict events from UCDP (Uppsala Conflict Data Program). Displacement data from UNHCR (updated annually). Ukraine front lines from DeepStateMap (updated daily).
            News via BBC, Al Jazeera, NY Times, The Guardian. Casualty figures are estimates.
            Front lines and controlled areas are approximate.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
