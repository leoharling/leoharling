"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  GitBranch,
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
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">Aerospace-X AP2</span>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">Consulting Project</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">Python · Simulation</span>
              </div>
              <h1 className="gradient-text text-5xl font-bold tracking-tight sm:text-6xl">DCM Tool</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                A five-tier demand &amp; capacity simulation for an aerospace engine supply chain — cascading OEM demand through every supplier tier to detect capacity constraints before they stall production.
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
              <h2 className="text-3xl font-bold tracking-tight">Aerospace-X: A&amp;D Industry Data Ecosystem</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Aerospace-X is a consortium of <strong className="text-foreground">30+ companies</strong> led by Airbus Operations GmbH, building an industry-wide digital data ecosystem for Aerospace &amp; Defence.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">AP2 — Demand &amp; Capacity Management</strong> is one of the core use cases: define a harmonised, multi-tier DCM standard that automates demand and capacity information exchange across all supply chain partners — enabling early identification of bottlenecks through demand cascading.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The DCM Tool was built for <strong className="text-foreground">Pillar 3 — Risk Monitoring of Critical Supply Chain Items</strong>, an Airbus-led workstream focused on proactive visibility into critical component constraints.
              </p>
            </FadeIn>
            <FadeIn direction="right" delay={0.1}>
              <div className="space-y-3">
                {[
                  { color: "red", title: "No shared planning baseline", body: "Each partner modelled in isolation. Supply-demand gaps only surfaced in joint reviews — after constraints had already formed." },
                  { color: "amber", title: "Lead times span quarters", body: "With lead times up to 20 weeks, order signals must be sent months in advance. Without demand cascading, this horizon is invisible." },
                  { color: "blue", title: "Dual-source complexity", body: "Blade supply is split across two sites with different lead times — a dependency invisible in any single-tier view." },
                  { color: "emerald", title: "Counter-intuitive bottlenecks", body: "End-to-end simulation regularly reveals that constraints sit at unexpected tiers — not findable from any single stakeholder's data." },
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
              A subsection of the RR engine supply chain — four critical items selected to monitor stock levels and enable early-warning signals for the production ramp.
            </p>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 sm:p-8"
              style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 70%)" }}>

              {/* Dot grid */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

              {/* Tier labels */}
              <div className="relative mb-4 flex w-full items-end gap-2">
                {/* OEM + T0 labels */}
                <div className="flex flex-1 gap-2">
                  <div className="flex-1" />
                  <div className="flex flex-1 justify-center">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-blue-400/70">Tier 0</span>
                  </div>
                </div>
                {/* Arrow spacer */}
                <div className="w-10 flex-none" />
                {/* Monitored scope label */}
                <div className="flex flex-[2.8] justify-center">
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 font-mono text-[9px] uppercase tracking-widest text-accent">
                    ⚑ Monitored · Critical SC Items
                  </span>
                </div>
                {/* Arrow spacer */}
                <div className="w-10 flex-none" />
                {/* T3 T4 labels */}
                <div className="flex flex-1 gap-2">
                  <div className="flex flex-1 justify-center">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-amber-400/70">Tier 3</span>
                  </div>
                  <div className="w-8 flex-none" />
                  <div className="flex flex-1 justify-center">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-orange-400/70">Tier 4</span>
                  </div>
                </div>
              </div>

              {/* Main row */}
              <div className="relative flex w-full items-stretch gap-2">

                {/* OEM Demand */}
                <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
                  className="flex flex-1 flex-col items-center justify-center rounded-xl border border-accent/25 bg-accent/[0.07] px-2 py-4 text-center">
                  <p className="font-mono text-[8px] uppercase tracking-widest text-accent">OEM</p>
                  <p className="mt-1 text-sm font-bold">Demand</p>
                  <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">Qty / Week</p>
                </motion.div>

                {/* Arrow */}
                <div className="flex w-10 flex-none items-center justify-center">
                  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex items-center gap-0">
                    <div className="h-px w-5 bg-gradient-to-r from-white/10 to-white/25" />
                    <ArrowRight size={10} className="text-white/30" />
                  </motion.div>
                </div>

                {/* T0: Engine */}
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
                  className="flex flex-1 flex-col items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/[0.06] px-2 py-4 text-center">
                  <span className="mb-1.5 inline-block rounded bg-blue-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-blue-400">TIER 0</span>
                  <p className="text-sm font-bold">Engine</p>
                  <p className="mt-1 font-mono text-[9px] text-muted-foreground">assembly</p>
                </motion.div>

                {/* Arrow into scope */}
                <div className="flex w-10 flex-none items-center justify-center">
                  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex items-center">
                    <div className="h-px w-5 bg-gradient-to-r from-white/15 to-accent/40" />
                    <ArrowRight size={10} className="text-accent/50" />
                  </motion.div>
                </div>

                {/* ── MONITORED SCOPE: T1 + T2 ── */}
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }}
                  className="relative flex flex-[2.8] items-stretch gap-2 rounded-xl border-2 border-dashed border-accent/50 bg-accent/[0.03] p-2.5">

                  {/* T1: Module */}
                  <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/[0.08] px-2 py-4 text-center">
                    <span className="mb-1.5 inline-block rounded bg-violet-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-violet-400">TIER 1</span>
                    <p className="text-sm font-bold">Module</p>
                    <p className="mt-1 font-mono text-[9px] text-muted-foreground">LT: 4 wk</p>
                  </div>

                  {/* Arrow within scope */}
                  <div className="flex flex-none items-center">
                    <div className="h-px w-3 bg-white/20" />
                    <ArrowRight size={9} className="text-white/25" />
                  </div>

                  {/* T2: Three components */}
                  <div className="flex flex-[1.6] flex-col gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] p-1.5">
                    <p className="text-center font-mono text-[8px] uppercase tracking-widest text-muted-foreground/60">Tier 2</p>
                    {[
                      { name: "BladeA", note: "80%", lt: "14 wk", badge: "bg-emerald-500/20 text-emerald-400", border: "border-emerald-500/25 bg-emerald-500/[0.06]" },
                      { name: "BladeB", note: "20%", lt: "16 wk", badge: "bg-teal-500/20 text-teal-400",    border: "border-teal-500/25 bg-teal-500/[0.06]" },
                      { name: "Disk",   note: "",    lt: "20 wk", badge: "bg-cyan-500/20 text-cyan-400",    border: "border-cyan-500/25 bg-cyan-500/[0.06]" },
                    ].map((m) => (
                      <div key={m.name} className={`flex flex-1 items-center justify-between rounded border px-2 py-1.5 ${m.border}`}>
                        <div className="flex items-center gap-1.5">
                          <span className={`rounded px-1 py-0.5 font-mono text-[8px] font-bold ${m.badge}`}>{m.name}</span>
                          {m.note && <span className="text-[9px] text-muted-foreground">{m.note}</span>}
                        </div>
                        <span className="font-mono text-[9px] text-muted-foreground">{m.lt}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Arrow out of scope */}
                <div className="flex w-10 flex-none items-center justify-center">
                  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.35 }} className="flex items-center">
                    <div className="h-px w-5 bg-gradient-to-r from-accent/40 to-white/15" />
                    <ArrowRight size={10} className="text-white/30" />
                  </motion.div>
                </div>

                {/* T3: Forging */}
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                  className="flex flex-1 flex-col items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/[0.05] px-2 py-4 text-center">
                  <span className="mb-1.5 inline-block rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-400">TIER 3</span>
                  <p className="text-sm font-bold">Forging</p>
                  <p className="mt-1 font-mono text-[9px] text-muted-foreground">LT: 6 wk</p>
                </motion.div>

                {/* Arrow */}
                <div className="flex w-8 flex-none items-center justify-center">
                  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.45 }} className="flex items-center">
                    <div className="h-px w-4 bg-white/15" />
                    <ArrowRight size={9} className="text-white/25" />
                  </motion.div>
                </div>

                {/* T4: Ingot */}
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
                  className="flex flex-1 flex-col items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/[0.05] px-2 py-4 text-center">
                  <span className="mb-1.5 inline-block rounded bg-orange-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-orange-400">TIER 4</span>
                  <p className="text-sm font-bold">Ingot</p>
                  <p className="mt-1 font-mono text-[9px] text-muted-foreground">LT: 4 wk</p>
                  <p className="font-mono text-[9px] text-muted-foreground/60">raw material</p>
                </motion.div>
              </div>

              {/* Callout annotation strip */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.55 }}
                className="mt-4 flex flex-wrap items-start gap-4"
              >
                <div className="flex-1 rounded-xl border border-accent/20 bg-accent/[0.06] px-4 py-3">
                  <p className="mb-1 text-xs font-semibold text-accent">Early-warning monitoring</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Module (T1) and blade/disk components (T2) are selected as critical SC items — long lead times mean stock gaps must be detected weeks in advance to avoid production line stoppages.
                  </p>
                </div>
                <div className="flex flex-wrap gap-6 rounded-xl border border-white/[0.05] bg-white/[0.02] px-5 py-3">
                  {[
                    { label: "Total LT horizon", value: "44+ wk", color: "text-blue-400" },
                    { label: "Dual-source blades", value: "2 sites", color: "text-emerald-400" },
                    { label: "Shared Forging input", value: "BladeA + Disk", color: "text-amber-400" },
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

      {/* ── Model Logic — Inputs / Engine / Outputs ───────────────────── */}
      <section className="border-t border-white/[0.04] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn className="mb-10">
            <div className="mb-4 flex items-center gap-3 text-accent">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><BarChart3 size={16} /></div>
              <span className="font-mono text-xs uppercase tracking-widest">Model Logic</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Inputs · Simulation Engine · Outputs</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              The model calculates actual demand and effective capacity at each tier of the supply chain — week by week, material by material.
            </p>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="overflow-hidden rounded-2xl border border-white/[0.07]">
              <div className="flex flex-col lg:flex-row">

                {/* ── INPUTS ── */}
                <div className="flex-none border-b border-white/[0.06] bg-blue-500/[0.05] p-6 lg:w-52 lg:border-b-0 lg:border-r">
                  <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-blue-400">Inputs</p>
                  <div className="space-y-2">
                    <div className="rounded-lg border border-blue-500/25 bg-blue-500/10 px-3 py-2.5 text-xs font-medium">
                      OEM Demand
                      <p className="mt-0.5 font-mono text-[9px] font-normal text-muted-foreground">Qty / Week</p>
                    </div>
                    <div className="pt-1">
                      <p className="mb-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-blue-400/70">Parameters</p>
                      <div className="space-y-1.5">
                        {[
                          "BOM structure",
                          "Lead Times",
                          "Risk Weighted Factors",
                          "Buffer Stock",
                        ].map((p) => (
                          <div key={p} className="rounded border border-blue-500/15 bg-blue-500/[0.06] px-2.5 py-1.5 text-[11px] text-muted-foreground">
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-blue-500/25 bg-blue-500/10 px-3 py-2.5 text-xs font-medium">
                      Supplier Commits
                      <p className="mt-0.5 font-mono text-[9px] font-normal text-muted-foreground">Qty / Week</p>
                    </div>
                  </div>
                </div>

                {/* ── SIMULATION ENGINE ── */}
                <div className="flex flex-1 flex-col border-b border-white/[0.06] bg-card/50 p-6 lg:border-b-0 lg:border-r">
                  <p className="mb-5 font-mono text-[10px] uppercase tracking-widest text-foreground/60">Simulation Engine</p>
                  <div className="flex flex-1 gap-5">

                    {/* Calculated values */}
                    <div className="flex flex-1 flex-col gap-3">
                      {[
                        { label: "Derived Demand", icon: "→" },
                        { label: "Effective Capacity", icon: "→" },
                        { label: "Actual Capacity", icon: "→" },
                      ].map((c, i) => (
                        <motion.div
                          key={c.label}
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 + i * 0.07 }}
                          className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-3"
                        >
                          <span className="text-sm text-accent">{c.icon}</span>
                          <div>
                            <p className="text-xs font-semibold">{c.label}</p>
                            <p className="font-mono text-[9px] text-muted-foreground">Qty / Week / Material</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Weekly simulation tier flow */}
                    <div className="flex flex-1 flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <p className="mb-4 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">Weekly simulation</p>
                      <div className="flex flex-1 flex-col justify-center gap-2">
                        {[
                          { tier: "TIER 2", items: "Blade · Disk", color: "border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-400" },
                          { tier: "TIER 1", items: "Module",       color: "border-violet-500/25 bg-violet-500/[0.07] text-violet-400" },
                          { tier: "TIER 0", items: "Engine",       color: "border-blue-500/25 bg-blue-500/[0.07] text-blue-400" },
                        ].map((t, i) => (
                          <motion.div
                            key={t.tier}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.25 + i * 0.08 }}
                          >
                            {i > 0 && (
                              <div className="flex justify-center py-0.5">
                                <ArrowDown size={12} className="text-white/20" />
                              </div>
                            )}
                            <div className={`flex items-center justify-between rounded-lg border px-3 py-2 ${t.color}`}>
                              <span className="font-mono text-[9px] font-bold">{t.tier}</span>
                              <span className="text-xs font-medium">{t.items}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recovery adjustment plan */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.45 }}
                    className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] px-4 py-2.5"
                  >
                    <span className="text-emerald-400">↺</span>
                    <div>
                      <p className="text-xs font-semibold text-emerald-400">Recovery Adjustment Plan</p>
                      <p className="font-mono text-[9px] text-muted-foreground">Adaptive escalation feeds back into Supplier Commits</p>
                    </div>
                  </motion.div>
                </div>

                {/* ── OUTPUTS ── */}
                <div className="flex-none bg-amber-500/[0.04] p-6 lg:w-48">
                  <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-amber-400">Outputs</p>
                  <div className="space-y-2">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-amber-400/70">Charts</p>
                    {[
                      "Line of Balance",
                      "Component Analysis",
                      "Bottleneck Alerting",
                    ].map((c) => (
                      <div key={c} className="rounded-lg border border-amber-500/20 bg-amber-500/8 px-2.5 py-2 text-center text-xs">
                        {c}
                      </div>
                    ))}
                    <div className="pt-2">
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/8 px-2.5 py-2.5 text-center">
                        <p className="text-xs font-medium">Projected Stock</p>
                        <p className="font-mono text-[9px] text-muted-foreground">Qty / Week / Material</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                description="Component availability vs. production capacity over the planning horizon, alongside stock trajectories — immediately showing where and when constraints form."
                objectPos="center 60%" />
            </FadeIn>
            <FadeIn delay={0.1}>
              <ChartFrame src="/dcm/lob.png" filename="line_of_balance_chart.png"
                title="Line of Balance — All Materials"
                description="One LoB panel per material showing cumulative requirements, supplier deliveries, and stock level. The standard format used in multi-party aerospace programme reviews."
                objectPos="center 60%" />
            </FadeIn>
            <FadeIn delay={0.15}>
              <ChartFrame src="/dcm/alert.png" filename="alert_summary_chart.png"
                title="Supply–Demand Gap Heatmap"
                description="Gap severity by material and week. Dark cells indicate critical shortfalls — enabling planners to pre-position interventions before gaps propagate upward."
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
                  "Replaced fragmented per-partner Excel models with a single shared simulation — giving all stakeholders a common planning baseline",
                  "Enabled early detection of capacity constraints across all tiers, weeks before they propagate to the production line",
                  "Supported live scenario testing: adjusting supplier commitments or lead times and observing downstream impact immediately",
                  "Provided the analytical backbone for cross-company gap discussions in Aerospace-X Pillar 3 working sessions",
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
              <h2 className="mb-4 text-2xl font-bold tracking-tight">My Role</h2>
              <div className="rounded-xl border border-white/[0.06] bg-card/40 p-5">
                <div className="flex items-start gap-3">
                  <GitBranch size={16} className="mt-0.5 flex-shrink-0 text-accent" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Designed and built the simulation from scratch within the Aerospace-X AP2 Pillar 3 workstream — covering the BOM explosion logic, multi-tier lead time cascading, dual-source blade handling, adaptive supply escalation, and all four visualisation outputs. Worked with supply chain planners across OEM and supplier organisations to validate the model against real programme data.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
