# UCDP Data Integration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace ACLED with UCDP as the conflict event data source, storing events in Supabase and syncing via daily cron.

**Architecture:** Supabase `ucdp_events` table stores all georeferenced events. A daily cron route fetches recent GED Candidate data. A one-time backfill script loads historical data per conflict. The `/api/conflict-data` route reads from Supabase with significance-based ranking instead of calling ACLED.

**Tech Stack:** Next.js API routes, Supabase (PostgreSQL), UCDP REST API, Vercel Cron

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `supabase-schema.sql` | Modify | Add `ucdp_events` table + RLS |
| `lib/supabase.ts` | Modify | Add `UCDPEvent` interface |
| `lib/ucdp.ts` | Create | UCDP API client + significance scoring + country mapping |
| `app/api/cron/sync-ucdp/route.ts` | Create | Daily cron to fetch recent UCDP events and upsert |
| `scripts/backfill-ucdp.ts` | Create | One-time historical backfill |
| `lib/conflict-apis.ts` | Modify | Remove ACLED code, keep UNHCR + DeepState |
| `app/api/conflict-data/route.ts` | Modify | Replace ACLED with Supabase UCDP query |
| `components/tools/ConflictMap.tsx` | Modify | Tiered event display (featured/notable/minor) |
| `app/tools/conflict-monitor/ConflictMonitor.tsx` | Modify | Update ACLED references in UI text |
| `vercel.json` | Modify | Add sync-ucdp cron schedule |

---

## Task 1: Supabase Table + Types

**Files:**
- Modify: `supabase-schema.sql`
- Modify: `lib/supabase.ts`

- [ ] **Step 1: Add ucdp_events table to schema**

Add to `supabase-schema.sql`:

```sql
-- UCDP Georeferenced Events (cached from UCDP API)
CREATE TABLE ucdp_events (
  id INTEGER PRIMARY KEY,
  conflict_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  type_of_violence INTEGER NOT NULL,
  conflict_name TEXT,
  dyad_name TEXT,
  side_a TEXT,
  side_b TEXT,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  date_start DATE,
  date_end DATE,
  best INTEGER DEFAULT 0,
  high INTEGER DEFAULT 0,
  low INTEGER DEFAULT 0,
  deaths_civilians INTEGER DEFAULT 0,
  number_of_sources INTEGER DEFAULT 0,
  source_headline TEXT,
  where_description TEXT,
  country TEXT,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ucdp_events_conflict ON ucdp_events(conflict_id);
CREATE INDEX idx_ucdp_events_date ON ucdp_events(date_end);
CREATE INDEX idx_ucdp_events_best ON ucdp_events(best DESC);

ALTER TABLE ucdp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON ucdp_events FOR SELECT USING (true);
```

- [ ] **Step 2: Run schema in Supabase**

Execute the SQL above in the Supabase SQL editor (dashboard) to create the table.

- [ ] **Step 3: Add UCDPEvent type to lib/supabase.ts**

Add after the `ConflictTerritory` interface:

```typescript
export interface UCDPEvent {
  id: number;
  conflict_id: string;
  year: number;
  type_of_violence: number;
  conflict_name: string | null;
  dyad_name: string | null;
  side_a: string | null;
  side_b: string | null;
  latitude: number;
  longitude: number;
  date_start: string | null;
  date_end: string | null;
  best: number;
  high: number;
  low: number;
  deaths_civilians: number;
  number_of_sources: number;
  source_headline: string | null;
  where_description: string | null;
  country: string | null;
  region: string | null;
  created_at: string;
}
```

- [ ] **Step 4: Commit**

```bash
git add supabase-schema.sql lib/supabase.ts
git commit -m "feat: add ucdp_events table schema and UCDPEvent type"
```

---

## Task 2: UCDP Client Library

**Files:**
- Create: `lib/ucdp.ts`

- [ ] **Step 1: Create lib/ucdp.ts with API client, mappings, and scoring**

