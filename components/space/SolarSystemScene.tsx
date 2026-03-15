"use client";

import { useRef, useMemo, useState, useCallback, useEffect } from "react";
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
  return 0.12 + Math.sqrt(radiusKm / 70000) * 0.35;
}

function orbitalSpeed(periodYears: number): number {
  return (2 * Math.PI) / (250 + Math.log(periodYears + 1) * 400);
}

// ── Real texture paths ──────────────────────────────────────
const PLANET_TEXTURE_PATHS: Record<string, string> = {
  Mercury: "/textures/mercury-2k.jpg",
  Venus: "/textures/venus-2k.jpg",
  Earth: "/textures/earth-blue-marble-1k.jpg",
  Mars: "/textures/mars-2k.jpg",
  Jupiter: "/textures/jupiter-2k.jpg",
  Saturn: "/textures/saturn-2k.jpg",
  Uranus: "/textures/uranus-2k.jpg",
  Neptune: "/textures/neptune-2k.jpg",
};

// Shared texture cache — loaded once, reused across re-renders
const textureCache = new Map<string, THREE.Texture>();
const loader = new THREE.TextureLoader();

function useRealTexture(path: string): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(
    () => textureCache.get(path) ?? null
  );

  useEffect(() => {
    if (textureCache.has(path)) {
      setTexture(textureCache.get(path)!);
      return;
    }
    loader.load(path, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      textureCache.set(path, tex);
      setTexture(tex);
    });
  }, [path]);

  return texture;
}

