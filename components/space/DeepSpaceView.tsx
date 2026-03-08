"use client";

import { useState, useMemo, useCallback } from "react";
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

/* ── Planet on its orbit ── */
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

      {/* Rotating container — pointer-events:none so outer orbits don't block inner ones */}
      <div
        className="absolute left-1/2 top-1/2 pointer-events-none"
        style={{
          width: orbitR * 2,
          height: orbitR * 2,
          marginLeft: -orbitR,
          marginTop: -orbitR,
          animation: `spin ${duration}s linear infinite`,
          animationDelay: `-${(startAngle / 360) * duration}s`,
        }}
      >
        {/* Planet button — positioned at left edge, re-enables pointer events */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(planet);
          }}
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 group cursor-pointer pointer-events-auto"
          style={{ padding: 14, zIndex: 5 }}
        >
          <div className="relative">
            <div
              className="rounded-full transition-shadow duration-200"
              style={{
                width: size,
                height: size,
                backgroundColor: planet.color,
                boxShadow: isSelected
                  ? `0 0 18px 6px ${planet.color}80`
                  : `0 0 8px 2px ${planet.color}40`,
              }}
            />
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

          {/* Label — hidden by default, visible on hover, counter-rotates to stay upright */}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{
              animation: `spin ${duration}s linear infinite reverse`,
              animationDelay: `-${(startAngle / 360) * duration}s`,
            }}
          >
            <span className="text-[10px] font-medium text-foreground/70">
              {planet.name}
            </span>
          </div>
        </button>
      </div>
    </>
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

/* ── Star info panel (overlay, same as before) ── */
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
          <h3 className="text-sm font-semibold text-foreground">
            {star.name}
          </h3>
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
  const displaySize = Math.min(220, 80 + Math.sqrt(planet.radiusKm / 50));

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

      {/* Planet sphere — left side */}
      <motion.div
        className="relative shrink-0 flex items-center justify-center"
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div
          className="rounded-full relative"
          style={{
            width: displaySize,
            height: displaySize,
            background: `radial-gradient(circle at 35% 35%, ${planet.color}ee, ${planet.color}88 50%, ${planet.color}33 100%)`,
            boxShadow: `0 0 60px 15px ${planet.color}30, inset -${displaySize * 0.15}px -${displaySize * 0.05}px ${displaySize * 0.3}px ${planet.color}20`,
          }}
        >
          {/* Subtle surface texture */}
          <div
            className="absolute inset-0 rounded-full opacity-20"
            style={{
              background: `radial-gradient(ellipse at 60% 40%, transparent 40%, rgba(0,0,0,0.4) 100%)`,
            }}
          />
          {/* Highlight */}
          <div
            className="absolute rounded-full opacity-30"
            style={{
              width: displaySize * 0.25,
              height: displaySize * 0.2,
              top: "15%",
              left: "20%",
              background: `radial-gradient(ellipse, rgba(255,255,255,0.6), transparent)`,
              filter: "blur(4px)",
            }}
          />
        </div>
        {/* Rings for Saturn / Uranus */}
        {planet.hasRings && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 opacity-30 pointer-events-none"
            style={{
              width: displaySize * 1.8,
              height: displaySize * 0.5,
              borderColor: planet.color,
              boxShadow: `0 0 12px 2px ${planet.color}20`,
            }}
          />
        )}
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
            {/* Sun */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div
                className="h-7 w-7 rounded-full"
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

          {/* Star info panel (for local cluster) */}
          <AnimatePresence>
            {selectedStar && (
              <StarInfoPanel
                star={selectedStar}
                onClose={() => setSelectedStar(null)}
              />
            )}
          </AnimatePresence>

          {/* Planet detail view (zoom-in overlay) */}
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
