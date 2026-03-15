import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchUNHCRStats, fetchDeepStateGeoJSON } from "@/lib/conflict-apis";
import { computeSignificance, getEventTier, mapViolenceType } from "@/lib/ucdp";

// DeepState GeoJSON cached separately (6 hours)
let deepStateCache: { data: unknown; timestamp: number } | null = null;
const DEEPSTATE_CACHE_DURATION = 6 * 60 * 60 * 1000;

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DBEvent = Record<string, any>;

export async function GET(req: NextRequest) {
  const conflictId = req.nextUrl.searchParams.get("id");
  if (!conflictId) {
    return NextResponse.json({ error: "Missing ?id= parameter" }, { status: 400 });
  }

  // Fetch UCDP events from Supabase + other sources in parallel
  // Two queries: top events by fatalities (historical) + recent events (last 6 months)
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [topResult, recentResult, unhcrStats, deepStateGeoJSON] = await Promise.all([
    supabase
      .from("ucdp_events")
      .select("*")
      .eq("conflict_id", conflictId)
      .not("where_description", "is", null)
      .neq("where_description", "")
      .gt("best", 0)
      .order("best", { ascending: false })
      .limit(2000),
    supabase
      .from("ucdp_events")
      .select("*")
      .eq("conflict_id", conflictId)
      .not("where_description", "is", null)
      .neq("where_description", "")
      .gte("date_end", sixMonthsAgo)
      .order("best", { ascending: false })
      .limit(1000),
    fetchUNHCRStats(conflictId),
    conflictId === "ukraine" ? fetchOrCacheDeepState() : Promise.resolve(null),
  ]);

  // Merge and deduplicate
  const byId = new Map<number, DBEvent>();
  for (const e of [...(topResult.data || []), ...(recentResult.data || [])]) {
    byId.set(e.id, e);
  }
  const events = [...byId.values()];

  // Cluster events by region + month to create meaningful summaries
  const clusters = clusterEvents(events);

  // Score clusters, then pick top events per year for full timeline coverage
  const scored = clusters
    .map((c) => ({ ...c, significance: c.totalKilled * 2 + c.eventCount * 3 + (c.hasCivilians ? 30 : 0) }));

  // Group by year, take top 5 per year by significance
  const byYear = new Map<number, typeof scored>();
  for (const c of scored) {
    const year = new Date(c.dateISO).getFullYear();
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(c);
  }

  const ranked: typeof scored = [];
  for (const [, yearClusters] of byYear) {
    yearClusters.sort((a, b) => b.significance - a.significance);
    ranked.push(...yearClusters.slice(0, 5));
  }

  // Sort final list by date (newest first)
  ranked.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());

  const liveEvents = ranked.map((c) => {
    // All clusters are already significant summaries — use featured/notable only
    const tier = c.significance >= 60 ? "featured" as const : "notable" as const;
    return {
      lat: c.lat,
      lng: c.lng,
      title: c.title,
      description: c.description,
      type: c.type,
      date: formatDate(c.dateISO),
      dateISO: c.dateISO,
      fatalities: c.totalKilled,
      source: "UCDP",
      tier,
      significance: c.significance,
      dyad_name: null,
      deaths_civilians: c.civilianDeaths,
    };
  });

  return NextResponse.json({
    conflictId,
    liveEvents,
    unhcr: unhcrStats,
    deepStateGeoJSON,
    fetchedAt: new Date().toISOString(),
    eventCount: liveEvents.length,
  }, { headers: CACHE_HEADERS });
}

// ─── Event Clustering ────────────────────────────────────────────────────────

interface EventCluster {
  title: string;
  description: string;
  type: string;
  lat: number;
  lng: number;
  dateISO: string;
  totalKilled: number;
  civilianDeaths: number;
  eventCount: number;
  hasCivilians: boolean;
  headline: string | null;
}

/**
 * Cluster events by geographic area + month.
 * Groups nearby events (within ~0.5 degrees ≈ 50km) in the same month,
 * then creates a single summary for each cluster.
 */
