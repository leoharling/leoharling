"use client";

import { motion } from "framer-motion";
import type { DeepSpaceProbe } from "@/lib/deep-space-probes";

interface ProbeInfoPanelProps {
  probe: DeepSpaceProbe;
  onClose: () => void;
}

export default function ProbeInfoPanel({ probe, onClose }: ProbeInfoPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-4 top-4 bottom-4 w-80 max-md:w-full max-md:right-0 max-md:top-auto max-md:bottom-0 max-md:h-[50vh] overflow-y-auto rounded-xl max-md:rounded-b-none bg-card/90 backdrop-blur-md border border-white/10 p-5 z-30"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-bold">{probe.name}</h3>
          <span
            className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${
              probe.status === "active"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-zinc-500/20 text-zinc-400"
            }`}
          >
            {probe.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 mt-1"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
        {probe.description}
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
            Distance
          </p>
          <p className="text-sm font-medium">{probe.distanceAU} AU</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
            Speed
          </p>
          <p className="text-sm font-medium">{probe.speedKmS} km/s</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
            Launched
          </p>
          <p className="text-sm font-medium">{probe.launchYear}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
            Mission Age
          </p>
          <p className="text-sm font-medium">
            {new Date().getFullYear() - probe.launchYear} years
          </p>
        </div>
      </div>

      {/* Key Discoveries */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold mb-2">Key Discoveries</h4>
        <ul className="space-y-1.5">
          {probe.keyDiscoveries.map((discovery, i) => (
            <li
              key={i}
              className="text-xs text-muted-foreground flex items-start gap-2"
            >
              <span className="text-accent mt-0.5">•</span>
              {discovery}
            </li>
          ))}
        </ul>
      </div>

      {/* Trajectory Timeline */}
      <div>
        <h4 className="text-xs font-semibold mb-2">Trajectory</h4>
        <div className="relative pl-4 border-l border-white/10 space-y-3">
          {probe.trajectory.map((wp, i) => (
            <div key={i} className="relative">
              <div
                className={`absolute -left-[21px] w-2.5 h-2.5 rounded-full border-2 ${
                  wp.type === "current"
                    ? "bg-accent border-accent"
                    : wp.type === "gravity-assist"
                    ? "bg-amber-500 border-amber-500"
                    : wp.type === "launch"
                    ? "bg-emerald-500 border-emerald-500"
                    : "bg-blue-500 border-blue-500"
                }`}
              />
              <p className="text-xs font-medium">{wp.body}</p>
              <p className="text-[10px] text-muted-foreground">
                {wp.year} · {wp.distanceAU} AU
                {wp.type === "gravity-assist" && " · Gravity assist"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
