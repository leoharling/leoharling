import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { RSS_FEEDS } from "@/lib/rss-feeds";
import { detectHighlight, type Highlight } from "@/lib/news-highlights";

export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  snippet: string;
  source: string;
  category: string;
  highlight?: Highlight;
}

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; OrbitIntel/1.0)",
  },
});

export async function GET() {
  try {
    const feedPromises = RSS_FEEDS.map(async (feedConfig) => {
      try {
        const feed = await parser.parseURL(feedConfig.url);
        return (feed.items || []).slice(0, 5).map((item) => {
          const title = item.title || "Untitled";
          const raw = (item.contentSnippet || item.content || "").trim();
          // Strip HN-style metadata-only snippets (Article URL, Comments URL, Points, etc.)
          const isMetaOnly = /^Article URL:/.test(raw) || /^Comments URL:/.test(raw);
          const snippet = isMetaOnly ? "" : raw.slice(0, 200) + "...";
          const highlight = detectHighlight(title, snippet);
          return {
            title,
            link: item.link || "#",
            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
            snippet,
            source: feedConfig.name,
            category: feedConfig.category,
            ...(highlight && { highlight }),
          };
        });
      } catch {
        console.warn(`Failed to fetch feed: ${feedConfig.name}`);
        return [];
      }
    });

    const results = await Promise.allSettled(feedPromises);
    const allItems: FeedItem[] = results
      .filter(
        (r): r is PromiseFulfilledResult<FeedItem[]> =>
          r.status === "fulfilled"
      )
      .flatMap((r) => r.value)
      .sort(
        (a, b) =>
          new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );

    return NextResponse.json(allItems, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("RSS fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feeds" },
      { status: 500 }
    );
  }
}
