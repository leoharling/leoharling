import type { Metadata } from "next";
import AIPageClient from "./AIPageClient";

export const metadata: Metadata = {
  title: "AI | Leo Harling",
  description:
    "Explore the AI value chain — from global data center infrastructure and hyperscaler investments to model comparisons and real-world applications across industries.",
};

export default function AIPage() {
  return <AIPageClient />;
}
