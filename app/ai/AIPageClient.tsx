"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Server, Brain, Layers } from "lucide-react";
import ModelsTab from "@/components/ai/ModelsTab";
import ApplicationsTab from "@/components/ai/ApplicationsTab";

// Infrastructure tab uses MapLibre — must be SSR-disabled
const InfrastructureTab = dynamic(
  () => import("@/components/ai/InfrastructureTab"),
  { ssr: false }
);

type AIView = "infrastructure" | "models" | "applications";

const TABS = [
  { key: "infrastructure" as AIView, label: "Infrastructure", Icon: Server },
  { key: "models"         as AIView, label: "Models",         Icon: Brain },
  { key: "applications"   as AIView, label: "Applications",   Icon: Layers },
];

export default function AIPageClient() {
  const [view, setView] = useState<AIView>("infrastructure");
  const [highlightModelId, setHighlightModelId] = useState<string | null>(null);

  function handleNavigateToModel(modelId: string) {
    setView("models");
    setHighlightModelId(modelId);
  }

  return (
    <div className="relative min-h-screen">
      {/* Sticky sub-tab bar */}
      <div className="sticky top-16 z-20 border-b border-white/[0.04] bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex items-center gap-1 px-4 py-2">
          {TABS.map(({ key, label, Icon }) => (
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

      {/* Tab content */}
      {view === "infrastructure" && (
        <motion.div
          key="infrastructure"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-6xl px-4 pt-6 pb-12"
        >
          <InfrastructureTab />
        </motion.div>
      )}
      {view === "models" && (
        <motion.div
          key="models"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-6xl px-4 pt-6 pb-12"
        >
          <ModelsTab
            highlightModelId={highlightModelId}
            onHighlightClear={() => setHighlightModelId(null)}
          />
        </motion.div>
      )}
      {view === "applications" && (
        <motion.div
          key="applications"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-6xl px-4 pt-6 pb-12"
        >
          <ApplicationsTab onNavigateToModel={handleNavigateToModel} />
        </motion.div>
      )}
    </div>
  );
}
