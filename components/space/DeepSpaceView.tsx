"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomOut, ZoomIn, Minimize2, Maximize2 } from "lucide-react";
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

function PlanetOrbit({
  planet,
  onSelect,
  isSelected,
}: {
  planet: Planet;
  onSelect: (p: Planet) => void;
  isSelected: boolean;
}) {
  const orbitR = getOrbitRadius(planet.distanceAU);
  const size = getPlanetSize(planet.radiusKm);
  const duration = getOrbitalDuration(planet.orbitalPeriodYears);
  // Random start angle per planet for visual variety
  const startAngle = useMemo(
    () => Math.floor(planet.distanceAU * 137.5) % 360,
    [planet.distanceAU]
  );

  return (
    <>
      {/* Orbit ring */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full border border-white/[0.06]"
        style={{
          width: orbitR * 2,
          height: orbitR * 2,
          marginLeft: -orbitR,
          marginTop: -orbitR,
        }}
      />

      {/* Rotating container */}
      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{
          width: orbitR * 2,
          height: orbitR * 2,
          marginLeft: -orbitR,
          marginTop: -orbitR,
        }}
        initial={{ rotate: startAngle }}
        animate={{ rotate: startAngle + 360 }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Planet dot — positioned at left edge of rotating container */}
        <button
          onClick={() => onSelect(planet)}
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 group"
          style={{ padding: 8 }}
        >
          <div className="relative">
            <div
              className="rounded-full transition-shadow duration-200"
              style={{
                width: size,
                height: size,
                backgroundColor: planet.color,
                boxShadow: isSelected
                  ? `0 0 12px 4px ${planet.color}80`
                  : `0 0 6px 1px ${planet.color}40`,
              }}
            />
            {/* Saturn rings */}
            {planet.hasRings && (
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-40"
                style={{
                  width: size * 2.2,
                  height: size * 0.8,
                  borderColor: planet.color,
                }}
              />
            )}
          </div>

          {/* Counter-rotating label on hover */}
          <motion.div
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
            animate={{ rotate: -(startAngle + 360) }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span className="text-[10px] font-medium text-foreground/70">
              {planet.name}
            </span>
          </motion.div>
        </button>
      </motion.div>
    </>
  );
}

function StarDot({
  star,
  onSelect,
  isSelected,
}: {
  star: NearbyStar;
  onSelect: (s: NearbyStar) => void;
  isSelected: boolean;
}) {
  // Map x,y (in light-years, range roughly -12 to +12) to percentage position
  const left = 50 + (star.x / 14) * 38;
  const top = 50 + (star.y / 14) * 38;
  // Brighter stars = bigger dots (magnitude is inverted — lower = brighter)
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

function InfoPanel({
  planet,
  star,
  onClose,
}: {
  planet?: Planet | null;
  star?: NearbyStar | null;
  onClose: () => void;
}) {
  if (!planet && !star) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 w-64 rounded-xl bg-card/90 border border-white/10 backdrop-blur-md p-4 shadow-xl z-20"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {planet?.name || star?.name}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {planet?.type || star?.spectralType}
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
        {planet?.description || star?.description}
      </p>

      {planet && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-muted-foreground">Distance</span>
            <p className="font-mono font-medium text-foreground">
              {planet.distanceAU} AU
            </p>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-muted-foreground">Radius</span>
            <p className="font-mono font-medium text-foreground">
              {planet.radiusKm.toLocaleString()} km
            </p>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-muted-foreground">Temperature</span>
            <p className="font-mono font-medium text-foreground">
              {planet.surfaceTemp}
            </p>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-muted-foreground">Moons</span>
            <p className="font-mono font-medium text-foreground">
              {planet.moons}
            </p>
          </div>
          <div className="col-span-2 rounded-lg bg-white/5 p-2">
            <span className="text-muted-foreground">Orbital Period</span>
            <p className="font-mono font-medium text-foreground">
              {planet.orbitalPeriodYears < 1
                ? `${Math.round(planet.orbitalPeriodYears * 365)} days`
                : `${planet.orbitalPeriodYears} years`}
            </p>
          </div>
        </div>
      )}

      {star && (
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
      )}
    </motion.div>
  );
}

export default function DeepSpaceView() {
  const [viewMode, setViewMode] = useState<ViewMode>("solar-system");
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [selectedStar, setSelectedStar] = useState<NearbyStar | null>(null);

  // Background stars
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

  const toggleView = () => {
    setSelectedPlanet(null);
    setSelectedStar(null);
    setViewMode((v) =>
      v === "solar-system" ? "local-cluster" : "solar-system"
    );
  };

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
          >
            {/* Sun */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div
                className="h-6 w-6 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, #fef3c7 0%, #f59e0b 40%, #d97706 100%)",
                  boxShadow:
                    "0 0 30px 10px rgba(245, 158, 11, 0.3), 0 0 60px 20px rgba(245, 158, 11, 0.1)",
                }}
              />
            </div>

            {/* Planets */}
            {PLANETS.map((planet) => (
              <PlanetOrbit
                key={planet.name}
                planet={planet}
                onSelect={(p) => {
                  setSelectedStar(null);
                  setSelectedPlanet(p);
                }}
                isSelected={selectedPlanet?.name === planet.name}
              />
            ))}
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
                  background:
                    "radial-gradient(circle, #fef3c7, #f59e0b)",
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

          {/* Info Panel */}
          <AnimatePresence>
            {(selectedPlanet || selectedStar) && (
              <InfoPanel
                planet={selectedPlanet}
                star={selectedStar}
                onClose={() => {
                  setSelectedPlanet(null);
                  setSelectedStar(null);
                }}
              />
            )}
          </AnimatePresence>

          {/* View toggle */}
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

          {/* Scale indicator */}
          <div className="absolute bottom-4 right-4 z-20 rounded-lg bg-white/5 px-3 py-2 text-[10px] text-muted-foreground backdrop-blur-md">
            {viewMode === "solar-system" ? (
              <span>
                Scale: Astronomical Units (AU) &middot; Click planets for info
              </span>
            ) : (
              <span>
                Scale: Light Years (ly) &middot; Click stars for info
              </span>
            )}
          </div>

          {/* View label */}
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
        </div>
      </div>
    </FadeIn>
  );
}
