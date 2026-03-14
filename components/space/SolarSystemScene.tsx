"use client";

import { useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { PLANETS, type Planet } from "@/lib/space-data";
import {
  DEEP_SPACE_PROBES,
  EDGE_INDICATOR_THRESHOLD_AU,
  type DeepSpaceProbe,
} from "@/lib/deep-space-probes";

// ── Scene scaling ────────────────────────────────────────────
function orbitRadius(au: number): number {
  return 2.5 + au ** 0.45 * 3.5;
}

function planetSize(radiusKm: number): number {
  // Bigger planets so they're clearly visible
  return 0.12 + Math.sqrt(radiusKm / 70000) * 0.35;
}

function orbitalSpeed(periodYears: number): number {
  return (2 * Math.PI) / (25 + Math.log(periodYears + 1) * 40);
}

// ── Fast procedural textures using ImageData ─────────────────
function noise(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43.12) * 43758.5453;
  return n - Math.floor(n);
}

function fbm(x: number, y: number, seed: number, octaves = 4): number {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * noise(x * freq, y * freq, seed + i * 7.3);
    amp *= 0.5;
    freq *= 2.0;
  }
  return val;
}

function makeTexture(w: number, h: number, fill: (x: number, y: number, w: number, h: number) => [number, number, number, number]): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = fill(x, y, w, h);
      const idx = (y * w + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = a;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSunTexture(): THREE.CanvasTexture {
  return makeTexture(256, 256, (x, y) => {
    const n = fbm(x / 40, y / 40, 0, 4);
    return [255, Math.min(255, 170 + n * 70), Math.min(255, 40 + n * 50), 255];
  });
}

function createPlanetTexture(planet: Planet): THREE.CanvasTexture {
  const w = 512, h = 256;
  const name = planet.name;

  return makeTexture(w, h, (x, y) => {
    if (name === "Mercury") {
      const n = fbm(x / 60, y / 60, 1, 4);
      const crater = fbm(x / 20, y / 20, 2, 3);
      const base = 120 + n * 40 - (crater > 0.6 ? 30 : 0);
      return [base, base - 8, base - 15, 255];
    }
    if (name === "Venus") {
      const n = fbm(x / 80, y / 40, 10, 4);
      return [200 + n * 35, 170 + n * 25, 100 + n * 25, 255];
    }
    if (name === "Earth") {
      const n = fbm(x / 60, y / 60, 20, 5);
      const lat = y / h;
      const isPolar = lat < 0.08 || lat > 0.92;
      if (isPolar) return [220, 230, 240, 255];
      if (n > 0.5) {
        const g = 80 + (n - 0.5) * 300;
        return [50 + (n - 0.5) * 200, Math.min(255, g), 30, 255];
      }
      return [25, 60 + n * 30, 120 + n * 40, 255];
    }
    if (name === "Mars") {
      const n = fbm(x / 70, y / 70, 30, 4);
      const n2 = fbm(x / 35, y / 35, 35, 3);
      const lat = y / h;
      if (lat < 0.06 || lat > 0.94) return [210, 200, 190, 255];
      return [165 + n * 45 - n2 * 25, 85 + n * 25 - n2 * 15, 45 + n * 15, 255];
    }
    if (name === "Jupiter") {
      const band = Math.sin(y / h * Math.PI * 14) * 0.5 + Math.sin(y / h * Math.PI * 7 + 1) * 0.3;
      const turb = fbm(x / 100, y / 20, 40, 3) * 0.25;
      const v = band + turb;
      // Great Red Spot
      const dx = x / w - 0.35, dy = y / h - 0.55;
      const spot = (dx * dx) / 0.003 + (dy * dy) / 0.001;
      const spotMix = spot < 1 ? (1 - spot) * 0.5 : 0;
      return [
        Math.min(255, 190 + v * 35 + spotMix * 80),
        Math.min(255, 150 + v * 30 - spotMix * 30),
        Math.min(255, 100 + v * 20 - spotMix * 20),
        255,
      ];
    }
    if (name === "Saturn") {
      const band = Math.sin(y / h * Math.PI * 10) * 0.25;
      const t = fbm(x / 140, y / 30, 50, 3) * 0.12;
      const v = band + t;
      return [Math.min(255, 215 + v * 25), Math.min(255, 195 + v * 20), Math.min(255, 140 + v * 15), 255];
    }
    if (name === "Uranus") {
      const n = fbm(x / 140, y / 140, 60, 3) * 0.06;
      return [160 + n * 30, 210 + n * 20, 220 + n * 15, 255];
    }
    // Neptune
    const band = Math.sin(y / h * Math.PI * 8) * 0.12;
    const n = fbm(x / 100, y / 40, 70, 3) * 0.08;
    const v = band + n;
    return [65 + v * 15, 85 + v * 20, Math.min(255, 190 + v * 25), 255];
  });
}

function createRingTexture(): THREE.CanvasTexture {
  return makeTexture(256, 1, (x) => {
    const t = x / 256;
    const inGap = t > 0.45 && t < 0.52;
    const density = inGap ? 0.05 : 0.35 + Math.sin(t * 30) * 0.1 + noise(t * 10, 0, 99) * 0.12;
    const alpha = Math.min(255, density * 255);
    return [215, 200, 165, alpha];
  });
}

// ── Sun ──────────────────────────────────────────────────────
function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => createSunTexture(), []);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.55, 48, 48]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {/* Bright glow layers */}
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial color="#ffcc44" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshBasicMaterial color="#ff9922" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
      <pointLight color="#fff5e0" intensity={4} distance={50} />
    </group>
  );
}

