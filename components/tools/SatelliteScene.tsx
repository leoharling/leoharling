"use client";

import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  twoline2satrec,
  propagate,
  gstime,
  eciToEcf,
  eciToGeodetic,
} from "satellite.js";
import type { SatRec } from "satellite.js";
import { mesh, feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

// ── Constants ──────────────────────────────────────────────
const EARTH_RADIUS = 2;
const REAL_EARTH_KM = 6371;
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
// Altitude exaggeration: sqrt-based so LEO is visible, MEO/GEO stays reasonable
const ALT_SCALE = 0.06;

// ── Shared simulation clock ────────────────────────────────
// Module-level so all components in the scene share one clock.
let _simOffsetMs = 0;
let _timeSpeed = 1;
let _lastRealMs = 0;

function getSimTime(): Date {
  return new Date(Date.now() + _simOffsetMs);
}

// ── Types ──────────────────────────────────────────────────
export interface TLEEntry {
  name: string;
  line1: string;
  line2: string;
}

export interface SatelliteGroup {
  name: string;
  category: string;
  color: string;
  tles: TLEEntry[];
}

export interface NotableSatelliteData extends TLEEntry {
  id: string;
  label: string;
  description: string;
  color: string;
}

export interface SatelliteInfo {
  id: string;
  label: string;
  description: string;
  color: string;
  altitude: number;
  speed: number;
  latitude: number;
  longitude: number;
}

interface SceneProps {
  groups: SatelliteGroup[];
  notable: NotableSatelliteData[];
  visibleConstellations: Record<string, boolean>;
  selectedId: string | null;
  onSelect: (info: SatelliteInfo | null) => void;
  timeSpeed: number;
  highlightedGroup: string | null;
  notableVisible: boolean;
}

// ── Helpers ────────────────────────────────────────────────
// Convert ECEF km coordinates to scene coordinates with altitude exaggeration.
// Earth surface maps to EARTH_RADIUS; altitude above surface uses sqrt scaling
// so LEO orbits (~400-1200km) are clearly visible while GPS (~20200km) stays in frame.
function ecfToVec3(ecf: { x: number; y: number; z: number }): THREE.Vector3 {
  // Raw distance from Earth center in km
  const distKm = Math.sqrt(ecf.x ** 2 + ecf.y ** 2 + ecf.z ** 2);
  const altKm = Math.max(0, distKm - REAL_EARTH_KM);
  // Scene distance: Earth radius + sqrt-exaggerated altitude
  const sceneDist = EARTH_RADIUS + Math.sqrt(altKm) * ALT_SCALE;
  // Direction vector (ECEF → Three.js: x→x, z→y(up), y→z)
  const scale = sceneDist / distKm;
  return new THREE.Vector3(
    ecf.x * scale,
    ecf.z * scale,
    ecf.y * scale
  );
}

function propagateAt(satrec: SatRec, time?: Date) {
  const t = time ?? getSimTime();
  const gmst = gstime(t);
  const posVel = propagate(satrec, t);
  if (!posVel) return null;
  const pos = posVel.position;
  const vel = posVel.velocity;

  if (!pos || typeof pos === "boolean" || !vel || typeof vel === "boolean")
    return null;

  const ecf = eciToEcf(pos, gmst);
  const geo = eciToGeodetic(pos, gmst);
  const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2);

  return {
    position: ecfToVec3(ecf),
    lat: geo.latitude * RAD2DEG,
    lon: geo.longitude * RAD2DEG,
    alt: geo.height,
    speed: speed * 3600,
  };
}

function safeSatrec(line1: string, line2: string): SatRec | null {
  try {
    return twoline2satrec(line1, line2);
  } catch {
    return null;
  }
}

