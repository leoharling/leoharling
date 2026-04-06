import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const SPACE_DEVS = "https://ll.thespacedevs.com/2.3.0/launches";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
};

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") || "upcoming";
  const year = request.nextUrl.searchParams.get("year");

  // All-time past launches: merge all cached years
  if (type === "past" && year === "all") {
    const { data: rows, error } = await supabase
      .from("launch_cache")
      .select("data")
      .like("cache_key", "past_%");

    if (error) {
      return NextResponse.json(
        { error: "Failed to load launch data" },
        { status: 500 }
      );
    }

    const all = (rows || []).flatMap(
      (r) => ((r.data || []) as Record<string, unknown>[])
    );
    all.sort((a, b) => String(b.net || "").localeCompare(String(a.net || "")));

    // No CDN caching: this aggregates dynamically from Supabase as years get populated
    return NextResponse.json(
      { results: all, cached: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

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
      { headers: CACHE_HEADERS }
    );
  }

  // Upcoming: fetch from API on cache miss
  if (type === "upcoming") {
    try {
      const res: Response = await fetch(
        `${SPACE_DEVS}/upcoming/?limit=50&mode=detailed`,
        { headers: { "User-Agent": "OrbitIntel/1.0 (leoharling.com)" } }
      );

      if (res.status === 429) {
        return NextResponse.json(
          { error: "API rate limit reached. Data will be available after the next sync." },
          { status: 429 }
        );
      }
      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch launches: HTTP ${res.status}` },
          { status: 502 }
        );
      }

      const json: { results?: unknown[] } = await res.json();
      const results = json.results || [];

      await supabase.from("launch_cache").upsert(
        { cache_key: "upcoming", data: results, updated_at: new Date().toISOString() },
        { onConflict: "cache_key" }
      );

      return NextResponse.json(
        { results, cached: false },
        { headers: CACHE_HEADERS }
      );
    } catch (error) {
      console.error("Error fetching upcoming launches:", error);
      return NextResponse.json(
        { error: "Failed to fetch launch data" },
        { status: 500 }
      );
    }
  }

  // Past year: fetch from Space Devs API on cache miss, then cache permanently
  const yearNum = parseInt(year || "");
  if (isNaN(yearNum)) {
    return NextResponse.json({ results: [], cached: false }, { headers: CACHE_HEADERS });
  }

  try {
    const allLaunches: Record<string, unknown>[] = [];
    let nextUrl: string | null =
      `${SPACE_DEVS}/previous/?limit=100&mode=normal&net__gte=${yearNum}-01-01T00:00:00Z&net__lte=${yearNum}-12-31T23:59:59Z&ordering=-net`;

    while (nextUrl) {
      const res: Response = await fetch(nextUrl, {
        headers: { "User-Agent": "OrbitIntel/1.0 (leoharling.com)" },
      });

      if (res.status === 429) {
        if (allLaunches.length > 0) break;
        return NextResponse.json(
          { error: "API rate limit reached. Please try again later." },
          { status: 429 }
        );
      }
      if (!res.ok) break;

      const json = await res.json();
      allLaunches.push(...(json.results || []));
      nextUrl = json.next || null;
    }

    if (allLaunches.length > 0) {
      await supabase.from("launch_cache").upsert(
        { cache_key: `past_${yearNum}`, data: allLaunches, updated_at: new Date().toISOString() },
        { onConflict: "cache_key" }
      );
    }

    return NextResponse.json(
      { results: allLaunches, cached: false },
      { headers: CACHE_HEADERS }
    );
  } catch (error) {
    console.error("Error fetching past launches:", error);
    return NextResponse.json(
      { error: "Failed to fetch launch data" },
      { status: 500 }
    );
  }
}
