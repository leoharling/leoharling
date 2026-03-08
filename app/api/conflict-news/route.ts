import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser({ timeout: 10000 });

const FEEDS = [
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC" },
  {
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    source: "Al Jazeera",
  },
  {
    url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    source: "NY Times",
  },
  {
    url: "https://www.theguardian.com/world/rss",
    source: "The Guardian",
  },
];

const KEYWORDS: Record<string, string[]> = {
  ukraine: [
    "ukraine",
    "kyiv",
    "zelensky",
    "kremlin",
    "donbas",
    "kharkiv",
    "russia war",
    "russian invasion",
  ],
  middleeast: [
    "gaza",
    "israel",
    "hamas",
    "hezbollah",
    "iran",
    "palestinian",
    "houthi",
    "netanyahu",
  ],
  sudan: ["sudan", "khartoum", "darfur", "rsf", "rapid support"],
  myanmar: ["myanmar", "burma", "junta", "tatmadaw"],
  drc: ["congo", "goma", "m23", "kivu", "fardc", "monusco", "tshisekedi", "kagame"],
};

let cache: { data: unknown; timestamp: number } | null = null;
const CACHE_DURATION = 15 * 60 * 1000;

function matchConflict(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [id, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return id;
  }
  return null;
}

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return NextResponse.json(cache.data);
  }

  const allArticles: {
    title: string;
    link: string;
    source: string;
    pubDate: string;
    snippet: string;
  }[] = [];

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        return (parsed.items || []).map((item) => ({
          title: item.title || "",
          link: item.link || "",
          source: feed.source,
          pubDate: item.pubDate || item.isoDate || "",
          snippet: item.contentSnippet?.slice(0, 200) || "",
        }));
      } catch {
        return [];
      }
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    }
  }

  const tagged = allArticles
    .map((a) => ({
      ...a,
      conflict: matchConflict(a.title + " " + a.snippet),
    }))
    .filter((a) => a.conflict !== null)
    .sort(
      (a, b) =>
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

  const data = { articles: tagged, fetchedAt: new Date().toISOString() };
  cache = { data, timestamp: Date.now() };
  return NextResponse.json(data);
}
