"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import {
  SPACEPORT_LOCATIONS,
  latLonToVector3,
  type SpaceportLocation,
} from "@/lib/spaceports";
import { getTrajectoryTemplate } from "@/lib/trajectory-templates";
import type { TrajectoryTemplate } from "@/lib/trajectory-templates";

const EARTH_RADIUS = 2;

// ── Launch interface (copied from launch tracker page) ────
interface Launch {
  id: string;
  name: string;
  net: string;
  status: { name: string };
  launch_service_provider: { name: string };
  rocket: { configuration: { name: string } };
  pad: { name: string; location: { name: string } };
  image?: { image_url?: string } | null;
  mission?: {
    description?: string;
    type?: string;
    orbit?: { name?: string; abbrev?: string };
  } | null;
}

// ── Earth ─────────────────────────────────────────────────
function Earth() {
  // Progressive texture loading: start with 1k placeholder, then load full res
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const placeholder = useLoader(
    THREE.TextureLoader,
    "/textures/earth-blue-marble-1k.jpg"
  );
  const [fullTexture, setFullTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const path = isMobile
      ? "/textures/earth-blue-marble-4k.jpg"
      : "/textures/earth-blue-marble-8k.jpg";
    loader.load(path, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setFullTexture(tex);
    });
  }, [isMobile]);

  const texture = fullTexture ?? placeholder;
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <group>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, 128, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS * 1.015, 48, 48]} />
        <meshBasicMaterial
          color="#4a9eff"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// ── SpaceportMarker ───────────────────────────────────────
