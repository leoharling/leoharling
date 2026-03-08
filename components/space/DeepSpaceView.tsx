"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomOut, ZoomIn, ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react";
import {
  PLANETS,
  NEARBY_STARS,
  NEARBY_GALAXIES,
  getOrbitRadius,
  getPlanetSize,
  getOrbitalDuration,
  type Planet,
  type Moon,
  type NearbyStar,
  type NearbyGalaxy,
} from "@/lib/space-data";
import FadeIn from "@/components/ui/FadeIn";
import dynamic from "next/dynamic";

const SolarSystemScene = dynamic(
  () => import("@/components/space/SolarSystemScene"),
  { ssr: false }
);

type ViewMode = "solar-system" | "local-cluster" | "galactic";

const VIEW_ORDER: ViewMode[] = ["solar-system", "local-cluster", "galactic"];
const VIEW_LABELS: Record<ViewMode, { title: string; subtitle: string; scale: string }> = {
  "solar-system": {
    title: "Our Solar System",
    subtitle: "8 planets orbiting the Sun",
    scale: "Scale: Astronomical Units (AU)",
  },
  "local-cluster": {
    title: "Local Stellar Neighborhood",
    subtitle: "Stars within ~12 light-years of Sol",
    scale: "Scale: Light Years (ly)",
  },
  galactic: {
    title: "The Local Group",
    subtitle: "Galaxies within ~3 million light-years",
    scale: "Scale: Million Light Years (Mly)",
  },
};

/* ── Per-planet surface gradient for detailed look ── */
const PLANET_GRADIENTS: Record<string, string[]> = {
  Mercury: ["#8c7b6b", "#b5a18e", "#6b5d50", "#a0917e"],
  Venus: ["#e8cda0", "#d4a853", "#c99a3a", "#f0dbb8"],
  Earth: ["#2d6b3f", "#4a90d9", "#1a5276", "#3a7d44"],
  Mars: ["#c1440e", "#e07040", "#8b2500", "#d4603a"],
  Jupiter: ["#c88b3a", "#a86b20", "#e0a84c", "#b07828", "#d4a050"],
  Saturn: ["#e4d08e", "#c8a850", "#d4bc6e", "#b89838"],
  Uranus: ["#72b5c4", "#5a9aaa", "#88c8d8", "#4a8898"],
  Neptune: ["#3f54ba", "#2a3d8f", "#5568d0", "#1e2d70"],
};

/* ── SVG planet rendering ── */
function PlanetSVG({
  planet,
  size,
  detailed = false,
}: {
  planet: Planet;
  size: number;
  detailed?: boolean;
}) {
  const colors = PLANET_GRADIENTS[planet.name] || [planet.color, planet.color];
  const id = `planet-${planet.name}-${detailed ? "detail" : "orbit"}-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="pointer-events-none"
    >
      <defs>
        <radialGradient id={`${id}-base`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={colors[0]} stopOpacity="1" />
          <stop offset="50%" stopColor={colors[1] || colors[0]} stopOpacity="0.9" />
          <stop offset="100%" stopColor={colors[2] || colors[0]} stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id={`${id}-shadow`} cx="70%" cy="65%" r="55%">
          <stop offset="0%" stopColor="black" stopOpacity="0.5" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-highlight`} cx="30%" cy="28%" r="25%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-atmo`} cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor={colors[0]} stopOpacity="0" />
          <stop offset="100%" stopColor={colors[0]} stopOpacity="0.15" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="50" fill={`url(#${id}-atmo)`} />
      <circle cx="50" cy="50" r="46" fill={`url(#${id}-base)`} />

      {planet.name === "Earth" && (
        <>
          <ellipse cx="38" cy="40" rx="12" ry="10" fill="#3a7d44" opacity="0.5" />
          <ellipse cx="60" cy="55" rx="8" ry="14" fill="#3a7d44" opacity="0.4" />
          <ellipse cx="35" cy="62" rx="6" ry="5" fill="#3a7d44" opacity="0.3" />
          <ellipse cx="50" cy="10" rx="14" ry="5" fill="white" opacity="0.25" />
          <ellipse cx="50" cy="90" rx="12" ry="4" fill="white" opacity="0.2" />
        </>
      )}
      {planet.name === "Jupiter" && (
        <>
          <ellipse cx="50" cy="30" rx="44" ry="4" fill="#a86b20" opacity="0.4" />
          <ellipse cx="50" cy="42" rx="44" ry="3" fill="#d4a050" opacity="0.3" />
          <ellipse cx="50" cy="55" rx="44" ry="5" fill="#8b5e14" opacity="0.35" />
          <ellipse cx="50" cy="68" rx="44" ry="3" fill="#d4a050" opacity="0.3" />
          <ellipse cx="62" cy="55" rx="7" ry="5" fill="#c04020" opacity="0.6" />
        </>
      )}
      {planet.name === "Saturn" && (
        <>
          <ellipse cx="50" cy="35" rx="44" ry="3" fill="#b89838" opacity="0.3" />
          <ellipse cx="50" cy="50" rx="44" ry="4" fill="#c8a850" opacity="0.25" />
          <ellipse cx="50" cy="65" rx="44" ry="3" fill="#b89838" opacity="0.3" />
        </>
      )}
      {planet.name === "Mars" && (
        <>
          <ellipse cx="50" cy="10" rx="10" ry="4" fill="white" opacity="0.3" />
          <ellipse cx="40" cy="45" rx="10" ry="8" fill="#8b2500" opacity="0.3" />
          <ellipse cx="65" cy="55" rx="8" ry="6" fill="#8b2500" opacity="0.25" />
        </>
      )}
      {planet.name === "Venus" && (
        <>
          <ellipse cx="40" cy="40" rx="20" ry="6" fill="#f0dbb8" opacity="0.3" transform="rotate(-15 40 40)" />
          <ellipse cx="55" cy="55" rx="18" ry="5" fill="#f0dbb8" opacity="0.25" transform="rotate(10 55 55)" />
        </>
      )}
      {planet.name === "Neptune" && (
        <>
          <ellipse cx="50" cy="38" rx="44" ry="3" fill="#5568d0" opacity="0.3" />
          <ellipse cx="50" cy="58" rx="44" ry="4" fill="#5568d0" opacity="0.25" />
          <ellipse cx="38" cy="45" rx="6" ry="5" fill="#1e2d70" opacity="0.4" />
        </>
      )}
      {planet.name === "Uranus" && (
        <>
          <ellipse cx="50" cy="40" rx="44" ry="5" fill="#88c8d8" opacity="0.2" />
          <ellipse cx="50" cy="60" rx="44" ry="4" fill="#5a9aaa" opacity="0.2" />
        </>
      )}
      {planet.name === "Mercury" && (
        <>
          <circle cx="35" cy="35" r="5" fill="#6b5d50" opacity="0.3" />
          <circle cx="58" cy="48" r="4" fill="#6b5d50" opacity="0.25" />
          <circle cx="42" cy="62" r="6" fill="#6b5d50" opacity="0.2" />
          <circle cx="62" cy="30" r="3" fill="#6b5d50" opacity="0.3" />
        </>
      )}

      <circle cx="50" cy="50" r="46" fill={`url(#${id}-shadow)`} />
      <circle cx="50" cy="50" r="46" fill={`url(#${id}-highlight)`} />
    </svg>
  );
}

