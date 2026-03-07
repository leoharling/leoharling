"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Ruler,
  Weight,
  Zap,
  DollarSign,
  RefreshCw,
  X,
  ChevronDown,
  Check,
  Plus,
  ArrowUpDown,
} from "lucide-react";
import {
  ROCKETS,
  COMPARISON_FIELDS,
  CATEGORY_LABELS,
  type Rocket as RocketType,
  type RocketCategory,
} from "@/lib/rockets";

type StatusFilter = "all" | "active" | "retired" | "in-development";
type CategoryFilter = "all" | RocketCategory;
type SortKey = "name" | "payloadLeoKg" | "costPerLaunchUsd" | "thrustKn" | "heightM" | "successRate";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "payloadLeoKg", label: "Payload (LEO)" },
  { key: "thrustKn", label: "Thrust" },
  { key: "heightM", label: "Height" },
  { key: "costPerLaunchUsd", label: "Cost / Launch" },
  { key: "successRate", label: "Success Rate" },
];

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All Status" },
  { key: "active", label: "Active" },
  { key: "retired", label: "Retired" },
  { key: "in-development", label: "In Development" },
];

const CATEGORY_FILTERS: { key: CategoryFilter; label: string }[] = [
  { key: "all", label: "All Classes" },
  ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    key: key as CategoryFilter,
    label,
  })),
];

function formatMass(kg: number) {
  return kg >= 1_000_000
    ? `${(kg / 1_000_000).toFixed(1)}M t`
    : `${(kg / 1000).toFixed(0)} t`;
}

