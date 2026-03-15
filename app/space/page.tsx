"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Map, List } from "lucide-react";

const SpaceMap = dynamic(() => import("@/components/space/SpaceMap"), {
  ssr: false,
});
const LaunchTrackerPage = dynamic(
  () => import("@/app/tools/launch-tracker/page"),
  { ssr: false }
);

type SpaceView = "map" | "launches";

export default function SpacePage() {
  const [view, setView] = useState<SpaceView>("map");

  return (
    <div className="relative min-h-screen pt-16">
      {/* Top nav — choose between Space Map and Launch Tracker */}
      <div className="sticky top-16 z-20 border-b border-white/[0.04] bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex items-center gap-1 px-4 py-2">
          {[
            { key: "map" as const, label: "Space Map", Icon: Map },
            { key: "launches" as const, label: "Launch Tracker", Icon: List },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                view === key
                  ? "bg-accent/15 text-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {view === "map" && (
        <motion.div
          key="map"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <SpaceMap />
        </motion.div>
      )}
      {view === "launches" && (
        <motion.div
          key="launches"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <LaunchTrackerPage />
        </motion.div>
      )}
    </div>
  );
}
