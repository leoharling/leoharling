export type Operator =
  | "Stargate"
  | "Microsoft"
  | "Google"
  | "Amazon"
  | "Meta"
  | "xAI"
  | "CoreWeave"
  | "Oracle"
  | "Other";

export type DCStatus = "existing" | "under-construction" | "announced";

export interface DataCenter {
  id: string;
  name: string;
  operator: Operator;
  lat: number;
  lng: number;
  status: DCStatus;
  capacityMW: number;
  investmentB?: number;
  announced?: string;
  notes?: string;
}

export interface InvestmentFlow {
  investor: Operator | string;
  totalB: number;
  color: string;
  projects: number;
}

export const OPERATOR_COLORS: Record<Operator, string> = {
  Stargate:  "#8b5cf6",
  Microsoft: "#3b82f6",
  Google:    "#22c55e",
  Amazon:    "#f97316",
  Meta:      "#a855f7",
  xAI:       "#ef4444",
  CoreWeave: "#06b6d4",
  Oracle:    "#f59e0b",
  Other:     "#71717a",
};

// ~0.15–0.25 degree jitter to spread overlapping metro dots
function j(v: number, seed: number): number {
  // Deterministic pseudo-jitter so positions are stable across renders
  const x = Math.sin(seed * 127.1) * 0.5 + 0.5;
  return v + (x - 0.5) * 0.4;
}

