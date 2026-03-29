"use client";

import { useState, useMemo } from "react";
import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import MapLayerControls from "@/components/tools/MapLayerControls";
import type { LayerToggle } from "@/components/tools/MapLayerControls";
import {
  DATA_CENTERS,
  OPERATOR_COLORS,
  mwToRadius,
  type DataCenter,
  type Operator,
  type DCStatus,
} from "@/lib/ai-infrastructure";

const STATUS_LABELS: Record<DCStatus, string> = {
  "existing":           "Operational",
  "under-construction": "Under Construction",
  "announced":          "Announced",
};

/* ── Hover tooltip ── */
function DCTooltip({ dc }: { dc: DataCenter }) {
  const color = OPERATOR_COLORS[dc.operator];
  return (
    <div
      style={{
        position: "absolute",
        bottom: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        marginBottom: 8,
        background: "rgba(10, 10, 18, 0.96)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: "10px 14px",
        minWidth: 180,
        maxWidth: 280,
        boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
        backdropFilter: "blur(16px)",
        pointerEvents: "none",
        zIndex: 9999,
        whiteSpace: "normal",
      }}
    >
      {/* Name + operator badge */}
      <div style={{ fontWeight: 700, fontSize: 12, color: "#e4e4e7", marginBottom: 5, lineHeight: 1.3 }}>
        {dc.name}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
        <span style={{
          fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
          background: `${color}22`, color, padding: "2px 6px", borderRadius: 4,
        }}>
          {dc.operator}
        </span>
        <span style={{
          fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px",
          background: dc.status === "existing" ? "rgba(34,197,94,0.15)" : dc.status === "under-construction" ? "rgba(251,191,36,0.15)" : "rgba(148,163,184,0.15)",
          color: dc.status === "existing" ? "#22c55e" : dc.status === "under-construction" ? "#fbbf24" : "#94a3b8",
          padding: "2px 6px", borderRadius: 4,
        }}>
          {STATUS_LABELS[dc.status]}
        </span>
      </div>
      {/* Stats */}
      <div style={{ fontSize: 11, color: "#a1a1aa", lineHeight: 1.7 }}>
        <div><span style={{ color: "#e4e4e7", fontWeight: 600 }}>Capacity: </span>{dc.capacityMW.toLocaleString()} MW</div>
        {dc.investmentB && (
          <div><span style={{ color: "#e4e4e7", fontWeight: 600 }}>Investment: </span>${dc.investmentB}B</div>
        )}
        {dc.announced && (
          <div><span style={{ color: "#e4e4e7", fontWeight: 600 }}>Announced: </span>{dc.announced}</div>
        )}
        {dc.notes && (
          <div style={{ marginTop: 4, color: "#71717a", fontStyle: "italic" }}>{dc.notes}</div>
        )}
      </div>
    </div>
  );
}

/* ── Single map dot ── */
function DCDot({ dc }: { dc: DataCenter }) {
  const [hovered, setHovered] = useState(false);
  const color = OPERATOR_COLORS[dc.operator];
  const r = mwToRadius(dc.capacityMW);
  const hitSize = Math.max(r + 20, 30);
  const opacity = dc.status === "existing" ? 1 : dc.status === "under-construction" ? 0.75 : 0.5;

  return (
    <Marker longitude={dc.lng} latitude={dc.lat} anchor="center" style={{ zIndex: hovered ? 9999 : 1 }}>
      <div
        className="cmap-event-marker"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ position: "relative", width: hitSize, height: hitSize, cursor: "pointer" }}
      >
        {/* Dot */}
        <span style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: r, height: r,
          borderRadius: "50%",
          background: color,
          opacity,
          boxShadow: hovered ? `0 0 ${r * 1.5}px ${color}99` : `0 0 ${r * 0.6}px ${color}55`,
          border: dc.status === "announced" ? `1.5px dashed ${color}` : `1.5px solid ${color}88`,
          transition: "box-shadow 0.15s",
          display: "block",
        }} />
        {hovered && <DCTooltip dc={dc} />}
      </div>
    </Marker>
  );
}

/* ── Main map ── */
export interface DataCenterMapProps {
  visibleOperators: Set<Operator>;
  showExisting: boolean;
  showAnnounced: boolean;
  layers: LayerToggle[];
  onToggleLayer: (id: string) => void;
}

export default function DataCenterMap({
  visibleOperators,
  showExisting,
  showAnnounced,
  layers,
  onToggleLayer,
}: DataCenterMapProps) {
  const visible = useMemo(() => {
    return DATA_CENTERS.filter((dc) => {
      if (!visibleOperators.has(dc.operator)) return false;
      if (dc.status === "existing" && !showExisting) return false;
      if ((dc.status === "announced" || dc.status === "under-construction") && !showAnnounced) return false;
      return true;
    });
  }, [visibleOperators, showExisting, showAnnounced]);

  return (
    <div className="relative w-full h-full rounded-xl" style={{ minHeight: 400 }}>
      <Map
        initialViewState={{ longitude: 0, latitude: 25, zoom: 1.4 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        attributionControl={false}
      >
        {visible.map((dc) => (
          <DCDot key={dc.id} dc={dc} />
        ))}
      </Map>

      <MapLayerControls layers={layers} onToggle={onToggleLayer} />

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 text-[9px] text-white/20 pointer-events-none">
        © CartoDB / OSM
      </div>
    </div>
  );
}
