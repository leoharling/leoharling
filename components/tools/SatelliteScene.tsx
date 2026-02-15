"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

// Simplified TLE propagation - create orbital positions
function generateOrbitPoints(
  semiMajorAxis: number,
  inclination: number,
  raan: number,
  numPoints: number = 128
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const incRad = (inclination * Math.PI) / 180;
  const raanRad = (raan * Math.PI) / 180;

  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const x =
      semiMajorAxis *
      (Math.cos(raanRad) * Math.cos(angle) -
        Math.sin(raanRad) * Math.sin(angle) * Math.cos(incRad));
    const y = semiMajorAxis * Math.sin(angle) * Math.sin(incRad);
    const z =
      semiMajorAxis *
      (Math.sin(raanRad) * Math.cos(angle) +
        Math.cos(raanRad) * Math.sin(angle) * Math.cos(incRad));
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}

interface ConstellationConfig {
  name: string;
  color: string;
  orbits: { sma: number; inc: number; raan: number }[];
  satellitesPerOrbit: number;
}

const CONSTELLATIONS: ConstellationConfig[] = [
  {
    name: "Starlink",
    color: "#60a5fa",
    orbits: Array.from({ length: 6 }, (_, i) => ({
      sma: 2.8,
      inc: 53,
      raan: i * 60,
    })),
    satellitesPerOrbit: 8,
  },
  {
    name: "OneWeb",
    color: "#34d399",
    orbits: Array.from({ length: 4 }, (_, i) => ({
      sma: 3.0,
      inc: 87.9,
      raan: i * 90,
    })),
    satellitesPerOrbit: 6,
  },
  {
    name: "GPS",
    color: "#fbbf24",
    orbits: Array.from({ length: 6 }, (_, i) => ({
      sma: 4.2,
      inc: 55,
      raan: i * 60,
    })),
    satellitesPerOrbit: 4,
  },
];

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group>
      {/* Earth sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 48, 48]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} metalness={0.2} />
      </mesh>
      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[2.01, 24, 24]} />
        <meshBasicMaterial
          color="#3b82f6"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.15, 32, 32]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function Satellite({
  position,
  color,
  name,
}: {
  position: THREE.Vector3;
  color: string;
  name: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {hovered && (
        <Html distanceFactor={8}>
          <div className="whitespace-nowrap rounded bg-card px-2 py-1 text-xs text-foreground border border-white/10">
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}

function ConstellationGroup({
  config,
  visible,
}: {
  config: ConstellationConfig;
  visible: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02;
    }
  });

  const orbitData = useMemo(() => {
    return config.orbits.map((orbit) => {
      const points = generateOrbitPoints(orbit.sma, orbit.inc, orbit.raan);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.2,
      });
      const lineObj = new THREE.Line(geometry, material);

      const satellites: THREE.Vector3[] = [];
      for (let i = 0; i < config.satellitesPerOrbit; i++) {
        const idx = Math.floor(
          (i / config.satellitesPerOrbit) * points.length
        );
        satellites.push(points[idx]);
      }

      return { lineObj, satellites };
    });
  }, [config]);

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {orbitData.map((orbit, i) => (
        <group key={i}>
          <primitive object={orbit.lineObj} />
          {orbit.satellites.map((pos, j) => (
            <Satellite
              key={j}
              position={pos}
              color={config.color}
              name={`${config.name} Sat-${i * config.satellitesPerOrbit + j + 1}`}
            />
          ))}
        </group>
      ))}
    </group>
  );
}

interface SatelliteSceneProps {
  visibleConstellations: Record<string, boolean>;
}

function Scene({ visibleConstellations }: SatelliteSceneProps) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={0.8} />
      <Earth />
      {CONSTELLATIONS.map((config) => (
        <ConstellationGroup
          key={config.name}
          config={config}
          visible={visibleConstellations[config.name] ?? true}
        />
      ))}
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={0.2}
      />
    </>
  );
}

export default function SatelliteSceneWrapper(props: SatelliteSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 3, 8], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Scene {...props} />
    </Canvas>
  );
}

export { CONSTELLATIONS };
