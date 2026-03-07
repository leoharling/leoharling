"use client";

import { useEffect, useState } from "react";
import { Loader2, Zap } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import NewsFeedItem from "@/components/tools/NewsFeedItem";
import { CATEGORIES } from "@/lib/rss-feeds";
import type { SignalType } from "@/lib/news-highlights";

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  snippet: string;
  source: string;
  category: string;
  highlight?: {
    type: SignalType;
    label: string;
  };
}

const FILTER_CATEGORIES = ["All", ...CATEGORIES.filter((c) => c !== "All"), "Noteworthy"];

export default function NewsFeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch("/api/rss")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const signalItems = items.filter((item) => item.highlight);

  const filtered =
    activeCategory === "All"
      ? items
      : activeCategory === "Noteworthy"
        ? signalItems
        : items.filter((item) => item.category === activeCategory);

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <SectionHeading
        title="Orbit Intel"
        subtitle="Curated news from the frontiers of space, AI, defence, and deep tech. Updated every 30 minutes."
      />

      {/* Signal banner */}
      {!loading && signalItems.length > 0 && (
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Zap size={14} className="text-amber-400" />
            <span>Noteworthy</span>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs">
              {signalItems.length}
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {signalItems.slice(0, 6).map((item, i) => (
              <NewsFeedItem
                key={`signal-${item.link}-${i}`}
                title={item.title}
                link={item.link}
                pubDate={item.pubDate}
                snippet={item.snippet}
                source={item.source}
                highlight={item.highlight}
                variant="signal"
              />
            ))}
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeCategory === cat
                ? cat === "Noteworthy"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-accent text-white"
                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feed items */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-accent" />
          <span className="ml-3 text-muted-foreground">
            Fetching latest news...
          </span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground">
          No articles found in this category.
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((item, i) => (
            <NewsFeedItem
              key={`${item.link}-${i}`}
              title={item.title}
              link={item.link}
              pubDate={item.pubDate}
              snippet={item.snippet}
              source={item.source}
              highlight={item.highlight}
            />
          ))}
        </div>
      )}
    </div>
  );
}
