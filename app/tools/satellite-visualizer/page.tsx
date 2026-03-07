"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Eye, EyeOff, Loader2, X, Satellite } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";
import type {
  SatelliteGroup,
  NotableSatelliteData,
  SatelliteInfo,
} from "@/components/tools/SatelliteScene";

const SatelliteScene = dynamic(
  () => import("@/components/tools/SatelliteScene"),
  { ssr: false }
);

const CONSTELLATION_META: Record<string, { count: string }> = {
  Starlink: { count: "~6,000 sats" },
  OneWeb: { count: "~600 sats" },
  GPS: { count: "~31 sats" },
};

interface APIResponse {
  groups: SatelliteGroup[];
  notable: NotableSatelliteData[];
}

export default function SatelliteVisualizerPage() {
  const [data, setData] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>({
    Starlink: true,
    OneWeb: true,
    GPS: true,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<SatelliteInfo | null>(null);

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

  const toggleConstellation = (name: string) => {
    setVisible((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSelect = useCallback((info: SatelliteInfo | null) => {
    setSelectedId(info?.id ?? null);
    setSelectedInfo(info);
  }, []);

  const handleLegendClick = useCallback(
    (id: string) => {
      if (selectedId === id) {
        // Deselect if clicking same one
        setSelectedId(null);
        setSelectedInfo(null);
      } else {
        setSelectedId(id);
        // Info will be populated by scene via onSelect callback
      }
    },
    [selectedId]
  );

  return (
    <div className="mx-auto max-w-6xl px-6 pt-8 pb-16">
      <SectionHeading
        title="Satellite Constellation Visualizer"
        subtitle="Live satellite positions powered by real TLE data and SGP4 propagation. Click on notable satellites to track them."
        className="mb-6"
      />

      <FadeIn>
        <div className="relative overflow-hidden rounded-2xl border border-white/5">
          {/* 3D Scene */}
          <div className="aspect-[16/10] w-full bg-[#060810]">
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
                visibleConstellations={visible}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            )}
          </div>

          {/* Constellation toggles */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2">
            {(data?.groups ?? []).map((g) => {
              const meta = CONSTELLATION_META[g.name];
              return (
                <button
                  key={g.name}
                  onClick={() => toggleConstellation(g.name)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium backdrop-blur-md transition-all ${
                    visible[g.name]
                      ? "bg-white/10 text-foreground"
                      : "bg-white/5 text-muted"
                  }`}
                >
                  {visible[g.name] ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: g.color }}
                  />
                  {g.name}
                  <span className="text-xs text-muted-foreground">
                    {meta?.count ?? `${g.tles.length} tracked`}
                  </span>
                </button>
              );
            })}

            {/* Notable satellites legend — clickable */}
            {(data?.notable ?? []).length > 0 && (
              <div className="mt-1 flex flex-col gap-1 rounded-lg bg-white/5 px-3 py-2 backdrop-blur-md">
                <span className="text-xs font-medium text-muted-foreground mb-0.5">
                  Notable Objects
                </span>
                {data!.notable.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleLegendClick(n.id)}
                    className={`flex items-center gap-2 text-xs py-1 px-1 -mx-1 rounded transition-all text-left ${
                      selectedId === n.id
                        ? "bg-white/10 text-foreground"
                        : "text-foreground/70 hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: n.color }}
                    />
                    {n.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="absolute right-4 bottom-4 rounded-lg bg-white/5 px-3 py-2 text-xs text-muted-foreground backdrop-blur-md">
            Drag to rotate &middot; Scroll to zoom &middot; Click satellites to
            track
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
      </FadeIn>
    </div>
  );
}
