"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Map, {
  Source,
  Layer,
  Marker,
  Popup,
  useMap,
} from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { feature } from "topojson-client";
import type { Conflict, TerritorySnapshot } from "@/lib/conflicts";
import type { FeatureCollection } from "geojson";
import type { Topology } from "topojson-specification";
import MapLayerControls from "./MapLayerControls";
import type { LayerToggle } from "./MapLayerControls";

/* ── World country boundaries (50m) ── */
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const worldTopo: any = require("world-atlas/countries-50m.json");
const worldGeo = feature(
  worldTopo as Topology,
  worldTopo.objects.countries
) as unknown as FeatureCollection;

function getCountryCollection(codes: string[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: worldGeo.features.filter((f) => codes.includes(String(f.id))),
  };
}

/* ── Data converters (lat,lng → lng,lat for GeoJSON) ── */
function frontLineToGeoJSON(coords: [number, number][]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: coords.map(([lat, lng]) => [lng, lat]) },
    }],
  };
}

function controlledAreasToGeoJSON(areas: Conflict["controlledAreas"]): FeatureCollection {
  if (!areas?.length) return { type: "FeatureCollection", features: [] };
  return {
    type: "FeatureCollection",
    features: areas.map((area, i) => ({
      type: "Feature" as const,
      properties: { label: area.label, color: area.color, fillOpacity: area.fillOpacity ?? 0.1, index: i },
      geometry: { type: "Polygon" as const, coordinates: [area.positions.map(([lat, lng]) => [lng, lat])] },
    })),
  };
}

function otherConflictsToGeoJSON(conflicts: Conflict[], currentId: string): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: conflicts
      .filter((c) => c.id !== currentId)
      .map((c) => ({
        type: "Feature" as const,
        properties: { id: c.id, name: c.shortName, color: c.color },
        geometry: { type: "Point" as const, coordinates: [c.center[1], c.center[0]] },
      })),
  };
}

/* ── Dot style configs ── */
const EVENT_COLORS: Record<string, string> = {
  strike: "#ef4444",
  battle: "#f97316",
  humanitarian: "#facc15",
  political: "#60a5fa",
};

const LOCATION_COLORS: Record<string, string> = {
  capital: "#60a5fa",
  city: "#94a3b8",
  hotspot: "#ef4444",
  event: "#f59e0b",
};

const LOCATION_SIZES: Record<string, number> = {
  capital: 9,
  city: 6,
  hotspot: 8,
  event: 6,
};

const TYPE_LABELS: Record<string, string> = {
  strike: "Strike",
  battle: "Battle",
  humanitarian: "Humanitarian",
  political: "Political",
  capital: "Capital",
  city: "City",
  hotspot: "Hotspot",
  event: "Event",
};

