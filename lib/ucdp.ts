/**
 * UCDP API client, country mappings, and significance scoring.
 *
 * API docs: https://ucdpapi.pcr.uu.se/api/
 * Auth: x-ucdp-access-token header
 * Rate limit: 5,000 requests/day
 */

const UCDP_BASE = "https://ucdpapi.pcr.uu.se/api";

// GED 25.1 = historical (up to 2024), GED Candidate 25.01.25.12 = quarterly (2025)
// GED Candidate monthly: 26.0.1 = Jan 2026, 26.0.2 = Feb 2026, 26.0.3 = Mar 2026, etc.
const GED_VERSION = "25.1";
const GED_CANDIDATE_VERSION = "25.01.25.12";
// All monthly releases to try — add new versions here as UCDP publishes them
const GED_MONTHLY_VERSIONS = ["26.0.1", "26.0.2", "26.0.3"];

/** Gleditsch-Ward country codes per conflict */
export const UCDP_CONFLICT_COUNTRIES: Record<string, {
  codes: number[];
  startDate: string;
  label: string;
}> = {
  ukraine: {
    codes: [369],
    startDate: "2022-02-24",
    label: "Russia–Ukraine War",
  },
  middleeast: {
    codes: [666, 6661, 630, 660, 652, 679],  // Israel, Palestine, Iran, Lebanon, Syria, Yemen
    startDate: "2023-10-07",
    label: "Israel–Palestine & Regional",
  },
  sudan: {
    codes: [625],
    startDate: "2023-04-15",
    label: "Sudan Civil War",
  },
  myanmar: {
    codes: [775],
    startDate: "2021-02-01",
    label: "Myanmar Civil War",
  },
  drc: {
    codes: [490],
    startDate: "2021-11-01",
    label: "DRC–M23 Conflict",
  },
};

/** Strategic keywords in source headlines that indicate non-casualty significance */
const STRATEGIC_KEYWORDS = [
  "capture", "captured", "offensive", "siege", "capital",
  "headquarters", "retreat", "surrender", "fall of", "seize",
  "seized", "overrun", "ceasefire", "peace", "negotiate",
  "withdrawal", "advance", "liberate", "liberated", "recapture",
];

/**
 * Compute a significance score for ranking events on the map.
 * Higher = more important.
 */
export function computeSignificance(event: {
  best: number;
  number_of_sources: number;
  source_headline: string | null;
  type_of_violence: number;
  deaths_civilians: number;
}): number {
  let score = 0;

  // Death toll (weighted x2)
  score += (event.best || 0) * 2;

  // Source count as proxy for media attention / strategic importance
  score += (event.number_of_sources || 0) * 5;

  // Strategic headline keywords
  if (event.source_headline) {
    const lower = event.source_headline.toLowerCase();
    const hasStrategic = STRATEGIC_KEYWORDS.some((kw) => lower.includes(kw));
    if (hasStrategic) score += 50;
  }

  // One-sided violence against civilians
  if (event.type_of_violence === 3) score += 30;

  // Civilian deaths bonus
  if (event.deaths_civilians > 0) {
    score += event.deaths_civilians * 3;
  }

  return score;
}

/** Tier classification based on significance score */
export type EventTier = "featured" | "notable" | "minor";

export function getEventTier(score: number): EventTier {
  if (score >= 100) return "featured";
  if (score >= 40) return "notable";
  return "minor";
}

/** Map UCDP type_of_violence to our map event types */
export function mapViolenceType(typeOfViolence: number): string {
  switch (typeOfViolence) {
    case 1: return "battle";    // State-based
    case 2: return "battle";    // Non-state
    case 3: return "humanitarian"; // One-sided violence
    default: return "battle";
  }
}

// ─── API Fetching ────────────────────────────────────────────────────────────

interface UCDPApiResponse {
  TotalCount: number;
  TotalPages: number;
  PreviousPageUrl: string | null;
  NextPageUrl: string | null;
  Result: UCDPRawEvent[];
}

export interface UCDPRawEvent {
  id: number;
  year: number;
  type_of_violence: number;
  conflict_name: string;
  dyad_name: string;
  side_a: string;
  side_b: string;
  latitude: number;
  longitude: number;
  date_start: string;
  date_end: string;
  best: number;
  high: number;
  low: number;
  deaths_civilians: number;
  number_of_sources: number;
  source_headline: string;
  where_description: string;
  country: string;
  country_id: number;
  region: string;
}

async function fetchUCDP(url: string): Promise<UCDPApiResponse> {
  const token = process.env.UCDP_API_KEY;
  if (!token) throw new Error("UCDP_API_KEY not set");

  const res = await fetch(url, {
    headers: { "x-ucdp-access-token": token },
  });

  if (!res.ok) {
    throw new Error(`UCDP API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch all events from a UCDP endpoint, handling pagination.
 * Uses pagesize=1000 to minimize requests.
 */
export async function fetchAllPages(
  resource: string,
  version: string,
  params: Record<string, string>,
): Promise<UCDPRawEvent[]> {
  const all: UCDPRawEvent[] = [];
  let page = 0;
  let totalPages = 1;

  const queryBase = new URLSearchParams({ pagesize: "1000", ...params });

  while (page < totalPages) {
    queryBase.set("page", String(page));
    const url = `${UCDP_BASE}/${resource}/${version}?${queryBase.toString()}`;
    const data = await fetchUCDP(url);

    all.push(...data.Result);
    totalPages = data.TotalPages;
    page++;

    // Safety: don't exceed 100 pages in a single call
    if (page >= 100) break;
  }

  return all;
}

/**
 * Fetch recent events for a conflict from GED Candidate (quarterly + monthly).
 * Used by the daily cron sync.
 */
export async function fetchRecentEvents(
  conflictId: string,
): Promise<UCDPRawEvent[]> {
  const config = UCDP_CONFLICT_COUNTRIES[conflictId];
  if (!config) return [];

  // Fetch quarterly (2025) + all monthly releases (2026) in parallel; skip missing versions gracefully
  const results = await Promise.all([
    fetchAllPages("gedevents", GED_CANDIDATE_VERSION, {
      Country: config.codes.join(","),
      StartDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    }).catch(() => [] as UCDPRawEvent[]),
    ...GED_MONTHLY_VERSIONS.map((v) =>
      fetchAllPages("gedevents", v, {
        Country: config.codes.join(","),
      }).catch(() => [] as UCDPRawEvent[]),
    ),
  ]);

  // Merge and deduplicate by event id
  const byId = new Map<number, UCDPRawEvent>();
  for (const e of results.flat()) {
    byId.set(e.id, e);
  }
  return [...byId.values()];
}

/**
 * Fetch all historical events for a conflict from GED (for backfill).
 */
export async function fetchHistoricalEvents(
  conflictId: string,
): Promise<UCDPRawEvent[]> {
  const config = UCDP_CONFLICT_COUNTRIES[conflictId];
  if (!config) return [];

  return fetchAllPages("gedevents", GED_VERSION, {
    Country: config.codes.join(","),
    StartDate: config.startDate,
  });
}

/**
 * Map a conflict_id from a UCDP country_id.
 */
export function conflictIdFromCountry(countryId: number): string | null {
  for (const [id, config] of Object.entries(UCDP_CONFLICT_COUNTRIES)) {
    if (config.codes.includes(countryId)) return id;
  }
  return null;
}
