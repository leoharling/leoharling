import { Metadata } from "next";
import ConflictMonitor from "@/app/tools/conflict-monitor/ConflictMonitor";

export const metadata: Metadata = {
  title: "Geopolitics | Conflict Monitor",
  description:
    "Real-time tracking of active armed conflicts worldwide with aggregated news, key metrics, and interactive maps.",
};

export default function GeopoliticsPage() {
  return <ConflictMonitor />;
}
