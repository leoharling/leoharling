"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function WireframeGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.08;
    }
  });

  // Generate points on sphere surface
  const particles = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.8;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  // Generate orbit ring Line objects
  const orbitLines = useMemo(() => {
    const lines: THREE.Line[] = [];
    const inclinations = [0.3, 0.8, 1.2, 1.6];
    const radii = [2.4, 2.8, 3.2, 2.6];

    inclinations.forEach((incl, idx) => {
      const points: THREE.Vector3[] = [];
      const segments = 128;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const r = radii[idx];
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle) * Math.sin(incl);
        const z = r * Math.sin(angle) * Math.cos(incl);
        points.push(new THREE.Vector3(x, y, z));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: "#3b82f6",
        transparent: true,
        opacity: 0.12 + idx * 0.04,
      });
      lines.push(new THREE.Line(geometry, material));
    });

    return lines;
  }, []);

  return (
    <group>
      {/* Wireframe sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.8, 24, 24]} />
        <meshBasicMaterial
          color="#3b82f6"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Surface particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#3b82f6"
          size={0.015}
          transparent
          opacity={0.4}
          sizeAttenuation
        />
      </points>

      {/* Orbit rings */}
      {orbitLines.map((lineObj, i) => (
        <primitive key={i} object={lineObj} />
      ))}
    </group>
  );
}

export default function Globe() {
  return (
    <div className="absolute inset-0 opacity-60">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <WireframeGlobe />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
}
