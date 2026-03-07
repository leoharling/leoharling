"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import RocketSlider from "@/components/space/RocketSlider";
import SectionHeading from "@/components/ui/SectionHeading";

const LaunchTrackerPage = dynamic(
  () => import("@/app/tools/launch-tracker/page"),
  { ssr: false }
);
const SatelliteVisualizerPage = dynamic(
  () => import("@/app/tools/satellite-visualizer/page"),
  { ssr: false }
);
const DeepSpaceView = dynamic(
  () => import("@/components/space/DeepSpaceView"),
  { ssr: false }
);

export default function SpacePage() {
  const [domain, setDomain] = useState(0);

  return (
    <div className="relative min-h-screen pt-16">
      <div className="flex">
        {/* Vertical sidebar — top-aligned, not centered */}
        <div className="sticky top-16 z-20 hidden h-[calc(100vh-4rem)] shrink-0 border-r border-white/[0.04] md:block">
          <RocketSlider value={domain} onChange={setDomain} />
        </div>

        {/* Mobile nav */}
        <div className="flex justify-center border-b border-white/[0.04] py-2 md:hidden">
          <div className="flex gap-4">
            {["Earth", "Orbit", "Deep Space"].map((label, i) => (
              <button
                key={label}
                onClick={() => setDomain(i)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  domain === i
                    ? "bg-accent text-white"
                    : "text-muted-foreground bg-white/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {domain === 0 && (
              <motion.div
                key="earth"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <LaunchTrackerPage />
              </motion.div>
            )}
            {domain === 1 && (
              <motion.div
                key="orbit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SatelliteVisualizerPage />
              </motion.div>
            )}
            {domain === 2 && (
              <motion.div
                key="deep-space"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mx-auto max-w-6xl px-6 pt-8 pb-16">
                  <SectionHeading
                    title="Deep Space Explorer"
                    subtitle="Navigate our solar system and zoom out to explore the local stellar neighborhood within 12 light-years of Earth."
                    className="mb-6"
                  />
                  <DeepSpaceView />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
