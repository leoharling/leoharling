"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Eye,
  EyeOff,
  Loader2,
  X,
  Satellite,
  ChevronDown,
} from "lucide-react";
import type {
  SatelliteGroup,
  NotableSatelliteData,
  SatelliteInfo,
} from "@/components/tools/SatelliteScene";

const SatelliteScene = dynamic(
  () => import("@/components/tools/SatelliteScene"),
  { ssr: false }
);

const CATEGORIES: {
  id: string;
  label: string;
  desc: string;
  color: string;
  realCount: string;
}[] = [
  { id: "comms", label: "Communications", desc: "Internet, phone & satellite TV", color: "#60a5fa", realCount: "~7,000" },
  { id: "nav", label: "Navigation", desc: "GPS, GLONASS, Galileo & BeiDou", color: "#fbbf24", realCount: "~130" },
  { id: "earth", label: "Earth & Weather", desc: "Climate monitoring & mapping", color: "#22d3ee", realCount: "~200" },
  { id: "geo", label: "Geostationary", desc: "Fixed orbit at 35,786 km", color: "#f472b6", realCount: "~560" },
  { id: "debris", label: "Tracked Debris", desc: "Collision fragments & spent rockets", color: "#ef4444", realCount: "~30,000" },
];

interface APIResponse {
  groups: SatelliteGroup[];
  notable: NotableSatelliteData[];
}