/* ── Ring SVG for Saturn/Uranus ── */
function RingSVG({ planet, size }: { planet: Planet; size: number }) {
  if (!planet.hasRings) return null;
  const isSaturn = planet.name === "Saturn";
  const ringWidth = isSaturn ? size * 2.4 : size * 1.8;
  const ringHeight = isSaturn ? size * 0.7 : size * 0.5;
  const tilt = planet.name === "Uranus" ? 82 : 0;

  return (
    <svg
      width={ringWidth}
      height={ringHeight}
      viewBox={`0 0 ${ringWidth} ${ringHeight}`}
      className="absolute left-1/2 top-1/2 pointer-events-none"
      style={{
        marginLeft: -ringWidth / 2,
        marginTop: -ringHeight / 2,
        transform: `rotate(${tilt}deg)`,
      }}
    >
      <defs>
        <linearGradient id={`ring-${planet.name}-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={planet.color} stopOpacity="0.05" />
          <stop offset="20%" stopColor={planet.color} stopOpacity="0.3" />
          <stop offset="50%" stopColor={planet.color} stopOpacity="0.4" />
          <stop offset="80%" stopColor={planet.color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={planet.color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {isSaturn ? (
        <>
          <ellipse cx={ringWidth / 2} cy={ringHeight / 2} rx={ringWidth * 0.46} ry={ringHeight * 0.46}
            fill="none" stroke={`url(#ring-${planet.name}-${size})`} strokeWidth={ringWidth * 0.04} />
          <ellipse cx={ringWidth / 2} cy={ringHeight / 2} rx={ringWidth * 0.40} ry={ringHeight * 0.40}
            fill="none" stroke={planet.color} strokeWidth={ringWidth * 0.02} opacity="0.2" />
          <ellipse cx={ringWidth / 2} cy={ringHeight / 2} rx={ringWidth * 0.36} ry={ringHeight * 0.36}
            fill="none" stroke={`url(#ring-${planet.name}-${size})`} strokeWidth={ringWidth * 0.05} />
          <ellipse cx={ringWidth / 2} cy={ringHeight / 2} rx={ringWidth * 0.30} ry={ringHeight * 0.30}
            fill="none" stroke={planet.color} strokeWidth={ringWidth * 0.01} opacity="0.15" />
        </>
      ) : (
        <>
          <ellipse cx={ringWidth / 2} cy={ringHeight / 2} rx={ringWidth * 0.44} ry={ringHeight * 0.44}
            fill="none" stroke={planet.color} strokeWidth={ringWidth * 0.02} opacity="0.2" />
          <ellipse cx={ringWidth / 2} cy={ringHeight / 2} rx={ringWidth * 0.38} ry={ringHeight * 0.38}
            fill="none" stroke={planet.color} strokeWidth={ringWidth * 0.015} opacity="0.15" />
        </>
      )}
    </svg>
  );
}

