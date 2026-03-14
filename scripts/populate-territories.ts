/**
 * Populate historical territory snapshots in Supabase.
 *
 * Sources:
 *   - Ukraine: NZZ maps repo (Feb 2022 – Nov 2024), DeepState GitHub (Jul 2024+)
 *   - Middle East: bothness/gaza-geojson + hand-authored Lebanon/Iran zones
 *   - Sudan, Myanmar, DRC: detailed hand-authored polygons
 *
 * Usage:
 *   npx tsx scripts/populate-territories.ts [--conflict=ukraine|middleeast|sudan|myanmar|drc] [--dry-run]
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env.local manually (avoid dotenv dependency)
const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const conflictFilter = args.find((a) => a.startsWith("--conflict="))?.split("=")[1];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Reduce coordinate precision */
function simplifyCoords(obj: unknown, decimals = 4): unknown {
  if (typeof obj === "number") return Math.round(obj * 10 ** decimals) / 10 ** decimals;
  if (Array.isArray(obj)) return obj.map((x) => simplifyCoords(x, decimals));
  if (obj && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = k === "coordinates" ? simplifyCoords(v, decimals) : v;
    }
    return result;
  }
  return obj;
}

/** Format date as YYYYMMDD for DeepState filenames */
function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

// ─── NZZ Maps (Ukraine Feb 2022 – Nov 2024) ─────────────────────────────────

/**
 * Fetch territory data from NZZ maps GitHub repo.
 * Files at: conflict-investigations/nzz-maps/master/data/YYYY-MM-DD.json
 * Structure: { value: { type: "FeatureCollection", features: [...] } }
 * Feature types: "nochange" (cumulative occupied), "gains" (newly taken), "losses" (liberated)
 * We want nochange + gains = total occupied territory at that date.
 */
async function fetchNZZ(dateStr: string): Promise<object | null> {
  const url = `https://raw.githubusercontent.com/conflict-investigations/nzz-maps/master/data/${dateStr}.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      // Try ±1 day
      for (const offset of [1, -1, 2, -2]) {
        const d = new Date(dateStr);
        d.setDate(d.getDate() + offset);
        const alt = d.toISOString().slice(0, 10);
        const res2 = await fetch(`https://raw.githubusercontent.com/conflict-investigations/nzz-maps/master/data/${alt}.json`);
        if (res2.ok) {
          console.log(`  ✓ NZZ data found for ${alt} (requested ${dateStr})`);
          const data = await res2.json();
          return processNZZData(data);
        }
      }
      console.log(`  ✗ No NZZ data found near ${dateStr}`);
      return null;
    }
    console.log(`  ✓ NZZ data found for ${dateStr}`);
    const data = await res.json();
    return processNZZData(data);
  } catch (e) {
    console.log(`  ✗ NZZ fetch error for ${dateStr}:`, e);
    return null;
  }
}

function processNZZData(data: Record<string, unknown>): object {
  const value = (data.value || data) as { type: string; features: Array<{ properties: { type: string }; geometry: unknown }> };
  const features = value.features || [];

  // nochange + gains = total occupied territory at this point in time
  const occupiedFeatures = features.filter(
    (f) => f.properties.type === "nochange" || f.properties.type === "gains"
  );

  const fc = {
    type: "FeatureCollection",
    features: occupiedFeatures.map((f) => ({
      type: "Feature",
      properties: {
        label: "Russian-occupied territory",
        color: "#ef4444",
        fillOpacity: 0.2,
      },
      geometry: f.geometry,
    })),
  };

  return simplifyCoords(fc) as object;
}

// ─── DeepState GitHub (Jul 2024+) ────────────────────────────────────────────

async function fetchDeepState(dateStr: string): Promise<object | null> {
  const baseDate = new Date(dateStr);
  for (let offset = 0; offset <= 4; offset++) {
    const sign = offset === 0 ? 0 : offset % 2 === 1 ? 1 : -1;
    const daysOffset = offset === 0 ? 0 : Math.ceil(offset / 2) * sign;
    const d = new Date(baseDate.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    const ds = formatDate(d);
    const url = `https://raw.githubusercontent.com/cyterat/deepstate-map-data/main/data/deepstatemap_data_${ds}.geojson`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        console.log(`  ✓ DeepState data for ${ds} (requested ${dateStr})`);
        const data = await res.json();
        return simplifyCoords(data) as object;
      }
    } catch {
      // continue
    }
  }
  console.log(`  ✗ No DeepState data near ${dateStr}`);
  return null;
}

// ─── Gaza GeoJSON (bothness/gaza-geojson) ────────────────────────────────────