/* ── Shared hover tooltip ── */
function HoverTooltip({
  title,
  description,
  color,
  type,
  date,
}: {
  title: string;
  description: string;
  color: string;
  type: string;
  date?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        marginBottom: 6,
        background: "rgba(10, 10, 18, 0.94)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "8px 12px",
        minWidth: 160,
        maxWidth: 260,
        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
        backdropFilter: "blur(12px)",
        pointerEvents: "none",
        zIndex: 9999,
        whiteSpace: "normal",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
        <span style={{
          display: "inline-block", width: 7, height: 7, borderRadius: "50%",
          background: color, boxShadow: `0 0 4px ${color}`, flexShrink: 0,
        }} />
        <span style={{ fontWeight: 700, fontSize: 12, color: "#e4e4e7", lineHeight: 1.3 }}>
          {title}
        </span>
      </div>
      {description && (
        <div style={{ fontSize: 11, color: "#a1a1aa", lineHeight: 1.4 }}>
          {description}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
        <span style={{
          fontSize: 9, fontWeight: 600, textTransform: "uppercase",
          letterSpacing: "0.5px", color, opacity: 0.9,
          background: `${color}18`, padding: "1px 5px", borderRadius: 3,
        }}>
          {TYPE_LABELS[type] || type}
        </span>
        {date && (
          <span style={{ fontSize: 10, color: "#71717a" }}>{date}</span>
        )}
      </div>
    </div>
  );
}

/* ── Unified map dot — handles both pulsing events and static locations ── */
function MapDot({
  lat,
  lng,
  color,
  size,
  title,
  description,
  type,
  date,
  pulse,
  stroke,
}: {
  lat: number;
  lng: number;
  color: string;
  size: number;
  title: string;
  description: string;
  type: string;
  date?: string;
  pulse?: boolean;
  stroke?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const hitSize = Math.max(size + 20, 28);

  return (
    <Marker longitude={lng} latitude={lat} anchor="center" style={{ zIndex: hovered ? 9999 : 1 }}>
      <div
        className="cmap-event-marker"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ position: "relative", width: hitSize, height: hitSize, cursor: "pointer" }}
      >
        {/* Pulse rings */}
        {pulse && (
          <>
            <span
              className="cmap-pulse-ring"
              style={{
                position: "absolute", inset: (hitSize - size - 4) / 2, borderRadius: "50%",
                background: color, opacity: 0.25,
              }}
            />
            <span
              className="cmap-pulse-ring cmap-pulse-ring-delayed"
              style={{
                position: "absolute", inset: (hitSize - size) / 2, borderRadius: "50%",
                background: color, opacity: 0.15,
              }}
            />
          </>
        )}
        {/* Core dot */}
        <span
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: size, height: size, borderRadius: "50%",
            background: color,
            boxShadow: pulse ? `0 0 6px 1px ${color}60` : undefined,
            border: stroke ? `2px solid ${color}` : undefined,
            opacity: pulse ? 1 : 0.85,
          }}
        />
        {/* Hover tooltip */}
        {hovered && (
          <HoverTooltip title={title} description={description} color={color} type={type} date={date} />
        )}
      </div>
    </Marker>
  );
}

/* ── Fly-to controller ── */
function FlyToController({ conflictCenter, conflictZoom, focusLocation, onFocused }: {
  conflictCenter: [number, number];
  conflictZoom: number;
  focusLocation?: { lat: number; lng: number } | null;
  onFocused?: () => void;
}) {
  const { current: map } = useMap();
  const prevConflictCenter = useRef(conflictCenter);

  // Fly to conflict center only when the conflict changes
  useEffect(() => {
    if (map && (prevConflictCenter.current[0] !== conflictCenter[0] || prevConflictCenter.current[1] !== conflictCenter[1])) {
      map.flyTo({ center: [conflictCenter[1], conflictCenter[0]], zoom: conflictZoom, duration: 1500 });
    }
    prevConflictCenter.current = conflictCenter;
  }, [conflictCenter, conflictZoom, map]);

  // Fly to focused location, then clear it so the user can freely navigate
  useEffect(() => {
    if (map && focusLocation) {
      const zoom = Math.max(conflictZoom + 2, 8);
      map.flyTo({ center: [focusLocation.lng, focusLocation.lat], zoom, duration: 1500 });
      if (onFocused) {
        const handler = () => { onFocused(); map.off("moveend", handler); };
        map.on("moveend", handler);
      }
    }
  }, [focusLocation, map, conflictZoom, onFocused]);

  return null;
}

/* ── Map component ── */
export interface LiveEvent {
  lat: number;
  lng: number;
  title: string;
  description: string;
  type: string;
  date?: string;
  dateISO?: string;
  fatalities?: number;
  source?: string;
  tier?: "featured" | "notable" | "minor";
  significance?: number;
  dyad_name?: string;
  deaths_civilians?: number;
}

/** Parse loose date strings like "Feb 2024", "Since Oct 2023", "2024-10-01" */
function parseDateLoose(dateStr?: string): number | null {
  if (!dateStr) return null;
  const cleaned = dateStr.replace(/^Since\s+/i, "");
  const parsed = new Date(cleaned).getTime();
  return isNaN(parsed) ? null : parsed;
}