/* ── Orbiting moons around the planet detail view ── */
function OrbitingMoons({ moons, planetSize }: { moons: Moon[]; planetSize: number }) {
  const [positions, setPositions] = useState<{ x: number; y: number }[]>(
    () => moons.map(() => ({ x: 0, y: 0 }))
  );
  const rafRef = useRef(0);

  useEffect(() => {
    const startTime = performance.now();
    const baseRadius = planetSize * 0.55;

    function tick(now: number) {
      const elapsed = (now - startTime) / 1000;
      const next = moons.map((moon, i) => {
        const orbitR = baseRadius + 16 + i * 20;
        // Faster orbits for visualization (scale days to seconds)
        const speed = 8 + moon.orbitDays * 1.5;
        const angle = (elapsed / speed) * Math.PI * 2 + i * 1.3;
        return {
          x: Math.cos(angle) * orbitR,
          y: Math.sin(angle) * orbitR * 0.35, // flatten for perspective
        };
      });
      setPositions(next);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [moons, planetSize]);

  return (
    <>
      {/* Orbit rings */}
      {moons.map((moon, i) => {
        const orbitR = planetSize * 0.55 + 16 + i * 20;
        return (
          <div
            key={`orbit-${moon.name}`}
            className="absolute left-1/2 top-1/2 rounded-full border border-white/[0.06] pointer-events-none"
            style={{
              width: orbitR * 2,
              height: orbitR * 2 * 0.35,
              marginLeft: -orbitR,
              marginTop: -orbitR * 0.35,
            }}
          />
        );
      })}
      {/* Moon dots */}
      {moons.map((moon, i) => {
        const pos = positions[i];
        const moonSize = Math.max(4, Math.min(10, 3 + Math.sqrt(moon.radiusKm / 200)));
        return (
          <div
            key={moon.name}
            className="absolute left-1/2 top-1/2 group pointer-events-none"
            style={{
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
              zIndex: pos.y > 0 ? 12 : 8,
            }}
          >
            <div
              className="rounded-full"
              style={{
                width: moonSize,
                height: moonSize,
                backgroundColor: moon.color,
                boxShadow: `0 0 4px 1px ${moon.color}40`,
              }}
            />
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 whitespace-nowrap text-[8px] text-foreground/50">
              {moon.name}
            </span>
          </div>
        );
      })}
    </>
  );
}

/* ── Solar system RAF-based orbits ── */
function SolarSystemView({
  onSelectPlanet,
  selectedPlanet,
}: {
  onSelectPlanet: (p: Planet) => void;
  selectedPlanet: Planet | null;
}) {
  const [positions, setPositions] = useState<{ x: number; y: number }[]>(
    () => PLANETS.map(() => ({ x: 0, y: 0 }))
  );
  const rafRef = useRef(0);

  useEffect(() => {
    const startAngles = PLANETS.map(
      (p) => ((p.distanceAU * 137.5) % 360) * (Math.PI / 180)
    );
    const durations = PLANETS.map((p) => getOrbitalDuration(p.orbitalPeriodYears));
    const radii = PLANETS.map((p) => getOrbitRadius(p.distanceAU));
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = (now - startTime) / 1000;
      const next = PLANETS.map((_, i) => {
        const angle = startAngles[i] + (elapsed / durations[i]) * Math.PI * 2;
        return {
          x: Math.cos(angle) * radii[i],
          y: Math.sin(angle) * radii[i],
        };
      });
      setPositions(next);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="absolute inset-0">
      {/* Sun */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div
          className="h-8 w-8 rounded-full"
          style={{
            background: "radial-gradient(circle, #fef3c7 0%, #f59e0b 40%, #d97706 100%)",
            boxShadow: "0 0 30px 10px rgba(245, 158, 11, 0.3), 0 0 60px 20px rgba(245, 158, 11, 0.1)",
          }}
        />
      </div>

      {/* Orbit rings */}
      {PLANETS.map((planet) => {
        const orbitR = getOrbitRadius(planet.distanceAU);
        return (
          <div
            key={`orbit-${planet.name}`}
            className="absolute left-1/2 top-1/2 rounded-full border border-white/[0.06] pointer-events-none"
            style={{
              width: orbitR * 2,
              height: orbitR * 2,
              marginLeft: -orbitR,
              marginTop: -orbitR,
            }}
          />
        );
      })}

      {/* Planets */}
      {PLANETS.map((planet, i) => {
        const size = getPlanetSize(planet.radiusKm);
        const ringExtra = planet.hasRings ? size * 0.8 : 0;
        const pos = positions[i];
        return (
          <button
            key={planet.name}
            onClick={(e) => { e.stopPropagation(); onSelectPlanet(planet); }}
            className="absolute group cursor-pointer"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
              zIndex: selectedPlanet?.name === planet.name ? 15 : 5,
              padding: 6,
            }}
          >
            <div className="relative flex items-center justify-center">
              <PlanetSVG planet={planet} size={size + ringExtra} />
              {planet.hasRings && <RingSVG planet={planet} size={size} />}
            </div>
            <span
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-[10px] font-medium transition-opacity duration-200 ${
                selectedPlanet?.name === planet.name
                  ? "opacity-100 text-foreground"
                  : "opacity-0 group-hover:opacity-100 text-foreground/70"
              }`}
            >
              {planet.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Nebula cloud (decorative background element) ── */
function NebulaCloud({
  x,
  y,
  size,
  color,
  opacity,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
}) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size * 0.6,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(ellipse, ${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}, transparent 70%)`,
        filter: `blur(${size * 0.3}px)`,
      }}
    />
  );
}

/* ── Star dot (local cluster) ── */
function StarDot({
  star,
  onSelect,
  isSelected,
}: {
  star: NearbyStar;
  onSelect: (s: NearbyStar) => void;
  isSelected: boolean;
}) {
  const left = 50 + (star.x / 14) * 38;
  const top = 50 + (star.y / 14) * 38;
  const dotSize = Math.max(3, Math.min(8, 7 - star.magnitude * 0.3));

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onSelect(star); }}
      className="absolute group"
      style={{ left: `${left}%`, top: `${top}%`, transform: "translate(-50%, -50%)", padding: 8 }}
    >
      <div className="relative">
        {/* Diffraction spikes for bright stars */}
        {star.magnitude < 2 && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div
              className="absolute"
              style={{
                width: 1,
                height: dotSize * 4,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                background: `linear-gradient(to bottom, transparent, ${star.color}40, transparent)`,
              }}
            />
            <div
              className="absolute"
              style={{
                width: dotSize * 4,
                height: 1,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                background: `linear-gradient(to right, transparent, ${star.color}40, transparent)`,
              }}
            />
          </div>
        )}
        <motion.div
          className="rounded-full"
          animate={{
            boxShadow: isSelected
              ? `0 0 14px 5px ${star.color}60`
              : `0 0 6px 2px ${star.color}30`,
          }}
          style={{ width: dotSize, height: dotSize, backgroundColor: star.color }}
        />
        <span
          className={`absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium transition-opacity duration-200 ${
            isSelected ? "opacity-100 text-foreground" : "opacity-0 group-hover:opacity-100 text-foreground/70"
          }`}
        >
          {star.name}
        </span>
        <span
          className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 whitespace-nowrap text-[8px] text-muted-foreground transition-opacity duration-200 ${
            isSelected ? "opacity-100" : "opacity-0"
          }`}
        >
          {star.distanceLY} ly
        </span>
      </div>
    </button>
  );
}

/* ── SVG Galaxy rendering ── */
function GalaxySVG({ galaxy, size }: { galaxy: NearbyGalaxy; size: number }) {
  const id = `gx-${galaxy.name.replace(/\s/g, "")}`;
  const { visualType, color, colorSecondary, tilt, rotation } = galaxy;

  // Generate spiral arm path
  function spiralArmPath(startAngle: number, clockwise: boolean, length: number): string {
    const points: string[] = [];
    const dir = clockwise ? 1 : -1;
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const angle = startAngle + dir * t * length * Math.PI;
      const r = 4 + t * 42;
      const x = 50 + Math.cos(angle) * r;
      const y = 50 + Math.sin(angle) * r;
      points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return points.join(" ");
  }

  const scaleY = Math.max(0.3, 1 - (tilt / 90) * 0.7);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="pointer-events-none"
      style={{ transform: `rotate(${rotation}deg) scaleY(${scaleY})` }}
    >
      <defs>
        {/* Core glow */}
        <radialGradient id={`${id}-core`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffae6" stopOpacity="0.9" />
          <stop offset="15%" stopColor={color} stopOpacity="0.7" />
          <stop offset="40%" stopColor={colorSecondary} stopOpacity="0.2" />
          <stop offset="100%" stopColor={colorSecondary} stopOpacity="0" />
        </radialGradient>
        {/* Outer halo */}
        <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="0.04" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        {/* Arm glow filter */}
        <filter id={`${id}-blur`}>
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <filter id={`${id}-blur-lg`}>
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* Outer halo */}
      <circle cx="50" cy="50" r="48" fill={`url(#${id}-halo)`} />

      {visualType === "spiral" || visualType === "barred-spiral" ? (
        <>
          {/* Spiral arms — glowing trails */}
          {[0, Math.PI].map((startAngle, i) => (
            <g key={i}>
              {/* Wide glow */}
              <path
                d={spiralArmPath(startAngle, true, 1.6)}
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.08"
                filter={`url(#${id}-blur-lg)`}
              />
              {/* Medium glow */}
              <path
                d={spiralArmPath(startAngle, true, 1.6)}
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.15"
                filter={`url(#${id}-blur)`}
              />
              {/* Core arm line */}
              <path
                d={spiralArmPath(startAngle, true, 1.6)}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.3"
              />
            </g>
          ))}
          {/* Secondary arms (fainter) */}
          {[Math.PI / 2, Math.PI * 1.5].map((startAngle, i) => (
            <g key={`sec-${i}`}>
              <path
                d={spiralArmPath(startAngle, true, 1.3)}
                fill="none"
                stroke={colorSecondary}
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.06"
                filter={`url(#${id}-blur-lg)`}
              />
              <path
                d={spiralArmPath(startAngle, true, 1.3)}
                fill="none"
                stroke={colorSecondary}
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.15"
              />
            </g>
          ))}
          {/* Bar for barred spirals */}
          {visualType === "barred-spiral" && (
            <ellipse
              cx="50"
              cy="50"
              rx="14"
              ry="4"
              fill={color}
              opacity="0.15"
              filter={`url(#${id}-blur)`}
            />
          )}
          {/* Dust lane hints */}
          <path
            d={spiralArmPath(0.3, true, 1.4)}
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.06"
          />
          {/* Bright star-forming regions along arms */}
          {[0, Math.PI].map((base) =>
            [0.3, 0.5, 0.7, 0.9].map((t, j) => {
              const angle = base + t * 1.6 * Math.PI;
              const r = 4 + t * 42;
              return (
                <circle
                  key={`sf-${base}-${j}`}
                  cx={50 + Math.cos(angle) * r}
                  cy={50 + Math.sin(angle) * r}
                  r={1 + Math.random()}
                  fill={color}
                  opacity={0.3 + Math.random() * 0.2}
                  filter={`url(#${id}-blur)`}
                />
              );
            })
          )}
        </>
      ) : visualType === "elliptical" ? (
        <>
          {/* Smooth elliptical glow */}
          <ellipse cx="50" cy="50" rx="30" ry="20" fill={color} opacity="0.1" filter={`url(#${id}-blur-lg)`} />
          <ellipse cx="50" cy="50" rx="20" ry="14" fill={color} opacity="0.15" filter={`url(#${id}-blur)`} />
        </>
      ) : (
        <>
          {/* Irregular — amorphous cloud-like shape */}
          <ellipse cx="48" cy="48" rx="25" ry="18" fill={color} opacity="0.08" filter={`url(#${id}-blur-lg)`} transform="rotate(-15 48 48)" />
          <ellipse cx="54" cy="52" rx="20" ry="14" fill={color} opacity="0.12" filter={`url(#${id}-blur)`} transform="rotate(20 54 52)" />
          <ellipse cx="46" cy="54" rx="15" ry="10" fill={colorSecondary} opacity="0.1" filter={`url(#${id}-blur)`} transform="rotate(-30 46 54)" />
          {/* Bright knots of star formation */}
          <circle cx="42" cy="46" r="3" fill={color} opacity="0.2" filter={`url(#${id}-blur)`} />
          <circle cx="56" cy="52" r="2" fill={color} opacity="0.15" filter={`url(#${id}-blur)`} />
        </>
      )}

      {/* Central core glow (all types) */}
      <circle cx="50" cy="50" r="20" fill={`url(#${id}-core)`} />
      {/* Bright nucleus */}
      <circle cx="50" cy="50" r="3" fill="#fffae6" opacity="0.6" filter={`url(#${id}-blur)`} />
    </svg>
  );
}

/* ── Galaxy button with SVG rendering ── */
function GalaxyButton({
  galaxy,
  onSelect,
  isSelected,
}: {
  galaxy: NearbyGalaxy;
  onSelect: (g: NearbyGalaxy) => void;
  isSelected: boolean;
}) {
  const left = 50 + (galaxy.x / 11) * 40;
  const top = 50 + (galaxy.y / 11) * 40;
  const svgSize = Math.max(40, Math.min(120, 20 + Math.sqrt(galaxy.diameterKly) * 8));
  const isMilkyWay = galaxy.name === "Milky Way";

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onSelect(galaxy); }}
      className="absolute group"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isMilkyWay ? 10 : isSelected ? 12 : 5,
      }}
    >
      <div className="relative flex items-center justify-center" style={{ width: svgSize, height: svgSize }}>
        <motion.div
          animate={{
            scale: isSelected ? 1.15 : 1,
            filter: isSelected ? "brightness(1.4)" : "brightness(1)",
          }}
          transition={{ duration: 0.3 }}
        >
          <GalaxySVG galaxy={galaxy} size={svgSize} />
        </motion.div>
        {isMilkyWay && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold text-yellow-200/70">
            You are here
          </span>
        )}
        <span
          className={`absolute ${isMilkyWay ? "-bottom-4" : "-bottom-2"} left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium transition-opacity duration-200 ${
            isSelected ? "opacity-100 text-foreground" : isMilkyWay ? "opacity-60 text-foreground/60" : "opacity-0 group-hover:opacity-100 text-foreground/70"
          }`}
        >
          {galaxy.name}
        </span>
      </div>
    </button>
  );
}

