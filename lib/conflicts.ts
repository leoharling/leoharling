export interface KeyLocation {
  name: string;
  lat: number;
  lng: number;
  description: string;
  type: "capital" | "city" | "hotspot" | "event";
}

export interface ConflictKPI {
  label: string;
  value: string;
  subtext?: string;
}

export interface ControlledArea {
  label: string;
  positions: [number, number][];
  color: string;
  fillOpacity?: number;
}

export interface RecentEvent {
  lat: number;
  lng: number;
  title: string;
  description: string;
  type: "strike" | "battle" | "humanitarian" | "political";
}

export interface RegionLabel {
  lat: number;
  lng: number;
  text: string;
  fontSize?: number;
}

export interface Conflict {
  id: string;
  name: string;
  shortName: string;
  parties: [string, string];
  startDate: string;
  status: "active-combat" | "high-tension" | "ceasefire";
  statusLabel: string;
  description: string;
  center: [number, number];
  zoom: number;
  color: string;
  /** ISO 3166-1 numeric codes for affected countries */
  countryCodes: string[];
  kpis: ConflictKPI[];
  frontLine?: [number, number][];
  controlledAreas?: ControlledArea[];
  recentEvents?: RecentEvent[];
  regionLabels?: RegionLabel[];
  keyLocations: KeyLocation[];
}