// ── Earth with canvas texture (land/ocean contrast) ────────
function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d")!;

  // Ocean
  ctx.fillStyle = "#070b14";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const world = require("world-atlas/countries-50m.json") as Topology<{
    land: GeometryCollection;
    countries: GeometryCollection;
  }>;

  // Fill land masses
  const landGeo = feature(world, world.objects.land);
  ctx.fillStyle = "#151d2e";

  const features =
    landGeo.type === "FeatureCollection" ? landGeo.features : [landGeo];
  for (const feat of features) {
    const geom = feat.type === "Feature" ? feat.geometry : feat;
    const polys =
      geom.type === "Polygon"
        ? [geom.coordinates]
        : geom.type === "MultiPolygon"
          ? geom.coordinates
          : [];

    for (const polygon of polys) {
      ctx.beginPath();
      for (const ring of polygon) {
        for (let i = 0; i < ring.length; i++) {
          const [lon, lat] = ring[i];
          const x = ((lon + 180) / 360) * canvas.width;
          const y = ((90 - lat) / 180) * canvas.height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      }
      ctx.fill();
    }
  }

  // Draw country borders
  const borders = mesh(world, world.objects.countries);
  ctx.strokeStyle = "#2a4a70";
  ctx.lineWidth = 1.5;

  for (const line of (borders as GeoJSON.MultiLineString).coordinates) {
    ctx.beginPath();
    for (let i = 0; i < line.length; i++) {
      const [lon, lat] = line[i];
      const x = ((lon + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Subtle lat/lon grid
  ctx.strokeStyle = "rgba(60, 100, 160, 0.08)";
  ctx.lineWidth = 0.5;
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let lon = -150; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * canvas.width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Earth() {
  const texture = useMemo(() => createEarthTexture(), []);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS * 1.012, 48, 48]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.035}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// ── GEO belt & orbital reference rings ──────────────────────
function GeoBelt() {
  const geoAlt = 35786;
  const r = EARTH_RADIUS + Math.sqrt(geoAlt) * ALT_SCALE;

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r - 0.12, r + 0.12, 128]} />
      <meshBasicMaterial
        color="#f472b6"
        transparent
        opacity={0.035}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function OrbitalShells() {
  const shells = useMemo(() => {
    const defs = [
      { alt: 2000, color: "#3b82f6", opacity: 0.06 },
      { alt: 20200, color: "#fbbf24", opacity: 0.06 },
      { alt: 35786, color: "#f472b6", opacity: 0.1 },
    ];

    return defs.map((s) => {
      const r = EARTH_RADIUS + Math.sqrt(s.alt) * ALT_SCALE;
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        points.push(
          new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)
        );
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: s.color,
        transparent: true,
        opacity: s.opacity,
      });
      return { alt: s.alt, line: new THREE.Line(geo, mat) };
    });
  }, []);

  return (
    <>
      {shells.map((s) => (
        <primitive key={s.alt} object={s.line} />
      ))}
    </>
  );
}

// ── Time controller ─────────────────────────────────────────
// Advances the shared simulation clock each frame based on timeSpeed.
function TimeController({ speed }: { speed: number }) {
  useFrame(() => {
    _timeSpeed = speed;
    const now = performance.now();
    if (_lastRealMs > 0) {
      const deltaMs = now - _lastRealMs;
      // Only accumulate offset when speed > 1
      _simOffsetMs += deltaMs * (speed - 1);
    }
    _lastRealMs = now;
  });

  // Reset offset when speed returns to 1
  useEffect(() => {
    if (speed === 1) {
      _simOffsetMs = 0;
    }
  }, [speed]);

  return null;
}

