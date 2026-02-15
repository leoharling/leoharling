"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import LaunchCard from "@/components/tools/LaunchCard";

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

const PROVIDERS = [
  "All",
  "SpaceX",
  "Rocket Lab",
  "Arianespace",
  "United Launch Alliance",
  "ISRO",
  "CNSA",
];

export default function LaunchTrackerPage() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=20&mode=detailed")
      .then((res) => res.json())
      .then((data) => {
        setLaunches(data.results || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "All"
      ? launches
      : launches.filter((l) =>
          l.launch_service_provider.name
            .toLowerCase()
            .includes(filter.toLowerCase())
        );

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        title="Space Launch Tracker"
        subtitle="Track upcoming rocket launches worldwide with real-time countdown timers and mission details."
      />

      {/* Provider filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {PROVIDERS.map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filter === p
                ? "bg-accent text-white"
                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            }`}
          >
            {p}
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
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground">
          No upcoming launches found for this provider.
        </div>
      ) : (
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
      )}
    </div>
  );
}