```typescript
/**
 * UCDP API client, country mappings, and significance scoring.
 *
 * API docs: https://ucdpapi.pcr.uu.se/api/
 * Auth: x-ucdp-access-token header
 * Rate limit: 5,000 requests/day
 */

const UCDP_BASE = "https://ucdpapi.pcr.uu.se/api";

// GED 25.1 = historical (up to 2024), GED Candidate 26.1 = recent (2025+)
const GED_VERSION = "25.1";
const GED_CANDIDATE_VERSION = "26.1";

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
    codes: [666, 6661],
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
 * Fetch recent events for a conflict from GED Candidate.
 * Used by the daily cron sync.
 */
export async function fetchRecentEvents(
  conflictId: string,
  daysBack = 90,
): Promise<UCDPRawEvent[]> {
  const config = UCDP_CONFLICT_COUNTRIES[conflictId];
  if (!config) return [];

  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return fetchAllPages("gedevents", GED_CANDIDATE_VERSION, {
    Country: config.codes.join(","),
    StartDate: since,
  });
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/ucdp.ts
git commit -m "feat: add UCDP API client library with significance scoring"
```

---

## Task 3: Daily Cron Sync Route

**Files:**
- Create: `app/api/cron/sync-ucdp/route.ts`
- Modify: `vercel.json`

- [ ] **Step 1: Create the cron route**

Create `app/api/cron/sync-ucdp/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  UCDP_CONFLICT_COUNTRIES,
  fetchRecentEvents,
  conflictIdFromCountry,
} from "@/lib/ucdp";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  for (const conflictId of Object.keys(UCDP_CONFLICT_COUNTRIES)) {
    try {
      const events = await fetchRecentEvents(conflictId);

      if (events.length === 0) {
        results.push(`${conflictId}: no new events`);
        continue;
      }

      // Map to DB rows
      const rows = events.map((e) => ({
        id: e.id,
        conflict_id: conflictIdFromCountry(e.country_id) || conflictId,
        year: e.year,
        type_of_violence: e.type_of_violence,
        conflict_name: e.conflict_name,
        dyad_name: e.dyad_name,
        side_a: e.side_a,
        side_b: e.side_b,
        latitude: e.latitude,
        longitude: e.longitude,
        date_start: e.date_start,
        date_end: e.date_end,
        best: e.best,
        high: e.high,
        low: e.low,
        deaths_civilians: e.deaths_civilians,
        number_of_sources: e.number_of_sources,
        source_headline: e.source_headline,
        where_description: e.where_description,
        country: e.country,
        region: e.region,
      }));

      // Upsert in batches of 500
      for (let i = 0; i < rows.length; i += 500) {
        const batch = rows.slice(i, i + 500);
        const { error } = await supabase
          .from("ucdp_events")
          .upsert(batch, { onConflict: "id" });
        if (error) throw new Error(`Supabase upsert: ${error.message}`);
      }

      results.push(`${conflictId}: synced ${rows.length} events`);
    } catch (error) {
      results.push(`${conflictId}: error — ${String(error)}`);
    }
  }

  return NextResponse.json({ ok: true, synced: results });
}
```

- [ ] **Step 2: Verify UCDP_API_KEY is set in env**

Confirm `UCDP_API_KEY` exists in `.env.local` (it should already be `0eeebd71c2e81dd8`). Also ensure it's added to Vercel environment variables for the production deployment (Settings > Environment Variables).

- [ ] **Step 3: Add cron to vercel.json**

