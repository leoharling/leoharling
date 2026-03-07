"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, CalendarClock, History, Rocket as RocketIcon } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import LaunchCard from "@/components/tools/LaunchCard";
import PastLaunchesTab from "@/components/tools/PastLaunchesTab";
import RocketsTab from "@/components/tools/RocketsTab";

interface Launch {
  id: string;
  name: string;
  net: string;
  status: { name: string };
  launch_service_provider: { name: string };
  rocket: { configuration: { name: string } };
  pad: {
    name: string;
    location: { name: string };
  };
  image?: { image_url?: string } | null;
  mission?: { description?: string } | null;
}


type Tab = "upcoming" | "past" | "rockets";

const TABS: { key: Tab; label: string; icon: typeof CalendarClock }[] = [
  { key: "upcoming", label: "Upcoming", icon: CalendarClock },
  { key: "past", label: "Past Launches", icon: History },
  { key: "rockets", label: "Rockets", icon: RocketIcon },
];

export default function LaunchTrackerPage() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/launches?type=upcoming")
      .then((res) => {
        if (res.status === 429) throw new Error("rate-limit");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setLaunches(data.results || []);
        if (data.updated_at) setLastUpdated(data.updated_at);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(
          err.message === "rate-limit"
            ? "Data is being synced. Please try again in a few minutes."
            : "Failed to load launch data. Please try again later."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const SHORT_NAMES: Record<string, string> = {
    "China Aerospace Science and Technology Corporation": "CASC",
    "Chinese Aerospace Science and Technology Corporation": "CASC",
    "Indian Space Research Organization": "ISRO",
    "Russian Federal Space Agency (ROSCOSMOS)": "Roscosmos",
    "Roscosmos": "Roscosmos",
    "United Launch Alliance": "ULA",
  };

  const providers = useMemo(() => {
    const seen = new Map<string, string>();
    for (const l of launches) {
      const full = l.launch_service_provider.name;
      const short = SHORT_NAMES[full] || full;
      if (!seen.has(short)) seen.set(short, full);
    }
    const entries = [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    return [{ label: "All", value: "All" }, ...entries.map(([label, value]) => ({ label, value }))];
  }, [launches]);

  const filtered =
    filter === "All"
      ? launches
      : launches.filter((l) => {
          const short = SHORT_NAMES[l.launch_service_provider.name] || l.launch_service_provider.name;
          return short === filter;
        });

  return (
    <div className="mx-auto max-w-6xl px-6 pt-8 pb-16">
      <SectionHeading
        title="Space Launch Tracker"
        subtitle="Track rocket launches worldwide with real-time countdowns, launch history, and detailed rocket specifications."
        className="mb-6"
      />

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-xl bg-white/[0.03] p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-accent text-white shadow-lg shadow-accent/20"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Upcoming tab */}
      {tab === "upcoming" && (
        <>
          {/* Provider filter */}
          <div className="mb-8 flex flex-wrap gap-2">
            {providers.map((p) => (
              <button
                key={p.label}
                onClick={() => setFilter(p.label)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  filter === p.label
                    ? "bg-accent text-white"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={24} className="animate-spin text-accent" />
              <span className="ml-3 text-muted-foreground">
                Loading upcoming launches...
              </span>
            </div>
          ) : error ? (
            <div className="glass-card mx-auto max-w-lg px-6 py-12 text-center">
              <p className="text-sm text-amber-400">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center text-muted-foreground">
              No upcoming launches found for this provider.
            </div>
          ) : (
            <>
              {lastUpdated && (
                <p className="mb-4 text-xs text-muted-foreground">
                  Last synced:{" "}
                  {new Date(lastUpdated).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((launch) => (
                  <LaunchCard
                    key={launch.id}
                    name={launch.name}
                    provider={launch.launch_service_provider.name}
                    vehicle={launch.rocket.configuration.name}
                    padName={launch.pad.name}
                    padLocation={launch.pad.location.name}
                    launchDate={launch.net}
                    status={launch.status.name}
                    imageUrl={launch.image?.image_url}
                    missionDescription={launch.mission?.description}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Past launches tab */}
      {tab === "past" && <PastLaunchesTab />}

      {/* Rockets tab */}
      {tab === "rockets" && <RocketsTab />}
    </div>
  );
}
