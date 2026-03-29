"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { LayerToggle } from "@/components/tools/MapLayerControls";
import {
  DATA_CENTERS,
  INVESTMENT_FLOWS,
  OPERATOR_COLORS,
  type Operator,
} from "@/lib/ai-infrastructure";

const DataCenterMap = dynamic(() => import("./DataCenterMap"), { ssr: false });

const ALL_OPERATORS: Operator[] = [
  "Stargate", "Microsoft", "Google", "Amazon", "Meta", "xAI", "CoreWeave", "Oracle", "Other",
];

type PanelView = "operators" | "sites";

export default function InfrastructureTab() {
  const [visibleOperators, setVisibleOperators] = useState<Set<Operator>>(
    new Set(ALL_OPERATORS)
  );
  const [showExisting, setShowExisting] = useState(true);
  const [showAnnounced, setShowAnnounced] = useState(true);
  const [panelView, setPanelView] = useState<PanelView>("operators");

  // Toggle helpers
  function toggleOperator(op: Operator) {
    setVisibleOperators((prev) => {
      const next = new Set(prev);
      next.has(op) ? next.delete(op) : next.add(op);
      return next;
    });
  }

  function handleLayerToggle(id: string) {
    if (id === "existing") { setShowExisting((v) => !v); return; }
    if (id === "announced") { setShowAnnounced((v) => !v); return; }
    toggleOperator(id as Operator);
  }

  // Build LayerToggle array for MapLayerControls
  const layers: LayerToggle[] = useMemo(() => [
    ...ALL_OPERATORS.map((op) => ({
      id: op,
      label: op,
      color: OPERATOR_COLORS[op],
      enabled: visibleOperators.has(op),
    })),
    { id: "existing",  label: "Operational",  color: "#22c55e", enabled: showExisting },
    { id: "announced", label: "Announced / Building", color: "#94a3b8", enabled: showAnnounced },
  ], [visibleOperators, showExisting, showAnnounced]);

  // KPI totals
  const kpis = useMemo(() => {
    const totalMW = DATA_CENTERS.reduce((s, d) => s + d.capacityMW, 0);
    const totalInvestment = INVESTMENT_FLOWS.reduce((s, f) => s + f.totalB, 0);
    return {
      locations: DATA_CENTERS.length,
      investmentB: totalInvestment,
      capacityGW: (totalMW / 1000).toFixed(1),
    };
  }, []);

  const maxInvestment = Math.max(...INVESTMENT_FLOWS.map((f) => f.totalB));

  const sortedSites = useMemo(
    () => [...DATA_CENTERS].sort((a, b) => b.capacityMW - a.capacityMW),
    []
  );
  const maxSiteMW = sortedSites[0]?.capacityMW ?? 1;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-foreground">Global AI Infrastructure Buildout</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Data center clusters, hyperscaler investments, and power capacity — current as of March 2026.
        </p>
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Map */}
        <div style={{ minHeight: 480 }}>
          <DataCenterMap
            visibleOperators={visibleOperators}
            showExisting={showExisting}
            showAnnounced={showAnnounced}
            layers={layers}
            onToggleLayer={handleLayerToggle}
          />
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: 480 }}>
          {/* KPI cards */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
            <div className="glass-card p-3">
              <div className="text-xs text-muted-foreground mb-0.5">Locations Tracked</div>
              <div className="text-xl font-bold text-foreground">{kpis.locations}</div>
            </div>
            <div className="glass-card p-3">
              <div className="text-xs text-muted-foreground mb-0.5">Total Investment</div>
              <div className="text-xl font-bold text-foreground">${kpis.investmentB}B</div>
            </div>
            <div className="glass-card p-3">
              <div className="text-xs text-muted-foreground mb-0.5">Planned Capacity</div>
              <div className="text-xl font-bold text-foreground">{kpis.capacityGW} GW</div>
            </div>
          </div>

          {/* Panel toggle + leaderboard */}
          <div className="glass-card p-4 flex-1 flex flex-col gap-3">
            {/* Toggle */}
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {panelView === "operators" ? "Investment by Operator" : "Biggest Sites"}
              </div>
              <div className="flex rounded-lg overflow-hidden border border-white/8 text-[10px] font-semibold">
                <button
                  onClick={() => setPanelView("operators")}
                  className={`px-2.5 py-1 transition-colors ${panelView === "operators" ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Operators
                </button>
                <button
                  onClick={() => setPanelView("sites")}
                  className={`px-2.5 py-1 transition-colors ${panelView === "sites" ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Sites
                </button>
              </div>
            </div>

            {/* Operator view */}
            {panelView === "operators" && (
              <div className="space-y-2.5">
                {[...INVESTMENT_FLOWS].sort((a, b) => b.totalB - a.totalB).map((flow) => {
                  const op = flow.investor as Operator;
                  const enabled = ALL_OPERATORS.includes(op) ? visibleOperators.has(op) : true;
                  return (
                    <button
                      key={flow.investor}
                      onClick={() => ALL_OPERATORS.includes(op) && toggleOperator(op)}
                      className={`w-full text-left transition-opacity ${ALL_OPERATORS.includes(op) ? "cursor-pointer" : "cursor-default"} ${enabled ? "opacity-100" : "opacity-40"}`}
                    >
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-medium" style={{ color: flow.color }}>{flow.investor}</span>
                        <span className="text-muted-foreground">${flow.totalB}B</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(flow.totalB / maxInvestment) * 100}%`, background: flow.color }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Sites view */}
            {panelView === "sites" && (
              <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 320 }}>
                {sortedSites.map((dc) => {
                  const color = OPERATOR_COLORS[dc.operator];
                  return (
                    <div key={dc.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: color }}
                          />
                          <span className="text-foreground truncate" title={dc.name}>
                            {dc.name.replace(/^[^—]+— /, "")}
                          </span>
                        </div>
                        <span className="text-muted-foreground shrink-0">
                          {dc.capacityMW >= 1000
                            ? `${(dc.capacityMW / 1000).toFixed(1)} GW`
                            : `${dc.capacityMW} MW`}
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(dc.capacityMW / maxSiteMW) * 100}%`,
                            background: color,
                            opacity: dc.status === "existing" ? 1 : dc.status === "under-construction" ? 0.7 : 0.45,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="glass-card p-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</div>
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white/80 shrink-0" />
                <span className="text-muted-foreground">Operational (solid)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border border-white/80 bg-transparent shrink-0 opacity-75" />
                <span className="text-muted-foreground">Building (75% opacity)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border border-dashed border-white/60 bg-transparent shrink-0 opacity-50" />
                <span className="text-muted-foreground">Announced (50% + dashed)</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-3 h-1.5 rounded-full bg-white/20 shrink-0" />
                <span className="text-muted-foreground">Dot size = capacity (MW)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data note */}
      <p className="text-[11px] text-muted-foreground/60 text-right">
        Sources: company announcements, utility filings, news reports. Last updated March 2026. In Operators view, click bars to toggle map layers.
      </p>
    </div>
  );
}