// ── Sun ──────────────────────────────────────────────────────
function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useRealTexture("/textures/sun-2k.jpg");

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.03;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.55, 48, 48]} />
        <meshBasicMaterial map={texture} color={texture ? undefined : "#ffaa22"} />
      </mesh>
      {/* Glow layers */}
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial color="#ffcc44" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshBasicMaterial color="#ff9922" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
      <pointLight color="#fff5e0" intensity={4} distance={60} />
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
  frozen,
  earthAngleRef,
}: {
  planet: Planet;
  onSelect: (planet: Planet) => void;
  frozen: boolean;
  earthAngleRef?: React.MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const texturePath = PLANET_TEXTURE_PATHS[planet.name];
  const texture = useRealTexture(texturePath);
  const ringTexture = useRealTexture("/textures/saturn-ring.png");

  const r = orbitRadius(planet.distanceAU);
  const size = planetSize(planet.radiusKm);
  const speed = orbitalSpeed(planet.orbitalPeriodYears);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!groupRef.current || !meshRef.current) return;
    if (!frozen) {
      angleRef.current += delta * speed;
      meshRef.current.rotation.y += 0.003;
    }
    groupRef.current.position.x = Math.cos(angleRef.current) * r;
    groupRef.current.position.z = Math.sin(angleRef.current) * r;
    if (earthAngleRef) earthAngleRef.current = angleRef.current;
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
            color={texture ? undefined : planet.color}
            roughness={0.8}
            metalness={0.05}
            emissive={planet.color}
            emissiveIntensity={0.05}
          />
        </mesh>

        {/* Saturn rings */}
        {planet.hasRings && (
          <mesh rotation={[Math.PI / 2 + tilt, 0, 0]}>
            <ringGeometry args={[size * 1.3, size * 2.2, 64]} />
            <meshBasicMaterial
              map={ringTexture}
              transparent
              opacity={0.75}
              side={THREE.DoubleSide}
              color={ringTexture ? undefined : "#d4c8a0"}
            />
          </mesh>
        )}

        <Html
          distanceFactor={18}
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
  angleOffset,
}: {
  probe: DeepSpaceProbe;
  isSelected: boolean;
  onSelect: (probe: DeepSpaceProbe) => void;
  angleOffset: number;
}) {
  const [hovered, setHovered] = useState(false);
  const isNearby = probe.distanceAU <= EDGE_INDICATOR_THRESHOLD_AU;

  const r = isNearby
    ? orbitRadius(probe.distanceAU)
    : orbitRadius(30) + 1.5;
  const angle = (probe.eclipticLonDeg * Math.PI) / 180 + angleOffset;
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;

  return (
    <group position={[x, 0, z]}>
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

      {isSelected && (
        <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.15} />
        </mesh>
      )}

      <Html
        distanceFactor={18}
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

// ── Probe trajectory path (static historical path, rotated to Earth) ──
function ProbeTrajectory({
  probe,
  rotationOffset,
}: {
  probe: DeepSpaceProbe;
  rotationOffset: number;
}) {
  const line = useMemo(() => {
    const points = probe.trajectory
      .filter((wp) => wp.distanceAU <= EDGE_INDICATOR_THRESHOLD_AU)
      .map((wp) => {
        const r = orbitRadius(wp.distanceAU);
        const angle = (wp.eclipticLonDeg * Math.PI) / 180 + rotationOffset;
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
  }, [probe, rotationOffset]);

  if (!line) return null;

  return (
    <>
      <primitive object={line} />
      {probe.trajectory
        .filter((wp) => wp.distanceAU <= EDGE_INDICATOR_THRESHOLD_AU)
        .map((wp, i) => {
          const r = orbitRadius(wp.distanceAU);
          const angle = (wp.eclipticLonDeg * Math.PI) / 180 + rotationOffset;
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

// ── Camera zoom controller (only animates during transitions) ────────
function CameraZoom({
  controlsRef,
  target,
  active,
}: {
  controlsRef: React.RefObject<any>;
  target: THREE.Vector3 | null;
  active: boolean;
}) {
  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const animating = useRef(false);
  const prevActive = useRef(false);
  const prevTarget = useRef<THREE.Vector3 | null>(null);

  useFrame(({ camera }) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Detect selection change → start animating
    if (active !== prevActive.current || target !== prevTarget.current) {
      prevActive.current = active;
      prevTarget.current = target;
      animating.current = true;
    }

    // Only move camera during transitions, then let user freely zoom/orbit
    if (!animating.current) return;

    const dest = active && target ? target : origin;
    const desiredDist = active ? 12 : 32;

    controls.target.lerp(dest, 0.04);

    const offset = camera.position.clone().sub(controls.target);
    const currentDist = offset.length();
    if (Math.abs(currentDist - desiredDist) > 0.3) {
      const newDist = currentDist + (desiredDist - currentDist) * 0.04;
      offset.normalize().multiplyScalar(newDist);
      camera.position.copy(controls.target).add(offset);
    }

    controls.update();

    // Stop animating once camera has settled
    const targetDiff = controls.target.distanceTo(dest);
    if (Math.abs(currentDist - desiredDist) < 0.5 && targetDiff < 0.3) {
      animating.current = false;
    }
  });

  return null;
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
  const controlsRef = useRef<any>(null);
  const earthAngleRef = useRef(0);

  const handleMiss = useCallback(() => {
    onSelectProbe(null);
  }, [onSelectProbe]);

  const selectedProbe = selectedProbeName
    ? DEEP_SPACE_PROBES.find((p) => p.name === selectedProbeName) ?? null
    : null;

  const frozen = !!selectedProbeName;

  const rotationOffset = useMemo(() => {
    if (!frozen) return 0;
    return earthAngleRef.current;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProbeName]);

  const probeTarget = useMemo(() => {
    if (!selectedProbe) return null;
    const isNearby = selectedProbe.distanceAU <= EDGE_INDICATOR_THRESHOLD_AU;
    const r = isNearby
      ? orbitRadius(selectedProbe.distanceAU)
      : orbitRadius(30) + 1.5;
    const angle = (selectedProbe.eclipticLonDeg * Math.PI) / 180 + rotationOffset;
    return new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
  }, [selectedProbe, rotationOffset]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#b1c5ff", "#2a1a00", 0.3]} />

      <mesh onClick={handleMiss}>
        <sphereGeometry args={[60, 8, 8]} />
        <meshBasicMaterial visible={false} side={THREE.BackSide} />
      </mesh>

      <Sun />

      {PLANETS.map((p) => (
        <PlanetBody
          key={p.name}
          planet={p}
          onSelect={onSelectPlanet}
          frozen={frozen}
          earthAngleRef={p.name === "Earth" ? earthAngleRef : undefined}
        />
      ))}

      {DEEP_SPACE_PROBES.map((probe) => (
        <ProbeMarker
          key={probe.name}
          probe={probe}
          isSelected={selectedProbeName === probe.name}
          onSelect={onSelectProbe}
          angleOffset={frozen ? rotationOffset : 0}
        />
      ))}

      {selectedProbe && (
        <ProbeTrajectory probe={selectedProbe} rotationOffset={rotationOffset} />
      )}

      <CameraZoom controlsRef={controlsRef} target={probeTarget} active={frozen} />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={5}
        maxDistance={45}
        autoRotate={!frozen}
        autoRotateSpeed={0.12}
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
      camera={{ position: [0, 12, 28], fov: 50 }}
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