export default function OrbitBand() {
  const [data, setData] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visibleCats, setVisibleCats] = useState<Record<string, boolean>>({
    comms: true,
    nav: true,
    earth: true,
    geo: true,
    debris: true,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<SatelliteInfo | null>(null);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [notableExpanded, setNotableExpanded] = useState(false);
  const [notableVisible, setNotableVisible] = useState(true);
  const [highlightedGroup, setHighlightedGroup] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/satellites")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((d) => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const toggleCategory = (cat: string) => {
    setVisibleCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const visibleConstellations = useMemo(() => {
    if (!data) return {};
    const map: Record<string, boolean> = {};
    for (const g of data.groups) {
      map[g.name] = visibleCats[g.category] ?? true;
    }
    return map;
  }, [data, visibleCats]);

  const trackedCount = useMemo(() => {
    if (!data) return 0;
    return data.groups.reduce((sum, g) => sum + g.tles.length, 0) + (data.notable?.length ?? 0);
  }, [data]);

  const handleSelect = useCallback((info: SatelliteInfo | null) => {
    setSelectedId(info?.id ?? null);
    setSelectedInfo(info);
  }, []);

  const handleLegendClick = useCallback(
    (id: string) => {
      if (selectedId === id) {
        setSelectedId(null);
        setSelectedInfo(null);
      } else {
        setSelectedId(id);
      }
    },
    [selectedId]
  );

  return (
    <div className="relative h-full w-full bg-[#060810]">
      {/* 3D Scene */}
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 size={24} className="animate-spin text-accent" />
          <span className="ml-3 text-sm text-muted-foreground">
            Loading satellite data...
          </span>
        </div>
      ) : error || !data ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Failed to load satellite data. Please try again later.
        </div>
      ) : (
        <SatelliteScene
          groups={data.groups}
          notable={data.notable}
          visibleConstellations={visibleConstellations}
          selectedId={selectedId}
          onSelect={handleSelect}
          timeSpeed={timeSpeed}
          highlightedGroup={highlightedGroup}
          notableVisible={notableVisible}
        />
      )}

      {/* Stats overlay */}
      {data && (
        <div className="absolute top-4 left-4 rounded-lg bg-black/60 px-3 py-2 backdrop-blur-md border border-white/5">
          <p className="text-xs text-muted-foreground">
            <span className="font-mono font-medium text-foreground">{trackedCount.toLocaleString()}</span> objects tracked live
            <span className="mx-1.5 text-white/20">&middot;</span>
            ~10,000 active satellites in orbit
            <span className="mx-1.5 text-white/20">&middot;</span>
            ~35,000 cataloged objects
          </p>
        </div>
      )}

      {/* Accordion legend */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1 max-h-[75%] overflow-y-auto rounded-xl bg-black/60 backdrop-blur-md border border-white/5 p-2 min-w-[200px]">
        {CATEGORIES.map((cat) => {
          const catGroups = data?.groups.filter((g) => g.category === cat.id) ?? [];
          const groupCount = catGroups.reduce((sum, g) => sum + g.tles.length, 0);
          const isExpanded = expandedCats[cat.id] ?? false;

          return (
            <div key={cat.id}>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className={`flex-shrink-0 p-1.5 rounded transition-colors ${
                    visibleCats[cat.id]
                      ? "text-foreground/80 hover:text-foreground"
                      : "text-muted-foreground/40 hover:text-muted-foreground"
                  }`}
                  title={visibleCats[cat.id] ? "Hide" : "Show"}
                >
                  {visibleCats[cat.id] ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>

                <button
                  onClick={() =>
                    setExpandedCats((prev) => ({ ...prev, [cat.id]: !isExpanded }))
                  }
                  className={`flex flex-1 items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all ${
                    visibleCats[cat.id] ? "text-foreground" : "text-muted"
                  } hover:bg-white/5`}
                >
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="flex-1 text-left">{cat.label}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {groupCount > 0 ? groupCount : ""}
                  </span>
                  <ChevronDown
                    size={12}
                    className={`text-muted-foreground transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {isExpanded && catGroups.length > 0 && (
                <div className="ml-8 mb-1 flex flex-col">
                  <p className="px-2.5 py-1 text-xs text-muted-foreground/60">
                    {cat.desc}
                  </p>
                  {catGroups.map((g) => (
                    <button
                      key={g.name}
                      onClick={() =>
                        setHighlightedGroup((prev) => prev === g.name ? null : g.name)
                      }
                      className={`flex items-center gap-2 px-2.5 py-1 text-xs rounded-md transition-all text-left ${
                        highlightedGroup === g.name
                          ? "bg-white/10 text-foreground"
                          : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: g.color }}
                      />
                      <span className="flex-1">{g.name}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {g.tles.length}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Notable objects as expandable section */}
        {(data?.notable ?? []).length > 0 && (
          <div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setNotableVisible((p) => !p)}
                className={`flex-shrink-0 p-1.5 rounded transition-colors ${
                  notableVisible
                    ? "text-foreground/80 hover:text-foreground"
                    : "text-muted-foreground/40 hover:text-muted-foreground"
                }`}
                title={notableVisible ? "Hide" : "Show"}
              >
                {notableVisible ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>

              <button
                onClick={() => setNotableExpanded((p) => !p)}
                className={`flex flex-1 items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all ${
                  notableVisible ? "text-foreground" : "text-muted"
                } hover:bg-white/5`}
              >
                <Satellite size={12} className="text-muted-foreground flex-shrink-0" />
                <span className="flex-1 text-left">Notable Objects</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {data!.notable.length}
                </span>
                <ChevronDown
                  size={12}
                  className={`text-muted-foreground transition-transform ${
                    notableExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {notableExpanded && (
              <div className="ml-8 mb-1 flex flex-col">
                {data!.notable.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleLegendClick(n.id)}
                    className={`flex items-center gap-2 px-2.5 py-1 text-xs rounded-md transition-all text-left ${
                      selectedId === n.id
                        ? "bg-white/10 text-foreground"
                        : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: n.color }}
                    />
                    <span className="flex-1">{n.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Time-lapse & instructions */}
      <div className="absolute right-4 bottom-4 flex flex-col items-end gap-2">
        <div className="flex items-center gap-1 rounded-lg bg-black/60 px-3 py-2 backdrop-blur-md border border-white/5">
          <span className="text-xs text-muted-foreground mr-1.5">Time</span>
          {[1, 10, 100, 500].map((speed) => (
            <button
              key={speed}
              onClick={() => setTimeSpeed(speed)}
              className={`px-2 py-0.5 text-xs font-mono rounded transition-all ${
                timeSpeed === speed
                  ? "bg-accent text-white font-semibold"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
            >
              {speed}x
            </button>
          ))}
          {timeSpeed > 1 && (
            <span className="ml-1.5 text-xs text-accent animate-pulse">
              TIME-LAPSE
            </span>
          )}
        </div>
        <div className="rounded-lg bg-white/5 px-3 py-2 text-xs text-muted-foreground backdrop-blur-md">
          Drag to rotate &middot; Scroll to zoom &middot; Click satellites to
          track
        </div>
      </div>

      {/* Selected satellite info panel */}
      {selectedInfo && (
        <div className="absolute top-4 right-4 w-64 rounded-xl bg-card/90 border border-white/10 backdrop-blur-md p-4 shadow-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Satellite size={16} style={{ color: selectedInfo.color }} />
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {selectedInfo.label}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedInfo.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedId(null);
                setSelectedInfo(null);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-white/5 p-2">
              <span className="text-muted-foreground">Altitude</span>
              <p className="font-mono font-medium text-foreground">
                {selectedInfo.altitude.toLocaleString()} km
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-2">
              <span className="text-muted-foreground">Speed</span>
              <p className="font-mono font-medium text-foreground">
                {selectedInfo.speed.toLocaleString()} km/h
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-2">
              <span className="text-muted-foreground">Latitude</span>
              <p className="font-mono font-medium text-foreground">
                {selectedInfo.latitude > 0
                  ? `${selectedInfo.latitude}°N`
                  : `${Math.abs(selectedInfo.latitude)}°S`}
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-2">
              <span className="text-muted-foreground">Longitude</span>
              <p className="font-mono font-medium text-foreground">
                {selectedInfo.longitude > 0
                  ? `${selectedInfo.longitude}°E`
                  : `${Math.abs(selectedInfo.longitude)}°W`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
