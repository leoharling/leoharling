"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Polyline,
  Polygon,
  CircleMarker,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import { feature } from "topojson-client";
import "leaflet/dist/leaflet.css";
import type { Conflict } from "@/lib/conflicts";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import type { Topology } from "topojson-specification";

/* ── Load world country boundaries (50m resolution) ── */
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const worldTopo: any = require("world-atlas/countries-50m.json");
const worldGeo = feature(
  worldTopo as Topology,
  worldTopo.objects.countries
) as unknown as FeatureCollection;

function getCountryFeatures(codes: string[]): Feature<Geometry>[] {
  return worldGeo.features.filter((f) =>
    codes.includes(String(f.id))
  );
}

/* ── Fly-to animation ── */
function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

/* ── Custom icon builders ── */
const EVENT_COLORS: Record<string, string> = {
  strike: "#ef4444",
  battle: "#f97316",
  humanitarian: "#facc15",
  political: "#60a5fa",
};

function eventIcon(type: string) {
  const color = EVENT_COLORS[type] || "#ef4444";
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `
      <div style="position:relative;width:28px;height:28px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.2;animation:cmap-pulse 2.5s ease-out infinite;"></div>
        <div style="position:absolute;inset:3px;border-radius:50%;background:${color};opacity:0.12;animation:cmap-pulse 2.5s ease-out 0.5s infinite;"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:10px;height:10px;border-radius:50%;background:${color};box-shadow:0 0 8px 2px ${color}40;"></div>
      </div>`,
  });
}

function labelIcon(text: string, fontSize = 11) {
  return L.divIcon({
    className: "",
    iconSize: [1, 1],
    iconAnchor: [0, 0],
    html: `<div style="white-space:nowrap;font-size:${fontSize}px;font-weight:700;color:rgba(255,255,255,0.18);letter-spacing:4px;text-transform:uppercase;font-family:var(--font-geist-mono),ui-monospace,monospace;pointer-events:none;transform:translate(-50%,-50%);text-shadow:0 0 20px rgba(0,0,0,0.5);">${text}</div>`,
  });
}

const LOCATION_COLORS: Record<string, string> = {
  capital: "#60a5fa",
  city: "#94a3b8",
  hotspot: "#ef4444",
  event: "#f59e0b",
};

