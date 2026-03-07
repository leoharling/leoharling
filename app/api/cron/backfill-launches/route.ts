import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const SPACE_DEVS = "https://ll.thespacedevs.com/2.3.0/launches";
const START_YEAR = 2006;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchYear(year: number) {
  const res = await fetch(
    `${SPACE_DEVS}/previous/?limit=100&mode=normal&ordering=-net&net__gte=${year}-01-01T00:00:00Z&net__lte=${year}-12-31T23:59:59Z`,
    { headers: { "User-Agent": "OrbitIntel/1.0 (leoharling.com)" } }
  );
  if (res.status === 429) return { rateLimited: true, launches: [] };
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return { rateLimited: false, launches: data.results || [] };
}

// One-time backfill endpoint. Fetches past launches year-by-year from prod API.
// Re-run if rate limited — it skips years already cached with data.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const endYear = new Date().getFullYear() - 1;
  const results: string[] = [];
  let fetched = 0;

  for (let year = endYear; year >= START_YEAR; year--) {
    const cacheKey = `past_${year}`;

    // Skip if already cached with data
    const { data: existing } = await supabase
      .from("launch_cache")
      .select("data")
      .eq("cache_key", cacheKey)
      .single();

    const rows = existing?.data as unknown[] | null;
    if (rows && rows.length > 0) {
      results.push(`${year}: cached (${rows.length})`);
      continue;
    }

    // Delete empty cache entry if present
    if (existing) {
      await supabase.from("launch_cache").delete().eq("cache_key", cacheKey);
    }

    // Fetch from prod
    const { rateLimited, launches } = await fetchYear(year);
    if (rateLimited) {
      results.push(`${year}: RATE LIMITED — re-run to continue`);
      return NextResponse.json({ ok: false, synced: results, resumeAt: year });
    }

    await supabase.from("launch_cache").upsert(
      { cache_key: cacheKey, data: launches, updated_at: new Date().toISOString() },
      { onConflict: "cache_key" }
    );
    results.push(`${year}: ${launches.length} launches`);
    fetched++;

    // Small delay between requests
    if (year > START_YEAR) await sleep(2000);
  }

  return NextResponse.json({ ok: true, synced: results, totalFetched: fetched });
}
