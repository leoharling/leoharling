"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { SCALE_BANDS } from "@/lib/space-zoom";

// ── Band scenes (dynamic, no SSR) ───────────────────────
const SpaceportGlobe = dynamic(
  () => import("@/components/space/SpaceportGlobe"),
  { ssr: false }
);
const OrbitBand = dynamic(
  () => import("@/components/space/OrbitBand"),
  { ssr: false }
);
const SolarSystemBand = dynamic(
  () => import("@/components/space/SolarSystemBand"),
  { ssr: false }
);
const StellarBand = dynamic(
  () => import("@/components/space/StellarBand"),
  { ssr: false }
);
const GalacticBand = dynamic(
  () => import("@/components/space/GalacticBand"),
  { ssr: false }
);

// ── Starfield background ─────────────────────────────────
function Starfield() {
  const stars = useMemo(
    () =>
      Array.from({ length: 200 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.15,
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 3,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((s) => (
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
            duration: s.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

// ── Zoom slider (vertical) ──────────────────────────────
function ZoomSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (i: number) => void;
}) {
  return (
    <nav className="flex flex-col items-center gap-1 py-4 px-2">
      {SCALE_BANDS.map((stop, i) => {
        const active = i === value;
        const Icon = stop.Icon;
        return (
          <div key={stop.id} className="flex flex-col items-center">
            <button
              onClick={() => onChange(i)}
              className="group relative flex flex-col items-center gap-0.5"
            >
              <motion.div
                animate={{ scale: active ? 1 : 0.85 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-accent/15 text-accent shadow-[0_0_10px_rgba(59,130,246,0.15)]"
                    : "text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-white/[0.04]"
                }`}
              >
                <Icon size={14} strokeWidth={active ? 2 : 1.5} />
              </motion.div>
              <span
                className={`text-[8px] font-medium transition-colors duration-200 whitespace-nowrap leading-none ${
                  active ? "text-foreground" : "text-muted-foreground/30"
                }`}
              >
                {stop.label}
              </span>
            </button>
            {i < SCALE_BANDS.length - 1 && (
              <div className="relative mt-1 h-4 w-[1px] bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="absolute inset-x-0 top-0 rounded-full bg-accent/25"
                  animate={{ height: i < value ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ── Mobile zoom pills ────────────────────────────────────
function MobileZoomBar({
  value,
  onChange,
}: {
  value: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="flex gap-1 px-2 py-1.5 overflow-x-auto md:hidden">
      {SCALE_BANDS.map((stop, i) => (
        <button
          key={stop.id}
          onClick={() => onChange(i)}
          className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all whitespace-nowrap ${
            value === i
              ? "bg-accent text-white"
              : "text-muted-foreground/60 bg-white/5"
          }`}
        >
          {stop.label}
        </button>
      ))}
    </div>
  );
}

// ── Launch data fetcher ──────────────────────────────────
interface Launch {
  id: string;
  name: string;
  net: string;
  status: { name: string };
  launch_service_provider: { name: string };
  rocket: { configuration: { name: string } };
  pad: { name: string; location: { name: string } };
  image?: { image_url?: string } | null;
  mission?: {
    description?: string;
    type?: string;
    orbit?: { name?: string; abbrev?: string };
  } | null;
}

function useLaunches() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  useEffect(() => {
    fetch("/api/launches?type=upcoming")
      .then((r) => r.json())
      .then((d) => {
        if (d.results) setLaunches(d.results);
      })
      .catch(() => {});
  }, []);
  return launches;
}

// ── Transition config ────────────────────────────────────
const FADE_DURATION = 0.8;
const FADE_EASE = "easeInOut";

// ── Main SpaceMap component ──────────────────────────────
//
// Transition strategy:
//   Earth ↔ Orbit: SAME R3F canvas (SpaceportGlobe is always rendered).
//     Orbit band overlays (OrbitBand) fade in on top. Spaceport markers
//     hide when orbit is active. This avoids two competing canvases.
//
//   Orbit ↔ Solar System ↔ Stars ↔ Galaxies: Simple opacity crossfade.
//     Each band is absolute-positioned, only the active one is visible.
//     No scale transforms — they don't work across separate canvases.
//
export default function SpaceMap() {
  const [band, setBand] = useState(0);
  const launches = useLaunches();

  const handleSetBand = (newBand: number) => {
    if (newBand === band || newBand < 0 || newBand >= SCALE_BANDS.length) return;
    setBand(newBand);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex gap-0">
        {/* Vertical zoom slider — desktop */}
        <div className="hidden md:flex flex-col justify-center shrink-0 rounded-l-xl border border-r-0 border-white/[0.06] bg-[#030712]">
          <ZoomSlider value={band} onChange={handleSetBand} />
        </div>

        {/* Map viewport */}
        <div className="flex-1 flex flex-col rounded-xl md:rounded-l-none border border-white/[0.06] bg-[#030712] overflow-hidden">
          <MobileZoomBar value={band} onChange={handleSetBand} />

          <div className="relative w-full" style={{ height: "calc(100vh - 10rem)" }}>
            <Starfield />

            {/* ── Layer 0: Earth globe with spaceports ── */}
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: band === 0 ? 1 : 0 }}
              transition={{ duration: FADE_DURATION, ease: FADE_EASE }}
              style={{
                pointerEvents: band === 0 ? "auto" : "none",
                zIndex: band === 0 ? 10 : 1,
              }}
            >
              <SpaceportGlobe launches={launches} />
            </motion.div>

            {/* ── Layer 1: Orbit (satellites) ── */}
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: band === 1 ? 1 : 0 }}
              transition={{ duration: FADE_DURATION, ease: FADE_EASE }}
              style={{
                pointerEvents: band === 1 ? "auto" : "none",
                zIndex: band === 1 ? 10 : 1,
              }}
            >
              <OrbitBand />
            </motion.div>

            {/* ── Layer 2: Solar System (3D R3F) ── */}
            <motion.div
              className="absolute inset-0"
              animate={{
                opacity: band === 2 ? 1 : 0,
              }}
              transition={{
                duration: 1.2,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{ pointerEvents: band === 2 ? "auto" : "none", zIndex: band === 2 ? 5 : 1 }}
            >
              {(band === 2 || band === 1 || band === 3) && <SolarSystemBand />}
            </motion.div>

            {/* ── Layer 3: Stars (SVG) — scale+opacity like original DeepSpaceView ── */}
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={{
                opacity: band === 3 ? 1 : 0,
                scale: band === 3 ? 1 : band < 3 ? 3 : 0.01,
              }}
              transition={{
                duration: 1.8,
                ease: [0.25, 0.1, 0.25, 1],
                delay: band === 3 ? 0.3 : 0,
              }}
              style={{ pointerEvents: band === 3 ? "auto" : "none", zIndex: band === 3 ? 5 : 1 }}
            >
              {(band === 3 || band === 2 || band === 4) && (
                <StellarBand onNavigate={(d) => handleSetBand(d === "prev" ? 2 : 4)} />
              )}
            </motion.div>

            {/* ── Layer 4: Galaxies (SVG) — scale+opacity ── */}
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={{
                opacity: band === 4 ? 1 : 0,
                scale: band === 4 ? 1 : 3,
              }}
              transition={{
                duration: 1.8,
                ease: [0.25, 0.1, 0.25, 1],
                delay: band === 4 ? 0.3 : 0,
              }}
              style={{ pointerEvents: band === 4 ? "auto" : "none", zIndex: band === 4 ? 5 : 1 }}
            >
              {(band === 4 || band === 3) && (
                <GalacticBand onNavigate={() => handleSetBand(3)} />
              )}
            </motion.div>

            {/* Band description — centered so it never overlaps left legend or right controls */}
            <AnimatePresence mode="wait">
              <motion.div
                key={band}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none max-w-sm text-center"
              >
                <p className="text-[11px] text-white/45 leading-relaxed">
                  {SCALE_BANDS[band].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Scale indicator */}
            <div className="absolute bottom-3 right-3 z-20 pointer-events-none">
              <div className="rounded bg-black/50 px-2 py-1 text-[9px] text-muted-foreground/60 font-mono">
                {SCALE_BANDS[band].scaleLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
