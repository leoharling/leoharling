"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomOut, ZoomIn, ArrowLeft } from "lucide-react";
import {
  PLANETS,
  NEARBY_STARS,
  getOrbitRadius,
  getPlanetSize,
  getOrbitalDuration,
  type Planet,
  type NearbyStar,
} from "@/lib/space-data";
import FadeIn from "@/components/ui/FadeIn";

type ViewMode = "solar-system" | "local-cluster";

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
  const id = `planet-${planet.name}-${detailed ? "detail" : "orbit"}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="pointer-events-none"
    >
      <defs>
        {/* Base radial gradient with light source from upper-left */}
        <radialGradient id={`${id}-base`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={colors[0]} stopOpacity="1" />
          <stop offset="50%" stopColor={colors[1] || colors[0]} stopOpacity="0.9" />
          <stop offset="100%" stopColor={colors[2] || colors[0]} stopOpacity="0.5" />
        </radialGradient>
        {/* Shadow on the dark side */}
        <radialGradient id={`${id}-shadow`} cx="70%" cy="65%" r="55%">
          <stop offset="0%" stopColor="black" stopOpacity="0.5" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </radialGradient>
        {/* Specular highlight */}
        <radialGradient id={`${id}-highlight`} cx="30%" cy="28%" r="25%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        {/* Atmosphere glow for gas giants */}
        <radialGradient id={`${id}-atmo`} cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor={colors[0]} stopOpacity="0" />
          <stop offset="100%" stopColor={colors[0]} stopOpacity="0.15" />
        </radialGradient>
      </defs>

      {/* Atmosphere glow */}
      <circle cx="50" cy="50" r="50" fill={`url(#${id}-atmo)`} />

      {/* Planet body */}
      <circle cx="50" cy="50" r="46" fill={`url(#${id}-base)`} />

      {/* Planet-specific surface features */}
      {planet.name === "Earth" && (
        <>
          {/* Continents */}
          <ellipse cx="38" cy="40" rx="12" ry="10" fill="#3a7d44" opacity="0.5" />
          <ellipse cx="60" cy="55" rx="8" ry="14" fill="#3a7d44" opacity="0.4" />
          <ellipse cx="35" cy="62" rx="6" ry="5" fill="#3a7d44" opacity="0.3" />
          {/* Ice caps */}
          <ellipse cx="50" cy="10" rx="14" ry="5" fill="white" opacity="0.25" />
          <ellipse cx="50" cy="90" rx="12" ry="4" fill="white" opacity="0.2" />
        </>
      )}
      {planet.name === "Jupiter" && (
        <>
          {/* Bands */}
          <ellipse cx="50" cy="30" rx="44" ry="4" fill="#a86b20" opacity="0.4" />
          <ellipse cx="50" cy="42" rx="44" ry="3" fill="#d4a050" opacity="0.3" />
          <ellipse cx="50" cy="55" rx="44" ry="5" fill="#8b5e14" opacity="0.35" />
          <ellipse cx="50" cy="68" rx="44" ry="3" fill="#d4a050" opacity="0.3" />
          {/* Great Red Spot */}
          <ellipse cx="62" cy="55" rx="7" ry="5" fill="#c04020" opacity="0.6" />
        </>
      )}
      {planet.name === "Saturn" && (
        <>
          {/* Bands */}
          <ellipse cx="50" cy="35" rx="44" ry="3" fill="#b89838" opacity="0.3" />
          <ellipse cx="50" cy="50" rx="44" ry="4" fill="#c8a850" opacity="0.25" />
          <ellipse cx="50" cy="65" rx="44" ry="3" fill="#b89838" opacity="0.3" />
        </>
      )}
      {planet.name === "Mars" && (
        <>
          {/* Polar ice cap */}
          <ellipse cx="50" cy="10" rx="10" ry="4" fill="white" opacity="0.3" />
          {/* Dark regions */}
          <ellipse cx="40" cy="45" rx="10" ry="8" fill="#8b2500" opacity="0.3" />
          <ellipse cx="65" cy="55" rx="8" ry="6" fill="#8b2500" opacity="0.25" />
        </>
      )}
      {planet.name === "Venus" && (
        <>
          {/* Thick cloud swirls */}
          <ellipse cx="40" cy="40" rx="20" ry="6" fill="#f0dbb8" opacity="0.3" transform="rotate(-15 40 40)" />
          <ellipse cx="55" cy="55" rx="18" ry="5" fill="#f0dbb8" opacity="0.25" transform="rotate(10 55 55)" />
        </>
      )}
      {planet.name === "Neptune" && (
        <>
          {/* Atmospheric bands */}
          <ellipse cx="50" cy="38" rx="44" ry="3" fill="#5568d0" opacity="0.3" />
          <ellipse cx="50" cy="58" rx="44" ry="4" fill="#5568d0" opacity="0.25" />
          {/* Great Dark Spot */}
          <ellipse cx="38" cy="45" rx="6" ry="5" fill="#1e2d70" opacity="0.4" />
        </>
      )}
      {planet.name === "Uranus" && (
        <>
          {/* Subtle banding */}
          <ellipse cx="50" cy="40" rx="44" ry="5" fill="#88c8d8" opacity="0.2" />
          <ellipse cx="50" cy="60" rx="44" ry="4" fill="#5a9aaa" opacity="0.2" />
        </>
      )}
      {planet.name === "Mercury" && (
        <>
          {/* Craters */}
          <circle cx="35" cy="35" r="5" fill="#6b5d50" opacity="0.3" />
          <circle cx="58" cy="48" r="4" fill="#6b5d50" opacity="0.25" />
          <circle cx="42" cy="62" r="6" fill="#6b5d50" opacity="0.2" />
          <circle cx="62" cy="30" r="3" fill="#6b5d50" opacity="0.3" />
        </>
      )}

      {/* Shadow overlay */}
      <circle cx="50" cy="50" r="46" fill={`url(#${id}-shadow)`} />
      {/* Specular highlight */}
      <circle cx="50" cy="50" r="46" fill={`url(#${id}-highlight)`} />
    </svg>
  );
}