// ── Orbit ring ───────────────────────────────────────────────
function OrbitPath({ radius }: { radius: number }) {
  const line = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.08,
    });
    return new THREE.Line(geo, mat);
  }, [radius]);

  return <primitive object={line} />;
}

// ── Planet ────────────────────────────────────────────────────
function PlanetBody({
  planet,
  onSelect,
}: {
  planet: Planet;
  onSelect: (planet: Planet) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const texture = useMemo(() => createPlanetTexture(planet), [planet]);
  const ringTexture = useMemo(
    () => (planet.hasRings ? createRingTexture() : null),
    [planet.hasRings]
  );

  const r = orbitRadius(planet.distanceAU);
  const size = planetSize(planet.radiusKm);
  const speed = orbitalSpeed(planet.orbitalPeriodYears);
  const startAngle = useRef(Math.random() * Math.PI * 2);

  useFrame(({ clock }) => {
    if (!groupRef.current || !meshRef.current) return;
    const angle = startAngle.current + clock.getElapsedTime() * speed;
    groupRef.current.position.x = Math.cos(angle) * r;
    groupRef.current.position.z = Math.sin(angle) * r;
    meshRef.current.rotation.y += 0.003;
  });

  const tilt = planet.name === "Uranus" ? Math.PI * 0.48 : 0.05;

  return (
    <>
      <OrbitPath radius={r} />
      <group ref={groupRef}>
        <mesh
          ref={meshRef}
          rotation={[tilt, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(planet);
          }}
          onPointerOver={() => {
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "default";
          }}
        >
          <sphereGeometry args={[size, 48, 48]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.7}
            metalness={0.05}
            emissive={planet.color}
            emissiveIntensity={0.08}
          />
        </mesh>

        {/* Rings */}
        {ringTexture && (
          <mesh rotation={[Math.PI / 2 + tilt, 0, 0]}>
            <ringGeometry args={[size * 1.3, size * 2.2, 64]} />
            <meshBasicMaterial
              map={ringTexture}
              transparent
              opacity={0.75}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Always-visible planet name */}
        <Html
          distanceFactor={14}
          style={{ pointerEvents: "none" }}
          position={[0, size + 0.12, 0]}
        >
          <div
            className={`whitespace-nowrap text-center text-[11px] font-medium transition-all duration-200 ${
              hovered
                ? "text-foreground bg-card/90 border border-white/10 rounded-md px-2 py-0.5 backdrop-blur-sm shadow-lg"
                : "text-foreground/50"
            }`}
          >
            {planet.name}
          </div>
        </Html>

        {/* Selection ring on hover */}
        {hovered && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size + 0.03, size + 0.06, 32]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </>
  );
}

// ── Probe marker ─────────────────────────────────────────────
function ProbeMarker({
  probe,
  isSelected,
  onSelect,
}: {
  probe: DeepSpaceProbe;
  isSelected: boolean;
  onSelect: (probe: DeepSpaceProbe) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isNearby = probe.distanceAU <= EDGE_INDICATOR_THRESHOLD_AU;

  // Position: use orbitRadius for nearby, clamp at edge for far probes
  const r = isNearby
    ? orbitRadius(probe.distanceAU)
    : orbitRadius(30) + 1.5; // just beyond Neptune orbit
  const angle = (probe.eclipticLonDeg * Math.PI) / 180;
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;

  return (
    <group position={[x, 0, z]}>
      {/* Diamond-shaped marker (rotated cube) */}
      <mesh
        rotation={[Math.PI / 4, 0, Math.PI / 4]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(probe);
        }}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <boxGeometry args={[
          isSelected ? 0.18 : 0.12,
          isSelected ? 0.18 : 0.12,
          isSelected ? 0.18 : 0.12,
        ]} />
        <meshBasicMaterial
          color={probe.status === "active" ? "#22d3ee" : "#6b7280"}
          transparent
          opacity={hovered || isSelected ? 1 : 0.7}
        />
      </mesh>

      {/* Glow effect when selected */}
      {isSelected && (
        <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.15} />
        </mesh>
      )}

      {/* Label */}
      <Html
        distanceFactor={14}
        style={{ pointerEvents: "none" }}
        position={[0, 0.25, 0]}
      >
        <div
          className={`whitespace-nowrap text-center text-[9px] font-medium transition-all duration-200 ${
            hovered || isSelected
              ? "text-cyan-300 bg-card/90 border border-cyan-500/20 rounded-md px-2 py-0.5 backdrop-blur-sm shadow-lg"
              : "text-cyan-400/50"
          }`}
        >
          {probe.name}
          {!isNearby && (
            <span className="text-[8px] text-cyan-300/40 ml-1">
              {probe.distanceAU} AU →
            </span>
          )}
        </div>
      </Html>
    </group>
  );
}

// ── Probe trajectory path ────────────────────────────────────
function ProbeTrajectory({ probe }: { probe: DeepSpaceProbe }) {
  const line = useMemo(() => {
    const points = probe.trajectory
      .filter((wp) => wp.distanceAU <= EDGE_INDICATOR_THRESHOLD_AU)
      .map((wp) => {
        const r = orbitRadius(wp.distanceAU);
        const angle = (wp.eclipticLonDeg * Math.PI) / 180;
        return new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      });

    if (points.length < 2) return null;

    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(64));
    const mat = new THREE.LineDashedMaterial({
      color: "#22d3ee",
      transparent: true,
      opacity: 0.6,
      dashSize: 0.15,
      gapSize: 0.1,
    });
    const l = new THREE.Line(geo, mat);
    l.computeLineDistances();
    return l;
  }, [probe]);

  if (!line) return null;

  return (
    <>
      <primitive object={line} />
      {/* Waypoint markers */}
      {probe.trajectory
        .filter((wp) => wp.distanceAU <= EDGE_INDICATOR_THRESHOLD_AU)
        .map((wp, i) => {
          const r = orbitRadius(wp.distanceAU);
          const angle = (wp.eclipticLonDeg * Math.PI) / 180;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
            >
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshBasicMaterial
                color={
                  wp.type === "gravity-assist"
                    ? "#f59e0b"
                    : wp.type === "launch"
                    ? "#22c55e"
                    : "#22d3ee"
                }
              />
            </mesh>
          );
        })}
    </>
  );
}