function SpaceportMarker({
  location,
  isSelected,
  launchCount,
  onClick,
}: {
  location: SpaceportLocation;
  isSelected: boolean;
  launchCount: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const position = useMemo(
    () => latLonToVector3(location.lat, location.lon, EARTH_RADIUS * 1.005),
    [location.lat, location.lon]
  );

  return (
    <group position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[isSelected ? 0.035 : 0.02, 12, 12]} />
        <meshBasicMaterial
          color={isSelected ? "#22d3ee" : "#4ade80"}
          transparent
          opacity={hovered || isSelected ? 1 : 0.8}
        />
      </mesh>
      {/* Pulse ring */}
      {(hovered || isSelected) && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.025, 0.045, 24]} />
          <meshBasicMaterial
            color={isSelected ? "#22d3ee" : "#4ade80"}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      {/* Tooltip — fixed screen size, no distance scaling */}
      {(hovered || isSelected) && (
        <Html style={{ pointerEvents: "none", transform: "translate(-50%, -120%)" }} center={false}>
          <div className="whitespace-nowrap rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-medium text-white/90 border border-white/10" style={{ fontSize: 9 }}>
            {location.name.split(",")[0]}
            {launchCount > 0 && (
              <span className="text-white/50 ml-1">· {launchCount}</span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// ── CameraController ──────────────────────────────────────
// Three modes:
// - spaceport selected: zoom in close to the pad
// - launch selected: pull back and tilt to show the trajectory arc
// - nothing selected: default view, hand off to OrbitControls
function CameraController({
  target,
  trajectoryView,
  controlsRef,
}: {
  target: [number, number, number] | null;
  trajectoryView: { padLat: number; padLon: number; azimuthDeg: number } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const goalPos = useRef(new THREE.Vector3(0, 2, 5));
  const goalLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const framesLeft = useRef(0); // finite frame count, not distance-based

  // Stable keys to detect real changes
  const tvKey = trajectoryView ? `${trajectoryView.padLat},${trajectoryView.padLon},${trajectoryView.azimuthDeg}` : null;
  const tKey = target ? target.join(",") : null;

  useEffect(() => {
    if (trajectoryView) {
      // Position camera so the launch site is centered but we're far enough
      // to see the ascent and the start of the orbit. The user can zoom out
      // further to see the full orbit.
      const padPos = new THREE.Vector3(
        ...latLonToVector3(trajectoryView.padLat, trajectoryView.padLon, EARTH_RADIUS)
      );
      const padDir = padPos.clone().normalize();

      // Camera directly above the pad area, pulled out to a comfortable distance
      goalPos.current.copy(padDir.clone().multiplyScalar(EARTH_RADIUS + 3.0));
      goalLookAt.current.copy(padDir.clone().multiplyScalar(EARTH_RADIUS));
    } else if (target) {
      const dir = new THREE.Vector3(...target).normalize();
      goalPos.current.copy(dir.multiplyScalar(EARTH_RADIUS + 1.5));
      goalLookAt.current.set(...(target as [number, number, number]));
    } else {
      goalPos.current.set(0, 2, 5);
      goalLookAt.current.set(0, 0, 0);
    }
    // Animate for exactly 60 frames (~1s at 60fps), then stop completely
    framesLeft.current = 60;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tvKey, tKey]);

  useFrame(() => {
    if (framesLeft.current <= 0 || !controlsRef.current) return;
    framesLeft.current--;

    camera.position.lerp(goalPos.current, 0.08);
    controlsRef.current.target.lerp(goalLookAt.current, 0.08);
    controlsRef.current.update();
    // After 60 frames: completely stop. OrbitControls takes over.
  });

  return null;
}

// ── Range safety corridors ────────────────────────────────
// Rockets must fly over ocean. Returns [minAz, maxAz] in degrees.
function getSafeAzimuthRange(lat: number, lon: number): [number, number] {
  if (lon > -85 && lon < -70 && lat > 20 && lat < 45) return [35, 120];    // US East Coast
  if (lon >= -125 && lon < -110 && lat > 25 && lat < 45) return [170, 250]; // US West Coast
  if (lon > -100 && lon < -90 && lat > 24 && lat < 30) return [80, 120];   // Boca Chica
  if (lon < -140 && lat > 50) return [170, 230];                            // Kodiak
  if (lon > -55 && lon < -48 && lat > 0 && lat < 10) return [0, 100];      // Kourou
  if (lon > 55 && lon < 75 && lat > 40 && lat < 50) return [30, 100];      // Baikonur
  if (lon > 35 && lon < 50 && lat > 60) return [0, 80];                    // Plesetsk
  if (lon > 13 && lon < 19 && lat > 68 && lat < 71) return [285, 360];    // Andøya (NW over Norwegian Sea)
  if (lon > 19 && lon < 23 && lat > 66 && lat < 69) return [280, 360];    // Esrange (NW over Norwegian Sea)
  if (lon > 125 && lon < 140 && lat > 45 && lat < 55) return [50, 120];    // Vostochny
  if (lon > 75 && lon < 85 && lat > 10 && lat < 20) return [80, 140];      // India
  if (lon > 128 && lon < 135 && lat > 28 && lat < 35) return [150, 220];   // Japan
  if (lon > 125 && lon < 130 && lat > 33 && lat < 36) return [160, 210];   // S. Korea
  if (lon > 108 && lon < 112 && lat > 18 && lat < 21) return [100, 180];   // Wenchang
  if (lon > 95 && lon < 108 && lat > 25 && lat < 45) return [110, 180];    // China inland
  if (lon > 34 && lon < 36 && lat > 31 && lat < 33) return [250, 310];     // Israel
  if (lon > 175 && lat < -35) return [30, 120];                             // NZ
  if (lon > -50 && lon < -40 && lat > -5 && lat < 0) return [0, 80];       // Brazil
  return [0, 360];
}

function clampAzimuth(azDeg: number, range: [number, number]): number {
  const az = ((azDeg % 360) + 360) % 360;
  const [min, max] = range;
  if (max > 360) {
    if (az >= min || az <= max - 360) return az;
  } else {
    if (az >= min && az <= max) return az;
  }
  const d1 = Math.min(Math.abs(az - min), Math.abs(az - min + 360), Math.abs(az - min - 360));
  const d2 = Math.min(Math.abs(az - max), Math.abs(az - max + 360), Math.abs(az - max - 360));
  return ((d1 <= d2 ? min : max) % 360 + 360) % 360;
}

// ── Shared: compute ascent + insertion from pad ──────────
function computeAscent(padLat: number, padLon: number, inclDeg: number, parkingAlt: number) {
  const latRad = (padLat * Math.PI) / 180;
  const inclRad = (inclDeg * Math.PI) / 180;
  const padPos = new THREE.Vector3(...latLonToVector3(padLat, padLon, EARTH_RADIUS * 1.005));
  const padUp = padPos.clone().normalize();
  const worldY = new THREE.Vector3(0, 1, 0);
  const padEast = new THREE.Vector3().crossVectors(worldY, padUp).normalize();
  if (padEast.lengthSq() < 0.001) padEast.set(1, 0, 0);
  const padNorth = new THREE.Vector3().crossVectors(padUp, padEast).normalize();

  const cosLat = Math.cos(latRad);
  let optAzDeg = 90;
  if (cosLat > 0.001) {
    const sinAz = Math.max(-1, Math.min(1, Math.cos(inclRad) / cosLat));
    let azRad = Math.asin(sinAz);
    if (inclDeg > 90) {
      // High-latitude northern sites (>55°N, e.g. Andøya, Esrange): retrograde orbits
      // head NW/N over the sea — use the 2π+azRad solution (~337° for Andøya SSO).
      // Lower-latitude sites (e.g. Vandenberg 34.6°N): SW solution (π - azRad) is correct.
      azRad = padLat > 55 ? (2 * Math.PI + azRad) : (Math.PI - azRad);
    }
    optAzDeg = (azRad * 180) / Math.PI;
  }
  const safeRange = getSafeAzimuthRange(padLat, padLon);
  const launchAzDeg = clampAzimuth(optAzDeg, safeRange);
  const launchAzRad = (launchAzDeg * Math.PI) / 180;

  const downrange = new THREE.Vector3()
    .addScaledVector(padNorth, Math.cos(launchAzRad))
    .addScaledVector(padEast, Math.sin(launchAzRad))
    .normalize();
  const pitchAxis = new THREE.Vector3().crossVectors(padUp, downrange).normalize();

  return { padUp, padEast, padNorth, downrange, pitchAxis, launchAzDeg };
}

function computeTargetNormal(insDir: THREE.Vector3, parkN: THREE.Vector3, inclDeg: number) {
  const inclRad = (inclDeg * Math.PI) / 180;
  const cosI = Math.cos(inclRad), sinI = Math.sin(inclRad);
  const Ax = insDir.x, By = insDir.y, Cz = insDir.z;
  const Rxz = Math.sqrt(Ax * Ax + Cz * Cz);

  if (Rxz > 0.001 && Math.abs(sinI) > 0.001) {
    const ratio = (-cosI * By / sinI) / Rxz;
    const phi = Math.atan2(Cz, Ax);
    if (Math.abs(ratio) <= 1) {
      const a1 = phi + Math.acos(Math.max(-1, Math.min(1, ratio)));
      const a2 = phi - Math.acos(Math.max(-1, Math.min(1, ratio)));
      const n1 = new THREE.Vector3(sinI * Math.cos(a1), cosI, sinI * Math.sin(a1)).normalize();
      const n2 = new THREE.Vector3(sinI * Math.cos(a2), cosI, sinI * Math.sin(a2)).normalize();
      const targN = (Math.abs(parkN.dot(n1)) > Math.abs(parkN.dot(n2))) ? n1 : n2;
      if (parkN.dot(targN) < 0) targN.negate();
      return targN;
    }
  }
  return parkN.clone();
}

// ── LaunchTrajectory ──────────────────────────────────────
// Three visualization models based on orbit category:
//
// CIRCULAR (LEO/SSO/Polar):
//   ascent → direct insertion into circular Earth orbit at target altitude
//
// TRANSFER (GTO/MEO/HEO):
//   ascent → parking orbit coast → transfer burn → elliptical arc
//   rising to apogee at target altitude
//
// ESCAPE (Lunar/Interplanetary):
//   ascent → parking orbit coast → injection burn → hyperbolic arc
//   departing Earth (shown as a spiral outward)
//
function LaunchTrajectory({
  padLat,
  padLon,
  template,
}: {
  padLat: number;
  padLon: number;
  template: TrajectoryTemplate;
}) {
  const PARKING_ALT = 0.08;
  const PARKING_R = EARTH_RADIUS + PARKING_ALT;

  const { ascentPts, orbitPts, stagingMarkers } = useMemo(() => {
    const { padUp, pitchAxis } = computeAscent(padLat, padLon, template.inclinationDeg, PARKING_ALT);

    // ── Ascent (shared by all categories) ────────────────
    const arcAngle = Math.PI * 0.15;
    const raw: THREE.Vector3[] = [];
    for (const [p, af] of template.ascentProfile) {
      const alt = EARTH_RADIUS * 1.005 + af * PARKING_ALT;
      const po = Math.min(p * 2.5, 1);
      const ga = po * p * arcAngle;
      raw.push(padUp.clone().applyAxisAngle(pitchAxis, ga).multiplyScalar(alt));
    }
    const ascent = new THREE.CatmullRomCurve3(raw).getPoints(80);

    // Insertion point & velocity
    const insDir = ascent[ascent.length - 1].clone().normalize();
    const insVel = ascent[ascent.length - 1].clone().sub(ascent[ascent.length - 2]).normalize();
    const parkN = new THREE.Vector3().crossVectors(insDir, insVel).normalize();
    const targN = computeTargetNormal(insDir, parkN, template.inclinationDeg);

    // ── Generate orbital path per category ────────────────
    const orbit: THREE.Vector3[] = [];
    const S = 200;
    const cat = template.category;

    if (cat === "circular") {
      // ─── CIRCULAR: LEO / SSO / Polar ───────────────────
      // Direct insertion, full orbit at target altitude.
      // Smooth plane change over first 20%, rise to target alt quickly.
      const targetAlt = 0.15 + Math.min(template.altitudeKm / 35786, 1) * 0.6;
      const targetR = EARTH_RADIUS + targetAlt;
      const fullArc = Math.PI * 1.95;

      for (let i = 0; i <= S; i++) {
        const t = i / S;
        const angle = t * fullArc;
        const pct = Math.min(t / 0.2, 1);
        const smooth = pct * pct * (3 - 2 * pct);
        const normal = parkN.clone().lerp(targN, smooth).normalize();
        const r = PARKING_R + Math.min(t * 3, 1) * (targetR - PARKING_R);
        orbit.push(insDir.clone().applyAxisAngle(normal, angle).multiplyScalar(r));
      }

    } else if (cat === "transfer") {
      // ─── TRANSFER: GTO / MEO / HEO ────────────────────
      // Phase 1: coast in parking orbit ~90° (coast to transfer burn point)
      // Phase 2: transfer burn — radius rises from perigee to apogee
      //          following an elliptical profile
      // Phase 3: coast at apogee altitude
      const targetAlt = 0.15 + Math.min(template.altitudeKm / 35786, 1) * 0.6;
      const targetR = EARTH_RADIUS + targetAlt;
      const fullArc = Math.PI * 1.9;

      const coastFrac = 0.15;   // 15% in parking orbit
      const transferFrac = 0.5; // next 50% is the transfer ellipse
      // remaining 35% at apogee

      for (let i = 0; i <= S; i++) {
        const t = i / S;
        const angle = t * fullArc;

        // Plane change during transfer phase
        const pct = Math.min(t / (coastFrac + transferFrac), 1);
        const smooth = pct * pct * (3 - 2 * pct);
        const normal = parkN.clone().lerp(targN, smooth).normalize();

        let r: number;
        if (t < coastFrac) {
          // Phase 1: parking orbit coast
          r = PARKING_R;
        } else if (t < coastFrac + transferFrac) {
          // Phase 2: transfer — sinusoidal rise (elliptical shape)
          const tf = (t - coastFrac) / transferFrac;
          const elliptical = 0.5 - 0.5 * Math.cos(tf * Math.PI);
          r = PARKING_R + elliptical * (targetR - PARKING_R);
        } else {
          // Phase 3: at apogee altitude
          r = targetR;
        }

        orbit.push(insDir.clone().applyAxisAngle(normal, angle).multiplyScalar(r));
      }

    } else {
      // ─── ESCAPE: Lunar / Interplanetary ─────────────────
      // Phase 1: coast in parking orbit ~120° to injection point
      // Phase 2: injection burn — hyperbolic departure, radius increases
      //          rapidly and continuously (no closed orbit)
      const fullArc = Math.PI * 1.5; // less than full orbit — it's escaping

      const coastFrac = 0.25;  // 25% in parking orbit
      const escapeR = EARTH_RADIUS + 2.5; // visual limit of the escape arc

      for (let i = 0; i <= S; i++) {
        const t = i / S;
        const angle = t * fullArc;

        // Slight plane change during injection
        const pct = Math.min(t / 0.4, 1);
        const smooth = pct * pct * (3 - 2 * pct);
        const normal = parkN.clone().lerp(targN, smooth).normalize();

        let r: number;
        if (t < coastFrac) {
          // Parking orbit coast
          r = PARKING_R;
        } else {
          // Hyperbolic departure — accelerating outward
          const ef = (t - coastFrac) / (1 - coastFrac);
          // Exponential-ish growth for hyperbolic feel
          r = PARKING_R + (escapeR - PARKING_R) * (1 - Math.exp(-3 * ef));
        }

        orbit.push(insDir.clone().applyAxisAngle(normal, angle).multiplyScalar(r));
      }
    }

    // Staging markers (skip Liftoff at pad)
    const markers = template.stagingEvents
      .filter((e) => e.progressFraction > 0)
      .map((evt) => ({
        position: ascent[Math.min(Math.floor(evt.progressFraction * (ascent.length - 1)), ascent.length - 1)],
        label: evt.label,
      }));

    return { ascentPts: ascent, orbitPts: orbit, stagingMarkers: markers };
  }, [padLat, padLon, template]);

  // ── Render: solid ascent tube, dashed orbit line ────────
  const ascentTube = useMemo(() => {
    if (ascentPts.length < 2) return null;
    const c = new THREE.CatmullRomCurve3(ascentPts);
    return new THREE.Mesh(
      new THREE.TubeGeometry(c, 64, 0.01, 8, false),
      new THREE.MeshBasicMaterial({ color: "#f59e0b", side: THREE.DoubleSide })
    );
  }, [ascentPts]);

  const orbitColor = template.category === "escape" ? "#a78bfa" : "#60a5fa";

  const orbitLine = useMemo(() => {
    if (orbitPts.length < 2) return null;
    const g = new THREE.BufferGeometry().setFromPoints(orbitPts);
    const m = new THREE.LineDashedMaterial({
      color: orbitColor,
      dashSize: 0.05,
      gapSize: 0.03,
    });
    const l = new THREE.Line(g, m);
    l.computeLineDistances();
    return l;
  }, [orbitPts, orbitColor]);

  const insertionLabel =
    template.category === "circular" ? "Orbit insertion" :
    template.category === "transfer" ? "Transfer burn" :
    "Injection burn";

  return (
    <group>
      {ascentTube && <primitive object={ascentTube} />}
      {orbitLine && <primitive object={orbitLine} />}
      {stagingMarkers.map((m, i) => (
        <group key={i} position={m.position}>
          <mesh>
            <sphereGeometry args={[0.005, 8, 8]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.15} />
          </mesh>
          <Html style={{ pointerEvents: "none", transform: "translate(8px, -50%)" }} center={false}>
            <div className="whitespace-nowrap rounded bg-black/85 px-1.5 py-0.5 border border-amber-500/30 leading-none shadow-lg shadow-amber-500/10" style={{ fontSize: 10 }}>
              <span className="text-amber-300">{m.label}</span>
            </div>
          </Html>
        </group>
      ))}
      {ascentPts.length > 0 && (
        <group position={ascentPts[ascentPts.length - 1]}>
          <mesh>
            <sphereGeometry args={[0.006, 10, 10]} />
            <meshBasicMaterial color={orbitColor} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.015, 10, 10]} />
            <meshBasicMaterial color={orbitColor} transparent opacity={0.15} />
          </mesh>
          <Html style={{ pointerEvents: "none", transform: "translate(8px, -50%)" }} center={false}>
            <div className="whitespace-nowrap rounded bg-black/85 px-1.5 py-0.5 border border-blue-500/30 leading-none shadow-lg shadow-blue-500/10" style={{ fontSize: 10 }}>
              <span style={{ color: orbitColor }}>{insertionLabel}</span>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

// ── SpaceportGlobe (main export) ──────────────────────────
interface SpaceportGlobeProps {
  launches: Launch[];
}

export default function SpaceportGlobe({ launches }: SpaceportGlobeProps) {
  const [selectedLocation, setSelectedLocation] =
    useState<SpaceportLocation | null>(null);
  const [selectedLaunch, setSelectedLaunch] = useState<Launch | null>(null);
  const [showAll, setShowAll] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  // Count launches per location
  const launchCountByLocation = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const launch of launches) {
      const locName = launch.pad?.location?.name;
      if (locName) counts[locName] = (counts[locName] || 0) + 1;
    }
    return counts;
  }, [launches]);

  // Filter spaceports: only with upcoming launches unless "show all" toggled
  const visibleLocations = useMemo(() => {
    if (showAll) return SPACEPORT_LOCATIONS;
    return SPACEPORT_LOCATIONS.filter(
      (loc) => (launchCountByLocation[loc.name] || 0) > 0
    );
  }, [launchCountByLocation, showAll]);

  // Launches for selected location
  const locationLaunches = useMemo(() => {
    if (!selectedLocation) return [];
    return launches.filter(
      (l) => l.pad?.location?.name === selectedLocation.name
    );
  }, [launches, selectedLocation]);

  // Camera: zoom to spaceport when selected, or pull back for trajectory view
  const cameraTarget = useMemo(() => {
    if (!selectedLocation || selectedLaunch) return null;
    return latLonToVector3(
      selectedLocation.lat,
      selectedLocation.lon,
      EARTH_RADIUS * 1.005
    );
  }, [selectedLocation, selectedLaunch]);

  const trajectoryTemplate = useMemo(() => {
    if (!selectedLaunch) return null;
    return getTrajectoryTemplate(selectedLaunch.mission?.orbit?.abbrev);
  }, [selectedLaunch]);

  // Compute launch azimuth for camera positioning
  const trajectoryView = useMemo(() => {
    if (!selectedLaunch || !selectedLocation) return null;
    const latRad = (selectedLocation.lat * Math.PI) / 180;
    const inclRad = ((trajectoryTemplate?.inclinationDeg ?? 51.6) * Math.PI) / 180;
    const cosLat = Math.cos(latRad);
    let optAzDeg = 90;
    if (cosLat > 0.001) {
      const sinAz = Math.max(-1, Math.min(1, Math.cos(inclRad) / cosLat));
      let azRad = Math.asin(sinAz);
      if ((trajectoryTemplate?.inclinationDeg ?? 0) > 90) {
        azRad = selectedLocation.lat > 55 ? (2 * Math.PI + azRad) : (Math.PI - azRad);
      }
      optAzDeg = (azRad * 180) / Math.PI;
    }
    const safeRange = getSafeAzimuthRange(selectedLocation.lat, selectedLocation.lon);
    const azDeg = clampAzimuth(optAzDeg, safeRange);
    return { padLat: selectedLocation.lat, padLon: selectedLocation.lon, azimuthDeg: azDeg };
  }, [selectedLaunch, selectedLocation, trajectoryTemplate]);

  return (
    <div className="relative h-full w-full overflow-x-hidden max-md:flex max-md:flex-col">
      {/* Canvas area — takes all remaining space above panel on mobile */}
      <div className="relative h-full w-full flex-1 min-h-0">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "#030712" }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 3, 5]} intensity={0.8} />
        <Suspense
          fallback={
            <Html center>
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-muted-foreground mt-2">Loading Earth...</p>
              </div>
            </Html>
          }
        >
          <Earth />
          {visibleLocations.map((loc) => (
            <SpaceportMarker
              key={loc.id}
              location={loc}
              isSelected={selectedLocation?.id === loc.id}
              launchCount={launchCountByLocation[loc.name] || 0}
              onClick={() => {
                setSelectedLocation(
                  selectedLocation?.id === loc.id ? null : loc
                );
                setSelectedLaunch(null);
              }}
            />
          ))}
          {selectedLaunch && trajectoryTemplate && selectedLocation && (
            <LaunchTrajectory
              padLat={selectedLocation.lat}
              padLon={selectedLocation.lon}
              template={trajectoryTemplate}
            />
          )}
        </Suspense>
        <Stars
          radius={100}
          depth={50}
          count={2000}
          factor={4}
          fade
          speed={1}
        />
        <CameraController target={cameraTarget} trajectoryView={trajectoryView} controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={2.15}
          maxDistance={12}
          autoRotate={!selectedLocation}
          autoRotateSpeed={0.3}
        />
      </Canvas>

      {/* Filter toggle */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <button
          onClick={() => setShowAll(!showAll)}
          className={`rounded-lg px-2.5 py-1.5 text-[10px] font-medium border backdrop-blur-sm transition-colors ${
            showAll
              ? "bg-white/10 border-white/20 text-foreground"
              : "bg-black/60 border-white/10 text-muted-foreground"
          }`}
        >
          {showAll ? "All spaceports" : "With launches"}
        </button>
        <span className="text-[10px] text-muted-foreground/60">
          {visibleLocations.length} sites
        </span>
      </div>

      {/* Loading indicator */}
      {launches.length === 0 && (
        <p className="absolute bottom-4 left-4 text-xs text-muted-foreground z-10">
          Loading launch data...
        </p>
      )}
      </div>

      {/* Side panel for launches at selected location */}
      {selectedLocation && (
        <div className="absolute top-4 right-4 bottom-4 w-80 overflow-y-auto rounded-xl bg-card/90 backdrop-blur-md border border-white/10 p-4 space-y-3 max-md:static max-md:w-full max-md:shrink-0 max-md:h-[50vh] max-md:rounded-t-xl max-md:rounded-b-none max-md:border-l-0 max-md:border-r-0 max-md:border-b-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">
                {selectedLocation.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {selectedLocation.country} · {selectedLocation.pads.length} pad
                {selectedLocation.pads.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedLocation(null);
                setSelectedLaunch(null);
              }}
              className="p-1 rounded hover:bg-white/10"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>

          {/* Selected launch detail */}
          {selectedLaunch && trajectoryTemplate && (
            <div className="space-y-2">
              <button
                onClick={() => setSelectedLaunch(null)}
                className="text-[10px] text-accent hover:text-accent/80 flex items-center gap-1"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M6 2L3 5L6 8" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                Back to launches
              </button>
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 space-y-2">
                <p className="text-xs font-semibold">{selectedLaunch.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {selectedLaunch.rocket.configuration.name}
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">Orbit</p>
                    <p className="text-[11px] font-medium text-blue-400">{trajectoryTemplate.orbitName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">Altitude</p>
                    <p className="text-[11px] font-medium">{trajectoryTemplate.altitudeKm.toLocaleString()} km</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">Inclination</p>
                    <p className="text-[11px] font-medium">{trajectoryTemplate.inclinationDeg}°</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">Date</p>
                    <p className="text-[11px] font-medium">
                      {new Date(selectedLaunch.net).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                {selectedLaunch.mission?.description && (
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 line-clamp-3">
                    {selectedLaunch.mission.description}
                  </p>
                )}
              </div>
              {/* Legend */}
              <div className="flex items-center gap-3 text-[9px] text-muted-foreground/70 pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-amber-400 rounded-full inline-block" /> Ascent
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-blue-400 rounded-full inline-block opacity-50" style={{ borderBottom: "1px dashed" }} /> Orbit
                </span>
              </div>
            </div>
          )}

          {/* Launch list */}
          {!selectedLaunch && locationLaunches.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No upcoming launches
            </p>
          ) : !selectedLaunch ? (
            locationLaunches.map((launch) => (
              <button
                key={launch.id}
                onClick={() => setSelectedLaunch(launch)}
                className="w-full text-left rounded-lg border p-3 transition-colors border-white/5 hover:border-white/15 bg-white/5"
              >
                <p className="text-xs font-medium truncate">{launch.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {launch.rocket.configuration.name}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(launch.net).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {launch.mission?.orbit?.abbrev && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent">
                      {launch.mission.orbit.abbrev}
                    </span>
                  )}
                </div>
              </button>
            ))
          ) : null}
        </div>
      )}
    </div>
  );
}
