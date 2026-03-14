import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const SPACE_DEVS = "https://ll.thespacedevs.com/2.3.0/launches";

async function fetchFromSpaceDevs(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "OrbitIntel/1.0 (leoharling.com)" },
  });
  if (!res.ok) throw new Error(`Space Devs API: ${res.status}`);
  return res.json();
}

async function upsertCache(key: string, data: unknown) {
  const { error } = await supabase.from("launch_cache").upsert(
    { cache_key: key, data, updated_at: new Date().toISOString() },
    { onConflict: "cache_key" }
  );
  if (error) throw new Error(`Supabase upsert ${key}: ${error.message}`);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // 1. Fetch upcoming launches from API
    const upcoming = await fetchFromSpaceDevs(
      `${SPACE_DEVS}/upcoming/?limit=50&mode=detailed`
    );
    const upcomingLaunches = (upcoming.results || []) as Record<string, unknown>[];
    await upsertCache("upcoming", upcomingLaunches);
    results.push(`upcoming: ${upcomingLaunches.length} launches`);

    // 2. Move any completed launches into the past year cache.
    //    "previous" launches from the API that launched this year get merged
    //    into past_YYYY so historical data stays current without re-fetching
    //    entire years.
    const now = new Date();
    const currentYear = now.getFullYear();
    const cacheKey = `past_${currentYear}`;

    // Fetch recently completed launches (last 10)
    const recent = await fetchFromSpaceDevs(
      `${SPACE_DEVS}/previous/?limit=10&mode=normal&ordering=-net&net__gte=${currentYear}-01-01T00:00:00Z`
    );
    const recentLaunches = (recent.results || []) as Record<string, unknown>[];

    if (recentLaunches.length > 0) {
      // Load existing cache for current year
      const { data: existing } = await supabase
        .from("launch_cache")
        .select("data")
        .eq("cache_key", cacheKey)
        .single();

      const cached = (existing?.data || []) as Record<string, unknown>[];

      // Merge: add new launches not already in cache (by id)
      const cachedIds = new Set(cached.map((l) => l.id));
      const newLaunches = recentLaunches.filter((l) => !cachedIds.has(l.id));

      if (newLaunches.length > 0) {
        const merged = [...cached, ...newLaunches].sort((a, b) => {
          const aNet = String(a.net || "");
          const bNet = String(b.net || "");
          return bNet.localeCompare(aNet); // newest first
        });
        await upsertCache(cacheKey, merged);
        results.push(`past_${currentYear}: added ${newLaunches.length} new (total ${merged.length})`);
      } else {
        results.push(`past_${currentYear}: up to date (${cached.length})`);
      }
    }

    return NextResponse.json({ ok: true, synced: results });
  } catch (error) {
    console.error("Cron sync-launches error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
