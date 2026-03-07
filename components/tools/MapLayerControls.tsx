"use client";

import { useState } from "react";
import { Layers } from "lucide-react";

export interface LayerToggle {
  id: string;
  label: string;
  color: string;
  enabled: boolean;
}

export default function MapLayerControls({
  layers,
  onToggle,
}: {
  layers: LayerToggle[];
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-3 right-3 z-10">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-black/60 border border-white/10 backdrop-blur-sm hover:bg-black/80 transition-colors"
        title="Toggle layers"
      >
        <Layers size={14} className="text-white/70" />
      </button>

      {open && (
        <div className="absolute top-10 right-0 w-44 rounded-lg bg-black/80 border border-white/10 backdrop-blur-md p-2 space-y-0.5">
          {layers.map((l) => (
            <button
              key={l.id}
              onClick={() => onToggle(l.id)}
              className="flex items-center gap-2 w-full rounded px-2 py-1.5 text-left hover:bg-white/5 transition-colors"
            >
              <span
                className="h-2 w-2 rounded-full shrink-0 transition-opacity"
                style={{ backgroundColor: l.color, opacity: l.enabled ? 1 : 0.2 }}
              />
              <span className={`text-[11px] ${l.enabled ? "text-white/80" : "text-white/30"}`}>
                {l.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
