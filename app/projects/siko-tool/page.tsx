"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  FileDown,
  Lock,
  Database,
  Search,
  BookOpen,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

const phases = [
  { id: "A1", label: "Scope & Assets",     color: "amber",  description: "Define IT systems, processes, and rooms. Assign information categories; this data feeds every phase that follows." },
  { id: "A2", label: "Protection Needs",   color: "emerald",description: "Protection requirements are pre-filled from A1 information categories. When multiple systems share information, the highest requirement level applies automatically." },
  { id: "A3", label: "Modelling",          color: "blue",   description: "Map assets to BSI building blocks. The tool suggests modules based on asset type; 111 blocks with requirements are embedded." },
  { id: "A4", label: "Basic Check",        color: "purple", description: "Work through all requirements per building block. Track implementation status across every asset in one view." },
  { id: "A5", label: "Risk Analysis",      color: "red",    description: "Identify and assess risks for assets with elevated protection needs, drawing directly from A1 and A2 data." },
  { id: "A6", label: "Consolidation",      color: "green",  description: "One-click export: complete SiKo document with cover page, TOC, cross-reference matrices, and risk overview." },
];

const colorMap: Record<string, { border: string; bg: string; badge: string }> = {
  amber:   { border: "border-amber-500/30",   bg: "bg-amber-500/[0.06]",   badge: "bg-amber-500/20 text-amber-400" },
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/[0.06]", badge: "bg-emerald-500/20 text-emerald-400" },
  blue:    { border: "border-blue-500/30",    bg: "bg-blue-500/[0.06]",    badge: "bg-blue-500/20 text-blue-400" },
  purple:  { border: "border-purple-500/30",  bg: "bg-purple-500/[0.06]",  badge: "bg-purple-500/20 text-purple-400" },
  red:     { border: "border-red-500/30",     bg: "bg-red-500/[0.06]",     badge: "bg-red-500/20 text-red-400" },
  green:   { border: "border-green-500/30",   bg: "bg-green-500/[0.06]",   badge: "bg-green-500/20 text-green-400" },
};

const capabilities = [
  {
    icon: <Database size={18} />,
    color: "blue",
    title: "Auto-syncing assets",
    body: "Change an asset in A1 and every downstream phase updates automatically. Protection needs, modelling, risks, and measures stay in sync without manual effort.",
  },
  {
    icon: <BookOpen size={18} />,
    color: "violet",
    title: "BSI catalogue built in",
    body: "All 111 building blocks with requirements and threat catalogue are embedded. No external document lookup during modelling. Everything is in the tool.",
  },
  {
    icon: <Search size={18} />,
    color: "blue",
    title: "Search, filter, scale",
    body: "Full-text search and filtering across all asset tables. A guided phase structure keeps work organized as the concept grows to hundreds of assets and requirements.",
  },
  {
    icon: <FileDown size={18} />,
    color: "emerald",
    title: "One-click export",
    body: "Generates a complete SiKo document in seconds: cover page, table of contents, cross-reference matrices, risk overview. Also structured Excel and versioned JSON.",
  },
  {
    icon: <Lock size={18} />,
    color: "amber",
    title: "Data stays local",
    body: "Everything runs in the browser. No server, no cloud. The concept never leaves the machine. Docker-deployable, no Office dependency, works on any device.",
  },
  {
    icon: <Layers size={18} />,
    color: "violet",
    title: "Audit-ready at any point",
    body: "Structured data across all phases means you can generate the current state of your IT security concept at any time, not just at the end of a months-long project.",
  },
];

const accentFor = (c: string) => {
  if (c === "emerald") return { icon: "bg-emerald-500/10 text-emerald-400", border: "border-emerald-500/20 bg-emerald-500/[0.05]" };
  if (c === "amber")   return { icon: "bg-amber-500/10 text-amber-400",     border: "border-amber-500/20 bg-amber-500/[0.05]" };
  if (c === "violet")  return { icon: "bg-violet-500/10 text-violet-400",   border: "border-violet-500/20 bg-violet-500/[0.05]" };
  return { icon: "bg-blue-500/10 text-blue-400", border: "border-blue-500/20 bg-blue-500/[0.05]" };
};

