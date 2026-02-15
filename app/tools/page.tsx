import { Metadata } from "next";
import Link from "next/link";
import {
  Rocket,
  Newspaper,
  Globe,
  Shield,
  Plane,
  ExternalLink,
} from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Interactive tools and projects — from space launch tracking to defence procurement insights.",
};

const tools = [
  {
    title: "TrippyPlans",
    description:
      "Organize trips with friends, discover destinations, and plan itineraries collaboratively.",
    icon: <Plane size={24} />,
    href: "https://trippyplans.com",
    external: true,
    status: "Live" as const,
  },
  {
    title: "Orbit Intel",
    description:
      "Curated news feed aggregating the latest from New Space, AI, defence, and deep tech startups.",
    icon: <Newspaper size={24} />,
    href: "/tools/news-feed",
    external: false,
    status: "Live" as const,
  },
  {
    title: "Space Launch Tracker",
    description:
      "Track upcoming rocket launches worldwide with real-time data from SpaceX, RocketLab, and more.",
    icon: <Rocket size={24} />,
    href: "/tools/launch-tracker",
    external: false,
    status: "Live" as const,
  },
  {
    title: "Satellite Constellation Visualizer",
    description:
      "Explore satellite orbits in 3D — visualize Starlink, OneWeb, GPS and other constellations around Earth.",
    icon: <Globe size={24} />,
    href: "/tools/satellite-visualizer",
    external: false,
    status: "Live" as const,
  },
  {
    title: "Defence Procurement Tracker",
    description:
      "Aggregate and visualize public EU/NATO defence procurement data. Search by country, category, and value.",
    icon: <Shield size={24} />,
    href: "/tools/defence-procurement",
    external: false,
    status: "Coming Soon" as const,
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        title="Tools & Projects"
        subtitle="Interactive tools I've built to explore the industries I care about — space, defence, and technology."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, i) => {
          const className =
            "glass-card group flex h-full flex-col p-6 transition-all duration-300 hover:scale-[1.02]";
          const content = (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
                  {tool.icon}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    tool.status === "Live"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {tool.status}
                </span>
              </div>
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                {tool.title}
                {tool.external && (
                  <ExternalLink size={14} className="text-muted" />
                )}
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">
                {tool.description}
              </p>
            </>
          );

          return (
            <FadeIn key={tool.title} delay={i * 0.1}>
              {tool.external ? (
                <a
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {content}
                </a>
              ) : (
                <Link href={tool.href} className={className}>
                  {content}
                </Link>
              )}
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
