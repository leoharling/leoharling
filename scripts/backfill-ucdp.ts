/**
 * One-time script to backfill historical UCDP GED events into Supabase.
 *
 * Usage: npx tsx scripts/backfill-ucdp.ts
 *
 * Requires env vars: UCDP_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// Load .env.local manually (no dotenv dependency)
const envFile = readFileSync(".env.local", "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const UCDP_BASE = "https://ucdpapi.pcr.uu.se/api";
const GED_VERSION = "25.1";
const GED_CANDIDATE_VERSION = "25.01.25.12"; // Quarterly candidate (2025 data)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// NOTE: Duplicated from lib/ucdp.ts — script runs standalone outside Next.js
const CONFLICTS: Record<string, { codes: number[]; startDate: string }> = {
  ukraine: { codes: [369], startDate: "2022-02-24" },
  middleeast: { codes: [666, 6661, 630, 660, 652, 679], startDate: "2023-10-07" },
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

async function backfillCandidate(conflictId: string) {
  const config = CONFLICTS[conflictId];
  if (!config) return;

  console.log(`\n--- Backfilling candidate ${conflictId} (2025 data) ---`);

  const params = new URLSearchParams({
    pagesize: "1000",
    Country: config.codes.join(","),
    StartDate: "2025-01-01",
  });

  let page = 0;
  let totalPages = 1;
  let totalInserted = 0;

  while (page < totalPages) {
    params.set("page", String(page));
    const url = `${UCDP_BASE}/gedevents/${GED_CANDIDATE_VERSION}?${params.toString()}`;

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
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`  Done: ${totalInserted} candidate events inserted for ${conflictId}`);
}

async function main() {
  const mode = process.argv[2]; // "historical", "candidate", or undefined (both)

  if (!mode || mode === "historical") {
    console.log("UCDP Historical Backfill (GED 25.1)");
    console.log("====================================");
    for (const conflictId of Object.keys(CONFLICTS)) {
      await backfillConflict(conflictId);
    }
  }

  if (!mode || mode === "candidate") {
    console.log("\nUCDP Candidate Backfill (GED Candidate 25.01.25.12)");
    console.log("===================================================");
    for (const conflictId of Object.keys(CONFLICTS)) {
      await backfillCandidate(conflictId);
    }
  }

  console.log("\nBackfill complete!");
}

main().catch(console.error);
