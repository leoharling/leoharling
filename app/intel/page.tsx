import { Metadata } from "next";
import NewsFeedPage from "@/app/tools/news-feed/page";

export const metadata: Metadata = {
  title: "Intel | Orbit Intel",
  description:
    "Curated news from the frontiers of space, AI, defence, and deep tech.",
};

export default function IntelPage() {
  return <NewsFeedPage />;
}
