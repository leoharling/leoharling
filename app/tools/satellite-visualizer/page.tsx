"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Eye, EyeOff } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";

const SatelliteScene = dynamic(
  () => import("@/components/tools/SatelliteScene"),
  { ssr: false }
);

// Import constellation configs
const CONSTELLATIONS = [
  { name: "Starlink", color: "#60a5fa", count: "~6,000 satellites" },
  { name: "OneWeb", color: "#34d399", count: "~600 satellites" },
  { name: "GPS", color: "#fbbf24", count: "~31 satellites" },
];

export default function SatelliteVisualizerPage() {
  const [visible, setVisible] = useState<Record<string, boolean>>({
    Starlink: true,
    OneWeb: true,
    GPS: true,
  });

  const toggleConstellation = (name: string) => {
    setVisible((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        title="Satellite Constellation Visualizer"
        subtitle="Explore major satellite constellations orbiting Earth in 3D. Click on individual satellites for details."
      />

      <FadeIn>
        <div className="relative overflow-hidden rounded-2xl border border-white/5">
          {/* 3D Scene */}
          <div className="aspect-[16/10] w-full bg-[#0a0a12]">
            <SatelliteScene visibleConstellations={visible} />
          </div>

          {/* Controls overlay */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2">
            {CONSTELLATIONS.map((c) => (
              <button
                key={c.name}
                onClick={() => toggleConstellation(c.name)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium backdrop-blur-md transition-all ${
                  visible[c.name]
                    ? "bg-white/10 text-foreground"
                    : "bg-white/5 text-muted"
                }`}
              >
                {visible[c.name] ? (
                  <Eye size={14} />
                ) : (
                  <EyeOff size={14} />
                )}
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                {c.name}
                <span className="text-xs text-muted-foreground">
                  {c.count}
                </span>
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="absolute right-4 bottom-4 rounded-lg bg-white/5 px-3 py-2 text-xs text-muted-foreground backdrop-blur-md">
            Drag to rotate &middot; Scroll to zoom &middot; Hover satellites
            for details
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
