import { Metadata } from "next";
import Link from "next/link";
import {
  Plane,
  Network,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Software projects — from collaborative trip planning to aerospace supply chain simulation and IT security compliance.",
};

const projects = [
  {
    title: "TrippyPlans",
    description:
      "Organize trips with friends, discover destinations, and plan itineraries collaboratively. Built as a full-stack web app with real-time sync.",
    icon: <Plane size={24} />,
    href: "https://trippyplans.com",
    external: true,
    status: "Live" as const,
    tags: ["Next.js", "Supabase", "Real-time"],
  },
  {
    title: "DCM Tool",
    description:
      "Aerospace supply chain simulator for modeling supply flows across tiers of suppliers, identifying bottlenecks, and optimizing delivery timelines with Monte Carlo simulations.",
    icon: <Network size={24} />,
    href: "/projects/dcm-tool",
    external: false,
    status: "In Development" as const,
    tags: ["Supply Chain", "Simulation", "Aerospace"],
  },
  {
    title: "SiKo Tool",
    description:
      "IT-Grundschutz compliance tool for creating Sicherheitskonzepte following BSI standards (A1-A6). Generates security concepts, risk assessments, and compliance documentation.",
    icon: <ShieldCheck size={24} />,
    href: "/projects/siko-tool",
    external: false,
    status: "In Development" as const,
    tags: ["IT-Grundschutz", "BSI", "Compliance"],
  },
];

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        title="Projects"
        subtitle="Software I'm building to solve real problems in aerospace, travel, and IT security."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => {
          const cardClass =
            "glass-card group flex h-full flex-col p-6 transition-all duration-300 hover:scale-[1.02]";

          const content = (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
                  {project.icon}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    project.status === "Live"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                {project.title}
                {project.external && (
                  <ExternalLink size={14} className="text-muted" />
                )}
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">
                {project.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                {project.status === "Live" ? "Visit" : "Coming Soon"}
                <ArrowRight size={14} />
              </div>
            </>
          );

          return (
            <FadeIn key={project.title} delay={i * 0.1}>
              {project.external ? (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClass}
                >
                  {content}
                </a>
              ) : (
                <div className={cardClass}>
                  {content}
                </div>
              )}
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
