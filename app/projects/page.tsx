"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plane,
  Network,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

const projects = [
  {
    title: "TrippyPlans",
    tagline: "Collaborative trip planning, reimagined.",
    description:
      "Plan trips with friends in real-time: shared itineraries, destination discovery, and collaborative editing. Full-stack web app with live sync.",
    icon: <Plane size={20} />,
    href: "https://trippyplans.com",
    external: true,
    tags: ["Next.js", "Supabase", "Real-time"],
    accent: "from-emerald-500/15 to-teal-500/5",
    accentColor: "emerald",
  },
  {
    title: "DCM Tool",
    tagline: "Supply chain visibility across every tier.",
    description:
      "Multi-tier demand and capacity simulation for aerospace engine supply chains. Detects bottlenecks at Tier 2 before they propagate to the production line.",
    icon: <Network size={20} />,
    href: "/projects/dcm-tool",
    external: false,
    tags: ["Python", "Supply Chain", "Aerospace-X"],
    accent: "from-blue-500/15 to-cyan-500/5",
    accentColor: "blue",
  },
  {
    title: "SiKo Tool",
    tagline: "IT-Grundschutz compliance without the overhead.",
    description:
      "Browser-native tool for BSI IT-Grundschutz Standard 200-2. Pre-fills protection needs from information categories. Runs entirely in the browser with no data exposure.",
    icon: <ShieldCheck size={20} />,
    href: "/projects/siko-tool",
    external: false,
    tags: ["Next.js", "BSI 200-2", "Public Sector"],
    accent: "from-violet-500/15 to-purple-500/5",
    accentColor: "violet",
  },
];

const accentStyles = {
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-400",
    tagline: "text-emerald-400",
    btn: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20",
  },
  blue: {
    icon: "bg-blue-500/10 text-blue-400",
    tagline: "text-blue-400",
    btn: "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-400",
    tagline: "text-violet-400",
    btn: "bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20",
  },
};

export default function ProjectsPage() {
  return (
    <div className="overflow-x-hidden">
      {/* ── Project grid ─────────────────────────────────────────────── */}
      <section className="py-20 pt-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => {
              const a = accentStyles[project.accentColor as keyof typeof accentStyles];
              return (
                <motion.div
                  key={project.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br ${project.accent} backdrop-blur-sm transition-all hover:border-white/[0.12]`}
                >
                  {/* Card body */}
                  <div className="flex flex-1 flex-col p-6">
                    {/* Header */}
                    <div className="mb-4">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${a.icon}`}>
                        {project.icon}
                      </div>
                    </div>

                    <h2 className="mb-1 text-xl font-bold tracking-tight">
                      {project.title}
                    </h2>
                    <p className={`mb-3 text-sm font-medium ${a.tagline}`}>
                      {project.tagline}
                    </p>
                    <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {project.description}
                    </p>

                    {/* Tags */}
                    <div className="mb-5 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    {project.external ? (
                      <a
                        href={project.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 self-start rounded-xl border px-4 py-2 text-sm font-medium transition-all ${a.btn}`}
                      >
                        Visit Site
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      <Link
                        href={project.href}
                        className={`inline-flex items-center gap-2 self-start rounded-xl border px-4 py-2 text-sm font-medium transition-all ${a.btn}`}
                      >
                        View Project
                        <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