/* ── Sol / Sun info panel ── */
function SolInfoPanel({ onClose, onZoomIn }: { onClose: () => void; onZoomIn: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 w-64 rounded-xl bg-card/90 border border-white/10 backdrop-blur-md p-4 shadow-xl z-20"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Sol (The Sun)</h3>
          <p className="text-[11px] text-muted-foreground">G2V Main-Sequence Star</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={14} />
        </button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
        Our star. A 4.6 billion year old yellow dwarf containing 99.86% of the solar system&apos;s mass. Its core fuses 600 million tons of hydrogen per second at 15 million °C.
      </p>
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="rounded-lg bg-white/5 p-2">
          <span className="text-muted-foreground">Radius</span>
          <p className="font-mono font-medium text-foreground">696,340 km</p>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <span className="text-muted-foreground">Surface Temp</span>
          <p className="font-mono font-medium text-foreground">5,778 K</p>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <span className="text-muted-foreground">Age</span>
          <p className="font-mono font-medium text-foreground">4.6 Gyr</p>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <span className="text-muted-foreground">Luminosity</span>
          <p className="font-mono font-medium text-foreground">3.83 × 10²⁶ W</p>
        </div>
      </div>
      <button
        onClick={onZoomIn}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-foreground hover:bg-white/15 transition-colors"
      >
        <ZoomIn size={12} />
        Zoom to Solar System
      </button>
    </motion.div>
  );
}

