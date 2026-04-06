"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ArrowLeft } from "lucide-react";
import {
  type Planet,
  type Moon,
  type NearbyStar,
  type NearbyGalaxy,
} from "@/lib/space-data";
import dynamic from "next/dynamic";

const PlanetPreview3D = dynamic(
  () => import("@/components/space/PlanetPreview3D"),
  { ssr: false }
);

/* ── Shared types ── */
export type ViewMode = "solar-system" | "local-cluster" | "galactic";

export const VIEW_ORDER: ViewMode[] = ["solar-system", "local-cluster", "galactic"];
export const VIEW_LABELS: Record<ViewMode, { title: string; subtitle: string; scale: string }> = {
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
export const PLANET_GRADIENTS: Record<string, string[]> = {
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
export function PlanetSVG({
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
export function RingSVG({ planet, size }: { planet: Planet; size: number }) {
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

/* ── Nebula cloud (decorative background element) ── */
export function NebulaCloud({
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
export function StarDot({
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
export function GalaxySVG({ galaxy, size }: { galaxy: NearbyGalaxy; size: number }) {
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
export function GalaxyButton({
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
export function SolInfoPanel({ onClose, onZoomIn }: { onClose: () => void; onZoomIn: () => void }) {
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
export function StarInfoPanel({ star, onClose }: { star: NearbyStar; onClose: () => void }) {
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
export function GalaxyInfoPanel({ galaxy, onClose }: { galaxy: NearbyGalaxy; onClose: () => void }) {
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
export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/[0.06] p-2.5">
      <span className="text-muted-foreground text-[9px] uppercase tracking-wider">{label}</span>
      <p className="font-mono font-medium text-foreground text-[12px] mt-0.5">{value}</p>
    </div>
  );
}

/* ── Planet detail view with orbiting moons ── */
export function PlanetDetailView({ planet, onClose }: { planet: Planet; onClose: () => void }) {
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
      <div className="flex flex-col items-center min-h-full px-6 py-14 overflow-y-auto">
        {/* Back button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-40 flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-md hover:bg-white/15 transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {/* Planet with orbiting moons — centered, large */}
        <motion.div
          className="relative flex items-center justify-center mx-auto"
          style={{ width: Math.min(displaySize + 250, 500), height: Math.min(displaySize + 250, 500) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <PlanetPreview3D
            planetName={planet.name}
            hasRings={!!planet.hasRings}
            size={Math.min(displaySize + 250, 500)}
            moons={planet.namedMoons}
          />
        </motion.div>

        {/* Planet name + type */}
        <div className="text-center mt-2 mb-6">
          <h2 className="text-xl font-bold text-foreground">{planet.name}</h2>
          <p className="text-sm text-muted-foreground">{planet.type}</p>
        </div>

        {/* Stats — centered below */}
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
