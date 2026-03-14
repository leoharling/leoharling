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
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
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
// Animates to target then stops. OrbitControls always remains enabled.
function CameraController({
  target,
  controlsRef,
}: {
  target: [number, number, number] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const goalPos = useRef(new THREE.Vector3(0, 2, 5));
  const goalLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const animating = useRef(false);

  useEffect(() => {
    if (target) {
      const targetVec = new THREE.Vector3(...target);
      const dir = targetVec.clone().normalize();
      goalPos.current.copy(dir.multiplyScalar(EARTH_RADIUS + 1.5));
      goalLookAt.current.copy(targetVec);
    } else {
      goalPos.current.set(0, 2, 5);
      goalLookAt.current.set(0, 0, 0);
    }
    animating.current = true;
  }, [target]);

  useFrame(() => {
    if (!animating.current || !controlsRef.current) return;

    camera.position.lerp(goalPos.current, 0.06);
    controlsRef.current.target.lerp(goalLookAt.current, 0.06);
    controlsRef.current.update();

    if (camera.position.distanceTo(goalPos.current) < 0.01) {
      animating.current = false;
    }
  });

  return null;
}

// ── LaunchTrajectory ──────────────────────────────────────
function LaunchTrajectory({
  padLat,
  padLon,
  template,
}: {
  padLat: number;
  padLon: number;
  template: TrajectoryTemplate;
}) {
  const points = useMemo(() => {
    const start = new THREE.Vector3(
      ...latLonToVector3(padLat, padLon, EARTH_RADIUS * 1.005)
    );
    const altScale = Math.min(template.altitudeKm / 35786, 1); // normalize to GTO max
    const maxHeight = EARTH_RADIUS * (0.3 + altScale * 1.2);

    // Build curve from ascent profile
    const curvePoints: THREE.Vector3[] = [];
    const dir = start.clone().normalize();

    for (const [progress, altFrac] of template.ascentProfile) {
      const height = EARTH_RADIUS + altFrac * maxHeight * 0.5;
      // Rotate along the trajectory direction
      const angle = progress * Math.PI * 0.4;
      const rotAxis = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
      const point = dir
        .clone()
        .applyAxisAngle(rotAxis, angle)
        .multiplyScalar(height);
      curvePoints.push(point);
    }

    return new THREE.CatmullRomCurve3(curvePoints).getPoints(64);
  }, [padLat, padLon, template]);

  // Trajectory line object (same pattern as OrbitPath in SolarSystemScene)
  const trajectoryLine = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: "#f59e0b",
      transparent: true,
      opacity: 0.8,
    });
    return new THREE.Line(geo, mat);
  }, [points]);

  // Orbit ring
  const orbitRadius = useMemo(() => {
    const altScale = Math.min(template.altitudeKm / 35786, 1);
    return EARTH_RADIUS + 0.15 + altScale * 0.6;
  }, [template.altitudeKm]);

  return (
    <group>
      {/* Trajectory arc -- using primitive to match codebase pattern */}
      <primitive object={trajectoryLine} />
      {/* Target orbit ring -- tilted by inclination */}
      <mesh
        rotation={[
          Math.PI / 2 - (template.inclinationDeg * Math.PI) / 180,
          0,
          0,
        ]}
      >
        <ringGeometry
          args={[orbitRadius - 0.005, orbitRadius + 0.005, 128]}
        />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
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

  // Only auto-zoom to spaceport when first selected (not when a launch is picked)
  // When a launch is selected, let the user freely zoom out to see trajectory
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

  return (
    <div className="relative h-[600px] w-full rounded-xl overflow-hidden border border-white/5">
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
        <CameraController target={cameraTarget} controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={1.8}
          maxDistance={8}
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

      {/* Side panel for launches at selected location */}
      {selectedLocation && (
        <div className="absolute top-4 right-4 bottom-4 w-80 overflow-y-auto rounded-xl bg-card/90 backdrop-blur-md border border-white/10 p-4 space-y-3 max-md:w-full max-md:right-0 max-md:left-0 max-md:top-auto max-md:bottom-0 max-md:h-[50vh] max-md:rounded-b-none">
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

          {locationLaunches.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No upcoming launches
            </p>
          ) : (
            locationLaunches.map((launch) => (
              <button
                key={launch.id}
                onClick={() =>
                  setSelectedLaunch(
                    selectedLaunch?.id === launch.id ? null : launch
                  )
                }
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  selectedLaunch?.id === launch.id
                    ? "border-accent bg-accent/10"
                    : "border-white/5 hover:border-white/15 bg-white/5"
                }`}
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
          )}
        </div>
      )}
    </div>
  );
}