// ── Scene ────────────────────────────────────────────────────
function Scene({
  onSelectPlanet,
  onSelectProbe,
  selectedProbeName,
}: {
  onSelectPlanet: (planet: Planet) => void;
  onSelectProbe: (probe: DeepSpaceProbe | null) => void;
  selectedProbeName: string | null;
}) {
  const handleMiss = useCallback(() => {
    onSelectProbe(null); // Clear probe selection on background click
  }, [onSelectProbe]);

  const selectedProbe = selectedProbeName
    ? DEEP_SPACE_PROBES.find((p) => p.name === selectedProbeName) ?? null
    : null;

  return (
    <>
      {/* Higher ambient so planets aren't pitch black on the dark side */}
      <ambientLight intensity={0.5} />
      {/* Hemisphere light adds subtle color variation */}
      <hemisphereLight args={["#b1c5ff", "#2a1a00", 0.3]} />

      <mesh onClick={handleMiss}>
        <sphereGeometry args={[50, 8, 8]} />
        <meshBasicMaterial visible={false} side={THREE.BackSide} />
      </mesh>

      <Sun />

      {PLANETS.map((p) => (
        <PlanetBody key={p.name} planet={p} onSelect={onSelectPlanet} />
      ))}

      {/* Deep space probes */}
      {DEEP_SPACE_PROBES.map((probe) => (
        <ProbeMarker
          key={probe.name}
          probe={probe}
          isSelected={selectedProbeName === probe.name}
          onSelect={onSelectProbe}
        />
      ))}

      {/* Selected probe trajectory */}
      {selectedProbe && <ProbeTrajectory probe={selectedProbe} />}

      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={30}
        autoRotate
        autoRotateSpeed={0.15}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.15}
      />
    </>
  );
}

// ── Wrapper ──────────────────────────────────────────────────
export default function SolarSystemScene({
  onSelectPlanet,
  onSelectProbe,
  selectedProbeName,
}: {
  onSelectPlanet: (planet: Planet) => void;
  onSelectProbe: (probe: DeepSpaceProbe | null) => void;
  selectedProbeName: string | null;
}) {
  return (
    <Canvas
      camera={{ position: [0, 6, 16], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Scene
        onSelectPlanet={onSelectPlanet}
        onSelectProbe={onSelectProbe}
        selectedProbeName={selectedProbeName}
      />
    </Canvas>
  );
}
