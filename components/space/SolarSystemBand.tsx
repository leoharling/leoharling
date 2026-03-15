"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { type Planet } from "@/lib/space-data";
import { type DeepSpaceProbe } from "@/lib/deep-space-probes";
import { PlanetDetailView } from "@/components/space/deep-space-shared";
import ProbeInfoPanel from "@/components/space/ProbeInfoPanel";
import dynamic from "next/dynamic";

const SolarSystemScene = dynamic(
  () => import("@/components/space/SolarSystemScene"),
  { ssr: false }
);

export default function SolarSystemBand() {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [selectedProbe, setSelectedProbe] = useState<DeepSpaceProbe | null>(null);

  const handleSelectPlanet = useCallback((p: Planet) => {
    setSelectedProbe(null);
    setSelectedPlanet(p);
  }, []);

  const handleSelectProbe = useCallback((probe: DeepSpaceProbe | null) => {
    setSelectedPlanet(null);
    setSelectedProbe(probe);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    if (selectedPlanet || selectedProbe) {
      setSelectedPlanet(null);
      setSelectedProbe(null);
    }
  }, [selectedPlanet, selectedProbe]);

  return (
    <div className="relative h-full w-full">
      <SolarSystemScene
        onSelectPlanet={handleSelectPlanet}
        onSelectProbe={handleSelectProbe}
        selectedProbeName={selectedProbe?.name ?? null}
      />

      <AnimatePresence>
        {selectedPlanet && (
          <div onClick={(e) => e.stopPropagation()}>
            <PlanetDetailView
              planet={selectedPlanet}
              onClose={() => setSelectedPlanet(null)}
            />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProbe && (
          <div onClick={(e) => e.stopPropagation()}>
            <ProbeInfoPanel
              probe={selectedProbe}
              onClose={() => setSelectedProbe(null)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
