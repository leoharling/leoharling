"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  Cpu,
  BarChart3,
  Users,
  AlertTriangle,
} from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

// ─── Chart frame ─────────────────────────────────────────────────────────────
function ChartFrame({
  src,
  filename,
  title,
  description,
  objectPos = "top",
}: {
  src: string;
  filename: string;
  title: string;
  description: string;
  objectPos?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-card/40 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500/40" />
            <span className="h-2 w-2 rounded-full bg-amber-500/40" />
            <span className="h-2 w-2 rounded-full bg-emerald-500/40" />
          </div>
          <span className="ml-2 font-mono text-[10px] text-muted/50">{filename}</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${src}?v=2`}
          alt={title}
          className="w-full object-cover"
          style={{ maxHeight: "300px", objectPosition: objectPos }}
        />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function DCMToolPage() {
  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative border-b border-white/[0.04] pb-24 pt-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/5" />
        <div className="relative mx-auto max-w-7xl px-6">
          <FadeIn>
            <Link href="/projects" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft size={14} />All Projects
            </Link>
          </FadeIn>
          <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:gap-24">
            <FadeIn className="flex-1">
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">Aerospace-X</span>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">Consulting Project</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">Python · Simulation</span>
              </div>
              <h1 className="gradient-text text-5xl font-bold tracking-tight sm:text-6xl">DCM Tool</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                A five-tier demand &amp; capacity simulation for an aerospace engine supply chain, cascading OEM demand through every supplier tier to detect capacity constraints before they stall production.
              </p>
            </FadeIn>
            <FadeIn delay={0.2} className="flex flex-wrap gap-8 lg:flex-shrink-0">
              {[
                { n: "5", label: "Supply chain tiers" },
                { n: "7", label: "Materials modelled" },
                { n: "30+", label: "Consortium partners" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl font-bold text-accent">{s.n}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Context ──────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 lg:items-start">
            <FadeIn direction="left">
              <div className="mb-4 flex items-center gap-3 text-accent">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><Users size={16} /></div>
                <span className="font-mono text-xs uppercase tracking-widest">Context</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Why supply chain visibility breaks down</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                In aerospace, a finished engine contains thousands of parts sourced across <strong className="text-foreground">four or five supplier tiers</strong>. An OEM like Airbus sees its Tier-1 partners, but rarely has direct visibility into what Tier-2 or Tier-3 suppliers are producing, committing, or struggling with.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                This is fine when everything runs smoothly. It becomes a crisis when a critical component, a forging or a disk with a <strong className="text-foreground">20-week lead time</strong>, can quietly fall behind. By the time the shortage surfaces in a programme review, there is no longer enough time to recover. Production stalls.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The DCM Tool was built to close that gap: a simulation that propagates demand through every tier simultaneously, so shortfalls are visible <strong className="text-foreground">weeks or months before they become production problems</strong>. Built within <strong className="text-foreground">Aerospace-X</strong>, a 30+ company industry consortium led by Airbus.
              </p>
            </FadeIn>
            <FadeIn direction="right" delay={0.1}>
              <div className="space-y-3">
                {[
                  { color: "red", title: "Visibility stops at Tier 1", body: "OEMs can see their direct suppliers, but lower tiers remain a black box. Risks building at Tier 3 or 4 are invisible until they propagate upward." },
                  { color: "amber", title: "Long lead times, frozen plans", body: "Critical components require order signals months in advance. Once a production schedule is frozen, you cannot react. The gap needs to be seen weeks or months earlier." },
                  { color: "blue", title: "Each partner plans in isolation", body: "Without a shared model, every company maintains its own forecast. Supply-demand gaps only surface when partners compare notes, often too late to act." },
                  { color: "emerald", title: "Bottlenecks hide across tiers", body: "The constraint is rarely where you expect it. End-to-end simulation regularly shows the real bottleneck sitting two tiers below where it first appears." },
                ].map((item) => (
                  <div key={item.title} className={`rounded-xl border p-4 ${
                    item.color === "red" ? "border-red-500/20 bg-red-500/5"
                    : item.color === "amber" ? "border-amber-500/20 bg-amber-500/5"
                    : item.color === "blue" ? "border-blue-500/20 bg-blue-500/5"
                    : "border-emerald-500/25 bg-emerald-500/5"
                  }`}>
                    <p className={`mb-1 text-sm font-semibold ${
                      item.color === "red" ? "text-red-400" : item.color === "amber" ? "text-amber-400"
                      : item.color === "blue" ? "text-blue-400" : "text-emerald-400"
                    }`}>{item.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Supply Chain Diagram ──────────────────────────────────────── */}
      <section className="relative border-t border-white/[0.04]" style={{ background: "linear-gradient(180deg,rgb(5,9,18) 0%,rgb(7,12,22) 100%)" }}>
        <div className="mx-auto max-w-7xl px-6 py-20">
          <FadeIn className="mb-10">
            <div className="mb-4 flex items-center gap-3 text-accent">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><Cpu size={16} /></div>
              <span className="font-mono text-xs uppercase tracking-widest">Architecture</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Five-Tier Engine Supply Chain</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              All five tiers are monitored, from OEM demand down to raw material ingots. The tool tracks stock levels, lead times, and dependencies across every tier to detect bottlenecks weeks before they impact the production line.
            </p>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 sm:p-10"
              style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 70%)" }}>

              {/* Dot grid */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

              {/* ── Horizontal dependency graph ── */}
              {/*
                Layout (left→right):
                OEM → Engine(T0) → Module(T1) → [Disk/BladeA/BladeB stacked] → Forging(T3) → Ingot(T4)
                T2 column height: 3×96px + 2×12px gap = 312px
                Disk center   = 48px  = 15.4% of 312
                BladeA center = 156px = 50%   of 312
                BladeB center = 264px = 84.6% of 312
                Mid(Disk,BladeA) = 102px = 32.7% → Forging/Ingot vertical center
                Forging paddingTop = 102 - 48 = 54px
              */}
              <div className="flex items-center">

                  {/* OEM Demand — centered by items-center */}
                  <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
                    className="flex h-24 flex-1 flex-col items-center justify-center rounded-xl border border-accent/30 bg-accent/[0.08] px-2 text-center">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-accent">OEM</p>
                    <p className="mt-1 text-sm font-bold">Demand</p>
                    <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">Qty / Week</p>
                  </motion.div>

                  {/* → */}
                  <div className="h-px w-6 flex-shrink-0 bg-white/20" />

                  {/* Engine T0 */}
                  <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                    className="flex h-24 flex-1 flex-col items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/[0.07] px-2 text-center">
                    <span className="mb-1.5 rounded bg-blue-500/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-blue-400">TIER 0</span>
                    <p className="text-sm font-bold">Engine</p>
                    <p className="font-mono text-[9px] text-muted-foreground">final assembly</p>
                  </motion.div>

                  {/* → */}
                  <div className="h-px w-6 flex-shrink-0 bg-white/20" />

                  {/* Module T1 */}
                  <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
                    className="flex h-24 flex-1 flex-col items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/[0.07] px-2 text-center">
                    <span className="mb-1.5 rounded bg-violet-500/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-violet-400">TIER 1</span>
                    <p className="text-sm font-bold">Module</p>
                    <p className="font-mono text-[9px] text-muted-foreground">LT: 4 wk</p>
                  </motion.div>

                  {/* Branch comb: Module → [Disk, BladeA, BladeB] */}
                  <div className="relative w-10 flex-shrink-0 self-stretch">
                    {/* Horizontal stem from Module (at 50%) to vertical bar */}
                    <div className="absolute left-0 h-px w-1/2 bg-white/20" style={{ top: "50%" }} />
                    {/* Vertical bar from Disk (15.4%) to BladeB (84.6%) */}
                    <div className="absolute left-1/2 w-px bg-white/20" style={{ top: "15.4%", bottom: "15.4%" }} />
                    {/* Horizontals from bar to each T2 box */}
                    <div className="absolute right-0 h-px w-1/2 bg-white/20" style={{ top: "15.4%" }} />
                    <div className="absolute right-0 h-px w-1/2 bg-white/20" style={{ top: "50%" }} />
                    <div className="absolute right-0 h-px w-1/2 bg-white/20" style={{ top: "84.6%" }} />
                    {/* Percentage labels on BladeA and BladeB legs */}
                    <div className="absolute" style={{ top: "calc(50% - 11px)", right: "3px" }}>
                      <span className="font-mono text-[7px] text-emerald-400/80">80%</span>
                    </div>
                    <div className="absolute" style={{ top: "calc(84.6% - 11px)", right: "3px" }}>
                      <span className="font-mono text-[7px] text-teal-400/80">20%</span>
                    </div>
                  </div>

                  {/* T2 column: Disk / BladeA / BladeB */}
                  <div className="flex flex-1 flex-col gap-3">
                    <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                      className="flex h-24 w-full flex-col items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/[0.07] px-2 text-center">
                      <span className="mb-1.5 rounded bg-cyan-500/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-cyan-400">TIER 2</span>
                      <p className="text-sm font-bold">Disk</p>
                      <p className="font-mono text-[9px] text-muted-foreground">LT: 20 wk</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.22 }}
                      className="flex h-24 w-full flex-col items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] px-2 text-center">
                      <span className="mb-1.5 rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-emerald-400">TIER 2</span>
                      <p className="text-sm font-bold">BladeA</p>
                      <p className="font-mono text-[9px] text-muted-foreground">LT: 14 wk</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.24 }}
                      className="flex h-24 w-full flex-col items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/[0.07] px-2 text-center">
                      <span className="mb-1.5 rounded bg-teal-500/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-teal-400">TIER 2</span>
                      <p className="text-sm font-bold">BladeB</p>
                      <p className="font-mono text-[9px] text-muted-foreground">LT: 16 wk</p>
                      <p className="mt-0.5 font-mono text-[8px] text-teal-400/70">dual-source</p>
                    </motion.div>
                  </div>

                  {/* Partial connector: Disk+BladeA → Forging; BladeB independent */}
                  <div className="relative w-12 flex-shrink-0 self-stretch">
                    {/* Horizontals from Disk and BladeA to the vertical bar */}
                    <div className="absolute left-0 h-px w-1/2 bg-amber-500/40" style={{ top: "15.4%" }} />
                    <div className="absolute left-0 h-px w-1/2 bg-amber-500/40" style={{ top: "50%" }} />
                    {/* Vertical bar from Disk to BladeA */}
                    <div className="absolute left-1/2 w-px bg-amber-500/40" style={{ top: "15.4%", height: "34.6%" }} />
                    {/* Horizontal from bar to Forging at midpoint (32.7%) */}
                    <div className="absolute right-0 h-px w-1/2 bg-amber-500/40" style={{ top: "32.7%" }} />
                    {/* BladeB: no T3 */}
                    <div className="absolute" style={{ top: "calc(84.6% - 9px)", left: "4px" }}>
                      <span className="rounded border border-teal-500/20 bg-[rgb(5,9,18)] px-1 py-0.5 font-mono text-[7px] text-teal-400/60">no T3</span>
                    </div>
                  </div>

                  {/* Forging T3 — center aligned with midpoint of Disk+BladeA (pt-[54px]) */}
                  <div className="flex flex-1 flex-col items-center justify-start pt-[54px] self-stretch">
                    <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                      className="flex h-24 w-full flex-col items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/[0.07] px-2 text-center">
                      <span className="mb-1.5 rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-amber-400">TIER 3</span>
                      <p className="text-sm font-bold">Forging</p>
                      <p className="font-mono text-[9px] text-muted-foreground">LT: 6 wk · shared</p>
                    </motion.div>
                  </div>

                  {/* → (at Forging center height = 32.7%) */}
                  <div className="relative w-5 flex-shrink-0 self-stretch">
                    <div className="absolute left-0 right-0 h-px bg-white/20" style={{ top: "32.7%" }} />
                  </div>

                  {/* Ingot T4 — same vertical offset as Forging */}
                  <div className="flex flex-1 flex-col items-center justify-start pt-[54px] self-stretch">
                    <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 }}
                      className="flex h-24 w-full flex-col items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/[0.07] px-2 text-center">
                      <span className="mb-1.5 rounded bg-orange-500/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-orange-400">TIER 4</span>
                      <p className="text-sm font-bold">Ingot</p>
                      <p className="font-mono text-[9px] text-muted-foreground">LT: 4 wk · raw material</p>
                    </motion.div>
                  </div>

              </div>

              {/* Stats strip */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.45 }}
                className="mt-8 grid gap-4 sm:grid-cols-4"
              >
                <div className="rounded-xl border border-accent/20 bg-accent/[0.06] px-4 py-3 sm:col-span-2">
                  <p className="mb-1 text-xs font-semibold text-accent">End-to-end visibility</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Stock levels, lead times, and supplier commits are tracked at every tier simultaneously, so a Forging shortfall at T3 triggers an alert 30+ weeks before it would halt engine assembly.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-around gap-6 rounded-xl border border-white/[0.05] bg-white/[0.02] px-5 py-3 sm:col-span-2">
                  {[
                    { label: "Total LT horizon", value: "44+ wk", color: "text-blue-400" },
                    { label: "Dual-source blades", value: "2 sites", color: "text-emerald-400" },
                    { label: "Shared Forging input", value: "Disk + BladeA", color: "text-amber-400" },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                      <p className="font-mono text-[9px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Simulation Logic + Benefits ───────────────────────────────── */}
      <section className="border-t border-white/[0.04] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn className="mb-10">
            <div className="mb-4 flex items-center gap-3 text-accent">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><BarChart3 size={16} /></div>
              <span className="font-mono text-xs uppercase tracking-widest">Simulation</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">How the Simulation Works</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Each week, OEM demand is propagated backwards through the full bill of materials, tier by tier, accounting for lead times, risk-adjusted delivery rates, and current stock levels to forecast exactly where and when shortfalls will occur.
            </p>
          </FadeIn>

          {/* Simulation steps */}
          <FadeIn delay={0.06}>
            <div className="mb-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { step: "01", label: "Demand Propagation", desc: "OEM weekly demand is exploded through the BOM to derive material-specific requirements at every tier" },
                { step: "02", label: "Lead Time Cascade", desc: "Each derived demand is offset by the component's lead time. Forging orders must be placed 6 wk before Module assembly needs the part" },
                { step: "03", label: "Stock Accounting", desc: "Week-by-week: stock = opening stock + risk-adjusted deliveries − consumed in production. Negative stock = backlog" },
                { step: "04", label: "Bottleneck Detection", desc: "Stock below buffer triggers an alert. The most constraining material at each tier is flagged as the active production bottleneck" },
                { step: "05", label: "Adaptive Escalation", desc: "When backlogs form, the model calculates the minimum supplier commit uplift needed to recover to buffer stock within the planning horizon" },
              ].map((s, i) => (
                <motion.div key={s.step} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="flex flex-col rounded-xl border border-white/[0.06] bg-card/40 p-4">
                  <span className="mb-3 font-mono text-[10px] text-accent/60">{s.step}</span>
                  <p className="mb-2 text-sm font-semibold">{s.label}</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </FadeIn>

          {/* Benefits grid */}
          <FadeIn delay={0.1}>
            <p className="mb-6 text-lg font-semibold">What This Enables</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "30+ Week Early Warning", desc: "A Forging shortfall at T3 surfaces as a stock alert more than 30 weeks before it would halt engine assembly, with enough lead time to negotiate supplier recovery." },
                { title: "Cross-Tier Propagation", desc: "A missed supplier commit at T4 flows automatically through Forging to BladeA/Disk to Module to Engine. No manual re-calculation at each tier." },
                { title: "Common Planning Baseline", desc: "All supply chain partners work from the same model and numbers, replacing the fragmented per-tier tracking each party previously maintained separately." },
                { title: "Live Scenario Testing", desc: "Adjust a lead time, change a supplier commit, or remove a component. The downstream impact cascades through all tiers immediately." },
                { title: "Quantified Shortfalls", desc: "Not just 'there is a risk': the simulation gives exact units short, by material, by week, so planners can present hard numbers in supplier reviews." },
                { title: "Adaptive Recovery Planning", desc: "When backlogs build, the model calculates and outputs the required supplier commit uplift per material to recover within the planning horizon." },
              ].map((b, i) => (
                <motion.div key={b.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 + i * 0.05 }}
                  className="rounded-xl border border-white/[0.06] bg-card/40 p-5">
                  <p className="mb-2 text-sm font-semibold">{b.title}</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Output Charts ─────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.04] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn className="mb-12">
            <div className="mb-4 flex items-center gap-3 text-accent">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><AlertTriangle size={16} /></div>
              <span className="font-mono text-xs uppercase tracking-widest">Outputs</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Simulation Outputs</h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Four chart types generated per run, each targeting a distinct planning decision.</p>
          </FadeIn>
          <div className="grid gap-10 sm:grid-cols-2">
            <FadeIn delay={0.05}>
              <ChartFrame src="/dcm/bottleneck.png" filename="dcm_bottleneck_chart.png"
                title="Module Bottleneck & Stock Levels"
                description="Component availability vs. production capacity over the planning horizon, alongside stock trajectories, immediately showing where and when constraints form."
                objectPos="center 60%" />
            </FadeIn>
            <FadeIn delay={0.1}>
              <ChartFrame src="/dcm/lob.png" filename="line_of_balance_chart.png"
                title="Line of Balance: All Materials"
                description="One LoB panel per material showing cumulative requirements, supplier deliveries, and stock level. The standard format used in multi-party aerospace programme reviews."
                objectPos="center 60%" />
            </FadeIn>
            <FadeIn delay={0.15}>
              <ChartFrame src="/dcm/alert.png" filename="alert_summary_chart.png"
                title="Supply–Demand Gap Heatmap"
                description="Gap severity by material and week. Dark cells indicate critical shortfalls, enabling planners to pre-position interventions before gaps propagate upward."
                objectPos="top" />
            </FadeIn>
            <FadeIn delay={0.2}>
              <ChartFrame src="/dcm/commit.png" filename="commit_comparison_chart.png"
                title="Component Capacity Gap Analysis"
                description="Planned vs. required weekly capacity per material, adjusted for delivery risk. Flags which components need increased supplier commitments and by how much."
                objectPos="top" />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Impact + Tech ─────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.04] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <FadeIn direction="left">
              <h2 className="mb-6 text-2xl font-bold tracking-tight">Impact</h2>
              <div className="space-y-4">
                {[
                  "Replaced fragmented per-partner Excel models with a single shared simulation, giving all stakeholders a common planning baseline",
                  "Enabled early detection of capacity constraints across all tiers, weeks before they propagate to the production line",
                  "Supported live scenario testing: adjusting supplier commitments or lead times and observing downstream impact immediately",
                  "Provided the analytical backbone for cross-company supply chain gap discussions within the Aerospace-X consortium",
                ].map((o, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3 text-sm text-muted-foreground">
                    <ChevronRight size={14} className="mt-0.5 flex-shrink-0 text-accent" />{o}
                  </motion.div>
                ))}
              </div>
            </FadeIn>
            <FadeIn direction="right" delay={0.1}>
              <h2 className="mb-6 text-2xl font-bold tracking-tight">Tech Stack</h2>
              <div className="mb-8 grid grid-cols-2 gap-3">
                {[
                  { label: "Python 3.11", detail: "simulation engine" },
                  { label: "pandas", detail: "BOM explosion & data wrangling" },
                  { label: "matplotlib", detail: "LoB, bottleneck & heatmap charts" },
                  { label: "openpyxl / xlrd", detail: "Excel I/O" },
                  { label: "NumPy", detail: "vectorised weekly calculations" },
                ].map((t) => (
                  <div key={t.label} className="rounded-lg border border-white/[0.06] bg-card/40 p-3">
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.detail}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
