import { Metadata } from "next";
import NewsFeedPage from "@/app/tools/news-feed/page";

export const metadata: Metadata = {
  title: "Intel | Orbit Intel",
  description:
    "Signal feed from the frontiers of aerospace, AI, biotech, energy, and defence.",
};

export default function IntelPage() {
  return <NewsFeedPage />;
}