function clusterEvents(events: DBEvent[]): EventCluster[] {
  // Group by: rounded lat/lng (0.5 degree grid) + year-month
  const groups = new Map<string, DBEvent[]>();

  for (const e of events) {
    const gridLat = Math.round(e.latitude * 2) / 2;
    const gridLng = Math.round(e.longitude * 2) / 2;
    const month = (e.date_end || "").slice(0, 7); // "YYYY-MM"
    const key = `${gridLat},${gridLng},${month}`;

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }

  const clusters: EventCluster[] = [];

  for (const [, group] of groups) {
    const totalKilled = group.reduce((sum, e) => sum + (e.best || 0), 0);
    const civilianDeaths = group.reduce((sum, e) => sum + (e.deaths_civilians || 0), 0);

    // Use the highest-fatality event as the representative
    const rep = group.reduce((best, e) => (e.best || 0) > (best.best || 0) ? e : best, group[0]);

    // Pick the best location name
    const locationName = pickBestLocation(group);

    // Pick the best headline
    const headline = pickBestHeadline(group);

    // Build title: location-based like the editorial events
    const title = locationName;

    // Build description using headline if available, otherwise summarize
    const description = buildDescription(group, headline, totalKilled, civilianDeaths);

    // Determine event type from mix
    const type = determineType(group);

    // Use latest date in the cluster
    const latestDate = group.reduce((latest, e) => {
      return (e.date_end || "") > (latest || "") ? e.date_end : latest;
    }, group[0].date_end);

    clusters.push({
      title,
      description,
      type,
      lat: rep.latitude,
      lng: rep.longitude,
      dateISO: latestDate,
      totalKilled,
      civilianDeaths,
      eventCount: group.length,
      hasCivilians: civilianDeaths > 0,
      headline,
    });
  }

  return clusters;
}

/** Pick the most descriptive location name from a cluster of events */
function pickBestLocation(events: DBEvent[]): string {
  // Prefer specific named locations over generic ones
  const locations = events
    .map((e) => e.where_description || "")
    .filter((l) => l.length > 0);

  if (locations.length === 0) return events[0].country || "Unknown";

  // Find the shortest non-generic location (usually the most specific name)
  // But skip very short ones that are just prepositions
  const candidates = locations
    .filter((l) => l.length > 3 && l.toLowerCase() !== (events[0].country || "").toLowerCase())
    .sort((a, b) => a.length - b.length);

  if (candidates.length > 0) {
    // Clean up common prefixes
    let best = candidates[0];
    best = best.replace(/^(in |near |around |area of |area around )/i, "");
    // Capitalize first letter
    best = best.charAt(0).toUpperCase() + best.slice(1);
    // Truncate if too long
    if (best.length > 60) best = best.slice(0, 57) + "...";
    return best;
  }

  return events[0].country || "Unknown";
}

/** Pick the most informative source headline from a cluster */
function pickBestHeadline(events: DBEvent[]): string | null {
  const headlines = events
    .map((e) => e.source_headline || "")
    .filter((h) => h.length > 10)
    // Split combined headlines (separated by ";") and flatten
    .flatMap((h) => h.split(";").map((s: string) => s.trim()))
    .filter((h) => h.length > 10 && h.length < 200);

  if (headlines.length === 0) return null;

  // Prefer headlines that read like news (have verbs, details)
  // Sort by length (medium-length ones tend to be most informative)
  headlines.sort((a, b) => {
    const aScore = Math.abs(a.length - 80); // Ideal ~80 chars
    const bScore = Math.abs(b.length - 80);
    return aScore - bScore;
  });

  return headlines[0];
}

/** Build a description combining headline + stats */
function buildDescription(
  events: DBEvent[],
  headline: string | null,
  totalKilled: number,
  civilianDeaths: number,
): string {
  const parts: string[] = [];

  // Use headline as primary description if available
  if (headline) {
    parts.push(headline);
  } else {
    // Fallback: summarize the dyad
    const dyads = new Set(events.map((e) => e.dyad_name).filter(Boolean));
    if (dyads.size > 0) {
      parts.push([...dyads][0]);
    }
  }

  // Add stats
  const stats: string[] = [];
  if (totalKilled > 0) stats.push(`${totalKilled} killed`);
  if (civilianDeaths > 0) stats.push(`${civilianDeaths} civilians`);
  if (events.length > 1) stats.push(`${events.length} incidents`);

  if (stats.length > 0) {
    parts.push(stats.join(", "));
  }

  return parts.join(" — ");
}

/** Determine the predominant event type for a cluster */
function determineType(events: DBEvent[]): string {
  const types = events.map((e) => e.type_of_violence);
  const hasOneSided = types.includes(3);
  const hasNonState = types.includes(2);

  // If any one-sided violence (against civilians), mark as humanitarian
  if (hasOneSided) return "humanitarian";
  if (hasNonState) return "battle";

  // Check source headlines for strike indicators
  const allHeadlines = events.map((e) => (e.source_headline || "").toLowerCase()).join(" ");
  if (allHeadlines.includes("missile") || allHeadlines.includes("drone") ||
      allHeadlines.includes("airstrike") || allHeadlines.includes("bombard") ||
      allHeadlines.includes("shell")) {
    return "strike";
  }

  return mapViolenceType(types[0] || 1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}
