"use client";

import { motion } from "framer-motion";
import { Rocket, Globe, Sun } from "lucide-react";

interface RocketSliderProps {
  value: number;
  onChange: (index: number) => void;
}

const STOPS = [
  { label: "Earth", Icon: Rocket },
  { label: "Orbit", Icon: Globe },
  { label: "Deep Space", Icon: Sun },
];

export default function RocketSlider({ value, onChange }: RocketSliderProps) {
  return (
    <nav className="flex flex-col items-center gap-3 px-3 py-6">
      {STOPS.map((stop, i) => {
        const active = i === value;
        const Icon = stop.Icon;
        return (
          <div key={stop.label} className="flex flex-col items-center">
            <button
              onClick={() => onChange(i)}
              className="group relative flex flex-col items-center gap-1.5"
            >
              <motion.div
                animate={{ scale: active ? 1 : 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-accent/15 text-accent shadow-[0_0_12px_rgba(59,130,246,0.1)]"
                    : "text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-white/[0.04]"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              </motion.div>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 whitespace-nowrap ${
                  active ? "text-foreground" : "text-muted-foreground/35"
                }`}
              >
                {stop.label}
              </span>
            </button>

            {i < STOPS.length - 1 && (
              <div className="relative mt-3 h-8 w-[1px] bg-white/[0.06] overflow-hidden">
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