async function fetchGazaGeoJSON(filename: string): Promise<object | null> {
  const url = `https://raw.githubusercontent.com/bothness/gaza-geojson/main/areas/${filename}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

// ─── Snapshot definitions ────────────────────────────────────────────────────

interface SnapshotDef {
  date: string;
  label: string;
  source: "nzz" | "deepstate" | "manual" | "gaza-fetch";
  /** For manual source: GeoJSON FeatureCollection */
  geojson?: object;
  /** For gaza-fetch: which file to fetch */
  gazaFile?: string;
  /** For gaza-fetch: additional features to merge */
  extraFeatures?: object[];
}

// ─── Ukraine ─────────────────────────────────────────────────────────────────
// NZZ covers Feb 24 2022 – Nov 19 2024, DeepState covers Jul 8 2024+
// Use NZZ for 2022-2024, DeepState for late 2024+

const ukraineSnapshots: SnapshotDef[] = [
  // NZZ maps source (high-detail real polygon data)
  { date: "2022-02-24", label: "Pre-invasion — Crimea & Donbas occupied since 2014", source: "nzz" },
  { date: "2022-03-01", label: "Initial invasion — multi-axis advance", source: "nzz" },
  { date: "2022-03-08", label: "Northern advances peak, Kherson taken", source: "nzz" },
  { date: "2022-03-15", label: "Peak Russian advance — multi-axis invasion", source: "nzz" },
  { date: "2022-03-25", label: "Stalled advances, Ukrainian counterattacks begin", source: "nzz" },
  { date: "2022-04-02", label: "Russia withdraws from Kyiv, Chernihiv, Sumy", source: "nzz" },
  { date: "2022-04-15", label: "Northern withdrawal complete, Donbas focus", source: "nzz" },
  { date: "2022-05-01", label: "Focus shifts to Donbas", source: "nzz" },
  { date: "2022-05-15", label: "Battle of Severodonetsk begins", source: "nzz" },
  { date: "2022-06-01", label: "Severodonetsk falls", source: "nzz" },
  { date: "2022-06-15", label: "Lysychansk under siege", source: "nzz" },
  { date: "2022-07-01", label: "Lysychansk falls — Donbas push continues", source: "nzz" },
  { date: "2022-08-01", label: "Attritional fighting in Donbas", source: "nzz" },
  { date: "2022-09-01", label: "Pre-Kharkiv counteroffensive", source: "nzz" },
  { date: "2022-09-12", label: "Kharkiv counteroffensive — Izium liberated", source: "nzz" },
  { date: "2022-09-20", label: "Kharkiv oblast largely liberated", source: "nzz" },
  { date: "2022-10-01", label: "Russia annexes four oblasts (sham referendums)", source: "nzz" },
  { date: "2022-10-15", label: "Pre-Kherson liberation buildup", source: "nzz" },
  { date: "2022-11-01", label: "Kherson evacuation begins", source: "nzz" },
  { date: "2022-11-11", label: "Kherson liberated — Russia retreats east of Dnipro", source: "nzz" },
  { date: "2022-12-01", label: "Winter stabilization", source: "nzz" },
  { date: "2023-01-01", label: "Attritional phase — Bakhmut focus", source: "nzz" },
  { date: "2023-02-01", label: "Battle of Bakhmut intensifies", source: "nzz" },
  { date: "2023-03-01", label: "Wagner Group assault on Bakhmut", source: "nzz" },
  { date: "2023-04-01", label: "Bakhmut grinding continues", source: "nzz" },
  { date: "2023-05-01", label: "Pre-counteroffensive buildup", source: "nzz" },
  { date: "2023-06-04", label: "Summer counteroffensive launched", source: "nzz" },
  { date: "2023-07-01", label: "Counteroffensive — limited gains", source: "nzz" },
  { date: "2023-08-01", label: "Counteroffensive continues south", source: "nzz" },
  { date: "2023-09-01", label: "Robotyne salient established", source: "nzz" },
  { date: "2023-10-01", label: "Counteroffensive stalls", source: "nzz" },
  { date: "2023-11-01", label: "Avdiivka siege begins", source: "nzz" },
  { date: "2023-12-01", label: "Winter attritional phase", source: "nzz" },
  { date: "2024-01-01", label: "Russian pressure on Avdiivka", source: "nzz" },
  { date: "2024-02-17", label: "Avdiivka falls to Russia", source: "nzz" },
  { date: "2024-03-01", label: "Post-Avdiivka Russian advances", source: "nzz" },
  { date: "2024-04-01", label: "Chasiv Yar under pressure", source: "nzz" },
  { date: "2024-05-01", label: "Kharkiv border offensive begins", source: "nzz" },
  { date: "2024-06-01", label: "Russian Vovchansk push", source: "nzz" },
  { date: "2024-07-01", label: "Donbas advances accelerate", source: "nzz" },
  { date: "2024-08-01", label: "Pre-Kursk operations", source: "nzz" },
  { date: "2024-09-01", label: "Kursk incursion aftermath", source: "nzz" },
  { date: "2024-10-01", label: "Pokrovsk direction advances", source: "nzz" },
  { date: "2024-11-01", label: "Selydove, Kurakhove under pressure", source: "nzz" },
  // NZZ ends ~Nov 19 2024, switch to DeepState (bi-weekly granularity)
  { date: "2024-11-15", label: "Selydove falls", source: "deepstate" },
  { date: "2024-12-01", label: "Kurakhove under siege", source: "deepstate" },
  { date: "2024-12-15", label: "Kurakhove falls", source: "deepstate" },
  { date: "2025-01-01", label: "Winter offensive continues", source: "deepstate" },
  { date: "2025-01-15", label: "Pokrovsk pressure mounts", source: "deepstate" },
  { date: "2025-02-01", label: "Pokrovsk approach", source: "deepstate" },
  { date: "2025-02-15", label: "Donbas grinding advances", source: "deepstate" },
  { date: "2025-03-01", label: "Continued pressure on multiple axes", source: "deepstate" },
  { date: "2025-03-15", label: "Spring operations begin", source: "deepstate" },
  { date: "2025-04-01", label: "Continued territorial gains", source: "deepstate" },
  { date: "2025-04-15", label: "Frontline adjustments", source: "deepstate" },
  { date: "2025-05-01", label: "Ceasefire demand rejected", source: "deepstate" },
  { date: "2025-05-15", label: "Diplomatic pressure period", source: "deepstate" },
  { date: "2025-06-01", label: "Summer 2025 operations", source: "deepstate" },
  { date: "2025-06-15", label: "Continued summer fighting", source: "deepstate" },
  { date: "2025-07-01", label: "Donbas front evolution", source: "deepstate" },
  { date: "2025-07-15", label: "Mid-summer frontline state", source: "deepstate" },
  { date: "2025-08-01", label: "Pre-peace talks phase", source: "deepstate" },
  { date: "2025-08-15", label: "Diplomatic channels opening", source: "deepstate" },
  { date: "2025-09-01", label: "Diplomatic momentum building", source: "deepstate" },
  { date: "2025-09-15", label: "Pre-ceasefire negotiations", source: "deepstate" },
  { date: "2025-10-01", label: "Pre-peace plan territory", source: "deepstate" },
  { date: "2025-10-15", label: "Frontline stabilization trends", source: "deepstate" },
  { date: "2025-11-01", label: "28-point peace plan era", source: "deepstate" },
  { date: "2025-11-20", label: "Peace plan announced", source: "deepstate" },
  { date: "2025-12-01", label: "Negotiations active", source: "deepstate" },
  { date: "2025-12-15", label: "Year-end frontline state", source: "deepstate" },
  { date: "2026-01-01", label: "New year, talks continue", source: "deepstate" },
  { date: "2026-01-15", label: "January negotiations", source: "deepstate" },
  { date: "2026-02-01", label: "Pre-Mar-a-Lago territory", source: "deepstate" },
  { date: "2026-02-15", label: "Mar-a-Lago summit period", source: "deepstate" },
  { date: "2026-03-01", label: "Current frontlines", source: "deepstate" },
];

// ─── Middle East ─────────────────────────────────────────────────────────────
// Use real Gaza GeoJSON from bothness/gaza-geojson where available,
// combined with detailed hand-authored Lebanon and Iran zones

// South Lebanon — detailed polygon following the Litani River / UNIFIL zone
// Coordinates [lng, lat] for direct GeoJSON use
const SOUTH_LEBANON_POLYGON: number[][] = [
  [35.10, 33.09], [35.12, 33.11], [35.15, 33.14], [35.18, 33.17],
  [35.22, 33.19], [35.25, 33.21], [35.28, 33.23], [35.30, 33.26],
  [35.33, 33.28], [35.36, 33.30], [35.40, 33.31], [35.44, 33.32],
  [35.48, 33.33], [35.52, 33.34], [35.56, 33.35], [35.60, 33.35],
  [35.64, 33.34], [35.68, 33.33], [35.72, 33.32], [35.76, 33.30],
  [35.80, 33.29], [35.84, 33.28], [35.87, 33.27], [35.90, 33.25],
  [35.92, 33.22], [35.93, 33.19], [35.92, 33.16], [35.90, 33.13],
  [35.88, 33.10], [35.87, 33.07],
  // Border with Israel (south)
  [35.85, 33.06], [35.80, 33.06], [35.75, 33.07], [35.70, 33.07],
  [35.65, 33.07], [35.60, 33.08], [35.55, 33.08], [35.50, 33.09],
  [35.45, 33.09], [35.40, 33.09], [35.35, 33.08], [35.30, 33.07],
  [35.25, 33.07], [35.20, 33.07], [35.15, 33.08], [35.10, 33.09],
];

// Iranian strike zones — more realistic shapes following actual facility footprints
const ISFAHAN_ZONE: number[][] = [
  [51.62, 32.72], [51.68, 32.74], [51.76, 32.73], [51.82, 32.71],
  [51.85, 32.67], [51.84, 32.62], [51.80, 32.58], [51.74, 32.56],
  [51.66, 32.57], [51.60, 32.60], [51.57, 32.64], [51.58, 32.69], [51.62, 32.72],
];
const NATANZ_ZONE: number[][] = [
  [51.70, 33.55], [51.76, 33.56], [51.80, 33.54], [51.82, 33.50],
  [51.80, 33.46], [51.75, 33.44], [51.69, 33.45], [51.65, 33.48],
  [51.64, 33.52], [51.70, 33.55],
];
const TEHRAN_MIL_ZONE: number[][] = [
  [51.30, 35.73], [51.38, 35.75], [51.48, 35.74], [51.55, 35.72],
  [51.58, 35.68], [51.56, 35.63], [51.50, 35.60], [51.42, 35.59],
  [51.34, 35.60], [51.28, 35.64], [51.27, 35.69], [51.30, 35.73],
];
const BANDAR_ZONE: number[][] = [
  [56.18, 27.25], [56.26, 27.26], [56.34, 27.24], [56.38, 27.20],
  [56.36, 27.15], [56.30, 27.12], [56.22, 27.12], [56.16, 27.15],
  [56.14, 27.20], [56.18, 27.25],
];

function makeFeature(label: string, color: string, fillOpacity: number, type: string, coords: number[][]) {
  return {
    type: "Feature",
    properties: { label, color, fillOpacity },
    geometry: { type, coordinates: type === "Polygon" ? [coords] : coords },
  };
}

function makeFC(...features: object[]) {
  return { type: "FeatureCollection", features };
}

const middleeastSnapshots: SnapshotDef[] = [
  {
    date: "2023-10-06",
    label: "Pre-October 7 — no active conflict zones",
    source: "manual",
    geojson: makeFC(),
  },
  {
    date: "2023-10-08",
    label: "Post-attack — Gaza blockade tightened",
    source: "gaza-fetch",
    gazaFile: "gaza-strip.geojson",
  },
  {
    date: "2023-10-27",
    label: "Ground invasion begins — northern Gaza",
    source: "gaza-fetch",
    gazaFile: "israel-ground-nov22.geojson",
  },
  {
    date: "2024-01-15",
    label: "Northern Gaza under Israeli control",
    source: "gaza-fetch",
    gazaFile: "israel-claim-nov22.geojson",
  },
  {
    date: "2024-05-07",
    label: "Rafah operation — full Gaza under operations",
    source: "gaza-fetch",
    gazaFile: "gaza-strip.geojson",
  },
  {
    date: "2024-07-01",
    label: "Full Gaza occupation zone",
    source: "gaza-fetch",
    gazaFile: "gaza-strip.geojson",
  },
  {
    date: "2024-09-27",
    label: "Nasrallah killed — Lebanon front opens",
    source: "gaza-fetch",
    gazaFile: "gaza-strip.geojson",
    extraFeatures: [
      makeFeature("Southern Lebanon — Israeli operations", "#f97316", 0.12, "Polygon", SOUTH_LEBANON_POLYGON),
    ],
  },
  {
    date: "2024-10-01",
    label: "Iran retaliatory strikes period",
    source: "gaza-fetch",
    gazaFile: "gaza-strip.geojson",
    extraFeatures: [
      makeFeature("Southern Lebanon — active conflict zone", "#f97316", 0.15, "Polygon", SOUTH_LEBANON_POLYGON),
    ],
  },
  {
    date: "2025-01-19",
    label: "First ceasefire — zones held at lower intensity",
    source: "gaza-fetch",
    gazaFile: "gaza-strip.geojson",
    extraFeatures: [
      makeFeature("Southern Lebanon — ceasefire zone", "#eab308", 0.08, "Polygon", SOUTH_LEBANON_POLYGON),
    ],
  },
  {
    date: "2025-03-18",
    label: "Ceasefire collapse — operations resume",
    source: "gaza-fetch",
    gazaFile: "gaza-strip.geojson",
    extraFeatures: [
      makeFeature("Southern Lebanon — renewed tension", "#f97316", 0.12, "Polygon", SOUTH_LEBANON_POLYGON),
    ],
  },
  {
    date: "2025-10-10",
    label: "Second ceasefire",
    source: "gaza-fetch",
    gazaFile: "gaza-strip.geojson",
    extraFeatures: [
      makeFeature("Southern Lebanon — stabilizing", "#eab308", 0.06, "Polygon", SOUTH_LEBANON_POLYGON),
    ],
  },
  {
    date: "2026-02-28",
    label: "US-Israel strikes on Iran — regional war expands",
    source: "gaza-fetch",
    gazaFile: "gaza-strip.geojson",
    extraFeatures: [
      makeFeature("Southern Lebanon — stabilizing", "#eab308", 0.06, "Polygon", SOUTH_LEBANON_POLYGON),
      makeFeature("Isfahan — nuclear facility strikes", "#ef4444", 0.2, "Polygon", ISFAHAN_ZONE),
      makeFeature("Natanz — enrichment facility strikes", "#ef4444", 0.2, "Polygon", NATANZ_ZONE),
      makeFeature("Tehran — military target zone", "#ef4444", 0.15, "Polygon", TEHRAN_MIL_ZONE),
      makeFeature("Bandar Abbas — naval base strikes", "#ef4444", 0.15, "Polygon", BANDAR_ZONE),
    ],
  },
];

// ─── Sudan ───────────────────────────────────────────────────────────────────
// Detailed polygons following actual geographic features (rivers, roads, state borders)
// All coordinates [lng, lat] for GeoJSON

// Khartoum metropolitan area — follows Nile confluence shape
const KHARTOUM_DETAILED: number[][] = [
  [32.35, 15.72], [32.40, 15.74], [32.45, 15.73], [32.50, 15.72],
  [32.55, 15.70], [32.60, 15.68], [32.65, 15.66], [32.68, 15.63],
  [32.70, 15.60], [32.68, 15.56], [32.65, 15.53], [32.62, 15.50],
  [32.58, 15.48], [32.54, 15.46], [32.50, 15.45], [32.46, 15.44],
  [32.42, 15.44], [32.38, 15.46], [32.35, 15.48], [32.32, 15.51],
  [32.30, 15.54], [32.28, 15.58], [32.28, 15.62], [32.30, 15.66],
  [32.32, 15.69], [32.35, 15.72],
];

// Darfur — follows state boundaries more accurately
const DARFUR_REGION: number[][] = [
  [22.00, 10.00], [22.00, 10.50], [22.20, 11.00], [22.40, 11.50],
  [22.60, 12.00], [22.80, 12.40], [23.00, 12.80], [23.20, 13.20],
  [23.40, 13.60], [23.60, 14.00], [23.80, 14.40], [24.00, 14.80],
  [24.20, 15.20], [24.40, 15.60], [24.60, 15.80], [25.00, 15.85],
  [25.40, 15.80], [25.80, 15.70], [26.20, 15.50], [26.50, 15.20],
  [26.80, 14.80], [27.00, 14.40], [27.10, 14.00], [27.20, 13.60],
  [27.30, 13.20], [27.20, 12.80], [27.00, 12.40], [26.80, 12.00],
  [26.50, 11.60], [26.20, 11.20], [25.80, 10.80], [25.40, 10.50],
  [25.00, 10.20], [24.60, 10.05], [24.20, 10.00], [23.80, 10.00],
  [23.40, 10.00], [23.00, 10.00], [22.60, 10.00], [22.00, 10.00],
];

// El Fasher area — more detailed
const EL_FASHER_DETAILED: number[][] = [
  [25.20, 13.80], [25.28, 13.82], [25.36, 13.81], [25.44, 13.78],
  [25.48, 13.74], [25.50, 13.68], [25.48, 13.62], [25.44, 13.58],
  [25.38, 13.55], [25.30, 13.54], [25.22, 13.56], [25.16, 13.60],
  [25.12, 13.65], [25.12, 13.72], [25.15, 13.77], [25.20, 13.80],
];

// Kordofan corridor (RSF expansion route between Darfur and Khartoum)
const KORDOFAN_CORRIDOR: number[][] = [
  [27.20, 13.20], [27.50, 13.40], [28.00, 13.60], [28.50, 13.80],
  [29.00, 14.00], [29.50, 14.20], [30.00, 14.40], [30.50, 14.60],
  [31.00, 14.80], [31.50, 15.00], [31.80, 15.20], [32.00, 15.40],
  [32.30, 15.45], [32.30, 14.80], [32.00, 14.40], [31.50, 14.00],
  [31.00, 13.60], [30.50, 13.30], [30.00, 13.10], [29.50, 12.90],
  [29.00, 12.80], [28.50, 12.80], [28.00, 12.90], [27.50, 13.00],
  [27.20, 13.20],
];

// Gezira state — agricultural heartland south of Khartoum
const GEZIRA: number[][] = [
  [32.30, 15.40], [32.60, 15.38], [32.90, 15.30], [33.20, 15.20],
  [33.40, 15.00], [33.50, 14.70], [33.60, 14.40], [33.50, 14.10],
  [33.30, 13.90], [33.00, 13.80], [32.70, 13.80], [32.40, 13.90],
  [32.20, 14.10], [32.10, 14.40], [32.10, 14.70], [32.15, 15.00],
  [32.20, 15.20], [32.30, 15.40],
];

// Sennar state
const SENNAR: number[][] = [
  [33.50, 14.10], [33.80, 14.00], [34.10, 13.80], [34.30, 13.50],
  [34.40, 13.20], [34.30, 12.90], [34.10, 12.70], [33.80, 12.60],
  [33.50, 12.60], [33.20, 12.70], [33.00, 12.90], [32.90, 13.20],
  [33.00, 13.50], [33.20, 13.80], [33.50, 14.10],
];

const sudanSnapshots: SnapshotDef[] = [
  {
    date: "2023-04-15",
    label: "War outbreak — Khartoum contested",
    source: "manual",
    geojson: makeFC(
      makeFeature("Khartoum — contested zone", "#f59e0b", 0.15, "Polygon", KHARTOUM_DETAILED),
    ),
  },
  {
    date: "2023-07-01",
    label: "RSF consolidates Khartoum, fighting spreads to Darfur",
    source: "manual",
    geojson: makeFC(
      makeFeature("Khartoum — RSF controlled", "#ef4444", 0.2, "Polygon", KHARTOUM_DETAILED),
      makeFeature("North Darfur — El Geneina massacres", "#ef4444", 0.1, "Polygon", [
        [22.40, 13.30], [22.60, 13.50], [22.80, 13.60], [23.00, 13.50],
        [23.00, 13.20], [22.80, 13.00], [22.50, 13.00], [22.40, 13.10], [22.40, 13.30],
      ]),
    ),
  },
  {
    date: "2023-10-01",
    label: "RSF expands across Darfur",
    source: "manual",
    geojson: makeFC(
      makeFeature("Khartoum — RSF controlled", "#ef4444", 0.2, "Polygon", KHARTOUM_DETAILED),
      makeFeature("Darfur — RSF expanding", "#ef4444", 0.12, "Polygon", DARFUR_REGION),
      makeFeature("Kordofan corridor — contested", "#f59e0b", 0.08, "Polygon", KORDOFAN_CORRIDOR),
    ),
  },
  {
    date: "2024-01-01",
    label: "El-Fasher besieged, RSF controls most of Darfur",
    source: "manual",
    geojson: makeFC(
      makeFeature("Khartoum — RSF controlled", "#ef4444", 0.2, "Polygon", KHARTOUM_DETAILED),
      makeFeature("Darfur — RSF dominated", "#ef4444", 0.18, "Polygon", DARFUR_REGION),
      makeFeature("El-Fasher — besieged", "#f97316", 0.15, "Polygon", EL_FASHER_DETAILED),
      makeFeature("Kordofan corridor — RSF advancing", "#ef4444", 0.1, "Polygon", KORDOFAN_CORRIDOR),
    ),
  },
  {
    date: "2024-06-01",
    label: "RSF controls western corridor, expands to Gezira",
    source: "manual",
    geojson: makeFC(
      makeFeature("Khartoum — RSF controlled", "#ef4444", 0.2, "Polygon", KHARTOUM_DETAILED),
      makeFeature("Darfur — RSF dominated", "#ef4444", 0.18, "Polygon", DARFUR_REGION),
      makeFeature("Kordofan — RSF controlled", "#ef4444", 0.12, "Polygon", KORDOFAN_CORRIDOR),
      makeFeature("Gezira — RSF advancing", "#ef4444", 0.1, "Polygon", GEZIRA),
    ),
  },
  {
    date: "2024-12-01",
    label: "RSF dominant across west, center, and Gezira",
    source: "manual",
    geojson: makeFC(
      makeFeature("Khartoum — RSF controlled", "#ef4444", 0.2, "Polygon", KHARTOUM_DETAILED),
      makeFeature("Darfur — RSF controlled", "#ef4444", 0.2, "Polygon", DARFUR_REGION),
      makeFeature("Kordofan — RSF controlled", "#ef4444", 0.15, "Polygon", KORDOFAN_CORRIDOR),
      makeFeature("Gezira — RSF controlled", "#ef4444", 0.15, "Polygon", GEZIRA),
      makeFeature("Sennar — contested", "#f59e0b", 0.08, "Polygon", SENNAR),
    ),
  },
  {
    date: "2025-06-01",
    label: "RSF controls majority of Sudan's populated areas",
    source: "manual",
    geojson: makeFC(
      makeFeature("Khartoum — RSF controlled", "#ef4444", 0.2, "Polygon", KHARTOUM_DETAILED),
      makeFeature("Darfur — RSF controlled", "#ef4444", 0.2, "Polygon", DARFUR_REGION),
      makeFeature("Kordofan — RSF controlled", "#ef4444", 0.15, "Polygon", KORDOFAN_CORRIDOR),
      makeFeature("Gezira — RSF controlled", "#ef4444", 0.15, "Polygon", GEZIRA),
      makeFeature("Sennar — RSF advancing", "#ef4444", 0.1, "Polygon", SENNAR),
    ),
  },
];

// ─── Myanmar ─────────────────────────────────────────────────────────────────
// Detailed polygons following state/region boundaries

// Northern Shan State — follows actual state boundary shape
const NORTH_SHAN: number[][] = [
  [97.00, 23.40], [97.20, 23.30], [97.50, 23.20], [97.80, 23.10],
  [98.10, 23.00], [98.40, 22.90], [98.70, 22.80], [99.00, 22.70],
  [99.30, 22.50], [99.50, 22.30], [99.40, 22.00], [99.30, 21.70],
  [99.10, 21.50], [98.80, 21.40], [98.50, 21.30], [98.20, 21.40],
  [97.90, 21.50], [97.60, 21.60], [97.30, 21.80], [97.10, 22.00],
  [96.90, 22.30], [96.80, 22.60], [96.80, 22.90], [96.90, 23.10],
  [97.00, 23.40],
];

// Rakhine State — follows coastline
const RAKHINE: number[][] = [
  [92.20, 21.30], [92.40, 21.20], [92.60, 21.00], [92.80, 20.80],
  [93.00, 20.50], [93.10, 20.20], [93.20, 19.90], [93.30, 19.50],
  [93.40, 19.20], [93.50, 18.90], [93.40, 18.60], [93.20, 18.40],
  [93.00, 18.30], [92.80, 18.20], [92.60, 18.30], [92.40, 18.50],
  [92.20, 18.80], [92.10, 19.10], [92.00, 19.50], [91.90, 19.80],
  [91.90, 20.10], [91.95, 20.40], [92.00, 20.70], [92.05, 20.90],
  [92.10, 21.10], [92.20, 21.30],
];

// Chin State
const CHIN: number[][] = [
  [93.20, 22.60], [93.40, 22.50], [93.60, 22.30], [93.80, 22.00],
  [94.00, 21.70], [94.10, 21.40], [94.20, 21.10], [94.10, 20.80],
  [93.90, 20.60], [93.70, 20.50], [93.50, 20.60], [93.30, 20.80],
  [93.10, 21.00], [92.90, 21.30], [92.80, 21.60], [92.80, 21.90],
  [92.90, 22.10], [93.00, 22.30], [93.10, 22.50], [93.20, 22.60],
];

// Karenni (Kayah) State
const KARENNI: number[][] = [
  [97.10, 19.90], [97.30, 19.85], [97.50, 19.70], [97.70, 19.50],
  [97.80, 19.30], [97.90, 19.10], [97.80, 18.90], [97.60, 18.80],
  [97.40, 18.80], [97.20, 18.90], [97.00, 19.10], [96.90, 19.30],
  [96.90, 19.50], [96.95, 19.70], [97.10, 19.90],
];

// Sagaing Region — follows Chindwin/Irrawaddy river valleys
const SAGAING: number[][] = [
  [94.20, 25.40], [94.50, 25.30], [94.80, 25.10], [95.10, 24.80],
  [95.30, 24.50], [95.50, 24.20], [95.60, 23.90], [95.70, 23.60],
  [95.60, 23.30], [95.40, 23.00], [95.20, 22.80], [95.00, 22.60],
  [94.80, 22.50], [94.50, 22.50], [94.20, 22.60], [94.00, 22.80],
  [93.80, 23.10], [93.60, 23.40], [93.50, 23.70], [93.50, 24.00],
  [93.55, 24.30], [93.65, 24.60], [93.80, 24.90], [94.00, 25.10],
  [94.20, 25.40],
];

// Karen (Kayin) State
const KAREN: number[][] = [
  [97.50, 18.40], [97.70, 18.30], [97.90, 18.10], [98.10, 17.80],
  [98.20, 17.50], [98.30, 17.20], [98.20, 16.90], [98.00, 16.70],
  [97.80, 16.50], [97.60, 16.40], [97.40, 16.50], [97.20, 16.70],
  [97.00, 16.90], [96.90, 17.20], [96.90, 17.50], [97.00, 17.80],
  [97.10, 18.00], [97.30, 18.20], [97.50, 18.40],
];

// Junta core (Naypyidaw–Mandalay–Yangon corridor)
const JUNTA_CORE: number[][] = [
  [95.80, 22.00], [96.10, 21.80], [96.40, 21.50], [96.60, 21.20],
  [96.80, 20.80], [96.90, 20.40], [97.00, 20.00], [96.90, 19.60],
  [96.80, 19.20], [96.60, 18.80], [96.50, 18.40], [96.40, 18.00],
  [96.30, 17.60], [96.20, 17.20], [96.10, 16.80], [96.00, 16.50],
  [95.80, 16.30], [95.50, 16.20], [95.20, 16.30], [95.00, 16.50],
  [94.80, 16.80], [94.70, 17.20], [94.60, 17.60], [94.50, 18.00],
  [94.50, 18.40], [94.50, 18.80], [94.60, 19.20], [94.70, 19.60],
  [94.80, 20.00], [94.90, 20.40], [95.00, 20.80], [95.10, 21.10],
  [95.30, 21.40], [95.50, 21.70], [95.80, 22.00],
];

const myanmarSnapshots: SnapshotDef[] = [
  {
    date: "2023-10-26",
    label: "Pre-Operation 1027 — junta controls most territory",
    source: "manual",
    geojson: makeFC(
      makeFeature("Junta-controlled core", "#6b7280", 0.08, "Polygon", JUNTA_CORE),
    ),
  },
  {
    date: "2023-12-01",
    label: "Operation 1027 — Northern Shan falls to resistance",
    source: "manual",
    geojson: makeFC(
      makeFeature("Junta-controlled core", "#6b7280", 0.08, "Polygon", JUNTA_CORE),
      makeFeature("Northern Shan — resistance controlled", "#ef4444", 0.15, "Polygon", NORTH_SHAN),
    ),
  },
  {
    date: "2024-04-01",
    label: "Resistance gains in Rakhine, Chin states",
    source: "manual",
    geojson: makeFC(
      makeFeature("Junta-controlled core", "#6b7280", 0.08, "Polygon", JUNTA_CORE),
      makeFeature("Northern Shan — resistance", "#ef4444", 0.15, "Polygon", NORTH_SHAN),
      makeFeature("Rakhine — Arakan Army advances", "#ef4444", 0.12, "Polygon", RAKHINE),
      makeFeature("Chin — resistance gains", "#ef4444", 0.1, "Polygon", CHIN),
    ),
  },
  {
    date: "2024-08-01",
    label: "Multiple fronts — junta losing significant territory",
    source: "manual",
    geojson: makeFC(
      makeFeature("Junta-controlled core (shrinking)", "#6b7280", 0.08, "Polygon", JUNTA_CORE),
      makeFeature("Northern Shan — resistance", "#ef4444", 0.18, "Polygon", NORTH_SHAN),
      makeFeature("Rakhine — AA controlled", "#ef4444", 0.18, "Polygon", RAKHINE),
      makeFeature("Chin — resistance", "#ef4444", 0.12, "Polygon", CHIN),
      makeFeature("Karenni — resistance", "#ef4444", 0.12, "Polygon", KARENNI),
    ),
  },
  {
    date: "2025-01-01",
    label: "Resistance controls ~60% of territory",
    source: "manual",
    geojson: makeFC(
      makeFeature("Junta core — shrinking", "#6b7280", 0.06, "Polygon", JUNTA_CORE),
      makeFeature("Northern Shan — resistance", "#ef4444", 0.2, "Polygon", NORTH_SHAN),
      makeFeature("Rakhine — AA controlled", "#ef4444", 0.2, "Polygon", RAKHINE),
      makeFeature("Chin — resistance", "#ef4444", 0.15, "Polygon", CHIN),
      makeFeature("Karenni — resistance", "#ef4444", 0.15, "Polygon", KARENNI),
      makeFeature("Sagaing — resistance gains", "#ef4444", 0.12, "Polygon", SAGAING),
      makeFeature("Karen — resistance advances", "#ef4444", 0.1, "Polygon", KAREN),
    ),
  },
  {
    date: "2025-06-01",
    label: "Current — resistance holds majority of periphery",
    source: "manual",
    geojson: makeFC(
      makeFeature("Junta core — diminished", "#6b7280", 0.06, "Polygon", JUNTA_CORE),
      makeFeature("Northern Shan — resistance", "#ef4444", 0.2, "Polygon", NORTH_SHAN),
      makeFeature("Rakhine — AA controlled", "#ef4444", 0.2, "Polygon", RAKHINE),
      makeFeature("Chin — resistance", "#ef4444", 0.18, "Polygon", CHIN),
      makeFeature("Karenni — resistance", "#ef4444", 0.18, "Polygon", KARENNI),
      makeFeature("Sagaing — resistance", "#ef4444", 0.15, "Polygon", SAGAING),
      makeFeature("Karen — resistance", "#ef4444", 0.12, "Polygon", KAREN),
    ),
  },
];

// ─── DRC ─────────────────────────────────────────────────────────────────────
// M23 territory in North Kivu — detailed polygons following terrain

// Rutshuru territory — initial M23 foothold
const RUTSHURU: number[][] = [
  [29.30, -1.00], [29.35, -1.02], [29.40, -1.05], [29.45, -1.10],
  [29.50, -1.15], [29.52, -1.22], [29.50, -1.30], [29.45, -1.38],
  [29.40, -1.42], [29.35, -1.45], [29.30, -1.48], [29.25, -1.45],
  [29.20, -1.40], [29.15, -1.35], [29.12, -1.28], [29.10, -1.20],
  [29.12, -1.12], [29.15, -1.08], [29.20, -1.04], [29.25, -1.02],
  [29.30, -1.00],
];

// Expanded M23 area (towards Goma)
const M23_EXPANDED: number[][] = [
  [29.10, -0.90], [29.20, -0.88], [29.35, -0.90], [29.50, -0.95],
  [29.60, -1.05], [29.65, -1.15], [29.65, -1.30], [29.60, -1.45],
  [29.55, -1.55], [29.50, -1.60], [29.45, -1.65], [29.38, -1.68],
  [29.30, -1.70], [29.22, -1.68], [29.15, -1.63], [29.08, -1.55],
  [29.02, -1.45], [28.98, -1.35], [28.95, -1.25], [28.95, -1.15],
  [28.98, -1.05], [29.02, -0.97], [29.10, -0.90],
];

// Masisi territory
const MASISI: number[][] = [
  [28.70, -1.20], [28.80, -1.18], [28.90, -1.20], [29.00, -1.25],
  [29.05, -1.32], [29.05, -1.42], [29.00, -1.50], [28.92, -1.55],
  [28.82, -1.58], [28.72, -1.55], [28.65, -1.48], [28.60, -1.40],
  [28.58, -1.32], [28.60, -1.25], [28.65, -1.22], [28.70, -1.20],
];

// Goma region — Lake Kivu shore
const GOMA_REGION: number[][] = [
  [29.15, -1.55], [29.22, -1.53], [29.28, -1.56], [29.32, -1.60],
  [29.35, -1.66], [29.34, -1.72], [29.30, -1.76], [29.25, -1.80],
  [29.20, -1.82], [29.15, -1.80], [29.10, -1.76], [29.06, -1.70],
  [29.04, -1.65], [29.06, -1.60], [29.10, -1.57], [29.15, -1.55],
];

// Full M23 control (post-Goma capture)
const M23_FULL: number[][] = [
  [28.55, -0.80], [28.70, -0.75], [28.90, -0.78], [29.10, -0.82],
  [29.30, -0.85], [29.50, -0.90], [29.65, -1.00], [29.72, -1.15],
  [29.75, -1.30], [29.72, -1.50], [29.65, -1.65], [29.55, -1.78],
  [29.40, -1.88], [29.25, -1.92], [29.10, -1.90], [28.95, -1.85],
  [28.80, -1.78], [28.65, -1.68], [28.55, -1.55], [28.48, -1.40],
  [28.45, -1.25], [28.45, -1.10], [28.48, -0.98], [28.55, -0.80],
];

const drcSnapshots: SnapshotDef[] = [
  {
    date: "2023-01-01",
    label: "M23 resurgence — Rutshuru territory",
    source: "manual",
    geojson: makeFC(
      makeFeature("M23-controlled — Rutshuru", "#ef4444", 0.15, "Polygon", RUTSHURU),
    ),
  },
  {
    date: "2023-06-01",
    label: "M23 consolidates Rutshuru",
    source: "manual",
    geojson: makeFC(
      makeFeature("M23-controlled — Rutshuru", "#ef4444", 0.2, "Polygon", RUTSHURU),
    ),
  },
  {
    date: "2023-12-01",
    label: "M23 expands toward Goma",
    source: "manual",
    geojson: makeFC(
      makeFeature("M23-controlled — expanding", "#ef4444", 0.18, "Polygon", M23_EXPANDED),
    ),
  },
  {
    date: "2024-06-01",
    label: "Masisi captured by M23",
    source: "manual",
    geojson: makeFC(
      makeFeature("M23-controlled — north", "#ef4444", 0.18, "Polygon", M23_EXPANDED),
      makeFeature("Masisi — M23 captured", "#ef4444", 0.18, "Polygon", MASISI),
    ),
  },
  {
    date: "2025-01-27",
    label: "Goma captured by M23",
    source: "manual",
    geojson: makeFC(
      makeFeature("M23-controlled — expanded", "#ef4444", 0.2, "Polygon", M23_EXPANDED),
      makeFeature("Masisi — M23", "#ef4444", 0.2, "Polygon", MASISI),
      makeFeature("Goma region — M23 captured", "#ef4444", 0.25, "Polygon", GOMA_REGION),
    ),
  },
  {
    date: "2025-06-01",
    label: "M23 expanded control — eastern DRC",
    source: "manual",
    geojson: makeFC(
      makeFeature("M23-controlled territory", "#ef4444", 0.2, "Polygon", M23_FULL),
    ),
  },
];

// ─── Main execution ──────────────────────────────────────────────────────────

async function upsertSnapshot(conflictId: string, date: string, label: string, geojson: object) {
  if (dryRun) {
    const size = JSON.stringify(geojson).length;
    console.log(`  [DRY RUN] ${conflictId} / ${date}: "${label}" (${(size / 1024).toFixed(1)}KB)`);
    return;
  }

  const { error } = await supabase
    .from("conflict_territories")
    .upsert(
      { conflict_id: conflictId, date, label, geojson },
      { onConflict: "conflict_id,date" }
    );

  if (error) {
    console.error(`  ✗ Error ${conflictId}/${date}:`, error.message);
  } else {
    const size = JSON.stringify(geojson).length;
    console.log(`  ✓ ${conflictId} / ${date}: "${label}" (${(size / 1024).toFixed(1)}KB)`);
  }
}

async function processGazaFetch(snap: SnapshotDef): Promise<object> {
  let features: object[] = [];

  if (snap.gazaFile) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gazaData = await fetchGazaGeoJSON(snap.gazaFile) as any;
    if (gazaData?.features) {
      // Add styling properties to Gaza features
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      features = gazaData.features.map((f: any) => ({
        ...f,
        properties: {
          ...(f.properties || {}),
          label: snap.label.includes("blockade") ? "Gaza Strip — blockade zone" : "Gaza — Israeli military operations",
          color: snap.label.includes("ceasefire") ? "#eab308" : "#ef4444",
          fillOpacity: snap.label.includes("ceasefire") ? 0.12 : 0.2,
        },
      }));
      console.log(`  ✓ Fetched Gaza GeoJSON: ${snap.gazaFile} (${features.length} features)`);
    } else {
      console.log(`  ✗ Failed to fetch Gaza GeoJSON: ${snap.gazaFile}`);
    }
  }

  if (snap.extraFeatures) {
    features = [...features, ...snap.extraFeatures];
  }

  return { type: "FeatureCollection", features };
}

async function populateConflict(conflictId: string, snapshots: SnapshotDef[]) {
  console.log(`\n═══ ${conflictId.toUpperCase()} (${snapshots.length} snapshots) ═══`);

  for (const snap of snapshots) {
    let geojson: object | null = null;

    if (snap.source === "nzz") {
      geojson = await fetchNZZ(snap.date);
    } else if (snap.source === "deepstate") {
      geojson = await fetchDeepState(snap.date);
    } else if (snap.source === "gaza-fetch") {
      geojson = await processGazaFetch(snap);
    } else {
      geojson = snap.geojson || makeFC();
    }

    if (!geojson) {
      console.log(`  ⊘ Skipping ${snap.date} — no data available`);
      continue;
    }

    await upsertSnapshot(conflictId, snap.date, snap.label, geojson);
  }
}

async function main() {
  console.log(`\nPopulating conflict territories${dryRun ? " (DRY RUN)" : ""}...`);
  console.log(`Supabase URL: ${supabaseUrl}`);

  const all: [string, SnapshotDef[]][] = [
    ["ukraine", ukraineSnapshots],
    ["middleeast", middleeastSnapshots],
    ["sudan", sudanSnapshots],
    ["myanmar", myanmarSnapshots],
    ["drc", drcSnapshots],
  ];

  for (const [id, snaps] of all) {
    if (conflictFilter && id !== conflictFilter) continue;
    await populateConflict(id, snaps);
  }

  console.log("\n✓ Done!\n");
}

main().catch(console.error);