export default function SikoToolPage() {
  return (
    <div className="overflow-x-hidden">
      {/* ── Back nav ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 pt-8">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={14} />All projects
        </Link>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative border-b border-white/[0.04] pb-20 pt-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/8 via-transparent to-purple-500/5" />
        <div className="relative mx-auto max-w-7xl px-6">
          <FadeIn>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <ShieldCheck size={20} />
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">SiKo Tool</h1>
            <p className="mt-3 text-xl font-medium text-violet-400">
              IT-Grundschutz compliance that actually gets done.
            </p>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              A purpose-built GRC tool for BSI IT-Grundschutz Standard 200-2. Replaces
              month-long manual documentation with a guided, auto-synced workflow
              that keeps organisations continuously audit-ready.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Next.js", "BSI IT-Grundschutz 200-2", "Dexie.js", "IndexedDB", "Public Sector"].map((tag) => (
                <span key={tag} className="rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground">{tag}</span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── What is IT-Grundschutz ───────────────────────────────────── */}
      <section className="border-b border-white/[0.04] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 lg:items-center">
            <FadeIn direction="left">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-violet-400">The Standard</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What is IT-Grundschutz?</h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                IT-Grundschutz is Germany's most widely adopted IT security framework, published by the Federal Office for Information Security (BSI). The Standard 200-2 defines how organisations systematically identify, assess, and protect their information assets.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Compliance is mandatory or strongly recommended for German federal agencies, state administrations, and critical infrastructure operators (KRITIS), and serves as the path to ISO 27001 certification via the BSI Gold Standard.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  { label: "Federal agencies", color: "text-violet-400" },
                  { label: "KRITIS operators", color: "text-violet-400" },
                  { label: "ISO 27001 path", color: "text-violet-400" },
                  { label: "State administrations", color: "text-violet-400" },
                ].map((t) => (
                  <span key={t.label} className={`inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/[0.06] px-3 py-1 text-xs ${t.color}`}>
                    <CheckCircle2 size={11} />
                    {t.label}
                  </span>
                ))}
              </div>
            </FadeIn>
            <FadeIn direction="right" delay={0.15}>
              <div className="space-y-3">
                {[
                  { label: "Methodology phases (BSI 200-2)", value: "6", color: "text-violet-400" },
                  { label: "BSI building blocks available", value: "111+", color: "text-blue-400" },
                  { label: "Typical requirements per concept", value: "200–500", color: "text-amber-400" },
                  { label: "Duration without tool", value: "3–6 months", color: "text-red-400" },
                  { label: "Duration with tool", value: "Weeks", color: "text-emerald-400" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-3">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <span className={`font-mono text-sm font-bold ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── The compliance reality ───────────────────────────────────── */}
      <section className="border-b border-white/[0.04] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-red-400">The Reality</p>
            <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">A process few can afford to do right</h2>
            <p className="mb-12 max-w-xl text-base text-muted-foreground">
              IT-Grundschutz is thorough. That thoroughness is the problem. In practice,
              compliance requires months of expert work, most of it manual.
            </p>
          </FadeIn>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Clock size={18} />,
                color: "red",
                title: "Month-long documentation cycles",
                body: "A full IT security concept for a medium-sized organisation requires 3–6 months. Maintaining and updating it annually adds ongoing overhead that most teams cannot absorb.",
              },
              {
                icon: <AlertTriangle size={18} />,
                color: "amber",
                title: "Disconnected documents, constant re-entry",
                body: "Teams typically work across separate Excel sheets for each phase. The same asset appears six times. When something changes, every sheet has to be updated manually, and inconsistencies creep in.",
              },
              {
                icon: <Layers size={18} />,
                color: "red",
                title: "High barrier, low actual compliance",
                body: "Because the process is so burdensome, many organisations produce a concept once and never revisit it. A security concept that isn't maintained doesn't protect anyone and fails audits.",
              },
              {
                icon: <Search size={18} />,
                color: "amber",
                title: "External tools don't fit the standard",
                body: "Generic GRC platforms require significant configuration and don't map naturally to the BSI 200-2 phases and building block catalogue. The result: more overhead, not less.",
              },
              {
                icon: <FileDown size={18} />,
                color: "red",
                title: "Audit preparation is its own project",
                body: "Assembling the final SiKo document from scattered files takes days. When auditors request specific evidence or traceability, the data isn't structured to provide it quickly.",
              },
              {
                icon: <Database size={18} />,
                color: "amber",
                title: "Protection needs assessed repeatedly",
                body: "In A2, each asset's Schutzbedarf must be assessed individually. With dozens of linked systems, this is painstaking. Any change in A1 requires redoing the assessment by hand.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.45 }}
                className={`rounded-xl border p-5 ${
                  item.color === "red" ? "border-red-500/20 bg-red-500/[0.04]" : "border-amber-500/20 bg-amber-500/[0.04]"
                }`}
              >
                <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${
                  item.color === "red" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                }`}>
                  {item.icon}
                </div>
                <h3 className={`mb-2 text-sm font-semibold ${item.color === "red" ? "text-red-300" : "text-amber-300"}`}>{item.title}</h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The solution ─────────────────────────────────────────────── */}
      <section className="border-b border-white/[0.04] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 lg:items-center">
            <FadeIn direction="left">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-violet-400">The Tool</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                A GRC tool built specifically for this standard
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                The SiKo Tool brings the entire BSI 200-2 methodology into a single browser-based application.
                Instead of six disconnected documents, there is one data model. Enter an asset once; it propagates
                through every phase automatically.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                The tool was built with a specific goal: make IT-Grundschutz compliance achievable for organisations
                that could never afford the conventional approach. Security that's actually maintained, not documented
                once and forgotten.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "Protection needs pre-filled from A1 information categories",
                  "Integrated BSI catalogue, no external lookups",
                  "Complete Word document export in one click",
                  "Audit-ready data structure at any point in the process",
                ].map((o) => (
                  <div key={o} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <ChevronRight size={14} className="mt-0.5 shrink-0 text-violet-400" />
                    {o}
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn direction="right" delay={0.15}>
              {/* Before / After comparison */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-red-400">Before</p>
                  <div className="space-y-2">
                    {[
                      "6 separate Excel files, one per phase",
                      "Same asset re-entered 6 times",
                      "Schutzbedarf assessed manually, per asset",
                      "Manual document assembly for audits",
                      "Concept outdated within months",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-0.5 shrink-0 text-red-500">✕</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-emerald-400">With SiKo Tool</p>
                  <div className="space-y-2">
                    {[
                      "One application, all six phases connected",
                      "Asset entered once, synced everywhere",
                      "Schutzbedarf derived automatically",
                      "Complete Word export in one click",
                      "Concept stays current: update assets, not documents",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-0.5 shrink-0 text-emerald-400">✓</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Six phases ───────────────────────────────────────────────── */}
      <section className="border-b border-white/[0.04] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-violet-400">Methodology</p>
            <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Six phases, one connected workflow</h2>
            <p className="mb-12 max-w-xl text-base text-muted-foreground">
              The tool maps exactly to the BSI 200-2 phases. The standard is the navigation structure,
              not something to work around.
            </p>
          </FadeIn>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {phases.map((phase, i) => {
              const c = colorMap[phase.color];
              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.45 }}
                  className={`rounded-xl border p-5 ${c.border} ${c.bg}`}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold ${c.badge}`}>{phase.id}</span>
                    <span className="text-sm font-semibold">{phase.label}</span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{phase.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Capabilities ─────────────────────────────────────────────── */}
      <section className="border-b border-white/[0.04] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-violet-400">Capabilities</p>
            <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">What makes it different</h2>
            <p className="mb-12 max-w-xl text-base text-muted-foreground">
              Every feature was designed to eliminate a specific pain point in the conventional IT-Grundschutz process.
            </p>
          </FadeIn>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((b, i) => {
              const a = accentFor(b.color);
              return (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.45 }}
                  className={`rounded-xl border p-5 ${a.border}`}
                >
                  <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-xl ${a.icon}`}>{b.icon}</div>
                  <h3 className="mb-2 text-sm font-semibold">{b.title}</h3>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{b.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Back link ────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft size={14} />Back to all projects
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