/* ── Map component ── */
export default function ConflictMap({
  conflict,
  allConflicts,
  onSelectConflict,
}: {
  conflict: Conflict;
  allConflicts: Conflict[];
  onSelectConflict: (id: string) => void;
}) {
  const countryFeatures = useMemo(
    () => getCountryFeatures(conflict.countryCodes),
    [conflict.countryCodes]
  );

  const eventIcons = useMemo(() => {
    const map = new Map<string, L.DivIcon>();
    for (const t of ["strike", "battle", "humanitarian", "political"]) {
      map.set(t, eventIcon(t));
    }
    return map;
  }, []);

  const regionLabelIcons = useMemo(
    () => (conflict.regionLabels || []).map((rl) => labelIcon(rl.text, rl.fontSize)),
    [conflict.regionLabels]
  );

  return (
    <MapContainer
      center={conflict.center}
      zoom={conflict.zoom}
      className="conflict-map h-full w-full"
      style={{ minHeight: "600px", background: "#0a0a0f" }}
      zoomControl={false}
      attributionControl={false}
      minZoom={3}
      maxZoom={14}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      <FlyTo center={conflict.center} zoom={conflict.zoom} />

      {/* ── 1. Country boundary fills (subtle) ── */}
      {countryFeatures.map((feat) => (
        <GeoJSON
          key={`${conflict.id}-fill-${feat.id}`}
          data={feat}
          style={{
            color: "transparent",
            weight: 0,
            fillColor: conflict.color,
            fillOpacity: 0.05,
          }}
        />
      ))}

      {/* ── 2. Occupied / controlled area polygons ── */}
      {conflict.controlledAreas?.map((area, i) => (
        <Polygon
          key={`area-${conflict.id}-${i}`}
          positions={area.positions}
          pathOptions={{
            color: area.color,
            fillColor: area.color,
            fillOpacity: area.fillOpacity ?? 0.1,
            weight: 1.5,
            opacity: 0.5,
            dashArray: "6, 4",
          }}
        >
          <Tooltip direction="center" className="conflict-tooltip">
            <span style={{ fontWeight: 600, fontSize: 11 }}>
              {area.label}
            </span>
          </Tooltip>
        </Polygon>
      ))}

      {/* ── 3. Country boundary outlines (glow + sharp) ── */}
      {countryFeatures.map((feat) => (
        <GeoJSON
          key={`${conflict.id}-glow-${feat.id}`}
          data={feat}
          style={{
            color: conflict.color,
            weight: 6,
            opacity: 0.07,
            fillColor: "transparent",
            fillOpacity: 0,
          }}
        />
      ))}
      {countryFeatures.map((feat) => (
        <GeoJSON
          key={`${conflict.id}-outline-${feat.id}`}
          data={feat}
          style={{
            color: conflict.color,
            weight: 1.5,
            opacity: 0.55,
            fillColor: "transparent",
            fillOpacity: 0,
            dashArray: "",
          }}
        />
      ))}

      {/* ── 4. Front line ── */}
      {conflict.frontLine && (
        <>
          <Polyline
            positions={conflict.frontLine}
            pathOptions={{
              color: conflict.color,
              weight: 10,
              opacity: 0.08,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
          <Polyline
            positions={conflict.frontLine}
            pathOptions={{
              color: "#ffffff",
              weight: 3,
              opacity: 0.15,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
          <Polyline
            positions={conflict.frontLine}
            pathOptions={{
              color: conflict.color,
              weight: 2,
              dashArray: "6, 4",
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </>
      )}

      {/* ── 5. Region labels ── */}
      {conflict.regionLabels?.map((rl, i) => (
        <Marker
          key={`label-${conflict.id}-${i}`}
          position={[rl.lat, rl.lng]}
          icon={regionLabelIcons[i]}
          interactive={false}
        />
      ))}

      {/* ── 6. Recent event markers (pulsing) ── */}
      {conflict.recentEvents?.map((ev, i) => (
        <Marker
          key={`event-${conflict.id}-${i}`}
          position={[ev.lat, ev.lng]}
          icon={eventIcons.get(ev.type) || eventIcons.get("strike")!}
        >
          <Tooltip
            direction="top"
            offset={[0, -16]}
            className="conflict-tooltip"
          >
            <div style={{ maxWidth: 220 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  marginBottom: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: EVENT_COLORS[ev.type] || "#ef4444",
                    boxShadow: `0 0 4px ${EVENT_COLORS[ev.type] || "#ef4444"}`,
                  }}
                />
                {ev.title}
              </div>
              <div style={{ fontSize: 11, opacity: 0.75, lineHeight: 1.4 }}>
                {ev.description}
              </div>
            </div>
          </Tooltip>
        </Marker>
      ))}

      {/* ── 7. Other conflict zone markers ── */}
      {allConflicts
        .filter((c) => c.id !== conflict.id)
        .map((c) => (
          <CircleMarker
            key={c.id}
            center={c.center}
            radius={7}
            pathOptions={{
              color: c.color,
              fillColor: c.color,
              fillOpacity: 0.15,
              weight: 1.5,
            }}
            eventHandlers={{ click: () => onSelectConflict(c.id) }}
          >
            <Tooltip
              direction="top"
              offset={[0, -8]}
              className="conflict-tooltip"
            >
              <span style={{ fontWeight: 600, fontSize: 12 }}>
                {c.shortName}
              </span>
            </Tooltip>
          </CircleMarker>
        ))}

      {/* ── 8. Key location markers ── */}
      {conflict.keyLocations.map((loc) => {
        const color = LOCATION_COLORS[loc.type] || "#94a3b8";
        const isCapital = loc.type === "capital";
        return (
          <CircleMarker
            key={`loc-${conflict.id}-${loc.name}`}
            center={[loc.lat, loc.lng]}
            radius={isCapital ? 5 : 3}
            pathOptions={{
              color: isCapital ? color : "transparent",
              fillColor: color,
              fillOpacity: isCapital ? 1 : 0.75,
              weight: isCapital ? 2 : 0,
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -5]}
              className="conflict-tooltip"
            >
              <div>
                <span style={{ fontWeight: 700, fontSize: 12 }}>
                  {loc.name}
                </span>
                <br />
                <span style={{ fontSize: 11, opacity: 0.7 }}>
                  {loc.description}
                </span>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