// ── Constellation points ───────────────────────────────────
function ConstellationPoints({
  group,
  visible,
  highlighted,
  dimmed,
}: {
  group: SatelliteGroup;
  visible: boolean;
  highlighted: boolean;
  dimmed: boolean;
}) {
  const { satrecs, positions, pointsObj } = useMemo(() => {
    const satrecs = group.tles
      .map((tle) => safeSatrec(tle.line1, tle.line2))
      .filter((s): s is SatRec => s !== null);

    const positions = new Float32Array(satrecs.length * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const isDebris = group.category === "debris";
    const material = new THREE.PointsMaterial({
      color: group.color,
      size: isDebris ? 0.015 : 0.03,
      transparent: true,
      opacity: isDebris ? 0.35 : 0.85,
      sizeAttenuation: true,
    });

    const pointsObj = new THREE.Points(geometry, material);
    return { satrecs, positions, pointsObj };
  }, [group]);

  // Update opacity based on highlight/dim state
  useFrame(() => {
    const mat = pointsObj.material as THREE.PointsMaterial;
    const isDebris = group.category === "debris";
    const baseOpacity = isDebris ? 0.35 : 0.85;
    const baseSize = isDebris ? 0.015 : 0.03;

    if (highlighted) {
      mat.opacity = 1;
      mat.size = baseSize * 1.5;
    } else if (dimmed) {
      mat.opacity = baseOpacity * 0.15;
      mat.size = baseSize;
    } else {
      mat.opacity = baseOpacity;
      mat.size = baseSize;
    }
  });

  useFrame(() => {
    if (!visible) return;

    const now = getSimTime();
    const gmst = gstime(now);

    for (let i = 0; i < satrecs.length; i++) {
      const pv = propagate(satrecs[i], now);
      if (!pv) continue;
      const pos = pv.position;
      if (pos && typeof pos !== "boolean") {
        const ecf = eciToEcf(pos, gmst);
        const v = ecfToVec3(ecf);
        positions[i * 3] = v.x;
        positions[i * 3 + 1] = v.y;
        positions[i * 3 + 2] = v.z;
      }
    }

    pointsObj.geometry.attributes.position.needsUpdate = true;
  });

  if (!visible) return null;

  return <primitive object={pointsObj} />;
}

// ── Notable satellite ──────────────────────────────────────
function NotableSatellite({
  data,
  isSelected,
  onSelect,
}: {
  data: NotableSatelliteData;
  isSelected: boolean;
  onSelect: (info: SatelliteInfo) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const nadirGeoRef = useRef<THREE.BufferGeometry | null>(null);

  const satrec = useMemo(
    () => safeSatrec(data.line1, data.line2),
    [data.line1, data.line2]
  );

  // Orbit trail
  const orbitTrail = useMemo(() => {
    if (!satrec) return null;
    const periodMin = (2 * Math.PI) / satrec.no;
    const now = new Date();
    const points: THREE.Vector3[] = [];
    const steps = 200;

    for (let i = 0; i <= steps; i++) {
      const t = new Date(now.getTime() + (i / steps) * periodMin * 60000);
      const gmst = gstime(t);
      const pv = propagate(satrec, t);
      if (!pv) continue;
      const pos = pv.position;
      if (pos && typeof pos !== "boolean") {
        const ecf = eciToEcf(pos, gmst);
        points.push(ecfToVec3(ecf));
      }
    }

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.2,
    });
    return new THREE.Line(geo, mat);
  }, [satrec, data.color]);

  // Nadir line
  const nadirLine = useMemo(() => {
    const positions = new Float32Array(6);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    nadirGeoRef.current = geo;

    const mat = new THREE.LineDashedMaterial({
      color: "#ffffff",
      dashSize: 0.04,
      gapSize: 0.03,
      transparent: true,
      opacity: 0.25,
    });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    return line;
  }, []);

  useFrame(() => {
    if (!satrec || !groupRef.current) return;
    const result = propagateAt(satrec);
    if (!result) return;

    groupRef.current.position.copy(result.position);

    // Update nadir line
    if (isSelected && nadirGeoRef.current) {
      const attr = nadirGeoRef.current.getAttribute(
        "position"
      ) as THREE.BufferAttribute;
      const ground = result.position
        .clone()
        .normalize()
        .multiplyScalar(EARTH_RADIUS);
      attr.setXYZ(0, result.position.x, result.position.y, result.position.z);
      attr.setXYZ(1, ground.x, ground.y, ground.z);
      attr.needsUpdate = true;
      nadirLine.computeLineDistances();
    }
  });

  const handleClick = useCallback(
    (e: THREE.Event & { stopPropagation?: () => void }) => {
      if (e.stopPropagation) e.stopPropagation();
      if (!satrec) return;
      const result = propagateAt(satrec);
      if (!result) return;
      onSelect({
        id: data.id,
        label: data.label,
        description: data.description,
        color: data.color,
        altitude: Math.round(result.alt),
        speed: Math.round(result.speed),
        latitude: Math.round(result.lat * 100) / 100,
        longitude: Math.round(result.lon * 100) / 100,
      });
    },
    [satrec, data, onSelect]
  );

  if (!satrec) return null;

  return (
    <>
      {orbitTrail && <primitive object={orbitTrail} />}
      {isSelected && <primitive object={nadirLine} />}

      <group ref={groupRef}>
        <mesh
          onClick={handleClick}
          onPointerOver={() => {
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "default";
          }}
        >
          <sphereGeometry
            args={[hovered || isSelected ? 0.035 : 0.025, 12, 12]}
          />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={isSelected ? 1 : 0.9}
          />
        </mesh>

        {isSelected && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.05, 0.065, 32]} />
            <meshBasicMaterial
              color={data.color}
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {(hovered || isSelected) && (
          <Html distanceFactor={8} style={{ pointerEvents: "none" }}>
            <div className="whitespace-nowrap rounded-lg bg-card/95 px-3 py-1.5 text-xs font-medium text-foreground border border-white/10 backdrop-blur-sm shadow-lg">
              <span
                className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: data.color }}
              />
              {data.label}
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

// ── Camera controller ──────────────────────────────────────
// Only takes over the camera when a satellite is selected or
// briefly when returning from a selection. Otherwise hands off
// completely so OrbitControls can work freely.
function CameraController({
  selectedSatrec,
  controlsRef,
}: {
  selectedSatrec: SatRec | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const isReturning = useRef(false);
  const prevSatrec = useRef<SatRec | null>(null);
  const returnTarget = useRef(new THREE.Vector3(0, 3, 8));
  const returnLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Detect deselection → snapshot current camera and start returning
    if (prevSatrec.current && !selectedSatrec) {
      isReturning.current = true;
      // Return to a sensible default from wherever we are
      returnTarget.current.set(0, 3, 8);
      returnLookAt.current.set(0, 0, 0);
    }
    prevSatrec.current = selectedSatrec;

    if (selectedSatrec) {
      // Follow selected satellite
      isReturning.current = false;
      const result = propagateAt(selectedSatrec);
      if (result) {
        const dir = result.position.clone().normalize();
        const dist = result.position.length();
        const offset = Math.max(0.4, dist * 0.2);
        const targetPos = result.position
          .clone()
          .add(dir.multiplyScalar(offset));

        camera.position.lerp(targetPos, 0.025);
        controls.target.lerp(result.position, 0.025);
        controls.update();
      }
    } else if (isReturning.current) {
      // Briefly return to default, then stop
      camera.position.lerp(returnTarget.current, 0.03);
      controls.target.lerp(returnLookAt.current, 0.03);
      controls.update();

      if (camera.position.distanceTo(returnTarget.current) < 0.15) {
        isReturning.current = false;
      }
    }
    // When idle: do nothing — OrbitControls has full control
  });

  return null;
}

