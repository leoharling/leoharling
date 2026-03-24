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

  if (!process.env.UCDP_API_KEY) {
    return NextResponse.json({ error: "UCDP_API_KEY not set in environment" }, { status: 500 });
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
