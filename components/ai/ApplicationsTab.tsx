"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Heart, Truck, ShoppingBag, Scale, Cog, Film, Zap,
  AlertTriangle, ArrowRight,
  type LucideIcon,
} from "lucide-react";
import {
  APPLICATION_CASES,
  INDUSTRY_META,
  ALL_INDUSTRIES,
  ALL_TASKS,
  ROI_COLORS,
  type Industry,
  type TaskType,
  type ROIPotential,
} from "@/lib/ai-applications";
import { AI_MODELS } from "@/lib/ai-models";

const INDUSTRY_ICONS: Record<Industry, LucideIcon> = {
  Finance:       TrendingUp,
  Healthcare:    Heart,
  Logistics:     Truck,
  Retail:        ShoppingBag,
  Legal:         Scale,
  Manufacturing: Cog,
  Media:         Film,
  Energy:        Zap,
};

const ROI_LABELS: Record<ROIPotential, string> = {
  transformative: "Transformative",
  high:           "High",
  medium:         "Medium",
  low:            "Low",
};

interface ApplicationsTabProps {
  onNavigateToModel: (modelId: string) => void;
}

export default function ApplicationsTab({ onNavigateToModel }: ApplicationsTabProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);

  const match = selectedIndustry && selectedTask
    ? APPLICATION_CASES.find(
        (c) => c.industry === selectedIndustry && c.task === selectedTask
      ) ?? null
    : null;

  // Find tasks available for selected industry
  const availableTasks = selectedIndustry
    ? ALL_TASKS.filter((t) => APPLICATION_CASES.some((c) => c.industry === selectedIndustry && c.task === t))
    : ALL_TASKS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">AI Use Case Explorer</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Select an industry and task type to see how AI is being applied, which models fit best, and what the ROI looks like.
        </p>
      </div>

      {/* Industry picker */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          1. Select Industry
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {ALL_INDUSTRIES.map((industry) => {
            const Icon = INDUSTRY_ICONS[industry];
            const meta = INDUSTRY_META[industry];
            const isSelected = selectedIndustry === industry;
            return (
              <button
                key={industry}
                onClick={() => {
                  setSelectedIndustry(isSelected ? null : industry);
                  setSelectedTask(null);
                }}
                className={`glass-card p-3 flex flex-col items-center gap-2 text-center transition-all duration-200 ${
                  isSelected
                    ? "border-accent/50 bg-accent/5 !border-accent/40"
                    : "hover:border-white/15"
                }`}
              >
                <Icon size={20} style={{ color: meta.color }} />
                <span className="text-[10px] font-medium text-foreground leading-tight">{industry}</span>
              </button>
            );
          })}
        </div>
        {selectedIndustry && (
          <p className="text-xs text-muted-foreground mt-2 ml-0.5">
            {INDUSTRY_META[selectedIndustry].description}
          </p>
        )}
      </div>

      {/* Task picker */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          2. Select Task
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_TASKS.map((task) => {
            const available = availableTasks.includes(task);
            const isSelected = selectedTask === task;
            return (
              <button
                key={task}
                onClick={() => available && setSelectedTask(isSelected ? null : task)}
                disabled={!available}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-accent text-white shadow-sm shadow-accent/20"
                    : available
                    ? "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                    : "bg-white/[0.02] text-white/20 cursor-default"
                }`}
              >
                {task}
              </button>
            );
          })}
        </div>
      </div>

      {/* Output panel */}
      <AnimatePresence mode="wait">
        {selectedIndustry && selectedTask && (
          <motion.div
            key={`${selectedIndustry}-${selectedTask}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {match ? (
              <>
                {/* Summary + ROI */}
                <div className="glass-card p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">
                        {match.industry} × {match.task}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{match.summary}</p>
                    </div>
                    <div
                      className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                      style={{
                        background: `${ROI_COLORS[match.roiPotential]}18`,
                        color: ROI_COLORS[match.roiPotential],
                        border: `1px solid ${ROI_COLORS[match.roiPotential]}30`,
                      }}
                    >
                      {ROI_LABELS[match.roiPotential]} ROI
                    </div>
                  </div>
                </div>

                {/* 3-col detail grid */}
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Model types */}
                  <div className="glass-card p-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Best Model Types
                    </div>
                    <ul className="space-y-2">
                      {match.modelTypes.map((mt, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowRight size={12} className="text-accent shrink-0 mt-0.5" />
                          {mt}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Examples */}
                  <div className="glass-card p-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Real-World Examples
                    </div>
                    <div className="space-y-3">
                      {match.examples.map((ex, i) => (
                        <div key={i}>
                          <div className="text-xs font-semibold text-foreground">{ex.company}</div>
                          <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{ex.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risks */}
                  <div className="glass-card p-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Key Risks
                    </div>
                    <div className="space-y-1.5">
                      {match.risks.map((risk, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                          <AlertTriangle size={10} className="text-amber-500 shrink-0 mt-0.5" />
                          {risk}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommended models */}
                <div className="glass-card p-4">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Recommended Models
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {match.recommendedModelIds.map((id) => {
                      const model = AI_MODELS.find((m) => m.id === id);
                      if (!model) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => onNavigateToModel(id)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent/30 group"
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: model.providerColor }}
                          />
                          <span className="text-foreground">{model.name}</span>
                          <ArrowRight size={10} className="text-muted-foreground group-hover:text-accent transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mt-2">
                    Click a model to view its full specs in the Models tab.
                  </p>
                </div>
              </>
            ) : (
              <div className="glass-card p-8 text-center">
                <div className="text-muted-foreground text-sm">
                  No curated data for <span className="text-foreground font-medium">{selectedIndustry} × {selectedTask}</span> yet.
                </div>
                <p className="text-xs text-muted-foreground/60 mt-1">Try a different industry or task combination.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompt if nothing selected */}
      {(!selectedIndustry || !selectedTask) && (
        <div className="glass-card p-8 text-center text-muted-foreground text-sm">
          Select an industry and task above to explore AI applications.
        </div>
      )}
    </div>
  );
}