Add the sync-ucdp cron entry (runs daily at 07:00 UTC, after launches at 06:00):

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-launches",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/sync-ucdp",
      "schedule": "0 7 * * *"
    }
  ]
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/cron/sync-ucdp/route.ts vercel.json
git commit -m "feat: add daily UCDP cron sync route"
```

---

## Task 4: Backfill Script

**Files:**
- Create: `scripts/backfill-ucdp.ts`

- [ ] **Step 1: Create the backfill script**

Create `scripts/backfill-ucdp.ts`:

```typescript
/**
 * One-time script to backfill historical UCDP GED events into Supabase.
 *
 * Usage: npx tsx scripts/backfill-ucdp.ts
 *
 * Requires env vars: UCDP_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from "@supabase/supabase-js";

const UCDP_BASE = "https://ucdpapi.pcr.uu.se/api";
const GED_VERSION = "25.1";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// NOTE: Duplicated from lib/ucdp.ts — script runs standalone outside Next.js
const CONFLICTS: Record<string, { codes: number[]; startDate: string }> = {
  ukraine: { codes: [369], startDate: "2022-02-24" },
  middleeast: { codes: [666], startDate: "2023-10-07" },
  sudan: { codes: [625], startDate: "2023-04-15" },
  myanmar: { codes: [775], startDate: "2021-02-01" },
  drc: { codes: [490], startDate: "2021-11-01" },
};

async function fetchPage(url: string) {
  const token = process.env.UCDP_API_KEY;
  if (!token) throw new Error("UCDP_API_KEY not set");
  const res = await fetch(url, {
    headers: { "x-ucdp-access-token": token },
  });
  if (!res.ok) throw new Error(`UCDP API: ${res.status}`);
  return res.json();
}

function mapConflictId(countryId: number, fallback: string): string {
  for (const [id, cfg] of Object.entries(CONFLICTS)) {
    if (cfg.codes.includes(countryId)) return id;
  }
  return fallback;
}

async function backfillConflict(conflictId: string) {
  const config = CONFLICTS[conflictId];
  if (!config) return;

  console.log(`\n--- Backfilling ${conflictId} (since ${config.startDate}) ---`);

  const params = new URLSearchParams({
    pagesize: "1000",
    Country: config.codes.join(","),
    StartDate: config.startDate,
  });

  let page = 0;
  let totalPages = 1;
  let totalInserted = 0;

  while (page < totalPages) {
    params.set("page", String(page));
    const url = `${UCDP_BASE}/gedevents/${GED_VERSION}?${params.toString()}`;

    console.log(`  Page ${page + 1}/${totalPages}...`);
    const data = await fetchPage(url);
    totalPages = data.TotalPages;

    const rows = data.Result.map((e: Record<string, unknown>) => ({
      id: e.id,
      conflict_id: mapConflictId(e.country_id as number, conflictId),
      year: e.year,
      type_of_violence: e.type_of_violence,
      conflict_name: e.conflict_name,
      dyad_name: e.dyad_name,
      side_a: e.side_a,
      side_b: e.side_b,
      latitude: e.latitude,
      longitude: e.longitude,
      date_start: e.date_start,
      date_end: e.date_end,
      best: e.best,
      high: e.high,
      low: e.low,
      deaths_civilians: e.deaths_civilians,
      number_of_sources: e.number_of_sources,
      source_headline: e.source_headline,
      where_description: e.where_description,
      country: e.country,
      region: e.region,
    }));

    // Upsert in batches of 500
    for (let i = 0; i < rows.length; i += 500) {
      const batch = rows.slice(i, i + 500);
      const { error } = await supabase
        .from("ucdp_events")
        .upsert(batch, { onConflict: "id" });
      if (error) {
        console.error(`  Error upserting batch: ${error.message}`);
      }
    }

    totalInserted += rows.length;
    page++;

    // Small delay to be kind to the API
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`  Done: ${totalInserted} events inserted for ${conflictId}`);
}

async function main() {
  console.log("UCDP Historical Backfill");
  console.log("========================");

  for (const conflictId of Object.keys(CONFLICTS)) {
    await backfillConflict(conflictId);
  }

  console.log("\nBackfill complete!");
}

main().catch(console.error);
```

- [ ] **Step 2: Commit**

```bash
git add scripts/backfill-ucdp.ts
git commit -m "feat: add UCDP historical backfill script"
```

---

## Task 5: Replace ACLED with Supabase UCDP in API Route

**Files:**
- Modify: `lib/conflict-apis.ts` (remove ACLED, keep UNHCR + DeepState)
- Modify: `app/api/conflict-data/route.ts` (query Supabase instead of ACLED)

- [ ] **Step 1: Remove ACLED code from lib/conflict-apis.ts**

Remove everything from line 1 through the `fetchACLEDEvents` function (lines 1–114). Keep the UNHCR and DeepState sections. Update the file header comment:

```typescript
/**
 * Server-side utilities for fetching live conflict data from external APIs.
 *
 * Working sources:
 *  - UNHCR: Refugee and displacement statistics — no auth
 *  - DeepStateMap: Ukraine occupied territory GeoJSON — no auth, daily updates
 *
 * UCDP events are served from Supabase (synced via /api/cron/sync-ucdp).
 */
