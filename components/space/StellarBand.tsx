"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  NEARBY_STARS,
  type NearbyStar,
} from "@/lib/space-data";
import {
  NebulaCloud,
  StarDot,
  SolInfoPanel,
  StarInfoPanel,
  VIEW_ORDER,
  VIEW_LABELS,
} from "@/components/space/deep-space-shared";

export default function StellarBand({
  onNavigate,
}: {
  onNavigate?: (direction: "prev" | "next") => void;
}) {
  const [selectedStar, setSelectedStar] = useState<NearbyStar | null>(null);
  const [showSolInfo, setShowSolInfo] = useState(false);

  const clearSelections = useCallback(() => {
    setSelectedStar(null);
    setShowSolInfo(false);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    if (selectedStar || showSolInfo) {
      clearSelections();
    }
  }, [selectedStar, showSolInfo, clearSelections]);

  const handleSolClick = useCallback(() => {
    if (showSolInfo) {
      clearSelections();
      onNavigate?.("prev");
    } else {
      setSelectedStar(null);
      setShowSolInfo(true);
    }
  }, [showSolInfo, clearSelections, onNavigate]);

  return (
    <div className="relative h-full w-full" onClick={handleBackgroundClick}>
      {/* Nebula clouds — atmospheric background */}
      <NebulaCloud x={25} y={30} size={180} color="#4a2060" opacity={0.06} />
      <NebulaCloud x={70} y={65} size={220} color="#203050" opacity={0.05} />
      <NebulaCloud x={55} y={20} size={140} color="#2a4060" opacity={0.04} />
      <NebulaCloud x={15} y={75} size={160} color="#402040" opacity={0.05} />
      <NebulaCloud x={80} y={30} size={100} color="#204040" opacity={0.04} />

      {/* Sol */}
      <button
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); handleSolClick(); }}
        style={{ padding: 8 }}
      >
        <motion.div
          className="rounded-full"
          animate={{
            boxShadow: showSolInfo
              ? "0 0 18px 7px rgba(250, 204, 21, 0.7)"
              : [
                  "0 0 8px 3px rgba(250, 204, 21, 0.4)",
                  "0 0 14px 5px rgba(250, 204, 21, 0.6)",
                  "0 0 8px 3px rgba(250, 204, 21, 0.4)",
                ],
          }}
          transition={showSolInfo ? { duration: 0.3 } : { duration: 3, repeat: Infinity }}
          style={{ width: 6, height: 6, background: "radial-gradient(circle, #fef3c7, #f59e0b)" }}
        />
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-yellow-400 whitespace-nowrap">
          Sol
        </span>
      </button>

      {/* Distance rings */}
      {[5, 10].map((ly) => (
        <div
          key={ly}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[0.04]"
          style={{ width: `${(ly / 14) * 76}%`, height: `${(ly / 14) * 76}%` }}
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-muted/40">
            {ly} ly
          </span>
        </div>
      ))}

      {NEARBY_STARS.map((star) => (
        <StarDot
          key={star.name}
          star={star}
          onSelect={(s) => {
            setShowSolInfo(false);
            setSelectedStar(s);
          }}
          isSelected={selectedStar?.name === star.name}
        />
      ))}

      {/* Info panels */}
      <AnimatePresence>
        {showSolInfo && (
          <SolInfoPanel
            onClose={() => setShowSolInfo(false)}
            onZoomIn={() => { clearSelections(); onNavigate?.("prev"); }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedStar && (
          <StarInfoPanel star={selectedStar} onClose={() => setSelectedStar(null)} />
        )}
      </AnimatePresence>

    </div>
  );
}