// ── Main scene ─────────────────────────────────────────────
function Scene({
  groups,
  notable,
  visibleConstellations,
  selectedId,
  onSelect,
  timeSpeed,
  highlightedGroup,
  notableVisible,
}: SceneProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  const satrecMap = useMemo(() => {
    const map = new Map<string, SatRec>();
    for (const n of notable) {
      const sr = safeSatrec(n.line1, n.line2);
      if (sr) map.set(n.id, sr);
    }
    return map;
  }, [notable]);

  // When selectedId changes from page (legend click), compute info and report
  const prevSelectedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedId && selectedId !== prevSelectedIdRef.current) {
      const sr = satrecMap.get(selectedId);
      const nd = notable.find((n) => n.id === selectedId);
      if (sr && nd) {
        const result = propagateAt(sr);
        if (result) {
          onSelect({
            id: nd.id,
            label: nd.label,
            description: nd.description,
            color: nd.color,
            altitude: Math.round(result.alt),
            speed: Math.round(result.speed),
            latitude: Math.round(result.lat * 100) / 100,
            longitude: Math.round(result.lon * 100) / 100,
          });
        }
      }
    }
    prevSelectedIdRef.current = selectedId;
  }, [selectedId, satrecMap, notable, onSelect]);

  const handleSatelliteClick = useCallback(
    (info: SatelliteInfo) => {
      onSelect(info);
    },
    [onSelect]
  );

  const handleMiss = useCallback(() => {
    onSelect(null);
  }, [onSelect]);

  return (
    <>
      <TimeController speed={timeSpeed} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={0.5} />

      {/* Click background to deselect */}
      <mesh onClick={handleMiss}>
        <sphereGeometry args={[50, 8, 8]} />
        <meshBasicMaterial visible={false} side={THREE.BackSide} />
      </mesh>

      <Earth />
      <GeoBelt />
      <OrbitalShells />

      {groups.map((g) => (
        <ConstellationPoints
          key={g.name}
          group={g}
          visible={visibleConstellations[g.name] ?? true}
          highlighted={highlightedGroup === g.name}
          dimmed={highlightedGroup !== null && highlightedGroup !== g.name}
        />
      ))}

      {notableVisible && notable.map((n) => (
        <NotableSatellite
          key={n.id}
          data={n}
          isSelected={selectedId === n.id}
          onSelect={handleSatelliteClick}
        />
      ))}

      <CameraController
        selectedSatrec={
          selectedId ? (satrecMap.get(selectedId) ?? null) : null
        }
        controlsRef={controlsRef}
      />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={2.5}
        maxDistance={25}
        autoRotate={!selectedId}
        autoRotateSpeed={0.3}
      />
    </>
  );
}

// ── Wrapper ────────────────────────────────────────────────
export default function SatelliteSceneWrapper(
  props: Omit<SceneProps, "onSelect" | "timeSpeed" | "highlightedGroup" | "notableVisible"> & {
    onSelect: (info: SatelliteInfo | null) => void;
    timeSpeed?: number;
    highlightedGroup?: string | null;
    notableVisible?: boolean;
  }
) {
  return (
    <Canvas
      camera={{ position: [0, 3, 8], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Scene
        {...props}
        timeSpeed={props.timeSpeed ?? 1}
        highlightedGroup={props.highlightedGroup ?? null}
        notableVisible={props.notableVisible ?? true}
      />
    </Canvas>
  );
}