```

The file should only contain the UNHCR and DeepState exports after this change.

- [ ] **Step 2: Rewrite app/api/conflict-data/route.ts**

Replace the full file:

```typescript
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

export async function GET(req: NextRequest) {
  const conflictId = req.nextUrl.searchParams.get("id");
  if (!conflictId) {
    return NextResponse.json({ error: "Missing ?id= parameter" }, { status: 400 });
  }

  // Fetch UCDP events from Supabase + other sources in parallel
  const [ucdpResult, unhcrStats, deepStateGeoJSON] = await Promise.all([
    supabase
      .from("ucdp_events")
      .select("*")
      .eq("conflict_id", conflictId)
      .order("date_end", { ascending: false })
      .limit(500),
    fetchUNHCRStats(conflictId),
    conflictId === "ukraine" ? fetchOrCacheDeepState() : Promise.resolve(null),
  ]);

  const events = ucdpResult.data || [];

  // Score and rank events, take top 30
  const scored = events
    .map((e) => ({
      ...e,
      significance: computeSignificance(e),
    }))
    .sort((a, b) => b.significance - a.significance)
    .slice(0, 30);

  // Map to LiveEvent format for the frontend
  const liveEvents = scored.map((e) => {
    const tier = getEventTier(e.significance);
    return {
      lat: e.latitude,
      lng: e.longitude,
      title: e.where_description || e.country || "Unknown",
      description: `${e.side_a || ""}${e.side_b ? ` vs ${e.side_b}` : ""}${e.best > 0 ? ` — ${e.best} fatalities` : ""}`,
      type: mapViolenceType(e.type_of_violence),
      date: formatDate(e.date_end),
      fatalities: e.best,
      source: "UCDP",
      tier,
      significance: e.significance,
      dyad_name: e.dyad_name,
      deaths_civilians: e.deaths_civilians,
    };
  });

  const data = {
    conflictId,
    liveEvents,
    unhcr: unhcrStats,
    deepStateGeoJSON,
    fetchedAt: new Date().toISOString(),
    eventCount: liveEvents.length,
  };

  return NextResponse.json(data, { headers: CACHE_HEADERS });
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/conflict-apis.ts app/api/conflict-data/route.ts
git commit -m "feat: replace ACLED with Supabase UCDP events in conflict-data API"
```

---

## Task 6: Tiered Map Display

**Files:**
- Modify: `components/tools/ConflictMap.tsx` (lines 279–288 LiveEvent interface, lines 551–565 live events rendering)
- Modify: `app/tools/conflict-monitor/ConflictMonitor.tsx` (lines 473–513 ACLED label text)

- [ ] **Step 1: Update LiveEvent interface in ConflictMap.tsx**

At `components/tools/ConflictMap.tsx:279`, update the `LiveEvent` interface:

```typescript
export interface LiveEvent {
  lat: number;
  lng: number;
  title: string;
  description: string;
  type: string;
  date?: string;
  fatalities?: number;
  source?: string;
  tier?: "featured" | "notable" | "minor";
  significance?: number;
  dyad_name?: string;
  deaths_civilians?: number;
}
```

- [ ] **Step 2: Add zoom state tracking to ConflictMap**

Add a `zoom` state and `onZoom` handler near the top of the `ConflictMap` component (after existing `useState` calls around line 320):

```typescript
  const [currentZoom, setCurrentZoom] = useState(conflict.zoom);
```

Add `onZoom` to the `<Map>` component props:

```tsx
  onZoom={(e) => setCurrentZoom(e.viewState.zoom)}
```

- [ ] **Step 3: Update live event rendering in ConflictMap.tsx**

Replace the "5b. Live ACLED event markers" block (lines 551–565) with tiered rendering with zoom-level filtering:

```tsx
        {/* ── 5b. UCDP event markers (tiered by significance, zoom-filtered) ── */}
        {layerVisibility.events && filteredLiveEvents.map((ev, i) => {
          const tier = ev.tier || "minor";
          // Zoom-level visibility: featured always, notable >= 5, minor >= 7
          if (tier === "minor" && currentZoom < 7) return null;
          if (tier === "notable" && currentZoom < 5) return null;
          const size = tier === "featured" ? 10 : tier === "notable" ? 7 : 4;
          return (
            <MapDot
              key={`${conflict.id}-live-${i}`}
              lat={ev.lat}
              lng={ev.lng}
              color={EVENT_COLORS[ev.type] || "#ef4444"}
              size={size}
              title={ev.title}
              description={ev.description}
              type={ev.type}
              date={ev.date}
              pulse={tier === "featured" || tier === "notable"}
            />
          );
        })}
```

- [ ] **Step 4: Update ACLED references in ConflictMonitor.tsx**

At `app/tools/conflict-monitor/ConflictMonitor.tsx:479`, change the label from:

```
Live Events (last 30 days via ACLED)
```

to:

```
Recent Events (UCDP)
```

At line 481, change:
```
{liveEvents.length} events
```
to:
```
{liveEvents.length} significant events
```

At line 603-604 in the disclaimer, replace:
```
Displacement data from UNHCR (updated annually). Ukraine front lines from DeepStateMap (updated daily).
News via BBC, Al Jazeera, NY Times, The Guardian.
```
with:
```
Conflict events from UCDP (Uppsala Conflict Data Program). Displacement data from UNHCR (updated annually). Ukraine front lines from DeepStateMap (updated daily).
News via BBC, Al Jazeera, NY Times, The Guardian.
```

- [ ] **Step 5: Commit**

```bash
git add components/tools/ConflictMap.tsx app/tools/conflict-monitor/ConflictMonitor.tsx
git commit -m "feat: tiered UCDP event display on conflict map"
```

---

## Task 7: Run Backfill + Verify

- [ ] **Step 1: Create the ucdp_events table in Supabase**

Run the SQL from Task 1 in the Supabase dashboard SQL editor.

- [ ] **Step 2: Run the backfill script**

```bash
npx tsx scripts/backfill-ucdp.ts
```

Expected: Events inserted for all 5 conflicts. Check terminal output for counts.

- [ ] **Step 3: Verify data in Supabase**

Check the Supabase dashboard table viewer or run:
```sql
SELECT conflict_id, COUNT(*), MAX(date_end) FROM ucdp_events GROUP BY conflict_id;
```

- [ ] **Step 4: Test locally**

```bash
npm run dev
```

Navigate to the conflict monitor, select each conflict, verify:
- Events appear on the map with tiered sizing
- Featured events (large pulsing dots) are visible
- Notable events are medium-sized
- Situations tab shows "Recent Events (UCDP)" section
- UNHCR and DeepState data still works

- [ ] **Step 5: Final commit with any fixes**

```bash
git add -A
git commit -m "feat: UCDP integration complete — replaces ACLED with UCDP data"
```
