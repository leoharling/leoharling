import { Metadata } from "next";
import {
  Shield,
  Search,
  BarChart3,
  Bell,
  Globe,
  ExternalLink,
  Construction,
} from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Defence Procurement Tracker",
  description:
    "Aggregate and visualize public EU/NATO defence procurement data.",
};

const plannedFeatures = [
  {
    icon: <Search size={20} />,
    title: "Smart Search",
    description:
      "Search procurement notices by country, category, contract value, and keywords across multiple databases.",
  },
  {
    icon: <BarChart3 size={20} />,
    title: "Spend Analytics",
    description:
      "Visualize defence spending trends by country, domain, and time period with interactive charts.",
  },
  {
    icon: <Bell size={20} />,
    title: "Alert System",
    description:
      "Set up alerts for new procurement opportunities matching your criteria. Get notified via email.",
  },
  {
    icon: <Globe size={20} />,
    title: "Geographic View",
    description:
      "Map-based visualization of procurement activity across EU and NATO member states.",
  },
];

const dataSources = [
  {
    name: "TED (Tenders Electronic Daily)",
    url: "https://ted.europa.eu/",
    description: "Official EU public procurement journal",
  },
  {
    name: "NATO NSPA",
    url: "https://www.nspa.nato.int/",
    description: "NATO Support and Procurement Agency",
  },
  {
    name: "European Defence Agency",
    url: "https://eda.europa.eu/",
    description: "EU intergovernmental agency for defence capabilities",
  },
  {
    name: "SAM.gov",
    url: "https://sam.gov/",
    description: "US government contract opportunities",
  },
];

export default function DefenceProcurementPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <SectionHeading
        title="Defence Procurement Tracker"
        subtitle="Aggregating and visualizing public EU/NATO defence procurement data to improve transparency and accessibility."
      />

      {/* Coming Soon Banner */}
      <FadeIn>
        <div className="mb-12 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-6 py-4">
          <Construction size={20} className="text-amber-400 shrink-0" />
          <div>
            <p className="font-medium text-amber-400">Under Development</p>
            <p className="text-sm text-muted-foreground">
              This tool is currently being built. Below is an overview of
              planned features and data sources.
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Mockup UI */}
      <FadeIn>
        <div className="mb-12 overflow-hidden rounded-xl border border-white/5 bg-card">
          <div className="border-b border-white/5 p-4">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-accent" />
              <span className="font-semibold">Procurement Dashboard</span>
            </div>
          </div>
          <div className="p-6">
            {/* Search bar mockup */}
            <div className="mb-6 flex gap-3">
              <div className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-muted">
                Search contracts, agencies, categories...
              </div>
              <div className="rounded-lg bg-accent/20 px-4 py-2.5 text-sm text-accent">
                Search
              </div>
            </div>

            {/* Stats mockup */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              {[
                { label: "Active Tenders", value: "2,847" },
                { label: "Countries", value: "27" },
                { label: "Total Value", value: "€14.2B" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-white/5 bg-white/5 p-4 text-center"
                >
                  <p className="text-2xl font-bold text-accent">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Table mockup */}
            <div className="space-y-2">
              {[
                {
                  title: "Military Vehicle Maintenance Contract",
                  country: "Germany",
                  value: "€45M",
                },
                {
                  title: "Cybersecurity Infrastructure Upgrade",
                  country: "France",
                  value: "€12M",
                },
                {
                  title: "Naval Surveillance Systems",
                  country: "Netherlands",
                  value: "€78M",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.country}
                    </p>
                  </div>
                  <span className="font-mono text-accent">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Planned Features */}
      <FadeIn>
        <h3 className="mb-6 text-xl font-semibold">Planned Features</h3>
      </FadeIn>
      <div className="mb-12 grid gap-4 sm:grid-cols-2">
        {plannedFeatures.map((feature, i) => (
          <FadeIn key={feature.title} delay={i * 0.1}>
            <div className="glass-card p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                {feature.icon}
              </div>
              <h4 className="font-semibold">{feature.title}</h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Data Sources */}
      <FadeIn>
        <h3 className="mb-6 text-xl font-semibold">Data Sources</h3>
      </FadeIn>
      <div className="grid gap-3">
        {dataSources.map((source, i) => (
          <FadeIn key={source.name} delay={i * 0.1}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card flex items-center justify-between p-4 transition-all hover:scale-[1.01]"
            >
              <div>
                <p className="font-medium">{source.name}</p>
                <p className="text-sm text-muted-foreground">
                  {source.description}
                </p>
              </div>
              <ExternalLink size={16} className="shrink-0 text-muted" />
            </a>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
