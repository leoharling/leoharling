"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  DATA_CENTERS,
  INVESTMENT_FLOWS,
  OPERATOR_COLORS,
  DATA_LAST_UPDATED,
  type Operator,
} from "@/lib/ai-infrastructure";

const DataCenterMap = dynamic(() => import("./DataCenterMap"), { ssr: false });

const ALL_OPERATORS: Operator[] = [
  "Stargate", "Microsoft", "Google", "Amazon", "Meta", "xAI", "CoreWeave", "Oracle", "Other",
];

type PanelView = "operators" | "sites";

function formatB(b: number): string {
  if (b >= 1000) return `$${(b / 1000).toFixed(1)}T`;
  return `$${b}B`;
}

export default function InfrastructureTab() {
  const [visibleOperators, setVisibleOperators] = useState<Set<Operator>>(
    new Set(ALL_OPERATORS)
  );
  const [showExisting, setShowExisting] = useState(true);
  const [showAnnounced, setShowAnnounced] = useState(true);
  const [panelView, setPanelView] = useState<PanelView>("operators");

  function toggleOperator(op: Operator) {
    setVisibleOperators((prev) => {
      const next = new Set(prev);
      next.has(op) ? next.delete(op) : next.add(op);
      return next;
    });
  }

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
      {/* Header with inline stats */}
      <div className="mb-2">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="text-lg font-semibold text-foreground">Global AI Infrastructure Buildout</h2>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-sm">
            <span className="font-bold text-foreground">{formatB(kpis.investmentB)} committed</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="font-bold text-foreground">{kpis.locations} sites</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="font-bold text-foreground">{kpis.capacityGW} GW</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Data center clusters, hyperscaler investments, and power capacity — updated April 2026.
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
          />
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: 480 }}>
          {/* Leaderboard + merged legend */}
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

            {panelView === "operators" && (
              <p className="text-[10px] text-muted-foreground/50 -mt-1">Click a row to toggle map visibility.</p>
            )}

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
                        <span className="text-muted-foreground">
                          {formatB(flow.totalB)}
                          <span className="ml-1.5 opacity-50 text-[10px]">{flow.projects}p</span>
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-white/5">
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
                  const statusColor =
                    dc.status === "existing" ? "#22c55e" :
                    dc.status === "under-construction" ? "#fbbf24" : "#94a3b8";
                  return (
                    <div key={dc.id} className="space-y-1 pl-2" style={{ borderLeft: `2px solid ${statusColor}33` }}>
                      <div className="flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
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
                      <div className="h-1.5 rounded-full bg-white/5">
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

            {/* Status legend — merged, doubles as filter */}
            <div className="border-t border-white/8 pt-3 mt-1 flex flex-col gap-1.5">
              {([
                { id: "existing",  symbol: "●", label: "Operational",         color: "#22c55e", active: showExisting  },
                { id: "announced", symbol: "○", label: "Building / Announced", color: "#94a3b8", active: showAnnounced },
              ] as const).map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.id === "existing" ? setShowExisting(v => !v) : setShowAnnounced(v => !v)}
                  className={`flex items-center gap-2 text-[11px] text-left transition-opacity hover:opacity-80 ${item.active ? "opacity-100" : "opacity-35"}`}
                >
                  <span style={{ color: item.color }} className="text-sm leading-none w-3 text-center shrink-0">{item.symbol}</span>
                  <span className="text-muted-foreground">{item.label}</span>
                </button>
              ))}
              <div className="flex items-center gap-2 text-[11px] mt-0.5 opacity-40 pointer-events-none">
                <span className="w-3 h-1 rounded-full bg-white/30 shrink-0" />
                <span className="text-muted-foreground">Dot size = capacity</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data note */}
      <p className="text-[11px] text-muted-foreground/60 text-right">
        Sources: company announcements, utility filings, news reports. Last updated {DATA_LAST_UPDATED}.
      </p>
    </div>
  );
}
