/**
 * Server-side utilities for fetching live conflict data from external APIs.
 *
 * Working sources (free, no approval required):
 *  - ACLED: Geolocated conflict events — requires OAuth (email+password in env)
 *  - UNHCR: Refugee and displacement statistics — no auth
 *  - DeepStateMap: Ukraine occupied territory GeoJSON — no auth, daily updates
 */

// ─── ACLED ──────────────────────────────────────────────────────────────────

interface ACLEDToken {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

let acledToken: ACLEDToken | null = null;

async function getACLEDToken(): Promise<string | null> {
  if (acledToken && Date.now() < acledToken.expires_at - 60_000) {
    return acledToken.access_token;
  }

  const email = process.env.ACLED_EMAIL;
  const password = process.env.ACLED_PASSWORD;
  if (!email || !password) return null;

  try {
    const res = await fetch("https://acleddata.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username: email,
        password,
        grant_type: "password",
        client_id: "acled",
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();

    acledToken = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    };

    return acledToken.access_token;
  } catch {
    return null;
  }
}

export interface ACLEDEvent {
  event_id_cnty: string;
  event_date: string;
  event_type: string;
  sub_event_type: string;
  actor1: string;
  actor2: string;
  country: string;
  admin1: string;
  location: string;
  latitude: number;
  longitude: number;
  fatalities: number;
  notes: string;
}

/** ACLED covers all major conflicts globally */
const ACLED_COUNTRIES: Record<string, string> = {
  ukraine: "Ukraine",
  middleeast: "Israel:OR:country=Palestine:OR:country=Lebanon:OR:country=Syria:OR:country=Yemen:OR:country=Iran",
  sudan: "Sudan",
  myanmar: "Myanmar",
  drc: "Democratic Republic of Congo",
};

export async function fetchACLEDEvents(conflictId: string, limit = 200): Promise<ACLEDEvent[]> {
  const country = ACLED_COUNTRIES[conflictId];
  if (!country) return [];

  try {
    const token = await getACLEDToken();
    if (!token) return [];

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const now = new Date().toISOString().slice(0, 10);
    const url = `https://acleddata.com/api/acled/read?_format=json&country=${encodeURIComponent(country)}&event_date=${since}|${now}&event_date_where=BETWEEN&fields=event_id_cnty|event_date|event_type|sub_event_type|actor1|actor2|country|admin1|location|latitude|longitude|fatalities|notes&limit=${limit}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.warn(`ACLED data fetch returned ${res.status} — account may need API data access approval at acleddata.com`);
      return [];
    }
    const json = await res.json();
    if (!json.data) return [];

    return json.data.map((d: Record<string, string>) => ({
      ...d,
      latitude: parseFloat(d.latitude),
      longitude: parseFloat(d.longitude),
      fatalities: parseInt(d.fatalities, 10) || 0,
    }));
  } catch (e) {
    console.error("ACLED fetch error:", e);
    return [];
  }
}

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