function formatPayload(kg: number | null) {
  if (kg == null) return "N/A";
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)} t` : `${kg} kg`;
}

function formatCost(usd: number | null) {
  if (usd == null) return "N/A";
  if (usd >= 1_000_000_000) return `$${(usd / 1_000_000_000).toFixed(1)}B`;
  return `$${(usd / 1_000_000).toFixed(0)}M`;
}

function statusColor(status: RocketType["status"]) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-400";
    case "retired":
      return "bg-white/5 text-muted-foreground";
    case "in-development":
      return "bg-amber-500/10 text-amber-400";
  }
}

function statusLabel(status: RocketType["status"]) {
  switch (status) {
    case "active":
      return "Active";
    case "retired":
      return "Retired";
    case "in-development":
      return "In Dev";
  }
}

const ROCKET_IMAGES: Record<string, string> = {
  starship: "/rockets/starship.jpg",
  sls: "/rockets/sls.jpg",
  "falcon-heavy": "/rockets/falcon-heavy.jpg",
  "falcon-9": "/rockets/falcon-9.jpg",
  "new-glenn": "/rockets/new-glenn.jpg",
  "terran-r": "/rockets/terran-r.png",
  "vulcan-centaur": "/rockets/vulcan-centaur.jpg",
  "long-march-5": "/rockets/long-march-5.jpg",
  "ariane-6": "/rockets/ariane-6.jpg",
  "atlas-v": "/rockets/atlas-v.jpg",
  neutron: "/rockets/neutron.png",
  lvm3: "/rockets/lvm3.jpg",
  "soyuz-2": "/rockets/soyuz-2.jpg",
  h3: "/rockets/h3.jpg",
  pslv: "/rockets/pslv.jpg",
  "long-march-2d": "/rockets/long-march-2d.jpg",
  "vega-c": "/rockets/vega-c.jpg",
  electron: "/rockets/electron.jpg",
  "firefly-alpha": "/rockets/firefly-alpha.jpg",
  spectrum: "/rockets/spectrum.jpg",
  "rfa-one": "/rockets/rfa-one.jpg",
  "saturn-v": "/rockets/saturn-v.jpg",
  "space-shuttle": "/rockets/space-shuttle.jpg",
  "ariane-5": "/rockets/ariane-5.jpg",
  "delta-iv-heavy": "/rockets/delta-iv-heavy.jpg",
};

/* ── Rocket Detail Modal ── */
function RocketModal({
  rocket,
  isComparing,
  onToggleCompare,
  onClose,
}: {
  rocket: RocketType;
  isComparing: boolean;
  onToggleCompare: () => void;
  onClose: () => void;
}) {
  const successRate =
    rocket.successfulLaunches + rocket.failedLaunches > 0
      ? (
          (rocket.successfulLaunches /
            (rocket.successfulLaunches + rocket.failedLaunches)) *
          100
        ).toFixed(1)
      : null;

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.08] bg-card shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-black/30 text-white/60 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col sm:flex-row">
          {/* Image side */}
          <div className="relative h-48 sm:h-auto sm:w-2/5 shrink-0">
            {ROCKET_IMAGES[rocket.id] ? (
              <div
                className="h-full min-h-[280px] bg-cover bg-center"
                style={{ backgroundImage: `url(${ROCKET_IMAGES[rocket.id]})` }}
              >
                <div className="h-full w-full bg-gradient-to-r from-transparent to-card/80 sm:block hidden" />
                <div className="h-full w-full bg-gradient-to-t from-card to-transparent sm:hidden" />
              </div>
            ) : (
              <div className="flex h-full min-h-[280px] items-center justify-center bg-white/[0.02]">
                <Rocket size={40} className="text-muted-foreground/20" />
              </div>
            )}
            {/* Status badge */}
            <div className="absolute left-3 top-3">
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm ${statusColor(rocket.status)}`}
              >
                {statusLabel(rocket.status)}
              </span>
            </div>
          </div>

          {/* Data side */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[70vh]">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-xl font-bold">{rocket.name}</h2>
              <span className="text-sm">{rocket.countryFlag}</span>
            </div>
            <p className="mb-5 text-xs text-muted-foreground">
              {rocket.operator} · {rocket.fullName}
            </p>

            {/* Description */}
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
              {rocket.description}
            </p>

            {/* Key specs */}
            <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-3">
              <Stat icon={<Ruler size={13} />} label="Height" value={`${rocket.heightM} m`} />
              <Stat icon={<Weight size={13} />} label="Mass" value={formatMass(rocket.massKg)} />
              <Stat icon={<Zap size={13} />} label="Thrust" value={rocket.thrustKn >= 10000 ? `${(rocket.thrustKn / 1000).toFixed(1)} MN` : `${rocket.thrustKn} kN`} />
              <Stat icon={<Rocket size={13} />} label="LEO Payload" value={formatPayload(rocket.payloadLeoKg)} />
              <Stat icon={<DollarSign size={13} />} label="Cost / Launch" value={formatCost(rocket.costPerLaunchUsd)} />
              <Stat icon={<RefreshCw size={13} />} label="Reusability" value={rocket.reusable ? "Reusable" : "Expendable"} />
            </div>

            {/* Technical details */}
            <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg bg-white/[0.03] p-4 text-xs">
              <Detail label="Propellant" value={rocket.propellant} />
              <Detail label="Engines" value={rocket.engines} />
              <Detail label="Stages" value={String(rocket.stages)} />
              <Detail label="Diameter" value={`${rocket.diameterM} m`} />
              <Detail label="GTO Capacity" value={formatPayload(rocket.payloadGtoKg)} />
              <Detail label="First Flight" value={rocket.maidenFlight || "TBD"} />
              {rocket.lastFlight && <Detail label="Last Flight" value={rocket.lastFlight} />}
            </div>

            {/* Success rate */}
            {successRate && (
              <div className="mb-6">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-mono text-emerald-400">{successRate}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-emerald-500/60"
                    style={{ width: `${successRate}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {rocket.successfulLaunches} successful / {rocket.failedLaunches} failed
                </p>
              </div>
            )}

            {/* Compare button */}
            <button
              onClick={onToggleCompare}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                isComparing
                  ? "bg-accent text-white"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
            >
              {isComparing ? (
                <>
                  <Check size={14} />
                  Added to Comparison
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Add to Comparison
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 shrink-0 text-accent">{icon}</div>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}

/* ── Rocket Card (grid item) ── */
function RocketCard({
  rocket,
  isComparing,
  onToggleCompare,
  onClick,
}: {
  rocket: RocketType;
  isComparing: boolean;
  onToggleCompare: () => void;
  onClick: () => void;
}) {
  return (
    <div
      className={`glass-card overflow-hidden transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
        isComparing ? "ring-1 ring-accent/50" : ""
      }`}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative">
        {ROCKET_IMAGES[rocket.id] ? (
          <div
            className="h-36 bg-cover bg-center"
            style={{ backgroundImage: `url(${ROCKET_IMAGES[rocket.id]})` }}
          >
            <div className="h-full w-full bg-gradient-to-t from-card via-card/50 to-transparent" />
          </div>
        ) : (
          <div className="flex h-36 items-center justify-center bg-white/[0.02]">
            <Rocket size={28} className="text-muted-foreground/20" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm ${statusColor(rocket.status)}`}
          >
            {statusLabel(rocket.status)}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare();
          }}
          className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium backdrop-blur-sm transition-all ${
            isComparing
              ? "bg-accent text-white"
              : "bg-black/40 text-white/70 hover:bg-black/60 hover:text-white"
          }`}
        >
          {isComparing ? <Check size={10} /> : <Plus size={10} />}
          {isComparing ? "Comparing" : "Compare"}
        </button>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="text-base font-bold">{rocket.name}</h3>
          <span className="text-xs">{rocket.countryFlag}</span>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          {rocket.operator}
        </p>

        {/* Compact stats row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{rocket.heightM} m</span>
          <span>LEO {formatPayload(rocket.payloadLeoKg)}</span>
          <span>{rocket.reusable ? "Reusable" : "Expendable"}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Comparison Table ── */
function ComparisonTable({
  rockets,
  onRemove,
  onClear,
}: {
  rockets: RocketType[];
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Rocket Comparison
        </h3>
        <button
          onClick={onClear}
          className="rounded-full bg-white/5 px-3 py-1 text-xs text-muted-foreground hover:bg-white/10 hover:text-foreground"
        >
          Clear all
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="sticky left-0 z-10 bg-[rgba(18,18,26,0.95)] backdrop-blur px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Spec
              </th>
              {rockets.map((r) => (
                <th key={r.id} className="min-w-[140px] px-4 py-3 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{r.name}</span>
                    <button
                      onClick={() => onRemove(r.id)}
                      className="rounded-full p-0.5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                    >
                      <X size={10} />
                    </button>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {r.operator}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_FIELDS.map((field) => {
              const values = rockets.map((r) => r[field.key]);
              const numericValues = values.filter(
                (v): v is number => typeof v === "number" && v !== null
              );
              const best =
                field.higherBetter && numericValues.length > 1
                  ? Math.max(...numericValues)
                  : field.lowerBetter && numericValues.length > 1
                    ? Math.min(...numericValues)
                    : null;

              return (
                <tr
                  key={field.key}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                >
                  <td className="sticky left-0 z-10 bg-[rgba(18,18,26,0.95)] backdrop-blur px-4 py-2.5 text-xs text-muted-foreground">
                    {field.label}
                  </td>
                  {rockets.map((r) => {
                    const val = r[field.key];
                    const isBest =
                      best !== null && typeof val === "number" && val === best;
                    return (
                      <td
                        key={r.id}
                        className={`px-4 py-2.5 text-xs tabular-nums ${
                          isBest ? "font-semibold text-emerald-400" : ""
                        }`}
                      >
                        {field.format(val)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Main Tab ── */
function getSuccessRate(r: RocketType): number {
  const total = r.successfulLaunches + r.failedLaunches;
  return total > 0 ? r.successfulLaunches / total : -1;
}

export default function RocketsTab() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("payloadLeoKg");
  const [sortAsc, setSortAsc] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [selectedRocket, setSelectedRocket] = useState<RocketType | null>(null);

  const filtered = useMemo(() => {
    const list = ROCKETS.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      return true;
    });

    list.sort((a, b) => {
      let va: number | string;
      let vb: number | string;

      if (sortKey === "name") {
        va = a.name;
        vb = b.name;
      } else if (sortKey === "successRate") {
        va = getSuccessRate(a);
        vb = getSuccessRate(b);
      } else {
        va = a[sortKey] ?? -1;
        vb = b[sortKey] ?? -1;
      }

      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [statusFilter, categoryFilter, sortKey, sortAsc]);

  const compareRockets = useMemo(
    () => ROCKETS.filter((r) => compareIds.includes(r.id)),
    [compareIds]
  );

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedRocket) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedRocket]);

  return (
    <div className="space-y-6">
      {/* Comparison table */}
      {compareRockets.length >= 2 && (
        <ComparisonTable
          rockets={compareRockets}
          onRemove={(id) => toggleCompare(id)}
          onClear={() => setCompareIds([])}
        />
      )}

      {/* Compare hint */}
      {compareRockets.length === 1 && (
        <div className="glass-card flex items-center gap-3 px-5 py-3 text-sm text-muted-foreground">
          <Plus size={14} className="text-accent" />
          <span>
            <strong className="text-foreground">
              {compareRockets[0].name}
            </strong>{" "}
            selected — pick at least one more rocket to compare.
          </span>
          <button
            onClick={() => setCompareIds([])}
            className="ml-auto text-xs text-accent hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category dropdown */}
        <div className="relative">
          <button
            onClick={() => setCategoryOpen(!categoryOpen)}
            className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium transition-all hover:bg-white/10"
          >
            {categoryFilter === "all"
              ? "All Classes"
              : CATEGORY_LABELS[categoryFilter]}
            <ChevronDown
              size={14}
              className={`text-muted-foreground transition-transform ${categoryOpen ? "rotate-180" : ""}`}
            />
          </button>
          {categoryOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-lg border border-white/10 bg-card shadow-xl">
              {CATEGORY_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    setCategoryFilter(f.key);
                    setCategoryOpen(false);
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm transition-all hover:bg-white/10 ${
                    f.key === categoryFilter
                      ? "bg-accent/20 text-accent"
                      : "text-muted-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status pills */}
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              statusFilter === f.key
                ? "bg-accent text-white"
                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}

        {/* Sort dropdown */}
        <div className="relative ml-auto">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground"
          >
            <ArrowUpDown size={13} />
            {SORT_OPTIONS.find((s) => s.key === sortKey)?.label}
            <span className="text-[10px] opacity-60">{sortAsc ? "↑" : "↓"}</span>
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-white/10 bg-card shadow-xl">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => {
                    if (s.key === sortKey) {
                      setSortAsc(!sortAsc);
                    } else {
                      setSortKey(s.key);
                      setSortAsc(s.key === "name" || s.key === "costPerLaunchUsd");
                    }
                    setSortOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-xs transition-all hover:bg-white/10 ${
                    s.key === sortKey
                      ? "bg-accent/20 text-accent"
                      : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                  {s.key === sortKey && (
                    <span className="text-[10px]">{sortAsc ? "↑" : "↓"}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-xs text-muted-foreground">
          {filtered.length} rocket{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Rocket cards grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((rocket) => (
          <RocketCard
            key={rocket.id}
            rocket={rocket}
            isComparing={compareIds.includes(rocket.id)}
            onToggleCompare={() => toggleCompare(rocket.id)}
            onClick={() => setSelectedRocket(rocket)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          No rockets found for these filters.
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRocket && (
          <RocketModal
            rocket={selectedRocket}
            isComparing={compareIds.includes(selectedRocket.id)}
            onToggleCompare={() => toggleCompare(selectedRocket.id)}
            onClose={() => setSelectedRocket(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
