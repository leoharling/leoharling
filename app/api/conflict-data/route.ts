import { NextRequest, NextResponse } from "next/server";
import {
  fetchACLEDEvents,
  fetchUNHCRStats,
  fetchDeepStateGeoJSON,
} from "@/lib/conflict-apis";

// Cache per conflict, 30 minutes
const cache: Record<string, { data: unknown; timestamp: number }> = {};
const CACHE_DURATION = 30 * 60 * 1000;

// DeepState GeoJSON cached separately (6 hours)
let deepStateCache: { data: unknown; timestamp: number } | null = null;
const DEEPSTATE_CACHE_DURATION = 6 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const conflictId = req.nextUrl.searchParams.get("id");
  if (!conflictId) {
    return NextResponse.json({ error: "Missing ?id= parameter" }, { status: 400 });
  }

  // Check cache
  const cached = cache[conflictId];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  // Fetch all sources in parallel
  const promises: [Promise<unknown[]>, Promise<unknown>, Promise<unknown>] = [
    fetchACLEDEvents(conflictId),
    fetchUNHCRStats(conflictId),
    // DeepState only for Ukraine
    conflictId === "ukraine" ? fetchOrCacheDeepState() : Promise.resolve(null),
  ];

  const [acledEvents, unhcrStats, deepStateGeoJSON] = await Promise.all(promises);

  // Map ACLED event types to our map event types
  const liveEvents = (acledEvents as Array<{
    latitude: number; longitude: number; location: string; admin1: string;
    event_type: string; sub_event_type: string; actor1: string; actor2: string;
    fatalities: number; event_date: string;
  }>).map((e) => ({
    lat: e.latitude,
    lng: e.longitude,
    title: e.location || e.admin1,
    description: `${e.event_type}: ${e.actor1}${e.actor2 ? ` vs ${e.actor2}` : ""}${e.fatalities > 0 ? ` — ${e.fatalities} fatalities` : ""}`,
    type: mapACLEDEventType(e.event_type, e.sub_event_type),
    date: formatDate(e.event_date),
    fatalities: e.fatalities,
    source: "ACLED",
  }));

  const data = {
    conflictId,
    liveEvents,
    unhcr: unhcrStats,
    deepStateGeoJSON,
    fetchedAt: new Date().toISOString(),
    eventCount: liveEvents.length,
  };

  cache[conflictId] = { data, timestamp: Date.now() };
  return NextResponse.json(data, {
    headers: {
      // CDN caches for 30 min, serves stale for 1 hour while revalidating
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}

async function fetchOrCacheDeepState() {
  if (deepStateCache && Date.now() - deepStateCache.timestamp < DEEPSTATE_CACHE_DURATION) {
    return deepStateCache.data;
  }
  const data = await fetchDeepStateGeoJSON();
  if (data) {
    deepStateCache = { data, timestamp: Date.now() };
  }
  return data;
}

function mapACLEDEventType(eventType: string, subType: string): string {
  const et = eventType.toLowerCase();
  const st = subType.toLowerCase();
  if (et.includes("battle")) return "battle";
  if (et.includes("explosion") || et.includes("remote violence") || st.includes("air") || st.includes("drone") || st.includes("shell") || st.includes("missile")) return "strike";
  if (et.includes("violence against civilians") || st.includes("abduction") || st.includes("sexual")) return "humanitarian";
  if (et.includes("protest") || et.includes("riot")) return "political";
  if (et.includes("strategic")) return "political";
  return "battle";
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}