export const DATA_CENTERS: DataCenter[] = [
  // ── Stargate / OpenAI ──
  { id: "sg-abilene",     name: "Stargate — Abilene, TX",         operator: "Stargate",  lat: 32.45,  lng: -99.73,  status: "existing",           capacityMW: 1200, investmentB: 100, announced: "2025", notes: "Phase 1 operational; anchor site" },
  { id: "sg-shackelford", name: "Stargate — Shackelford Co., TX", operator: "Stargate",  lat: 32.73,  lng: -99.48,  status: "under-construction",  capacityMW: 2000, investmentB: 100, announced: "2025" },
  { id: "sg-milam",       name: "Stargate — Milam Co., TX",       operator: "Stargate",  lat: 31.19,  lng: -97.24,  status: "under-construction",  capacityMW: 1200, investmentB: 100, announced: "2025" },
  { id: "sg-lordstown",   name: "Stargate — Lordstown, OH",       operator: "Stargate",  lat: 41.29,  lng: -80.88,  status: "announced",           capacityMW: 1000, investmentB: 50,  announced: "2025" },
  { id: "sg-newmexico",   name: "Stargate — Doña Ana Co., NM",    operator: "Stargate",  lat: 32.14,  lng: -106.42, status: "announced",           capacityMW: 800,  announced: "2025" },
  { id: "sg-michigan",   name: "Stargate — Washtenaw Co., MI",   operator: "Stargate",  lat: 42.17,  lng: -83.78,  status: "under-construction",  capacityMW: 1000, announced: "2025", notes: "1.4 GW power approved; construction started early 2026" },
  { id: "sg-norway",     name: "Stargate — Norway",               operator: "Stargate",  lat: 59.91,  lng: 10.75,   status: "announced",           capacityMW: 200,  announced: "2026", notes: "100K NVIDIA GPUs targeted; open end-2026" },
  { id: "sg-uae",        name: "Stargate — UAE",                  operator: "Stargate",  lat: 24.47,  lng: 54.37,   status: "announced",           capacityMW: 300,  announced: "2026" },

  // ── Microsoft ──
  { id: "ms-quincy",      name: "Microsoft — Quincy, WA",         operator: "Microsoft", lat: 47.23,  lng: -119.85, status: "existing",           capacityMW: 400,  notes: "Columbia Basin flagship campus" },
  { id: "ms-desmoines",   name: "Microsoft — Des Moines, IA",     operator: "Microsoft", lat: 41.60,  lng: -93.61,  status: "announced",           capacityMW: 500,  investmentB: 10,  announced: "2025" },
  { id: "ms-london",      name: "Microsoft — London, UK",         operator: "Microsoft", lat: 51.52,  lng: -0.13,   status: "under-construction",  capacityMW: 300,  investmentB: 1.3, announced: "2025" },
  { id: "ms-stockholm",   name: "Microsoft — Stockholm, SE",      operator: "Microsoft", lat: 59.33,  lng: 18.07,   status: "existing",           capacityMW: 200  },
  { id: "ms-dublin",      name: "Microsoft — Dublin, IE",         operator: "Microsoft", lat: j(53.34, 1), lng: j(-6.26, 2), status: "existing",  capacityMW: 180  },
  { id: "ms-vienna",      name: "Microsoft — Vienna, AT",         operator: "Microsoft", lat: 48.21,  lng: 16.37,   status: "existing",           capacityMW: 200,  investmentB: 1.2, announced: "2025" },
  { id: "ms-tokyo",       name: "Microsoft — Tokyo, JP",          operator: "Microsoft", lat: j(35.69, 3), lng: j(139.69, 4), status: "announced", capacityMW: 300, investmentB: 10, announced: "2025", notes: "$10B commitment 2026–2029" },
  { id: "ms-hyderabad",   name: "Microsoft — Hyderabad, IN",      operator: "Microsoft", lat: j(17.39, 5), lng: j(78.47, 6), status: "announced",  capacityMW: 400, investmentB: 3,   announced: "2026" },
  { id: "ms-malaysia",    name: "Microsoft — Kuala Lumpur, MY",   operator: "Microsoft", lat: 3.14,   lng: 101.69,  status: "announced",           capacityMW: 200,  announced: "2025" },
  { id: "ms-saudi",       name: "Microsoft — Riyadh, SA",         operator: "Microsoft", lat: j(24.76, 7), lng: j(46.68, 8), status: "under-construction", capacityMW: 300, announced: "2025" },
  { id: "ms-abilene",   name: "Microsoft — Abilene, TX",         operator: "Microsoft", lat: 32.48,  lng: -99.78,  status: "announced",           capacityMW: 900,  announced: "2026", notes: "Leased from Crusoe Energy; formerly planned Stargate/Oracle site; first building mid-2027" },
  { id: "ms-wisconsin", name: "Microsoft — Mount Pleasant, WI",  operator: "Microsoft", lat: 42.72,  lng: -87.88,  status: "under-construction",  capacityMW: 800,  investmentB: 13,  announced: "2026", notes: "Fairwater campus; 15 DCs approved at former Foxconn site" },
  { id: "ms-thailand",  name: "Microsoft — Bangkok, TH",         operator: "Microsoft", lat: 13.75,  lng: 100.52,  status: "announced",           capacityMW: 100,  investmentB: 1,   announced: "2026" },

  // ── Google ──
  { id: "goog-iowa",      name: "Google — Iowa",                  operator: "Google",    lat: j(41.88, 9),  lng: j(-93.10, 10), status: "existing", capacityMW: 600 },
  { id: "goog-dalles",    name: "Google — The Dalles, OR",        operator: "Google",    lat: 45.60,  lng: -121.30, status: "existing",           capacityMW: 400  },
  { id: "goog-belgium",   name: "Google — Belgium",               operator: "Google",    lat: 50.42,  lng: 4.45,    status: "existing",           capacityMW: 350  },
  { id: "goog-nl",        name: "Google — Groningen, NL",         operator: "Google",    lat: 53.22,  lng: 6.57,    status: "under-construction",  capacityMW: 400,  investmentB: 0.7, announced: "2025" },
  { id: "goog-frankfurt", name: "Google — Frankfurt, DE",         operator: "Google",    lat: 50.11,  lng: 8.68,    status: "announced",           capacityMW: 482,  investmentB: 6.4, announced: "2025" },
  { id: "goog-singapore", name: "Google — Singapore",             operator: "Google",    lat: j(1.35, 11),  lng: j(103.82, 12), status: "existing", capacityMW: 200 },
  { id: "goog-india",     name: "Google — Visakhapatnam, IN",     operator: "Google",    lat: 17.69,  lng: 83.22,   status: "announced",           capacityMW: 1000, investmentB: 15,  announced: "2025" },
  { id: "goog-taiwan",    name: "Google — Taiwan",                operator: "Google",    lat: 25.04,  lng: 121.56,  status: "announced",           capacityMW: 300,  investmentB: 3,   announced: "2025" },
  { id: "goog-detroit",  name: "Google — Detroit Metro, MI",     operator: "Google",    lat: 42.40,  lng: -83.15,  status: "announced",           capacityMW: 2700, announced: "2026", notes: "DTE Energy partnership; 1,600 MW solar + storage" },
  { id: "goog-nc",       name: "Google — Lenoir, NC",             operator: "Google",    lat: 35.91,  lng: -81.54,  status: "announced",           capacityMW: 100,  investmentB: 1,   announced: "2026" },
  { id: "goog-norway",   name: "Google — Skien, NO",              operator: "Google",    lat: 59.21,  lng: 9.61,    status: "under-construction",  capacityMW: 75,   investmentB: 0.65, announced: "2026" },

  // ── Amazon / AWS ──
  { id: "aws-virginia",   name: "AWS — N. Virginia",              operator: "Amazon",    lat: 38.96,  lng: -77.45,  status: "existing",           capacityMW: 2000, notes: "Largest AWS region globally" },
  { id: "aws-indiana",    name: "AWS — N. Indiana (Project Rainier)", operator: "Amazon", lat: 41.54, lng: -86.68,  status: "existing",           capacityMW: 4600, investmentB: 26,  announced: "2025", notes: "2.2 GW + 2.4 GW expansion" },
  { id: "aws-nc",         name: "AWS — Richmond Co., NC",         operator: "Amazon",    lat: 35.19,  lng: -80.78,  status: "announced",           capacityMW: 800,  investmentB: 10,  announced: "2025" },
  { id: "aws-louisiana",  name: "AWS — Louisiana",                operator: "Amazon",    lat: 32.40,  lng: -93.74,  status: "announced",           capacityMW: 600,  investmentB: 12,  announced: "2025" },
  { id: "aws-ireland",    name: "AWS — Ireland",                  operator: "Amazon",    lat: j(53.34, 13), lng: j(-6.26, 14), status: "existing",  capacityMW: 600 },
  { id: "aws-india",      name: "AWS — Telangana, IN",            operator: "Amazon",    lat: j(17.36, 15), lng: j(78.48, 16), status: "announced", capacityMW: 500, investmentB: 7, announced: "2025" },
  { id: "aws-tokyo",      name: "AWS — Tokyo, JP",                operator: "Amazon",    lat: j(35.69, 17), lng: j(139.69, 18), status: "existing",  capacityMW: 500 },
  { id: "aws-sydney",     name: "AWS — Sydney, AU",               operator: "Amazon",    lat: -33.87, lng: 151.21,  status: "existing",           capacityMW: 400  },
  { id: "aws-pa",        name: "AWS — Pennsylvania",             operator: "Amazon",    lat: 41.19,  lng: -80.18,  status: "announced",           capacityMW: 1000, investmentB: 20,  announced: "2026", notes: "Salem & Falls Township campuses" },
  { id: "aws-spain",     name: "AWS — Aragón, ES",               operator: "Amazon",    lat: 41.65,  lng: -0.89,   status: "announced",           capacityMW: 500,  investmentB: 37,  announced: "2026", notes: "Part of €33.7B Spain commitment for cloud, AI & supply chain" },

  // ── Meta ──
  { id: "meta-iowa",      name: "Meta — Iowa",                    operator: "Meta",      lat: j(41.88, 19), lng: j(-93.10, 20), status: "existing", capacityMW: 800 },
  { id: "meta-oregon",    name: "Meta — Oregon",                  operator: "Meta",      lat: 45.52,  lng: -122.68, status: "existing",           capacityMW: 600  },
  { id: "meta-louisiana", name: "Meta — Richland Parish, LA",     operator: "Meta",      lat: 31.96,  lng: -91.39,  status: "under-construction",  capacityMW: 5000, investmentB: 27,  announced: "2025", notes: "Hyperion campus, 5 GW target; $27B JV with Blue Owl Capital; 10 gas plants ordered from Entergy" },
  { id: "meta-texas",     name: "Meta — El Paso, TX",             operator: "Meta",      lat: 31.76,  lng: -106.49, status: "under-construction",  capacityMW: 1000, investmentB: 10, announced: "2025" },
  { id: "meta-ohio",      name: "Meta — New Albany, OH",          operator: "Meta",      lat: 40.08,  lng: -82.79,  status: "under-construction",  capacityMW: 1000, announced: "2026", notes: "Prometheus campus; first 1 GW+ single data center" },

  // ── xAI ──
  { id: "xai-memphis",    name: "xAI — Memphis, TN (Colossus)",   operator: "xAI",       lat: 35.15,  lng: -90.05,  status: "existing",           capacityMW: 2000, investmentB: 18,  notes: "100K+ Nvidia H100/H200 GPUs, expanding to 2 GW" },

  // ── CoreWeave ──
  { id: "cw-lasvegas",    name: "CoreWeave — Las Vegas, NV",      operator: "CoreWeave", lat: 36.17,  lng: -115.14, status: "existing",           capacityMW: 275  },
  { id: "cw-plano",       name: "CoreWeave — Plano, TX",          operator: "CoreWeave", lat: 33.21,  lng: -96.69,  status: "under-construction",  capacityMW: 300,  investmentB: 1.6, announced: "2025" },
  { id: "cw-westtx",      name: "CoreWeave — West Texas",         operator: "CoreWeave", lat: 31.77,  lng: -102.29, status: "announced",           capacityMW: 2000, investmentB: 12,  announced: "2025", notes: "Partnership with Poolside" },

  // ── Oracle ──
  { id: "ora-phoenix",    name: "Oracle — Phoenix, AZ",           operator: "Oracle",    lat: 33.45,  lng: -112.07, status: "existing",           capacityMW: 400  },
  { id: "ora-tokyo",      name: "Oracle — Tokyo, JP",             operator: "Oracle",    lat: j(35.69, 23), lng: j(139.69, 24), status: "announced", capacityMW: 500, investmentB: 8, announced: "2025" },
  { id: "ora-malaysia",   name: "Oracle — Malaysia",              operator: "Oracle",    lat: 4.21,   lng: 101.69,  status: "announced",           capacityMW: 300,  investmentB: 6.5, announced: "2025" },

  // ── Other ──
  { id: "oth-sweden",     name: "Brookfield — Stockholm Region, SE", operator: "Other",  lat: 59.06,  lng: 15.61,   status: "announced",           capacityMW: 750,  investmentB: 10,  announced: "2025" },
  { id: "oth-brazil",     name: "ByteDance — Ceará, Brazil",      operator: "Other",     lat: -3.35,  lng: -38.64,  status: "announced",           capacityMW: 600,  investmentB: 38,  announced: "2025" },
  { id: "oth-saudi",      name: "NEOM / SDAIA — Riyadh, SA",      operator: "Other",     lat: j(24.69, 25), lng: j(46.72, 26), status: "announced", capacityMW: 2000, investmentB: 40, announced: "2025", notes: "Saudi Vision 2030 sovereign AI fund" },
  { id: "oth-wv",         name: "Penzance — Falling Waters, WV",  operator: "Other",     lat: 39.59,  lng: -77.88,  status: "announced",           capacityMW: 600,  investmentB: 4,   announced: "2026" },
];

