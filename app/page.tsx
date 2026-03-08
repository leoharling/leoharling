"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Newspaper,
  Rocket,
  Crosshair,
  FolderKanban,
  Plane,
  Network,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";

const Globe = dynamic(() => import("@/components/hero/Globe"), { ssr: false });
const NewsFeedPage = dynamic(() => import("@/app/tools/news-feed/page"), {
  ssr: false,
  loading: () => <PreviewSkeleton />,
});
const LaunchTrackerPage = dynamic(
  () => import("@/app/tools/launch-tracker/page"),
  { ssr: false, loading: () => <PreviewSkeleton /> }
);
const ConflictMonitor = dynamic(
  () => import("@/app/tools/conflict-monitor/ConflictMonitor"),
  { ssr: false, loading: () => <PreviewSkeleton /> }
);

function PreviewSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}

interface ShowcaseSection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  accentColor: string;
  preview: React.ReactNode;
  reverse: boolean;
}

const sections: ShowcaseSection[] = [
  {
    id: "intel",
    title: "Intel",
    subtitle: "Orbit Intel",
    description:
      "Signal feed from the frontiers of aerospace, AI, biotech, energy, and defence. Tracks transformational technology breakthroughs with automated signal detection.",
    href: "/intel",
    icon: <Newspaper size={20} />,
    accentColor: "from-blue-500/20 to-cyan-500/10",
    preview: <NewsFeedPage />,
    reverse: false,
  },
  {
    id: "space",
    title: "Space",
    subtitle: "Launch Tracker & Satellites",
    description:
      "Track upcoming rocket launches with real-time countdowns, explore past mission history, compare rocket specifications, and visualize satellite constellations in 3D.",
    href: "/space",
    icon: <Rocket size={20} />,
    accentColor: "from-violet-500/20 to-blue-500/10",
    preview: <LaunchTrackerPage />,
    reverse: true,
  },
  {
    id: "geopolitics",
    title: "Geopolitics",
    subtitle: "Conflict Monitor",
    description:
      "Real-time tracking of active armed conflicts worldwide with aggregated news, casualty data, escalation badges, diplomatic tracking, and interactive frontline maps.",
    href: "/geopolitics",
    icon: <Crosshair size={20} />,
    accentColor: "from-red-500/20 to-orange-500/10",
    preview: <ConflictMonitor />,
    reverse: false,
  },
];

const projects = [
  {
    title: "TrippyPlans",
    description: "Collaborative trip planning with real-time sync.",
    icon: <Plane size={20} />,
    href: "https://trippyplans.com",
    external: true,
    status: "Live",
  },
  {
    title: "AeroFlow",
    description: "Aerospace supply chain simulation & bottleneck analysis.",
    icon: <Network size={20} />,
    href: "/projects",
    external: false,
    status: "In Dev",
  },
  {
    title: "GRC Shield",
    description: "IT-Grundschutz compliance & Sicherheitskonzepte builder.",
    icon: <ShieldCheck size={20} />,
    href: "/projects",
    external: false,
    status: "In Dev",
  },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden">
        <Globe />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <p className="mb-4 font-mono text-sm tracking-widest text-accent uppercase">
              Strategy &middot; Space &middot; Technology
            </p>
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
              Leo Harling
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
              Strategy &amp; operations in aerospace, space and defence.
              Building tools and insights for the industries shaping our future.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button href="#intel">Explore</Button>
            <Button href="/contact" variant="secondary">
              Get in Touch
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowDown size={20} className="text-muted" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Showcase Sections ── */}
      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="relative border-t border-white/[0.04] py-24 lg:py-32"
        >
          {/* Subtle gradient glow */}
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${section.accentColor} opacity-30`}
          />

          <div className="relative mx-auto max-w-6xl px-6">
            <div
              className={`flex flex-col gap-12 lg:items-center lg:gap-16 ${
                section.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
              }`}
            >
              {/* Text side */}
              <FadeIn
                direction={section.reverse ? "right" : "left"}
                className="flex-1 lg:max-w-md"
              >
                <div className="flex items-center gap-3 text-accent mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                    {section.icon}
                  </div>
                  <span className="font-mono text-xs tracking-widest uppercase">
                    {section.title}
                  </span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {section.subtitle}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {section.description}
                </p>
                <div className="mt-8">
                  <Button href={section.href} size="sm">
                    Open {section.title}
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </FadeIn>

              {/* Preview side */}
              <FadeIn
                direction={section.reverse ? "left" : "right"}
                delay={0.15}
                className="flex-1"
              >
                <div className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-card/40 shadow-2xl shadow-black/40">
                  {/* Browser chrome bar */}
                  <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                      <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                      <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    </div>
                    <div className="ml-3 flex-1 rounded-md bg-white/[0.04] px-3 py-1 text-[10px] text-muted/60 font-mono">
                      leoharling.com/{section.id}
                    </div>
                  </div>

                  {/* Scaled live preview */}
                  <div className="relative h-[340px] overflow-hidden">
                    <div
                      className="pointer-events-none absolute left-0 top-0 origin-top-left"
                      style={{
                        width: "222%",
                        height: "222%",
                        transform: "scale(0.45)",
                      }}
                    >
                      {section.preview}
                    </div>

                    {/* Bottom fade */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      ))}

      {/* ── Projects Section ── */}
      <section
        id="projects"
        className="relative border-t border-white/[0.04] py-24 lg:py-32"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 opacity-30" />

        <div className="relative mx-auto max-w-6xl px-6">
          <FadeIn>
            <div className="flex items-center gap-3 text-accent mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                <FolderKanban size={20} />
              </div>
              <span className="font-mono text-xs tracking-widest uppercase">
                Projects
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What I&apos;m Building
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Software projects tackling real problems in aerospace, travel, and
              IT security compliance.
            </p>
          </FadeIn>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => {
              const inner = (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      {project.icon}
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        project.status === "Live"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <h3 className="flex items-center gap-2 text-base font-semibold">
                    {project.title}
                    {project.external && (
                      <ExternalLink size={12} className="text-muted" />
                    )}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </>
              );

              return (
                <FadeIn key={project.title} delay={i * 0.1}>
                  {project.external ? (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card group flex h-full flex-col p-6 transition-all duration-300 hover:scale-[1.02]"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className="glass-card group flex h-full flex-col p-6 transition-all duration-300 hover:scale-[1.02]">
                      {inner}
                    </div>
                  )}
                </FadeIn>
              );
            })}
          </div>

          <FadeIn delay={0.3}>
            <div className="mt-10 text-center">
              <Button href="/projects" variant="secondary" size="sm">
                View All Projects
                <ArrowRight size={14} />
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
