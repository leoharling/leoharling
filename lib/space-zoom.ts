"use client";

import { createContext, useContext } from "react";
import { Rocket, Globe, Sun, Sparkles, Telescope } from "lucide-react";

// ── Scale band definitions ───────────────────────────────
export const SCALE_BANDS = [
  { id: "earth", label: "Earth", scaleLabel: "Surface", Icon: Rocket, description: "Active spaceports and upcoming launches pinned on the globe. Click a marker to see mission details and live countdown." },
  { id: "orbit", label: "Orbit", scaleLabel: "LEO–GEO", Icon: Globe, description: "Live satellite positions in low Earth, medium, and geostationary orbit — propagated in real time from TLE data." },
  { id: "solar-system", label: "Solar System", scaleLabel: "AU", Icon: Sun, description: "The eight planets with accurate orbital periods shown in motion. Sizes are illustrative — actual distances are vastly larger." },
  { id: "stellar", label: "Stars", scaleLabel: "Light Years", Icon: Sparkles, description: "Nearby star systems within ~100 light-years, color-coded by spectral class. Our Sun sits at the center." },
  { id: "galactic", label: "Galaxies", scaleLabel: "Mly", Icon: Telescope, description: "Known galaxy clusters and deep-sky objects spanning billions of light-years of the observable universe." },
] as const;

export type ScaleBandId = (typeof SCALE_BANDS)[number]["id"];

// ── Transition labels shown during zoom ──────────────────
export const TRANSITION_LABELS: Record<string, string> = {
  "0→1": "Rising to orbital altitude…",
  "1→0": "Descending to Earth…",
  "1→2": "Expanding to planetary scale…",
  "2→1": "Returning to Earth orbit…",
  "2→3": "Zooming to stellar distances…",
  "3→2": "Returning to Solar System…",
  "3→4": "Expanding to intergalactic scale…",
  "4→3": "Returning to stellar neighborhood…",
};

export function getTransitionLabel(from: number, to: number): string {
  return TRANSITION_LABELS[`${from}→${to}`] ?? "";
}

// ── Zoom context ─────────────────────────────────────────
export interface SpaceZoomState {
  band: number;
  setBand: (band: number) => void;
  prevBand: number;
  isTransitioning: boolean;
}

export const SpaceZoomContext = createContext<SpaceZoomState>({
  band: 0,
  setBand: () => {},
  prevBand: 0,
  isTransitioning: false,
});

export function useSpaceZoom() {
  return useContext(SpaceZoomContext);
}