export const INVESTMENT_FLOWS: InvestmentFlow[] = [
  { investor: "Stargate",  totalB: 500, color: OPERATOR_COLORS.Stargate,  projects: 8  },
  { investor: "Amazon",    totalB: 200, color: OPERATOR_COLORS.Amazon,    projects: 9  },
  { investor: "Microsoft", totalB: 140, color: OPERATOR_COLORS.Microsoft, projects: 12 },
  { investor: "Google",    totalB: 80,  color: OPERATOR_COLORS.Google,    projects: 11 },
  { investor: "Meta",      totalB: 85,  color: OPERATOR_COLORS.Meta,      projects: 6  },
  { investor: "xAI",       totalB: 18,  color: OPERATOR_COLORS.xAI,       projects: 1  },
  { investor: "Oracle",    totalB: 17,  color: OPERATOR_COLORS.Oracle,    projects: 3  },
  { investor: "CoreWeave", totalB: 15,  color: OPERATOR_COLORS.CoreWeave, projects: 3  },
  { investor: "Other",     totalB: 92,  color: OPERATOR_COLORS.Other,     projects: 4  },
];

export function mwToRadius(mw: number): number {
  return Math.min(Math.max(Math.sqrt(mw / 200) * 5, 6), 22);
}

// Last updated: April 2026
export const DATA_LAST_UPDATED = "2026-04-05";