export default function ConflictMap({
  conflict,
  allConflicts,
  onSelectConflict,
  focusLocation,
  onFocused,
  liveEvents,
  liveGeoJSON,
  selectedTime,
  territorySnapshots,
}: {
  conflict: Conflict;
  allConflicts: Conflict[];
  onSelectConflict: (id: string) => void;
  focusLocation?: { lat: number; lng: number } | null;
  onFocused?: () => void;
  liveEvents?: LiveEvent[];
  liveGeoJSON?: object | null;
  selectedTime?: number | null;
  territorySnapshots?: TerritorySnapshot[];
}) {
  const mapRef = useRef<MapRef>(null);
  const [popup, setPopup] = useState<{
    lng: number;
    lat: number;
    title: string;
    description: string;
    color?: string;
  } | null>(null);
  const [externalGeoJSON, setExternalGeoJSON] = useState<Record<string, FeatureCollection>>({});
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({
    territory: true,
    frontline: true,
    locations: true,
    events: true,
    labels: true,
    others: true,
  });


  const layerToggles: LayerToggle[] = useMemo(() => [
    { id: "territory", label: "Territory", color: conflict.color, enabled: layerVisibility.territory },
    { id: "frontline", label: "Front lines", color: "#ffffff", enabled: layerVisibility.frontline },
    { id: "locations", label: "Locations", color: "#94a3b8", enabled: layerVisibility.locations },
    { id: "events", label: "Events", color: "#ef4444", enabled: layerVisibility.events },
    { id: "labels", label: "Labels", color: "#ffffff", enabled: layerVisibility.labels },
    { id: "others", label: "Other conflicts", color: "#71717a", enabled: layerVisibility.others },
  ], [conflict.color, layerVisibility]);

  const toggleLayer = useCallback((id: string) => {
    setLayerVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Load external GeoJSON files
  useEffect(() => {
    async function loadGeoJSON() {
      const files: Record<string, string> = {
        "ukraine-occupied": "/geojson/ukraine-occupied.geojson",
        gaza: "/geojson/gaza.geojson",
      };
      const loaded: Record<string, FeatureCollection> = {};
      for (const [key, url] of Object.entries(files)) {
        try {
          const res = await fetch(url);
          if (res.ok) loaded[key] = await res.json();
        } catch { /* skip */ }
      }
      setExternalGeoJSON(loaded);
    }
    loadGeoJSON();
  }, []);

  // Memoize GeoJSON
  const countryData = useMemo(() => getCountryCollection(conflict.countryCodes), [conflict.countryCodes]);
  const frontLineData = useMemo(() => conflict.frontLine ? frontLineToGeoJSON(conflict.frontLine) : null, [conflict.frontLine]);
  const controlledAreasData = useMemo(() => controlledAreasToGeoJSON(conflict.controlledAreas), [conflict.controlledAreas]);
  const otherConflictsData = useMemo(() => otherConflictsToGeoJSON(allConflicts, conflict.id), [allConflicts, conflict.id]);

  // Determine occupied territory data
  // When selectedTime is set and we have territory snapshots, use the appropriate snapshot.
  // Otherwise use current/live data (existing behavior).
  const occupiedTerritoryData = useMemo(() => {
    // Historical mode — find matching snapshot
    if (selectedTime != null && territorySnapshots && territorySnapshots.length > 0) {
      let matched: TerritorySnapshot | null = null;
      for (const s of territorySnapshots) {
        const snapTime = new Date(s.date).getTime();
        if (snapTime <= selectedTime) {
          matched = s;
        } else {
          break; // snapshots are sorted chronologically
        }
      }
      if (matched) {
        return matched.geojson as FeatureCollection;
      }
      // Before first snapshot — show empty
      return { type: "FeatureCollection" as const, features: [] } as FeatureCollection;
    }

    // Current/live mode (unchanged existing behavior)
    if (conflict.id === "ukraine" && (liveGeoJSON || externalGeoJSON["ukraine-occupied"])) {
      return (liveGeoJSON as FeatureCollection) || externalGeoJSON["ukraine-occupied"];
    }
    if (conflict.id === "middleeast" && externalGeoJSON["gaza"]) {
      const gazaFeatures = externalGeoJSON["gaza"].features.map((f) => ({
        ...f,
        properties: { ...f.properties, label: "Gaza Strip", color: "#f97316", fillOpacity: 0.2 },
      }));
      const lebanonFeatures = controlledAreasData.features.filter((f) => f.properties?.label?.includes("Lebanon"));
      return { type: "FeatureCollection" as const, features: [...gazaFeatures, ...lebanonFeatures] };
    }
    return controlledAreasData;
  }, [conflict.id, externalGeoJSON, controlledAreasData, liveGeoJSON, selectedTime, territorySnapshots]);

  // Filter events by selected time
  const filteredRecentEvents = useMemo(() => {
    if (selectedTime == null) return conflict.recentEvents || [];
    return (conflict.recentEvents || []).filter((ev) => {
      const evTime = parseDateLoose(ev.date);
      if (evTime == null) return true; // undated events always show
      return evTime <= selectedTime;
    });
  }, [conflict.recentEvents, selectedTime]);

  const filteredLiveEvents = useMemo(() => {
    if (!liveEvents?.length) return [];
    // Filter UCDP events by selected time on the timeline slider
    if (selectedTime != null) {
      return liveEvents.filter((ev) => {
        if (!ev.dateISO) return true;
        const evTime = new Date(ev.dateISO).getTime();
        return evTime <= selectedTime;
      });
    }
    return liveEvents;
  }, [liveEvents, selectedTime]);

  // Safe query for interactive layers
  const safeQuery = useCallback((map: maplibregl.Map, point: maplibregl.PointLike, layers: string[]) => {
    const existing = layers.filter((l) => map.getLayer(l));
    if (!existing.length) return [];
    return map.queryRenderedFeatures(point, { layers: existing });
  }, []);

  const onMapClick = useCallback((e: maplibregl.MapMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const features = safeQuery(map, e.point, ["other-conflicts-circle"]);
    if (features.length > 0) {
      const id = features[0].properties?.id;
      if (id) onSelectConflict(id);
    }
  }, [onSelectConflict, safeQuery]);

  const onMapMouseMove = useCallback((e: maplibregl.MapMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Other conflict markers only — all dots use unified HTML Marker tooltips
    const otherFeats = safeQuery(map, e.point, ["other-conflicts-circle"]);
    if (otherFeats.length > 0) {
      const props = otherFeats[0].properties;
      const geom = otherFeats[0].geometry;
      if (geom.type === "Point") {
        map.getCanvas().style.cursor = "pointer";
        setPopup({
          lng: geom.coordinates[0], lat: geom.coordinates[1],
          title: props?.name || "", description: "Click to view", color: props?.color,
        });
        return;
      }
    }

    map.getCanvas().style.cursor = "";
    setPopup(null);
  }, [safeQuery]);

  return (
    <div className="relative">
      <MapLayerControls layers={layerToggles} onToggle={toggleLayer} />
      <Map
        ref={mapRef}
        initialViewState={{ longitude: conflict.center[1], latitude: conflict.center[0], zoom: conflict.zoom }}
        style={{ width: "100%", minHeight: "600px" }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        attributionControl={false}
        minZoom={3}
        maxZoom={14}
        onClick={onMapClick}
        onMouseMove={onMapMouseMove}
        onMouseLeave={() => setPopup(null)}

      >
        <FlyToController
          conflictCenter={conflict.center}
          conflictZoom={conflict.zoom}
          focusLocation={focusLocation}
          onFocused={onFocused}
        />

        {/* ── 1. Country boundaries ── */}
        <Source id="countries" type="geojson" data={countryData}>
          <Layer id="country-fill" type="fill" paint={{ "fill-color": conflict.color, "fill-opacity": 0.04 }} />
          <Layer id="country-glow" type="line" paint={{ "line-color": conflict.color, "line-width": 6, "line-opacity": 0.06, "line-blur": 3 }} />
          <Layer id="country-outline" type="line" paint={{ "line-color": conflict.color, "line-width": 1.5, "line-opacity": 0.5 }} />
        </Source>

        {/* ── 2. Occupied / controlled territory ── */}
        {layerVisibility.territory && (
          <Source id="occupied" type="geojson" data={occupiedTerritoryData}>
            <Layer id="occupied-fill" type="fill" paint={{
              "fill-color": ["coalesce", ["get", "color"], conflict.color],
              "fill-opacity": ["coalesce", ["get", "fillOpacity"], 0.12],
            }} />
            <Layer id="occupied-outline" type="line" paint={{
              "line-color": ["coalesce", ["get", "color"], conflict.color],
              "line-width": 1.5, "line-opacity": 0.4, "line-dasharray": [4, 3],
            }} />
          </Source>
        )}

        {/* ── 3. Front line ── */}
        {frontLineData && layerVisibility.frontline && (
          <Source id="frontline" type="geojson" data={frontLineData}>
            <Layer id="frontline-glow" type="line" paint={{ "line-color": conflict.color, "line-width": 10, "line-opacity": 0.08, "line-blur": 4 }} layout={{ "line-cap": "round", "line-join": "round" }} />
            <Layer id="frontline-white" type="line" paint={{ "line-color": "#ffffff", "line-width": 3, "line-opacity": 0.15 }} layout={{ "line-cap": "round", "line-join": "round" }} />
            <Layer id="frontline-main" type="line" paint={{ "line-color": conflict.color, "line-width": 2, "line-opacity": 0.9, "line-dasharray": [4, 3] }} layout={{ "line-cap": "round", "line-join": "round" }} />
          </Source>
        )}

        {/* ── 4. Key location markers ── */}
        {layerVisibility.locations && conflict.keyLocations.map((loc) => (
          <MapDot
            key={`${conflict.id}-loc-${loc.name}`}
            lat={loc.lat}
            lng={loc.lng}
            color={LOCATION_COLORS[loc.type] || "#94a3b8"}
            size={LOCATION_SIZES[loc.type] || 6}
            title={loc.name}
            description={loc.description}
            type={loc.type}
            stroke={loc.type === "capital"}
          />
        ))}

        {/* ── 5. Pulsing event markers (filtered by time) ── */}
        {layerVisibility.events && filteredRecentEvents.map((ev, i) => (
          <MapDot
            key={`${conflict.id}-ev-${i}`}
            lat={ev.lat}
            lng={ev.lng}
            color={EVENT_COLORS[ev.type] || "#ef4444"}
            size={7}
            title={ev.title}
            description={ev.description}
            type={ev.type}
            date={ev.date}
            pulse
          />
        ))}

        {/* ── 5b. UCDP event markers (clustered, always visible) ── */}
        {layerVisibility.events && filteredLiveEvents.map((ev, i) => {
          const tier = ev.tier || "notable";
          const size = tier === "featured" ? 10 : 7;
          return (
            <MapDot
              key={`${conflict.id}-live-${i}`}
              lat={ev.lat}
              lng={ev.lng}
              color={EVENT_COLORS[ev.type] || "#ef4444"}
              size={size}
              title={ev.title}
              description={ev.description}
              type={ev.type}
              date={ev.date}
              pulse
            />
          );
        })}

        {/* ── 6. Other conflict markers ── */}
        {layerVisibility.others && (
          <Source id="other-conflicts" type="geojson" data={otherConflictsData}>
            <Layer id="other-conflicts-circle" type="circle" paint={{
              "circle-radius": 6, "circle-color": ["get", "color"], "circle-opacity": 0.15,
              "circle-stroke-color": ["get", "color"], "circle-stroke-width": 1.5,
            }} />
          </Source>
        )}

        {/* ── 7. Region labels ── */}
        {layerVisibility.labels && conflict.regionLabels && (
          <Source id="region-labels" type="geojson" data={{
            type: "FeatureCollection",
            features: conflict.regionLabels.map((rl) => ({
              type: "Feature" as const,
              properties: { text: rl.text, fontSize: rl.fontSize || 11 },
              geometry: { type: "Point" as const, coordinates: [rl.lng, rl.lat] },
            })),
          }}>
            <Layer id="region-labels-text" type="symbol"
              layout={{ "text-field": ["get", "text"], "text-size": ["get", "fontSize"], "text-font": ["Open Sans Bold"], "text-letter-spacing": 0.3, "text-allow-overlap": true }}
              paint={{ "text-color": "rgba(255, 255, 255, 0.15)", "text-halo-color": "rgba(0, 0, 0, 0.3)", "text-halo-width": 1 }} />
          </Source>
        )}

        {/* ── Popup ── */}
        {popup && (
          <Popup longitude={popup.lng} latitude={popup.lat} closeButton={false} closeOnClick={true} anchor="bottom" offset={14} className="conflict-popup">
            <div style={{ maxWidth: 240 }}>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                {popup.color && (
                  <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: popup.color, boxShadow: `0 0 4px ${popup.color}` }} />
                )}
                {popup.title}
              </div>
              <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.4 }}>{popup.description}</div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
