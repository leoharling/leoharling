"use client";

import { motion } from "framer-motion";
import { SCALE_BANDS } from "@/lib/space-zoom";

interface RocketSliderProps {
  value: number;
  onChange: (index: number) => void;
}

export default function RocketSlider({ value, onChange }: RocketSliderProps) {
  return (
    <nav className="flex flex-col items-center gap-3 px-3 py-6">
      {SCALE_BANDS.map((stop, i) => {
        const active = i === value;
        const Icon = stop.Icon;
        return (
          <div key={stop.id} className="flex flex-col items-center">
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
              <motion.span
                animate={{ opacity: active ? 1 : 0, y: active ? 0 : -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="text-[9px] text-accent/60 font-normal whitespace-nowrap leading-none -mt-0.5"
              >
                {stop.scaleLabel}
              </motion.span>
            </button>

            {i < SCALE_BANDS.length - 1 && (
              <div className="relative mt-3 h-6 w-[1px] bg-white/[0.06] overflow-hidden">
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
