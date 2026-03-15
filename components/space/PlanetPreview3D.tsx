"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

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

const textureCache = new Map<string, THREE.Texture>();
const loader = new THREE.TextureLoader();

function useTexture(path: string | undefined): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(
    () => (path ? textureCache.get(path) ?? null : null)
  );

  useEffect(() => {
    if (!path) return;
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

export interface MoonData {
  name: string;
  radiusKm: number;
  color: string;
  orbitDays: number;
  distanceKm: number;
}

// ── Ring geometry with radial UVs (for strip textures like Saturn rings) ──
function createRadialRingGeometry(innerRadius: number, outerRadius: number, segments: number) {
  const geo = new THREE.RingGeometry(innerRadius, outerRadius, segments);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const dist = Math.sqrt(x * x + y * y);
    // Map radial distance to texture u-axis (0 = inner, 1 = outer)
    const t = (dist - innerRadius) / (outerRadius - innerRadius);
    uv.setXY(i, t, 0.5);
  }

  return geo;
}

// ── Orbit ring ──
function OrbitRing({ radius }: { radius: number }) {
  const line = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.12 });
    return new THREE.Line(geo, mat);
  }, [radius]);

  return <primitive object={line} />;
}

// ── Moon on orbit ──
function MoonOrbit({ moon, orbitRadius }: { moon: MoonData; orbitRadius: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const speed = (2 * Math.PI) / (60 + moon.orbitDays * 3);
  const moonSize = Math.max(0.06, Math.min(0.18, 0.04 + Math.sqrt(moon.radiusKm / 1500)));

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    angleRef.current += delta * speed;
    groupRef.current.position.x = Math.cos(angleRef.current) * orbitRadius;
    groupRef.current.position.z = Math.sin(angleRef.current) * orbitRadius;
  });

  return (
    <>
      <OrbitRing radius={orbitRadius} />
      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[moonSize, 16, 16]} />
          <meshStandardMaterial color={moon.color} roughness={0.9} />
        </mesh>
        <Html
          distanceFactor={8}
          style={{ pointerEvents: "none" }}
          position={[0, moonSize + 0.1, 0]}
        >
          <span className="whitespace-nowrap text-[9px] text-foreground/60">
            {moon.name}
          </span>
        </Html>
      </group>
    </>
  );
}

// ── Rotating planet with texture ──
function RotatingPlanet({ planetName, hasRings }: { planetName: string; hasRings: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(PLANET_TEXTURE_PATHS[planetName]);
  const ringTexture = useTexture(hasRings ? "/textures/saturn-ring.png" : undefined);

  const ringGeo = useMemo(
    () => (hasRings ? createRadialRingGeometry(1.8, 3.2, 64) : null),
    [hasRings]
  );

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.1;
  });

  const tilt = planetName === "Uranus" ? Math.PI * 0.48 : 0.05;

  return (
    <group rotation={[tilt, 0, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 64, 32]} />
        <meshStandardMaterial
          key={texture ? "tex" : "flat"}
          map={texture}
          color={texture ? undefined : "#555"}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>
      {hasRings && ringGeo && (
        <mesh rotation={[Math.PI / 2, 0, 0]} geometry={ringGeo}>
          <meshBasicMaterial
            key={ringTexture ? "rtex" : "rflat"}
            map={ringTexture}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
            color={ringTexture ? undefined : "#d4c8a0"}
          />
        </mesh>
      )}
    </group>
  );
}

// ── Main scene ──
function PlanetScene({
  planetName,
  hasRings,
  moons,
}: {
  planetName: string;
  hasRings: boolean;
  moons: MoonData[];
}) {
  const moonOrbits = useMemo(() => {
    if (moons.length === 0) return [];
    const sorted = [...moons].sort((a, b) => a.distanceKm - b.distanceKm);
    const minOrbit = hasRings ? 3.5 : 2.2;
    const spacing = Math.max(0.6, Math.min(1.2, 3.0 / sorted.length));

    return sorted.map((moon, i) => ({
      moon,
      orbitRadius: minOrbit + (i + 1) * spacing,
    }));
  }, [moons, hasRings]);

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 3, 5]} intensity={1.2} />
      <hemisphereLight args={["#b1c5ff", "#2a1a00", 0.15]} />

      <RotatingPlanet planetName={planetName} hasRings={hasRings} />

      {moonOrbits.map(({ moon, orbitRadius }) => (
        <MoonOrbit key={moon.name} moon={moon} orbitRadius={orbitRadius} />
      ))}
    </>
  );
}

export default function PlanetPreview3D({
  planetName,
  hasRings,
  size,
  moons = [],
}: {
  planetName: string;
  hasRings: boolean;
  size: number;
  moons?: MoonData[];
}) {
  // Camera distance: fit outermost orbit or planet
  const outerOrbit = useMemo(() => {
    if (moons.length === 0) return 0;
    const minOrbit = hasRings ? 3.5 : 2.2;
    const spacing = Math.max(0.6, Math.min(1.2, 3.0 / moons.length));
    return minOrbit + moons.length * spacing;
  }, [moons, hasRings]);

  const camDist = outerOrbit > 0 ? outerOrbit * 1.8 + 2 : 4.5;

  return (
    <Canvas
      camera={{ position: [0, camDist * 0.35, camDist], fov: 42 }}
      style={{ width: size, height: size }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
    >
      <PlanetScene planetName={planetName} hasRings={hasRings} moons={moons} />
    </Canvas>
  );
}
