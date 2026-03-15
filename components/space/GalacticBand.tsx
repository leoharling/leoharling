"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import {
  NEARBY_GALAXIES,
  type NearbyGalaxy,
} from "@/lib/space-data";
import {
  NebulaCloud,
  GalaxyButton,
  GalaxyInfoPanel,
  VIEW_ORDER,
  VIEW_LABELS,
} from "@/components/space/deep-space-shared";

export default function GalacticBand({
  onNavigate,
}: {
  onNavigate?: (direction: "prev" | "next") => void;
}) {
  const [selectedGalaxy, setSelectedGalaxy] = useState<NearbyGalaxy | null>(null);

  const handleBackgroundClick = useCallback(() => {
    if (selectedGalaxy) {
      setSelectedGalaxy(null);
    }
  }, [selectedGalaxy]);

  const handleGalaxySelect = useCallback((g: NearbyGalaxy) => {
    if (g.name === "Milky Way" && selectedGalaxy?.name === "Milky Way") {
      setSelectedGalaxy(null);
      onNavigate?.("prev");
    } else {
      setSelectedGalaxy(g);
    }
  }, [selectedGalaxy, onNavigate]);

  return (
    <div className="relative h-full w-full" onClick={handleBackgroundClick}>
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

      {/* Info panel */}
      <AnimatePresence>
        {selectedGalaxy && (
          <GalaxyInfoPanel galaxy={selectedGalaxy} onClose={() => setSelectedGalaxy(null)} />
        )}
      </AnimatePresence>

    </div>
  );
}