/* ── Star info panel ── */
function StarInfoPanel({ star, onClose }: { star: NearbyStar; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 w-64 rounded-xl bg-card/90 border border-white/10 backdrop-blur-md p-4 shadow-xl z-20"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{star.name}</h3>
          <p className="text-[11px] text-muted-foreground">{star.spectralType}</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={14} />
        </button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{star.description}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-white/5 p-2">
          <span className="text-muted-foreground">Distance</span>
          <p className="font-mono font-medium text-foreground">{star.distanceLY} ly</p>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <span className="text-muted-foreground">Magnitude</span>
          <p className="font-mono font-medium text-foreground">{star.magnitude}</p>
        </div>
        <div className="col-span-2 rounded-lg bg-white/5 p-2">
          <span className="text-muted-foreground">Spectral Type</span>
          <p className="font-mono font-medium text-foreground">{star.spectralType}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Galaxy info panel ── */
function GalaxyInfoPanel({ galaxy, onClose }: { galaxy: NearbyGalaxy; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 w-72 rounded-xl bg-card/90 border border-white/10 backdrop-blur-md p-4 shadow-xl z-20"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{galaxy.name}</h3>
          <p className="text-[11px] text-muted-foreground">{galaxy.type}</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={14} />
        </button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{galaxy.description}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-white/5 p-2">
          <span className="text-muted-foreground">Distance</span>
          <p className="font-mono font-medium text-foreground">
            {galaxy.distanceMly === 0 ? "—" : `${galaxy.distanceMly} Mly`}
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <span className="text-muted-foreground">Diameter</span>
          <p className="font-mono font-medium text-foreground">{galaxy.diameterKly.toLocaleString()} kly</p>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <span className="text-muted-foreground">Stars</span>
          <p className="font-mono font-medium text-foreground">{galaxy.stars}</p>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <span className="text-muted-foreground">Type</span>
          <p className="font-mono font-medium text-foreground text-[10px]">{galaxy.type.split(" ")[0]}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Stat cell helper ── */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/[0.06] p-2.5">
      <span className="text-muted-foreground text-[9px] uppercase tracking-wider">{label}</span>
      <p className="font-mono font-medium text-foreground text-[12px] mt-0.5">{value}</p>
    </div>
  );
}

/* ── Planet detail view with orbiting moons ── */
function PlanetDetailView({ planet, onClose }: { planet: Planet; onClose: () => void }) {
  const displaySize = Math.min(200, 90 + Math.sqrt(planet.radiusKm / 50));
  const [selectedMoon, setSelectedMoon] = useState<Moon | null>(null);

  return (
    <motion.div
      className="absolute inset-0 z-30 bg-[#020208]/95 backdrop-blur-sm overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row items-center justify-center min-h-full gap-4 md:gap-10 px-6 py-14">
        {/* Back button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-40 flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-md hover:bg-white/15 transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {/* Planet with orbiting moons — left side */}
        <motion.div
          className="relative shrink-0 flex items-center justify-center"
          style={{ width: displaySize + 120, height: displaySize + 80 }}
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="relative flex items-center justify-center">
            <PlanetSVG planet={planet} size={displaySize} detailed />
            {planet.hasRings && <RingSVG planet={planet} size={displaySize * 0.75} />}
          </div>
          {/* Orbiting moons */}
          {planet.namedMoons.length > 0 && (
            <OrbitingMoons moons={planet.namedMoons} planetSize={displaySize} />
          )}
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-sm font-semibold text-foreground whitespace-nowrap">
            {planet.name}
          </span>
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[11px] text-muted-foreground whitespace-nowrap">
            {planet.type}
          </span>
        </motion.div>

        {/* Stats — right side */}
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            {planet.description}
          </p>

          <div className="grid grid-cols-3 gap-1.5 text-xs mb-3">
            <Stat label="Distance" value={`${planet.distanceAU} AU`} />
            <Stat label="Radius" value={`${planet.radiusKm.toLocaleString()} km`} />
            <Stat label="Mass" value={planet.massKg} />
            <Stat label="Gravity" value={`${planet.gravity} m/s²`} />
            <Stat label="Temperature" value={planet.surfaceTemp} />
            <Stat label="Day Length" value={planet.dayLength} />
            <Stat
              label="Orbital Period"
              value={
                planet.orbitalPeriodYears < 1
                  ? `${Math.round(planet.orbitalPeriodYears * 365)} days`
                  : `${planet.orbitalPeriodYears} years`
              }
            />
            <Stat label="Moons" value={String(planet.moons)} />
            <Stat label="Rings" value={planet.hasRings ? "Yes" : "No"} />
          </div>

          {/* Atmosphere */}
          <div className="rounded-lg bg-white/5 border border-white/[0.06] p-2.5 mb-3">
            <span className="text-muted-foreground text-[9px] uppercase tracking-wider">Atmosphere</span>
            <p className="font-mono text-foreground text-[11px] mt-0.5">{planet.atmosphere}</p>
          </div>

          {/* Named moons list */}
          {planet.namedMoons.length > 0 && (
            <div>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                Notable Moons
              </span>
              <div className="mt-1 space-y-1">
                {planet.namedMoons.map((moon) => (
                  <button
                    key={moon.name}
                    onClick={() => setSelectedMoon(selectedMoon?.name === moon.name ? null : moon)}
                    className={`w-full text-left rounded-lg p-2 text-xs transition-colors ${
                      selectedMoon?.name === moon.name
                        ? "bg-white/10 border border-white/10"
                        : "bg-white/[0.03] hover:bg-white/[0.06] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: moon.color }}
                      />
                      <span className="font-medium text-foreground">{moon.name}</span>
                      <span className="text-muted-foreground ml-auto text-[10px]">
                        {moon.radiusKm.toLocaleString()} km
                      </span>
                    </div>
                    <AnimatePresence>
                      {selectedMoon?.name === moon.name && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed overflow-hidden"
                        >
                          {moon.description}
                          <span className="block mt-1 font-mono text-foreground/60">
                            Orbit: {moon.orbitDays < 1 ? `${Math.round(moon.orbitDays * 24)}h` : `${moon.orbitDays}d`}
                            {" · "}
                            Distance: {(moon.distanceKm / 1000).toFixed(0)}k km
                          </span>
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── Main component ── */
export default function DeepSpaceView() {
  const [viewMode, setViewMode] = useState<ViewMode>("solar-system");
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [selectedStar, setSelectedStar] = useState<NearbyStar | null>(null);
  const [selectedGalaxy, setSelectedGalaxy] = useState<NearbyGalaxy | null>(null);
  const [showSolInfo, setShowSolInfo] = useState(false);

  const bgStars = useMemo(
    () =>
      Array.from({ length: 250 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        twinkleDelay: Math.random() * 4,
        twinkleDuration: 2 + Math.random() * 3,
      })),
    []
  );

  const currentIdx = VIEW_ORDER.indexOf(viewMode);

  const clearSelections = useCallback(() => {
    setSelectedPlanet(null);
    setSelectedStar(null);
    setSelectedGalaxy(null);
    setShowSolInfo(false);
  }, []);

  const goNext = useCallback(() => {
    clearSelections();
    const next = VIEW_ORDER[currentIdx + 1];
    if (next) setViewMode(next);
  }, [currentIdx, clearSelections]);

  const goPrev = useCallback(() => {
    clearSelections();
    const prev = VIEW_ORDER[currentIdx - 1];
    if (prev) setViewMode(prev);
  }, [currentIdx, clearSelections]);

  // Background click → zoom out one level
  const handleBackgroundClick = useCallback(() => {
    // If something is selected, deselect first
    if (selectedPlanet || selectedStar || selectedGalaxy || showSolInfo) {
      clearSelections();
      return;
    }
    // Otherwise zoom out
    const idx = VIEW_ORDER.indexOf(viewMode);
    if (idx < VIEW_ORDER.length - 1) {
      setViewMode(VIEW_ORDER[idx + 1]);
    }
  }, [viewMode, selectedPlanet, selectedStar, selectedGalaxy, showSolInfo, clearSelections]);

  // Sol click: first click → show info, second click → zoom to solar system
  const handleSolClick = useCallback(() => {
    if (showSolInfo) {
      clearSelections();
      setViewMode("solar-system");
    } else {
      setSelectedStar(null);
      setShowSolInfo(true);
    }
  }, [showSolInfo, clearSelections]);

  // Milky Way click: first click → select/info, second click → zoom to local cluster
  const handleGalaxySelect = useCallback((g: NearbyGalaxy) => {
    setSelectedPlanet(null);
    setSelectedStar(null);
    setShowSolInfo(false);
    if (g.name === "Milky Way" && selectedGalaxy?.name === "Milky Way") {
      clearSelections();
      setViewMode("local-cluster");
    } else {
      setSelectedGalaxy(g);
    }
  }, [selectedGalaxy, clearSelections]);

  const labels = VIEW_LABELS[viewMode];

  return (
    <FadeIn>
      <div className="relative overflow-hidden rounded-2xl border border-white/5">
        <div className="relative aspect-[16/10] w-full bg-[#020208] overflow-hidden">
          {/* Starfield */}
          {bgStars.map((s) => (
            <motion.div
              key={s.id}
              className="absolute rounded-full bg-white"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
              animate={{ opacity: [s.opacity, s.opacity * 0.3, s.opacity] }}
              transition={{
                duration: s.twinkleDuration,
                delay: s.twinkleDelay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Solar System view — 3D */}
          <motion.div
            className="absolute inset-0"
            animate={{
              opacity: viewMode === "solar-system" ? 1 : 0,
            }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ pointerEvents: viewMode === "solar-system" ? "auto" : "none" }}
          >
            {viewMode === "solar-system" && (
              <SolarSystemScene
                onSelectPlanet={(p) => {
                  setSelectedStar(null);
                  setSelectedGalaxy(null);
                  setSelectedPlanet(p);
                }}
              />
            )}
          </motion.div>

          {/* Local Cluster view */}
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{
              opacity: viewMode === "local-cluster" ? 1 : 0,
              scale: viewMode === "local-cluster" ? 1 : viewMode === "solar-system" ? 3 : 0.01,
            }}
            transition={{
              duration: 1.8,
              ease: [0.25, 0.1, 0.25, 1],
              delay: viewMode === "local-cluster" ? 0.3 : 0,
            }}
            style={{ pointerEvents: viewMode === "local-cluster" ? "auto" : "none" }}
            onClick={handleBackgroundClick}
          >
            {/* Nebula clouds — atmospheric background */}
            <NebulaCloud x={25} y={30} size={180} color="#4a2060" opacity={0.06} />
            <NebulaCloud x={70} y={65} size={220} color="#203050" opacity={0.05} />
            <NebulaCloud x={55} y={20} size={140} color="#2a4060" opacity={0.04} />
            <NebulaCloud x={15} y={75} size={160} color="#402040" opacity={0.05} />
            <NebulaCloud x={80} y={30} size={100} color="#204040" opacity={0.04} />

            {/* Sol */}
            <button
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); handleSolClick(); }}
              style={{ padding: 8 }}
            >
              <motion.div
                className="rounded-full"
                animate={{
                  boxShadow: showSolInfo
                    ? "0 0 18px 7px rgba(250, 204, 21, 0.7)"
                    : [
                        "0 0 8px 3px rgba(250, 204, 21, 0.4)",
                        "0 0 14px 5px rgba(250, 204, 21, 0.6)",
                        "0 0 8px 3px rgba(250, 204, 21, 0.4)",
                      ],
                }}
                transition={showSolInfo ? { duration: 0.3 } : { duration: 3, repeat: Infinity }}
                style={{ width: 6, height: 6, background: "radial-gradient(circle, #fef3c7, #f59e0b)" }}
              />
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-yellow-400 whitespace-nowrap">
                Sol
              </span>
            </button>

            {/* Distance rings */}
            {[5, 10].map((ly) => (
              <div
                key={ly}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[0.04]"
                style={{ width: `${(ly / 14) * 76}%`, height: `${(ly / 14) * 76}%` }}
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-muted/40">
                  {ly} ly
                </span>
              </div>
            ))}

            {NEARBY_STARS.map((star) => (
              <StarDot
                key={star.name}
                star={star}
                onSelect={(s) => {
                  setSelectedPlanet(null);
                  setSelectedGalaxy(null);
                  setSelectedStar(s);
                }}
                isSelected={selectedStar?.name === star.name}
              />
            ))}
          </motion.div>

          {/* Galactic view */}
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{
              opacity: viewMode === "galactic" ? 1 : 0,
              scale: viewMode === "galactic" ? 1 : 3,
            }}
            transition={{
              duration: 1.8,
              ease: [0.25, 0.1, 0.25, 1],
              delay: viewMode === "galactic" ? 0.3 : 0,
            }}
            style={{ pointerEvents: viewMode === "galactic" ? "auto" : "none" }}
            onClick={handleBackgroundClick}
          >
            {/* Cosmic dust / intergalactic medium clouds */}
            <NebulaCloud x={20} y={25} size={250} color="#1a1030" opacity={0.08} />
            <NebulaCloud x={75} y={60} size={300} color="#0a1828" opacity={0.07} />
            <NebulaCloud x={40} y={80} size={200} color="#180820" opacity={0.06} />
            <NebulaCloud x={60} y={15} size={180} color="#0a2030" opacity={0.05} />
            <NebulaCloud x={85} y={40} size={150} color="#201028" opacity={0.06} />
            <NebulaCloud x={10} y={55} size={220} color="#100a20" opacity={0.05} />

            {/* Magellanic Stream — tidal bridge between MCs and Milky Way */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="mag-stream" x1="0%" y1="0%" x2="100%">
                  <stop offset="0%" stopColor="#c8c8c0" stopOpacity="0" />
                  <stop offset="30%" stopColor="#c8c8c0" stopOpacity="0.04" />
                  <stop offset="70%" stopColor="#d8d0c0" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#d8d0c0" stopOpacity="0" />
                </linearGradient>
                <filter id="stream-blur"><feGaussianBlur stdDeviation="0.5" /></filter>
              </defs>
              {/* Stream from MW center to LMC/SMC region */}
              <path
                d="M 50 50 Q 42 48 43 60 Q 44 68 38 72"
                fill="none"
                stroke="url(#mag-stream)"
                strokeWidth="2"
                filter="url(#stream-blur)"
              />
            </svg>

            {/* Distance rings in Mly */}
            {[1, 2, 3].map((mly) => (
              <div
                key={mly}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[0.03]"
                style={{ width: `${(mly / 3.5) * 80}%`, height: `${(mly / 3.5) * 80}%` }}
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-white/15">
                  {mly} Mly
                </span>
              </div>
            ))}

            {NEARBY_GALAXIES.map((galaxy) => (
              <GalaxyButton
                key={galaxy.name}
                galaxy={galaxy}
                onSelect={handleGalaxySelect}
                isSelected={selectedGalaxy?.name === galaxy.name}
              />
            ))}
          </motion.div>

          {/* Info panels */}
          <AnimatePresence>
            {showSolInfo && viewMode === "local-cluster" && (
              <SolInfoPanel
                onClose={() => setShowSolInfo(false)}
                onZoomIn={() => { clearSelections(); setViewMode("solar-system"); }}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {selectedStar && <StarInfoPanel star={selectedStar} onClose={() => setSelectedStar(null)} />}
          </AnimatePresence>
          <AnimatePresence>
            {selectedGalaxy && <GalaxyInfoPanel galaxy={selectedGalaxy} onClose={() => setSelectedGalaxy(null)} />}
          </AnimatePresence>
          <AnimatePresence>
            {selectedPlanet && <PlanetDetailView planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />}
          </AnimatePresence>

          {/* Navigation — prev/next arrows */}
          {!selectedPlanet && (
            <div className="absolute bottom-4 left-4 z-20 flex gap-2">
              {currentIdx > 0 && (
                <button
                  onClick={goPrev}
                  className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-md transition-all hover:bg-white/15"
                >
                  <ChevronLeft size={14} />
                  {VIEW_LABELS[VIEW_ORDER[currentIdx - 1]].title}
                </button>
              )}
              {currentIdx < VIEW_ORDER.length - 1 && (
                <button
                  onClick={goNext}
                  className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-md transition-all hover:bg-white/15"
                >
                  {VIEW_LABELS[VIEW_ORDER[currentIdx + 1]].title}
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          )}

          {/* Scale indicator */}
          {!selectedPlanet && (
            <div className="absolute bottom-4 right-4 z-20 rounded-lg bg-white/5 px-3 py-2 text-[10px] text-muted-foreground backdrop-blur-md">
              {labels.scale}
            </div>
          )}

          {/* View label */}
          {!selectedPlanet && (
            <div className="absolute top-4 left-4 z-20">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-white/5 px-3 py-2 backdrop-blur-md"
              >
                <span className="text-xs font-semibold text-foreground">{labels.title}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">{labels.subtitle}</p>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}
