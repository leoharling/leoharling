import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Supabase table required:
// CREATE TABLE launch_cache (
//   cache_key TEXT PRIMARY KEY,
//   data JSONB NOT NULL,
//   updated_at TIMESTAMPTZ DEFAULT NOW()
// );

// Use the prod endpoint for accurate/up-to-date status data.
// The daily cron only makes 2-3 requests, well within the 15 req/hr limit.
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
  // Verify cron secret (Vercel sends this automatically for cron jobs)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // 1. Sync upcoming launches
    const upcoming = await fetchFromSpaceDevs(
      `${SPACE_DEVS}/upcoming/?limit=20&mode=detailed`
    );
    await upsertCache("upcoming", upcoming.results || []);
    results.push(`upcoming: ${(upcoming.results || []).length} launches`);

    // 2. Sync current year and previous year past launches
    const year = new Date().getFullYear();
    for (const y of [year, year - 1, year - 2]) {
      // Check if already cached (previous years don't change)
      if (y < year) {
        const { data: existing } = await supabase
          .from("launch_cache")
          .select("cache_key")
          .eq("cache_key", `past_${y}`)
          .single();
        if (existing) {
          results.push(`past_${y}: already cached`);
          continue;
        }
      }
      const past = await fetchFromSpaceDevs(
        `${SPACE_DEVS}/previous/?limit=100&mode=normal&ordering=-net&net__gte=${y}-01-01T00:00:00Z&net__lte=${y}-12-31T23:59:59Z`
      );
      await upsertCache(`past_${y}`, past.results || []);
      results.push(`past_${y}: ${(past.results || []).length} launches`);
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