/* ── Ring SVG for Saturn/Uranus ── */
function RingSVG({
  planet,
  size,
}: {
  planet: Planet;
  size: number;
}) {
  if (!planet.hasRings) return null;

  const isSaturn = planet.name === "Saturn";
  const ringWidth = isSaturn ? size * 2.4 : size * 1.8;
  const ringHeight = isSaturn ? size * 0.7 : size * 0.5;
  // Uranus is tilted ~98 degrees
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
        <linearGradient id={`ring-${planet.name}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={planet.color} stopOpacity="0.05" />
          <stop offset="20%" stopColor={planet.color} stopOpacity="0.3" />
          <stop offset="50%" stopColor={planet.color} stopOpacity="0.4" />
          <stop offset="80%" stopColor={planet.color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={planet.color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Multiple ring bands */}
      {isSaturn ? (
        <>
          <ellipse cx={ringWidth / 2} cy={ringHeight / 2} rx={ringWidth * 0.46} ry={ringHeight * 0.46}
            fill="none" stroke={`url(#ring-${planet.name})`} strokeWidth={ringWidth * 0.04} />
          <ellipse cx={ringWidth / 2} cy={ringHeight / 2} rx={ringWidth * 0.40} ry={ringHeight * 0.40}
            fill="none" stroke={planet.color} strokeWidth={ringWidth * 0.02} opacity="0.2" />
          <ellipse cx={ringWidth / 2} cy={ringHeight / 2} rx={ringWidth * 0.36} ry={ringHeight * 0.36}
            fill="none" stroke={`url(#ring-${planet.name})`} strokeWidth={ringWidth * 0.05} />
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

/* ── Orbiting planets — uses RAF for position, no rotating wrappers ── */
function SolarSystemView({
  onSelectPlanet,
  selectedPlanet,
}: {
  onSelectPlanet: (p: Planet) => void;
  selectedPlanet: Planet | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<
    { x: number; y: number; angle: number }[]
  >(() => PLANETS.map(() => ({ x: 0, y: 0, angle: 0 })));
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const startAngles = PLANETS.map(
      (p) => ((p.distanceAU * 137.5) % 360) * (Math.PI / 180)
    );
    const durations = PLANETS.map((p) =>
      getOrbitalDuration(p.orbitalPeriodYears)
    );
    const radii = PLANETS.map((p) => getOrbitRadius(p.distanceAU));
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = (now - startTime) / 1000;
      const next = PLANETS.map((_, i) => {
        const angle =
          startAngles[i] + (elapsed / durations[i]) * Math.PI * 2;
        return {
          x: Math.cos(angle) * radii[i],
          y: Math.sin(angle) * radii[i],
          angle,
        };
      });
      setPositions(next);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {/* Sun */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div
          className="h-8 w-8 rounded-full"
          style={{
            background:
              "radial-gradient(circle, #fef3c7 0%, #f59e0b 40%, #d97706 100%)",
            boxShadow:
              "0 0 30px 10px rgba(245, 158, 11, 0.3), 0 0 60px 20px rgba(245, 158, 11, 0.1)",
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

      {/* Planet buttons — absolutely positioned via RAF positions */}
      {PLANETS.map((planet, i) => {
        const size = getPlanetSize(planet.radiusKm);
        const ringExtra = planet.hasRings ? size * 0.8 : 0;
        const pos = positions[i];
        return (
          <button
            key={planet.name}
            onClick={() => onSelectPlanet(planet)}
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
            {/* Label — hover to show, like stars */}
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
      onClick={() => onSelect(star)}
      className="absolute group"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: "translate(-50%, -50%)",
        padding: 8,
      }}
    >
      <div className="relative">
        <motion.div
          className="rounded-full"
          animate={{
            boxShadow: isSelected
              ? `0 0 14px 5px ${star.color}60`
              : `0 0 6px 2px ${star.color}30`,
          }}
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: star.color,
          }}
        />
        <span
          className={`absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium transition-opacity duration-200 ${
            isSelected
              ? "opacity-100 text-foreground"
              : "opacity-0 group-hover:opacity-100 text-foreground/70"
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

/* ── Star info panel ── */
function StarInfoPanel({
  star,
  onClose,
}: {
  star: NearbyStar;
  onClose: () => void;
}) {
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
          <p className="text-[11px] text-muted-foreground">
            {star.spectralType}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
        {star.description}
      </p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-white/5 p-2">
          <span className="text-muted-foreground">Distance</span>
          <p className="font-mono font-medium text-foreground">
            {star.distanceLY} ly
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <span className="text-muted-foreground">Magnitude</span>
          <p className="font-mono font-medium text-foreground">
            {star.magnitude}
          </p>
        </div>
        <div className="col-span-2 rounded-lg bg-white/5 p-2">
          <span className="text-muted-foreground">Spectral Type</span>
          <p className="font-mono font-medium text-foreground">
            {star.spectralType}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Planet detail view (zoom-in) ── */
function PlanetDetailView({
  planet,
  onClose,
}: {
  planet: Planet;
  onClose: () => void;
}) {
  const displaySize = Math.min(240, 100 + Math.sqrt(planet.radiusKm / 40));

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 px-6 py-8 bg-[#020208]/95 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-40 flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-md hover:bg-white/15 transition-colors"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      {/* Planet — left side */}
      <motion.div
        className="relative shrink-0 flex items-center justify-center"
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <PlanetSVG planet={planet} size={displaySize} detailed />
        {planet.hasRings && <RingSVG planet={planet} size={displaySize * 0.75} />}
        {/* Name below */}
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-semibold text-foreground whitespace-nowrap">
          {planet.name}
        </span>
        <span className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-[11px] text-muted-foreground whitespace-nowrap">
          {planet.type}
        </span>
      </motion.div>

      {/* Stats — right side */}
      <motion.div
        className="w-full max-w-xs"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {planet.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-white/5 border border-white/[0.06] p-3">
            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
              Distance
            </span>
            <p className="font-mono font-medium text-foreground mt-1">
              {planet.distanceAU} AU
            </p>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/[0.06] p-3">
            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
              Radius
            </span>
            <p className="font-mono font-medium text-foreground mt-1">
              {planet.radiusKm.toLocaleString()} km
            </p>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/[0.06] p-3">
            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
              Temperature
            </span>
            <p className="font-mono font-medium text-foreground mt-1">
              {planet.surfaceTemp}
            </p>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/[0.06] p-3">
            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
              Moons
            </span>
            <p className="font-mono font-medium text-foreground mt-1">
              {planet.moons}
            </p>
          </div>
          <div className="col-span-2 rounded-lg bg-white/5 border border-white/[0.06] p-3">
            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
              Orbital Period
            </span>
            <p className="font-mono font-medium text-foreground mt-1">
              {planet.orbitalPeriodYears < 1
                ? `${Math.round(planet.orbitalPeriodYears * 365)} days`
                : `${planet.orbitalPeriodYears} years`}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main component ── */
export default function DeepSpaceView() {
  const [viewMode, setViewMode] = useState<ViewMode>("solar-system");
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [selectedStar, setSelectedStar] = useState<NearbyStar | null>(null);

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

  const toggleView = useCallback(() => {
    setSelectedPlanet(null);
    setSelectedStar(null);
    setViewMode((v) =>
      v === "solar-system" ? "local-cluster" : "solar-system"
    );
  }, []);

  return (
    <FadeIn>
      <div className="relative overflow-hidden rounded-2xl border border-white/5">
        <div className="relative aspect-[16/10] w-full bg-[#020208] overflow-hidden">
          {/* Starfield background */}
          {bgStars.map((s) => (
            <motion.div
              key={s.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
              }}
              animate={{ opacity: [s.opacity, s.opacity * 0.3, s.opacity] }}
              transition={{
                duration: s.twinkleDuration,
                delay: s.twinkleDelay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Warp flash on transition */}
          <AnimatePresence>
            {viewMode === "local-cluster" && (
              <motion.div
                className="absolute inset-0 z-10 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 blur-xl"
                  initial={{ width: 4, height: 4, opacity: 0 }}
                  animate={{
                    width: [4, 300, 4],
                    height: [4, 300, 4],
                    opacity: [0, 0.4, 0],
                  }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Solar System view */}
          <motion.div
            className="absolute inset-0"
            animate={{
              scale: viewMode === "solar-system" ? 1 : 0.005,
              opacity: viewMode === "solar-system" ? 1 : 0,
            }}
            transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              pointerEvents: viewMode === "solar-system" ? "auto" : "none",
            }}
          >
            <SolarSystemView
              onSelectPlanet={(p) => {
                setSelectedStar(null);
                setSelectedPlanet(p);
              }}
              selectedPlanet={selectedPlanet}
            />
          </motion.div>

          {/* Local Cluster view */}
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{
              opacity: viewMode === "local-cluster" ? 1 : 0,
              scale: viewMode === "local-cluster" ? 1 : 3,
            }}
            transition={{
              duration: 1.8,
              ease: [0.25, 0.1, 0.25, 1],
              delay: viewMode === "local-cluster" ? 0.3 : 0,
            }}
            style={{
              pointerEvents: viewMode === "local-cluster" ? "auto" : "none",
            }}
          >
            {/* Sol at center */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <motion.div
                className="rounded-full"
                animate={{
                  boxShadow: [
                    "0 0 8px 3px rgba(250, 204, 21, 0.4)",
                    "0 0 14px 5px rgba(250, 204, 21, 0.6)",
                    "0 0 8px 3px rgba(250, 204, 21, 0.4)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  width: 6,
                  height: 6,
                  background: "radial-gradient(circle, #fef3c7, #f59e0b)",
                }}
              />
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-yellow-400 whitespace-nowrap">
                Sol
              </span>
            </div>

            {/* Distance rings */}
            {[5, 10].map((ly) => (
              <div
                key={ly}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[0.04]"
                style={{
                  width: `${(ly / 14) * 76}%`,
                  height: `${(ly / 14) * 76}%`,
                }}
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-muted/40">
                  {ly} ly
                </span>
              </div>
            ))}

            {/* Nearby stars */}
            {NEARBY_STARS.map((star) => (
              <StarDot
                key={star.name}
                star={star}
                onSelect={(s) => {
                  setSelectedPlanet(null);
                  setSelectedStar(s);
                }}
                isSelected={selectedStar?.name === star.name}
              />
            ))}
          </motion.div>

          {/* Star info panel */}
          <AnimatePresence>
            {selectedStar && (
              <StarInfoPanel
                star={selectedStar}
                onClose={() => setSelectedStar(null)}
              />
            )}
          </AnimatePresence>

          {/* Planet detail view */}
          <AnimatePresence>
            {selectedPlanet && (
              <PlanetDetailView
                planet={selectedPlanet}
                onClose={() => setSelectedPlanet(null)}
              />
            )}
          </AnimatePresence>

          {/* View toggle */}
          {!selectedPlanet && (
            <div className="absolute bottom-4 left-4 z-20 flex gap-2">
              <button
                onClick={toggleView}
                className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-md transition-all hover:bg-white/15"
              >
                {viewMode === "solar-system" ? (
                  <>
                    <ZoomOut size={14} />
                    Zoom to Local Cluster
                  </>
                ) : (
                  <>
                    <ZoomIn size={14} />
                    Zoom to Solar System
                  </>
                )}
              </button>
            </div>
          )}

          {/* Scale indicator */}
          {!selectedPlanet && (
            <div className="absolute bottom-4 right-4 z-20 rounded-lg bg-white/5 px-3 py-2 text-[10px] text-muted-foreground backdrop-blur-md">
              {viewMode === "solar-system" ? (
                <span>
                  Scale: Astronomical Units (AU) &middot; Click planets to
                  explore
                </span>
              ) : (
                <span>
                  Scale: Light Years (ly) &middot; Click stars for info
                </span>
              )}
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
                <span className="text-xs font-semibold text-foreground">
                  {viewMode === "solar-system"
                    ? "Our Solar System"
                    : "Local Stellar Neighborhood"}
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {viewMode === "solar-system"
                    ? "8 planets orbiting the Sun"
                    : "Stars within ~12 light-years of Sol"}
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}
