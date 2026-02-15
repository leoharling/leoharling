"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import NewsFeedItem from "@/components/tools/NewsFeedItem";
import { CATEGORIES } from "@/lib/rss-feeds";

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  snippet: string;
  source: string;
  category: string;
}

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

  const filtered =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <SectionHeading
        title="Orbit Intel"
        subtitle="Curated news from the frontiers of space, AI, defence, and deep tech. Updated every 30 minutes."
      />

      {/* Category tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-accent text-white"
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
            <NewsFeedItem key={`${item.link}-${i}`} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}