export function getDaysSince(dateStr: string): number {
  const start = new Date(dateStr);
  const now = new Date();
  return Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export const conflicts: Conflict[] = [
  {
    id: "ukraine",
    name: "Russia\u2013Ukraine War",
    shortName: "Ukraine",
    parties: ["Ukraine", "Russia"],
    startDate: "2022-02-24",
    status: "active-combat",
    statusLabel: "Active Combat",
    description:
      "Full-scale Russian invasion of Ukraine \u2014 the largest armed conflict in Europe since World War II.",
    center: [48.5, 36.5],
    zoom: 6,
    color: "#ef4444",
    countryCodes: ["804", "643"], // Ukraine, Russia
    kpis: [
      {
        label: "Est. Military Casualties",
        value: "500,000+",
        subtext: "Both sides combined",
      },
      {
        label: "Civilian Deaths",
        value: "11,500+",
        subtext: "UN OHCHR verified",
      },
      { label: "Refugees Abroad", value: "6.2M", subtext: "UNHCR data" },
      {
        label: "Internally Displaced",
        value: "3.7M",
        subtext: "Within Ukraine",
      },
      {
        label: "Territory Occupied",
        value: "~18%",
        subtext: "Of Ukrainian territory",
      },
    ],
    frontLine: [
      [51.3, 35.2],
      [50.9, 35.8],
      [50.4, 36.3],
      [50.1, 37.0],
      [49.8, 37.6],
      [49.5, 38.1],
      [49.3, 38.4],
      [49.0, 38.5],
      [48.8, 38.3],
      [48.6, 38.0],
      [48.4, 37.9],
      [48.2, 37.7],
      [47.9, 37.3],
      [47.7, 37.0],
      [47.5, 36.7],
      [47.3, 36.2],
      [47.1, 35.7],
      [46.9, 35.2],
      [46.7, 34.8],
      [46.6, 34.3],
      [46.55, 33.8],
      [46.55, 33.4],
    ],
    controlledAreas: [
      {
        label: "Russian-occupied territory",
        color: "#ef4444",
        fillOpacity: 0.12,
        positions: [
          // Front line (west boundary, north to south)
          [51.3, 35.2],
          [50.9, 35.8],
          [50.4, 36.3],
          [50.1, 37.0],
          [49.8, 37.6],
          [49.5, 38.1],
          [49.3, 38.4],
          [49.0, 38.5],
          [48.8, 38.3],
          [48.6, 38.0],
          [48.4, 37.9],
          [48.2, 37.7],
          [47.9, 37.3],
          [47.7, 37.0],
          [47.5, 36.7],
          [47.3, 36.2],
          [47.1, 35.7],
          [46.9, 35.2],
          [46.7, 34.8],
          [46.6, 34.3],
          [46.55, 33.8],
          [46.55, 33.4],
          // Sea of Azov coast eastward
          [46.3, 34.8],
          [46.2, 35.8],
          [46.3, 36.8],
          [46.1, 37.8],
          [46.2, 38.3],
          // Russian border (east/north boundary)
          [46.6, 39.0],
          [47.2, 39.7],
          [48.0, 40.2],
          [48.8, 40.4],
          [49.5, 40.2],
          [50.2, 39.8],
          [50.8, 39.2],
          [51.3, 38.3],
          [51.7, 37.2],
          [52.0, 36.2],
          [51.7, 35.5],
          [51.3, 35.2],
        ],
      },
      {
        label: "Crimea (annexed 2014)",
        color: "#ef4444",
        fillOpacity: 0.18,
        positions: [
          [46.17, 33.59],
          [46.05, 33.15],
          [45.80, 32.72],
          [45.58, 32.58],
          [45.33, 32.50],
          [45.10, 32.62],
          [44.88, 32.90],
          [44.70, 33.20],
          [44.55, 33.55],
          [44.42, 33.78],
          [44.38, 34.05],
          [44.39, 34.30],
          [44.50, 34.55],
          [44.60, 34.75],
          [44.78, 35.00],
          [44.95, 35.20],
          [45.10, 35.50],
          [45.25, 35.90],
          [45.35, 36.25],
          [45.40, 36.55],
          [45.32, 36.70],
          [45.20, 36.60],
          [45.30, 36.30],
          [45.45, 35.80],
          [45.60, 35.30],
          [45.75, 34.70],
          [45.90, 34.20],
          [46.05, 33.80],
          [46.17, 33.59],
        ],
      },
    ],
    recentEvents: [
      {
        lat: 50.0,
        lng: 36.3,
        title: "Kharkiv shelling",
        description:
          "Ongoing missile and drone strikes on civilian infrastructure",
        type: "strike",
      },
      {
        lat: 48.5,
        lng: 37.9,
        title: "Bakhmut-Chasiv Yar axis",
        description: "Active ground combat along the Bakhmut-Chasiv Yar line",
        type: "battle",
      },
      {
        lat: 47.8,
        lng: 37.0,
        title: "Donetsk front",
        description: "Russian advances toward Pokrovsk and Kurakhove",
        type: "battle",
      },
      {
        lat: 47.3,
        lng: 35.5,
        title: "Zaporizhzhia front",
        description: "Positional warfare with heavy artillery exchanges",
        type: "battle",
      },
      {
        lat: 46.6,
        lng: 33.0,
        title: "Dnipro river crossings",
        description: "Ukrainian bridgehead operations on the east bank",
        type: "battle",
      },
      {
        lat: 50.45,
        lng: 30.52,
        title: "Kyiv air defense",
        description: "Regular interception of Russian drones and missiles",
        type: "strike",
      },
    ],
    regionLabels: [
      { lat: 49.0, lng: 39.0, text: "OCCUPIED" },
      { lat: 45.2, lng: 34.0, text: "CRIMEA" },
      { lat: 49.5, lng: 32.0, text: "UKRAINE" },
    ],
    keyLocations: [
      {
        name: "Kyiv",
        lat: 50.45,
        lng: 30.52,
        description: "Capital of Ukraine",
        type: "capital",
      },
      {
        name: "Kharkiv",
        lat: 49.99,
        lng: 36.23,
        description: "Frequent missile strikes, second largest city",
        type: "city",
      },
      {
        name: "Bakhmut",
        lat: 48.6,
        lng: 38.0,
        description: "Heavily contested since 2022",
        type: "hotspot",
      },
      {
        name: "Donetsk",
        lat: 48.0,
        lng: 37.8,
        description: "Russian-occupied since 2014",
        type: "city",
      },
      {
        name: "Zaporizhzhia",
        lat: 47.84,
        lng: 35.14,
        description: "Front line city, nuclear plant nearby",
        type: "city",
      },
      {
        name: "Kherson",
        lat: 46.64,
        lng: 32.62,
        description: "Liberated Nov 2022, under regular shelling",
        type: "city",
      },
      {
        name: "Mariupol",
        lat: 47.1,
        lng: 37.55,
        description: "Destroyed and occupied since May 2022",
        type: "hotspot",
      },
      {
        name: "Odesa",
        lat: 46.48,
        lng: 30.73,
        description: "Major port city, missile targets",
        type: "city",
      },
      {
        name: "Dnipro",
        lat: 48.46,
        lng: 35.04,
        description: "Key logistics hub",
        type: "city",
      },
      {
        name: "Luhansk",
        lat: 48.57,
        lng: 39.31,
        description: "Russian-occupied regional capital",
        type: "city",
      },
      {
        name: "Pokrovsk",
        lat: 48.28,
        lng: 37.18,
        description: "Key logistics node under threat",
        type: "hotspot",
      },
      {
        name: "Avdiivka",
        lat: 48.14,
        lng: 37.74,
        description: "Fell to Russian forces Feb 2024",
        type: "event",
      },
      {
        name: "Sevastopol",
        lat: 44.6,
        lng: 33.5,
        description: "Black Sea Fleet base, Crimea",
        type: "event",
      },
    ],
  },
  {
    id: "middleeast",
    name: "Israel\u2013Palestine & Regional Conflict",
    shortName: "Middle East",
    parties: ["Israel", "Hamas / Hezbollah / Iran"],
    startDate: "2023-10-07",
    status: "active-combat",
    statusLabel: "Active Combat",
    description:
      "Multi-front conflict following the October 7 attack, expanding to Lebanon and regional tensions with Iran.",
    center: [31.5, 34.8],
    zoom: 7,
    color: "#f97316",
    countryCodes: ["376", "275", "422", "760", "364", "887"], // Israel, Palestine, Lebanon, Syria, Iran, Yemen
    kpis: [
      {
        label: "Deaths in Gaza",
        value: "45,000+",
        subtext: "Gaza Health Ministry",
      },
      {
        label: "Israeli Deaths (Oct 7)",
        value: "1,200",
        subtext: "Israeli government",
      },
      {
        label: "Displaced in Gaza",
        value: "1.9M",
        subtext: "~85% of population",
      },
      {
        label: "Lebanon Deaths",
        value: "4,000+",
        subtext: "Lebanese Health Ministry",
      },
      { label: "Hostages Taken", value: "251", subtext: "Oct 7, 2023" },
    ],
    controlledAreas: [
      {
        label: "Gaza Strip",
        color: "#f97316",
        fillOpacity: 0.25,
        positions: [
          [31.59, 34.22],
          [31.59, 34.56],
          [31.35, 34.54],
          [31.22, 34.35],
          [31.22, 34.22],
          [31.59, 34.22],
        ],
      },
      {
        label: "Southern Lebanon conflict zone",
        color: "#f97316",
        fillOpacity: 0.1,
        positions: [
          [33.9, 35.1],
          [33.9, 36.0],
          [33.3, 36.0],
          [33.1, 35.8],
          [33.1, 35.1],
          [33.9, 35.1],
        ],
      },
    ],
    recentEvents: [
      {
        lat: 31.45,
        lng: 34.4,
        title: "Gaza bombardment",
        description: "Continuing airstrikes and ground operations in Gaza",
        type: "strike",
      },
      {
        lat: 31.25,
        lng: 34.28,
        title: "Rafah operations",
        description: "Military operations near the Egyptian border",
        type: "battle",
      },
      {
        lat: 33.5,
        lng: 35.5,
        title: "South Lebanon strikes",
        description: "Israeli strikes targeting Hezbollah infrastructure",
        type: "strike",
      },
      {
        lat: 31.52,
        lng: 34.44,
        title: "Humanitarian crisis",
        description: "Severe food and medical supply shortages",
        type: "humanitarian",
      },
      {
        lat: 15.5,
        lng: 42.5,
        title: "Red Sea / Bab el-Mandeb",
        description: "Houthi attacks on international shipping lanes",
        type: "strike",
      },
    ],
    regionLabels: [
      { lat: 31.4, lng: 34.39, text: "GAZA", fontSize: 10 },
      { lat: 33.5, lng: 35.5, text: "LEBANON", fontSize: 10 },
      { lat: 32.0, lng: 35.2, text: "ISRAEL" },
    ],
    keyLocations: [
      {
        name: "Gaza City",
        lat: 31.52,
        lng: 34.44,
        description: "Extensive bombardment since Oct 2023",
        type: "hotspot",
      },
      {
        name: "Rafah",
        lat: 31.3,
        lng: 34.25,
        description: "Humanitarian corridor and crossing",
        type: "hotspot",
      },
      {
        name: "Khan Younis",
        lat: 31.35,
        lng: 34.3,
        description: "Major ground operations",
        type: "hotspot",
      },
      {
        name: "Tel Aviv",
        lat: 32.08,
        lng: 34.78,
        description: "Israel's largest metro area",
        type: "capital",
      },
      {
        name: "Jerusalem",
        lat: 31.77,
        lng: 35.23,
        description: "Contested capital",
        type: "capital",
      },
      {
        name: "Beirut",
        lat: 33.89,
        lng: 35.5,
        description: "Israeli strikes on Hezbollah targets",
        type: "hotspot",
      },
      {
        name: "Tehran",
        lat: 35.69,
        lng: 51.39,
        description: "Regional escalation with Iran",
        type: "event",
      },
      {
        name: "Sana'a",
        lat: 15.37,
        lng: 44.19,
        description: "Houthi attacks on Red Sea shipping",
        type: "event",
      },
      {
        name: "Nablus",
        lat: 32.22,
        lng: 35.26,
        description: "West Bank raids and tensions",
        type: "event",
      },
    ],
  },
  {
    id: "sudan",
    name: "Sudan Civil War",
    shortName: "Sudan",
    parties: ["Sudanese Armed Forces", "Rapid Support Forces"],
    startDate: "2023-04-15",
    status: "active-combat",
    statusLabel: "Active Combat",
    description:
      "Power struggle between rival military factions causing one of the world's worst humanitarian crises.",
    center: [15.5, 32.5],
    zoom: 6,
    color: "#f59e0b",
    countryCodes: ["729", "728", "148"], // Sudan, South Sudan, Chad
    kpis: [
      {
        label: "Est. Deaths",
        value: "15,000+",
        subtext: "Armed Conflict Location data",
      },
      {
        label: "Displaced",
        value: "8M+",
        subtext: "Largest displacement crisis globally",
      },
      {
        label: "Food Insecure",
        value: "25M",
        subtext: "Half the population",
      },
      {
        label: "Refugees",
        value: "1.5M+",
        subtext: "Fled to neighboring countries",
      },
    ],
    recentEvents: [
      {
        lat: 15.59,
        lng: 32.53,
        title: "Battle for Khartoum",
        description: "Ongoing urban warfare in the capital",
        type: "battle",
      },
      {
        lat: 13.63,
        lng: 25.35,
        title: "El-Fasher siege",
        description: "RSF siege of the last SAF stronghold in Darfur",
        type: "battle",
      },
      {
        lat: 14.0,
        lng: 30.0,
        title: "Mass displacement",
        description: "Millions fleeing violence in Kordofan and Darfur",
        type: "humanitarian",
      },
      {
        lat: 13.0,
        lng: 23.0,
        title: "Darfur atrocities",
        description: "Reports of ethnic violence and mass killings",
        type: "humanitarian",
      },
    ],
    regionLabels: [
      { lat: 13.5, lng: 25.0, text: "DARFUR" },
      { lat: 18.0, lng: 34.0, text: "SUDAN" },
    ],
    keyLocations: [
      {
        name: "Khartoum",
        lat: 15.59,
        lng: 32.53,
        description: "Capital, heavily fought over",
        type: "capital",
      },
      {
        name: "Port Sudan",
        lat: 19.62,
        lng: 37.22,
        description: "De facto government seat",
        type: "city",
      },
      {
        name: "El-Fasher",
        lat: 13.63,
        lng: 25.35,
        description: "Last SAF stronghold in Darfur, under siege",
        type: "hotspot",
      },
      {
        name: "Nyala",
        lat: 12.05,
        lng: 24.88,
        description: "RSF-controlled, humanitarian crisis",
        type: "hotspot",
      },
      {
        name: "El Geneina",
        lat: 13.45,
        lng: 22.45,
        description: "Site of mass atrocities",
        type: "event",
      },
      {
        name: "Omdurman",
        lat: 15.65,
        lng: 32.48,
        description: "Twin city of Khartoum, active fighting",
        type: "hotspot",
      },
      {
        name: "Wad Madani",
        lat: 14.4,
        lng: 33.52,
        description: "Fell to RSF Dec 2023",
        type: "event",
      },
    ],
  },
  {
    id: "myanmar",
    name: "Myanmar Civil War",
    shortName: "Myanmar",
    parties: ["Military Junta (Tatmadaw)", "Resistance Forces (NUG/PDF)"],
    startDate: "2021-02-01",
    status: "active-combat",
    statusLabel: "Active Combat",
    description:
      "Nationwide resistance against military coup, with ethnic armed organizations and people's defence forces.",
    center: [19.8, 96.1],
    zoom: 6,
    color: "#a855f7",
    countryCodes: ["104", "764"], // Myanmar, Thailand
    kpis: [
      {
        label: "Est. Deaths",
        value: "50,000+",
        subtext: "Since Feb 2021 coup",
      },
      {
        label: "Displaced",
        value: "2.6M",
        subtext: "Internal displacement",
      },
      {
        label: "Political Prisoners",
        value: "20,000+",
        subtext: "AAPP data",
      },
      {
        label: "Junta Control",
        value: "~40%",
        subtext: "Of territory, declining",
      },
    ],
    recentEvents: [
      {
        lat: 22.0,
        lng: 97.0,
        title: "Shan State offensive",
        description:
          "Resistance forces advancing through northern Shan State",
        type: "battle",
      },
      {
        lat: 25.4,
        lng: 97.4,
        title: "Kachin clashes",
        description: "KIA forces engaging junta troops",
        type: "battle",
      },
      {
        lat: 19.0,
        lng: 95.0,
        title: "Rakhine State",
        description: "Arakan Army expanding territorial control",
        type: "battle",
      },
      {
        lat: 17.0,
        lng: 96.5,
        title: "Karen State",
        description: "KNLA controlling border crossings",
        type: "political",
      },
    ],
    regionLabels: [
      { lat: 25.0, lng: 97.0, text: "KACHIN" },
      { lat: 22.5, lng: 98.0, text: "SHAN" },
      { lat: 19.0, lng: 94.5, text: "RAKHINE" },
    ],
    keyLocations: [
      {
        name: "Naypyidaw",
        lat: 19.76,
        lng: 96.07,
        description: "Capital, junta headquarters",
        type: "capital",
      },
      {
        name: "Yangon",
        lat: 16.87,
        lng: 96.2,
        description: "Largest city, protest center",
        type: "city",
      },
      {
        name: "Mandalay",
        lat: 21.97,
        lng: 96.08,
        description: "Second city, resistance activity",
        type: "city",
      },
      {
        name: "Myitkyina",
        lat: 25.38,
        lng: 97.39,
        description: "Kachin state capital, active fighting",
        type: "hotspot",
      },
      {
        name: "Lashio",
        lat: 22.93,
        lng: 97.75,
        description: "Captured by resistance forces in 2024",
        type: "event",
      },
      {
        name: "Sittwe",
        lat: 20.15,
        lng: 92.9,
        description: "Rakhine state capital, Arakan Army activity",
        type: "hotspot",
      },
      {
        name: "Myawaddy",
        lat: 16.69,
        lng: 98.51,
        description: "Key border crossing with Thailand",
        type: "event",
      },
    ],
  },
];
