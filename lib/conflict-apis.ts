/**
 * Server-side utilities for fetching live conflict data from external APIs.
 *
 * Working sources:
 *  - UNHCR: Refugee and displacement statistics — no auth
 *  - DeepStateMap: Ukraine occupied territory GeoJSON — no auth, daily updates
 *
 * UCDP events are served from Supabase (synced via /api/cron/sync-ucdp).
 */

// ─── UNHCR ──────────────────────────────────────────────────────────────────

export interface UNHCRStats {
  refugees: number;
  asylum_seekers: number;
  idps: number;
  year: number;
}

/** UNHCR uses its own country codes (not ISO alpha-3) */
const UNHCR_CODES: Record<string, string> = {
  ukraine: "UKR",
  middleeast: "GAZ", // "State of Palestine"
  sudan: "SUD",
  myanmar: "MYA",
  drc: "COD",
};

export async function fetchUNHCRStats(conflictId: string): Promise<UNHCRStats | null> {
  const code = UNHCR_CODES[conflictId];
  if (!code) return null;

  try {
    const res = await fetch(
      `https://api.unhcr.org/population/v1/population/?coo=${code}&yearFrom=2023&yearTo=2026&limit=5`,
    );
    if (!res.ok) return null;
    const json = await res.json();
    const items = json.items || [];
    if (!items.length) return null;

    // Get most recent year
    const row = items.reduce(
      (latest: { year: number }, item: { year: number }) => (item.year > latest.year ? item : latest),
      items[0],
    );
    return {
      refugees: row.refugees || 0,
      asylum_seekers: row.asylum_seekers || 0,
      idps: row.idps || 0,
      year: row.year || 0,
    };
  } catch (e) {
    console.error("UNHCR fetch error:", e);
    return null;
  }
}

// ─── DeepStateMap (Ukraine front lines) ─────────────────────────────────────

export async function fetchDeepStateGeoJSON(): Promise<object | null> {
  try {
    // Files are in data/ subdirectory, try today first then fall back
    for (let daysAgo = 0; daysAgo <= 5; daysAgo++) {
      const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");
      const url = `https://raw.githubusercontent.com/cyterat/deepstate-map-data/main/data/deepstatemap_data_${dateStr}.geojson`;
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    }
    return null;
  } catch (e) {
    console.error("DeepState fetch error:", e);
    return null;
  }
}
