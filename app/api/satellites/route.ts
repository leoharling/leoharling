import { NextResponse } from "next/server";

const CELESTRAK = "https://celestrak.org/NORAD/elements/gp.php";

const GROUPS = [
  // Communications
  { name: "Starlink", category: "comms", color: "#60a5fa", param: "GROUP=starlink", limit: 200 },
  { name: "OneWeb", category: "comms", color: "#93c5fd", param: "GROUP=oneweb", limit: 100 },
  { name: "Iridium NEXT", category: "comms", color: "#7dd3fc", param: "GROUP=iridium-NEXT", limit: 66 },
  // Navigation
  { name: "GPS", category: "nav", color: "#fbbf24", param: "GROUP=gps-ops", limit: 31 },
  { name: "GLONASS", category: "nav", color: "#fcd34d", param: "GROUP=glonass-operational", limit: 24 },
  { name: "Galileo", category: "nav", color: "#fde68a", param: "GROUP=galileo", limit: 30 },
  { name: "BeiDou", category: "nav", color: "#f59e0b", param: "GROUP=beidou", limit: 45 },
  // Earth & Weather
  { name: "Weather", category: "earth", color: "#22d3ee", param: "GROUP=weather", limit: 40 },
  { name: "Earth Resources", category: "earth", color: "#34d399", param: "GROUP=resource", limit: 40 },
  // Geostationary belt
  { name: "Geostationary", category: "geo", color: "#f472b6", param: "GROUP=geo", limit: 100 },
  // Debris
  { name: "Cosmos Debris", category: "debris", color: "#ef4444", param: "GROUP=cosmos-2251-debris", limit: 100 },
  { name: "Iridium Debris", category: "debris", color: "#ef4444", param: "GROUP=iridium-33-debris", limit: 100 },
];

const NOTABLE = [
  {
    id: "iss",
    label: "ISS (ZARYA)",
    catnr: "25544",
    color: "#f43f5e",
    description: "International Space Station",
  },
  {
    id: "hubble",
    label: "Hubble",
    catnr: "20580",
    color: "#a78bfa",
    description: "Hubble Space Telescope",
  },
  {
    id: "tiangong",
    label: "Tiangong",
    catnr: "48274",
    color: "#fb923c",
    description: "Chinese Space Station",
  },
  {
    id: "goes16",
    label: "GOES-16",
    catnr: "41866",
    color: "#38bdf8",
    description: "Geostationary Weather Satellite",
  },
  {
    id: "landsat9",
    label: "Landsat 9",
    catnr: "49260",
    color: "#4ade80",
    description: "Earth Observation Satellite",
  },
  {
    id: "noaa20",
    label: "NOAA-20",
    catnr: "43013",
    color: "#e879f9",
    description: "Polar Weather Satellite",
  },
  {
    id: "terra",
    label: "Terra",
    catnr: "25994",
    color: "#22d3ee",
    description: "Earth Observation Flagship",
  },
];

function parseTLEs(
  text: string,
  limit?: number
): { name: string; line1: string; line2: string }[] {
  const lines = text
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);
  const tles: { name: string; line1: string; line2: string }[] = [];
  for (let i = 0; i < lines.length - 2; i += 3) {
    if (lines[i + 1]?.startsWith("1 ") && lines[i + 2]?.startsWith("2 ")) {
      tles.push({
        name: lines[i],
        line1: lines[i + 1],
        line2: lines[i + 2],
      });
      if (limit && tles.length >= limit) break;
    }
  }
  return tles;
}

export async function GET() {
  try {
    const groupPromises = GROUPS.map(async (g) => {
      const res = await fetch(`${CELESTRAK}?${g.param}&FORMAT=tle`, {
        next: { revalidate: 14400 },
      });
      if (!res.ok) throw new Error(`Celestrak ${g.name}: ${res.status}`);
      const text = await res.text();
      return { name: g.name, category: g.category, color: g.color, tles: parseTLEs(text, g.limit) };
    });

    const notablePromises = NOTABLE.map(async (n) => {
      const res = await fetch(`${CELESTRAK}?CATNR=${n.catnr}&FORMAT=tle`, {
        next: { revalidate: 14400 },
      });
      if (!res.ok) throw new Error(`Celestrak ${n.label}: ${res.status}`);
      const text = await res.text();
      const tles = parseTLEs(text, 1);
      if (!tles[0]) return null;
      return {
        id: n.id,
        label: n.label,
        description: n.description,
        color: n.color,
        name: tles[0].name,
        line1: tles[0].line1,
        line2: tles[0].line2,
      };
    });

    const [groupResults, notableResults] = await Promise.all([
      Promise.allSettled(groupPromises),
      Promise.allSettled(notablePromises),
    ]);

    const groups = groupResults
      .filter(
        (r): r is PromiseFulfilledResult<{
          name: string;
          category: string;
          color: string;
          tles: { name: string; line1: string; line2: string }[];
        }> => r.status === "fulfilled"
      )
      .map((r) => r.value);

    const notable = notableResults
      .filter(
        (r): r is PromiseFulfilledResult<{
          id: string;
          label: string;
          description: string;
          color: string;
          name: string;
          line1: string;
          line2: string;
        } | null> => r.status === "fulfilled"
      )
      .map((r) => r.value)
      .filter(Boolean);

    return NextResponse.json(
      { groups, notable },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=14400, stale-while-revalidate=28800",
        },
      }
    );
  } catch (error) {
    console.error("Satellite data fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch satellite data" },
      { status: 500 }
    );
  }
}
