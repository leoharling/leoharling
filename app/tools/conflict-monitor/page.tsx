import { Metadata } from "next";
import ConflictMonitor from "./ConflictMonitor";

export const metadata: Metadata = {
  title: "Global Conflict Monitor",
  description:
    "Real-time tracking of active armed conflicts worldwide with aggregated news, key metrics, and interactive maps.",
};

export default function ConflictMonitorPage() {
  return <ConflictMonitor />;
}
