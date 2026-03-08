import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const SPACE_DEVS = "https://ll.thespacedevs.com/2.3.0/launches";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fetch all pages from The Space Devs and cache in Supabase
async function fetchAndCache(cacheKey: string, startUrl: string) {
  const allResults: unknown[] = [];
  let url: string | null = startUrl;

  while (url) {
    const res: Response = await fetch(url, {
      headers: { "User-Agent": "OrbitIntel/1.0 (leoharling.com)" },
    });
    if (res.status === 429) {
      return { error: "rate-limit", data: null };
    }
    if (!res.ok) {
      return { error: `HTTP ${res.status}`, data: null };
    }
    const json: { results?: unknown[]; next?: string } = await res.json();
    allResults.push(...(json.results || []));
    url = json.next || null;
    if (url) await sleep(2500);
  }

  // Cache in Supabase
  await supabase.from("launch_cache").upsert(
    { cache_key: cacheKey, data: allResults, updated_at: new Date().toISOString() },
    { onConflict: "cache_key" }
  );

  return { error: null, data: allResults };
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") || "upcoming";
  const year = request.nextUrl.searchParams.get("year");

  const cacheKey = type === "upcoming" ? "upcoming" : `past_${year}`;

  // Try Supabase cache first
  const { data: cached } = await supabase
    .from("launch_cache")
    .select("data, updated_at")
    .eq("cache_key", cacheKey)
    .single();

  if (cached) {
    return NextResponse.json(
      { results: cached.data, cached: true, updated_at: cached.updated_at },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  }

  // Cache miss — fetch from The Space Devs and store
  let url: string;
  if (type === "upcoming") {
    url = `${SPACE_DEVS}/upcoming/?limit=20&mode=detailed`;
  } else {
    url = `${SPACE_DEVS}/previous/?limit=100&mode=normal&ordering=-net&net__gte=${year}-01-01T00:00:00Z&net__lte=${year}-12-31T23:59:59Z`;
  }

  const result = await fetchAndCache(cacheKey, url);
  if (result.error === "rate-limit") {
    return NextResponse.json(
      { error: "API rate limit reached. Data will be available after the next sync." },
      { status: 429 }
    );
  }
  if (result.error) {
    return NextResponse.json(
      { error: `Failed to fetch launches: ${result.error}` },
      { status: 502 }
    );
  }

  return NextResponse.json(
    { results: result.data, cached: false },
    {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    }
  );
}
