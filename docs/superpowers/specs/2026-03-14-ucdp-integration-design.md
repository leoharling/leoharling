# UCDP Data Integration for Conflict Map

**Date:** 2026-03-14
**Status:** Approved

## Goal

Replace ACLED with UCDP (Uppsala Conflict Data Program) as the sole georeferenced conflict event data source. Store historical + recent events in Supabase, sync new data via cron (matching the launch sync pattern). Display events on the conflict map with significance-based prioritization to avoid clutter.

## Data Source

- **UCDP GED 25.1** — Historical georeferenced events (1989–2024), 385K+ events
- **UCDP GED Candidate 26.1** — Monthly near-real-time events (2025+)
- **Auth:** Token-based header `x-ucdp-access-token`
- **Rate limit:** 5,000 requests/day
- **API base:** `https://ucdpapi.pcr.uu.se/api/`

## Architecture

### 1. Supabase Table: `ucdp_events`

| Column | Type | Source Field |
|---|---|---|
| id | integer PK | id |
| conflict_id | text | mapped from country_id |
| year | integer | year |
| type_of_violence | integer | type_of_violence (1=state, 2=non-state, 3=one-sided) |
| conflict_name | text | conflict_name |
| dyad_name | text | dyad_name |
| side_a | text | side_a |
| side_b | text | side_b |
| latitude | float8 | latitude |
| longitude | float8 | longitude |
| date_start | date | date_start |
| date_end | date | date_end |
| best | integer | best (best estimate deaths) |
| high | integer | high |
| low | integer | low |
| deaths_civilians | integer | deaths_civilians |
| number_of_sources | integer | number_of_sources |
| source_headline | text | source_headline |
| where_description | text | where_description |
| country | text | country |
| region | text | region |
| created_at | timestamptz | default now() |

Public read policy. RLS enabled.

### 2. Conflict-to-Country Mapping (Gleditsch-Ward Codes)

| Conflict ID | GW Codes | Start Date | Datasets |
|---|---|---|---|
| ukraine | 369 | 2022-02-24 | GED 25.1 + Candidate 26.1 |
| middleeast | 666, 6661 | 2023-10-07 | GED 25.1 + Candidate 26.1 |
| sudan | 625 | 2023-04-15 | GED 25.1 + Candidate 26.1 |
| myanmar | 775 | 2021-02-01 | GED 25.1 + Candidate 26.1 |
| drc | 490 | 2021-11-01 | GED 25.1 + Candidate 26.1 |

### 3. Cron Route: `/api/cron/sync-ucdp`

Runs daily (Vercel cron). For each conflict:
1. Fetch GED Candidate 26.1 events filtered by country + last 90 days
2. Upsert into `ucdp_events` (dedup by UCDP `id`)
3. Auth via `UCDP_API_KEY` env var, sent as `x-ucdp-access-token` header

Pattern matches existing `sync-launches` cron: auth check via `CRON_SECRET`, paginated fetch, upsert to Supabase.

### 4. Backfill Script: `scripts/backfill-ucdp.ts`

One-time script to populate historical data:
- For each conflict, page through GED 25.1 filtered by Country + StartDate
- Insert all events into `ucdp_events`
- Pagesize of 1000 to minimize requests
- Rate-limited to stay under 5,000/day

### 5. API Route: `/api/conflict-data` (Modified)

Replace ACLED fetch with Supabase query:
- Query `ucdp_events` for conflict_id, compute significance score server-side
- Return top ~30 events ranked by significance
- Keep UNHCR and DeepState fetches unchanged

### 6. Significance Scoring

Composite score to rank events beyond raw death count:

```
score = (best * 2) + (number_of_sources * 5) + headline_bonus + violence_type_bonus
```

- `headline_bonus` = +50 if `source_headline` contains strategic keywords: "capture", "offensive", "siege", "capital", "headquarters", "retreat", "surrender", "fall of", "seize"
- `violence_type_bonus` = +30 for type_of_violence = 3 (one-sided violence against civilians)

### 7. Map Display Tiers

Events classified into three tiers based on significance score:

- **Featured** (score >= 100): Large pulsing dot, visible at all zoom levels, may show tooltip by default
- **Notable** (score >= 40): Medium dot, visible at zoom >= 5
- **Minor** (score < 40): Small dot, visible at zoom >= 7

Existing map layer toggle extended with "UCDP Events" toggle. Events replace the current ACLED `liveEvents` layer.

### 8. What Gets Removed

- `fetchACLEDEvents()` and all ACLED OAuth code from `lib/conflict-apis.ts`
- ACLED-related env vars (ACLED_EMAIL, ACLED_PASSWORD) become unused
- In-memory cache in `/api/conflict-data` (data served from Supabase)

### 9. What Stays Unchanged

- UNHCR stats (live fetch, works fine)
- DeepState GeoJSON (Ukraine frontlines, live fetch)
- ConflictMap component structure and all existing layers
- ConflictTimeline, territory snapshots
- Static curated events in `conflicts.ts`
- All other map features (popups, fly-to, layer controls)

## Files to Create/Modify

**New files:**
- `app/api/cron/sync-ucdp/route.ts` — Daily cron sync
- `scripts/backfill-ucdp.ts` — One-time historical backfill

**Modified files:**
- `supabase-schema.sql` — Add `ucdp_events` table
- `lib/supabase.ts` — Add `UCDPEvent` type
- `lib/conflict-apis.ts` — Remove ACLED, add UCDP fetch helper
- `app/api/conflict-data/route.ts` — Replace ACLED with Supabase UCDP query
- `components/tools/ConflictMap.tsx` — Update event layer to use tiered display
- `app/tools/conflict-monitor/ConflictMonitor.tsx` — Update types/data flow if needed
