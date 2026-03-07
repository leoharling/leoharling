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
  /** Optional date string, e.g. "Feb 2024" or "2024-10-01" */
  date?: string;
}

export interface RegionLabel {
  lat: number;
  lng: number;
  text: string;
  fontSize?: number;
}

export interface TimelinePhase {
  id: string;
  label: string;
  startDate: string;
  endDate?: string;
  description: string;
  escalationLevel: 1 | 2 | 3 | 4 | 5;
}

export interface TimelineMilestone {
  date: string;
  title: string;
  description: string;
  phase: string;
  category: "military" | "political" | "humanitarian" | "territorial" | "diplomatic";
  significance: "major" | "moderate";
}

export interface EscalationIndicator {
  level: "critical" | "high" | "elevated" | "moderate" | "low";
  trend: "escalating" | "stable" | "de-escalating";
  lastAssessed: string;
  summary: string;
  factors: { label: string; direction: "up" | "stable" | "down"; detail?: string }[];
}

export interface ConflictActor {
  name: string;
  type: "state" | "non-state" | "proxy" | "international-org";
  side: string;
  objectives: string;
  backedBy?: string[];
  strength?: string;
}

export interface HumanitarianData {
  casualties: {
    military?: { value: string; subtext?: string };
    civilian?: { value: string; subtext?: string };
  };
  displacement: {
    internal?: { value: string; subtext?: string };
    refugees?: { value: string; subtext?: string };
  };
  foodSecurity?: { value: string; subtext?: string; severity?: "crisis" | "emergency" | "famine" };
  aidAccess?: { status: "open" | "restricted" | "blocked"; detail: string };
  lastUpdated: string;
}

export interface DiplomaticEntry {
  type: "negotiation" | "sanction" | "arms-delivery" | "un-action" | "ceasefire-attempt" | "statement";
  date: string;
  title: string;
  detail: string;
  actors: string[];
  status?: "active" | "stalled" | "failed" | "succeeded";
}

export interface DiplomaticLandscape {
  peaceStatus: { label: string; detail: string; lastTalkDate?: string };
  entries: DiplomaticEntry[];
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
  timeline?: { phases: TimelinePhase[]; milestones: TimelineMilestone[] };
  escalation?: EscalationIndicator;
  actors?: ConflictActor[];
  humanitarian?: HumanitarianData;
  diplomatic?: DiplomaticLandscape;
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
    // Front line and occupied territory use external GeoJSON from DeepStateMap
    controlledAreas: [],
    recentEvents: [
      { lat: 50.0, lng: 36.3, title: "Kharkiv shelling", description: "Ongoing missile and drone strikes on civilian infrastructure", type: "strike" },
      { lat: 48.5, lng: 37.9, title: "Bakhmut-Chasiv Yar axis", description: "Active ground combat along the Bakhmut-Chasiv Yar line", type: "battle" },
      { lat: 47.8, lng: 37.0, title: "Donetsk front", description: "Russian advances toward Pokrovsk and Kurakhove", type: "battle", date: "Since Oct 2024" },
      { lat: 47.3, lng: 35.5, title: "Zaporizhzhia front", description: "Positional warfare with heavy artillery exchanges", type: "battle" },
      { lat: 46.6, lng: 33.0, title: "Dnipro river crossings", description: "Ukrainian bridgehead operations on the east bank", type: "battle", date: "Since Nov 2023" },
      { lat: 50.45, lng: 30.52, title: "Kyiv air defense", description: "Regular interception of Russian drones and missiles", type: "strike" },
      { lat: 46.48, lng: 30.73, title: "Odesa port strikes", description: "Russian missile strikes on port and grain infrastructure", type: "strike" },
      { lat: 51.3, lng: 35.3, title: "Sumy border clashes", description: "Cross-border shelling and sabotage operations", type: "battle" },
      { lat: 47.1, lng: 37.55, title: "Mariupol — humanitarian", description: "Ongoing humanitarian crisis in occupied city", type: "humanitarian", date: "Since May 2022" },
      { lat: 51.7, lng: 36.2, title: "Kursk incursion", description: "Ukrainian forces holding positions in Kursk Oblast, Russia", type: "battle", date: "Since Aug 2024" },
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
    timeline: {
      phases: [
        { id: "ua-1", label: "Full-Scale Invasion", startDate: "2022-02-24", endDate: "2022-11-11", description: "Russia launched multi-axis invasion; Ukraine halted advance on Kyiv.", escalationLevel: 5 },
        { id: "ua-2", label: "Counteroffensives", startDate: "2022-11-12", endDate: "2023-06-03", description: "Ukraine liberated Kherson and parts of Kharkiv Oblast.", escalationLevel: 4 },
        { id: "ua-3", label: "Attritional Stalemate", startDate: "2023-06-04", endDate: "2024-08-05", description: "Summer counteroffensive yielded limited gains; grinding attrition.", escalationLevel: 4 },
        { id: "ua-4", label: "Kursk & Donbas Push", startDate: "2024-08-06", endDate: "2025-11-19", description: "Ukraine's Kursk incursion; Russia accelerated Donbas advances.", escalationLevel: 5 },
        { id: "ua-5", label: "Peace Negotiations", startDate: "2025-11-20", description: "Trump's 28-point peace plan catalyzed active negotiations.", escalationLevel: 4 },
      ],
      milestones: [
        { date: "2022-02-24", title: "Russia Invades Ukraine", description: "Full-scale invasion launched on multiple fronts.", phase: "ua-1", category: "military", significance: "major" },
        { date: "2022-04-02", title: "Withdrawal from Kyiv", description: "Russia refocused operations on Donbas and south.", phase: "ua-1", category: "military", significance: "major" },
        { date: "2022-09-30", title: "Russia Annexes Four Oblasts", description: "Sham referendums condemned internationally.", phase: "ua-1", category: "territorial", significance: "major" },
        { date: "2022-11-11", title: "Liberation of Kherson", description: "Only regional capital Russia had seized recaptured.", phase: "ua-2", category: "military", significance: "major" },
        { date: "2023-06-04", title: "Summer Counteroffensive", description: "Deeply layered Russian defenses limited progress.", phase: "ua-3", category: "military", significance: "major" },
        { date: "2024-08-06", title: "Kursk Incursion", description: "Surprise cross-border assault into Russia.", phase: "ua-4", category: "military", significance: "major" },
        { date: "2024-11-01", title: "North Korean Troops Deploy", description: "~11,000 DPRK soldiers deployed to Kursk.", phase: "ua-4", category: "military", significance: "major" },
        { date: "2025-11-20", title: "28-Point Peace Plan", description: "US presented comprehensive peace framework.", phase: "ua-5", category: "diplomatic", significance: "major" },
        { date: "2025-12-28", title: "Mar-a-Lago Summit", description: "Zelensky stated 90% of deal agreed.", phase: "ua-5", category: "diplomatic", significance: "major" },
      ],
    },
    escalation: {
      level: "high",
      trend: "de-escalating",
      lastAssessed: "2026-03-01",
      summary: "Active peace negotiations offer the best prospect since 2022, though territorial disputes remain a fundamental obstacle.",
      factors: [
        { label: "Peace negotiations", direction: "up", detail: "28-point plan with 90% reportedly agreed" },
        { label: "Russian manpower", direction: "up", detail: "Losses exceeding recruitment capacity" },
        { label: "Territorial pressure", direction: "up", detail: "Russia gained ~5,000 sq km in 2025" },
        { label: "Western support", direction: "stable", detail: "Aid continues amid political uncertainty" },
      ],
    },
    actors: [
      { name: "Ukraine", type: "state", side: "Defender", objectives: "Restore territorial integrity and secure security guarantees.", backedBy: ["US", "EU", "UK"], strength: "~800,000 active" },
      { name: "Russia", type: "state", side: "Aggressor", objectives: "Retain occupied territories and prevent NATO membership.", backedBy: ["North Korea", "Iran", "China"], strength: "~1.3M deployed" },
      { name: "North Korea", type: "state", side: "Russian-aligned", objectives: "Gain battlefield experience and strengthen Russia partnership.", backedBy: ["Russia"], strength: "~11,000 deployed" },
      { name: "United States", type: "state", side: "Mediator", objectives: "Broker peace deal while securing strategic interests.", strength: ">$60B in military aid" },
      { name: "NATO / EU", type: "international-org", side: "Ukraine supporter", objectives: "Support sovereignty while preventing direct confrontation." },
    ],
    humanitarian: {
      casualties: {
        military: { value: "~1.7M+", subtext: "Combined both sides (CSIS est.)" },
        civilian: { value: "~56,000", subtext: "UN OHCHR verified" },
      },
      displacement: {
        internal: { value: "3.7M", subtext: "Within Ukraine" },
        refugees: { value: "5.9M", subtext: "Across Europe" },
      },
      foodSecurity: { value: "Moderate", subtext: "Global grain prices affected; corridors partially restored", severity: "crisis" },
      aidAccess: { status: "restricted", detail: "Access to occupied territories severely limited." },
      lastUpdated: "Feb 2026",
    },
    diplomatic: {
      peaceStatus: { label: "Negotiations Active", detail: "28-point plan with 90% reportedly agreed. Territory remains key issue.", lastTalkDate: "2025-12-28" },
      entries: [
        { type: "sanction", date: "2022-02-25", title: "Western Sanctions on Russia", detail: "Unprecedented sanctions including SWIFT disconnection and asset freezes.", actors: ["US", "EU", "UK"], status: "active" },
        { type: "arms-delivery", date: "2023-01-25", title: "Western Tanks Pledged", detail: "Leopard 2 and M1 Abrams deliveries announced.", actors: ["US", "Germany"], status: "succeeded" },
        { type: "ceasefire-attempt", date: "2025-05-08", title: "30-Day Ceasefire Demand", detail: "Russia rejected Trump's ultimatum.", actors: ["US", "Russia"], status: "failed" },
        { type: "negotiation", date: "2025-11-20", title: "28-Point Peace Plan", detail: "Comprehensive framework on territory, security, and NATO.", actors: ["US", "Ukraine", "Russia"], status: "active" },
        { type: "negotiation", date: "2025-12-28", title: "Mar-a-Lago Summit", detail: "90% of deal terms reportedly agreed.", actors: ["US", "Ukraine"], status: "active" },
      ],
    },
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
    center: [31.0, 42.0],
    zoom: 5,
    color: "#f97316",
    countryCodes: ["376", "275", "422", "760", "364", "887", "368"], // Israel, Palestine, Lebanon, Syria, Iran, Yemen, Iraq
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
    // Gaza uses external GeoJSON (public/geojson/gaza.geojson); Lebanon below is hand-drawn
    controlledAreas: [
      {
        label: "Southern Lebanon conflict zone (south of Litani River)",
        color: "#f97316",
        fillOpacity: 0.1,
        positions: [
          // Follows Litani River (north boundary) → coast → Blue Line (south) → east
          [33.35, 35.22],
          [33.37, 35.30],
          [33.40, 35.38],
          [33.38, 35.48],
          [33.35, 35.55],
          [33.30, 35.62],
          [33.32, 35.72],
          [33.35, 35.82],
          [33.38, 35.88],
          [33.36, 35.95],
          // Eastern boundary
          [33.28, 35.87],
          [33.20, 35.85],
          [33.12, 35.82],
          [33.08, 35.75],
          [33.10, 35.62],
          [33.08, 35.50],
          [33.06, 35.42],
          [33.09, 35.33],
          [33.10, 35.20],
          // Coast (west)
          [33.17, 35.15],
          [33.27, 35.18],
          [33.35, 35.22],
        ],
      },
    ],
    recentEvents: [
      { lat: 31.45, lng: 34.4, title: "Gaza bombardment", description: "Continuing airstrikes and ground operations in Gaza", type: "strike", date: "Since Oct 2023" },
      { lat: 31.25, lng: 34.28, title: "Rafah operations", description: "Military operations near the Egyptian border", type: "battle", date: "May 2024" },
      { lat: 33.3, lng: 35.6, title: "South Lebanon strikes", description: "Israeli strikes targeting Hezbollah infrastructure", type: "strike", date: "Since Sep 2024" },
      { lat: 31.52, lng: 34.44, title: "Humanitarian crisis", description: "Severe food, water and medical supply shortages", type: "humanitarian" },
      { lat: 15.5, lng: 42.5, title: "Red Sea / Bab el-Mandeb", description: "Houthi attacks on international shipping lanes", type: "strike", date: "Since Nov 2023" },
      { lat: 35.69, lng: 51.39, title: "Iran strikes", description: "US/Israeli strikes on Iranian nuclear and military sites", type: "strike", date: "2025" },
      { lat: 32.65, lng: 51.68, title: "Isfahan strikes", description: "Strikes reported near Isfahan nuclear facilities", type: "strike", date: "Apr 2024" },
      { lat: 27.18, lng: 56.27, title: "Strait of Hormuz", description: "Heightened naval tensions in critical oil shipping lane", type: "political" },
      { lat: 33.33, lng: 44.37, title: "Baghdad — Iran-backed militias", description: "Pro-Iran militia activity and US base attacks", type: "battle" },
      { lat: 34.8, lng: 36.7, title: "Syria — Israeli strikes", description: "Israeli strikes on Iranian assets in Syria", type: "strike" },
      { lat: 32.22, lng: 35.26, title: "West Bank raids", description: "IDF operations in Nablus, Jenin, Tulkarm", type: "battle" },
      { lat: 29.5, lng: 34.9, title: "Eilat / Aqaba", description: "Houthi missile and drone interceptions", type: "strike", date: "Since Jan 2024" },
    ],
    regionLabels: [
      { lat: 31.4, lng: 34.39, text: "GAZA", fontSize: 10 },
      { lat: 33.3, lng: 35.5, text: "LEBANON", fontSize: 10 },
      { lat: 32.0, lng: 35.2, text: "ISRAEL" },
      { lat: 34.5, lng: 51.5, text: "IRAN", fontSize: 12 },
      { lat: 15.0, lng: 44.0, text: "YEMEN", fontSize: 10 },
      { lat: 33.5, lng: 44.0, text: "IRAQ", fontSize: 10 },
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
        description: "Capital of Iran — military and nuclear tensions",
        type: "capital",
      },
      {
        name: "Isfahan",
        lat: 32.65,
        lng: 51.68,
        description: "Nuclear facilities and military targets",
        type: "hotspot",
      },
      {
        name: "Bandar Abbas",
        lat: 27.18,
        lng: 56.27,
        description: "Major naval base near Strait of Hormuz",
        type: "city",
      },
      {
        name: "Natanz",
        lat: 33.51,
        lng: 51.73,
        description: "Uranium enrichment facility",
        type: "hotspot",
      },
      {
        name: "Damascus",
        lat: 33.51,
        lng: 36.29,
        description: "Israeli strikes on Iranian assets",
        type: "hotspot",
      },
      {
        name: "Baghdad",
        lat: 33.33,
        lng: 44.37,
        description: "Pro-Iran militia activity",
        type: "city",
      },
      {
        name: "Sana'a",
        lat: 15.37,
        lng: 44.19,
        description: "Houthi capital, US/coalition strikes",
        type: "hotspot",
      },
      {
        name: "Hodeidah",
        lat: 14.8,
        lng: 42.95,
        description: "Houthi-controlled Red Sea port",
        type: "event",
      },
      {
        name: "Nablus",
        lat: 32.22,
        lng: 35.26,
        description: "West Bank raids and tensions",
        type: "event",
      },
      {
        name: "Jenin",
        lat: 32.46,
        lng: 35.3,
        description: "Frequent IDF operations",
        type: "event",
      },
      {
        name: "Tyre",
        lat: 33.27,
        lng: 35.2,
        description: "Southern Lebanon conflict zone",
        type: "event",
      },
    ],
    timeline: {
      phases: [
        { id: "me-1", label: "Oct 7 & Bombardment", startDate: "2023-10-07", endDate: "2024-01-25", description: "Hamas attacked Israel; Israel launched devastating air and ground campaign.", escalationLevel: 5 },
        { id: "me-2", label: "Ground Invasion & Regional Spread", startDate: "2024-01-26", endDate: "2025-01-18", description: "Ground operations expanded across Gaza; conflict spread to Lebanon, Yemen, Syria.", escalationLevel: 5 },
        { id: "me-3", label: "First Ceasefire", startDate: "2025-01-19", endDate: "2025-03-17", description: "US-brokered ceasefire with hostage releases and partial aid restoration.", escalationLevel: 3 },
        { id: "me-4", label: "Ceasefire Collapse", startDate: "2025-03-18", endDate: "2025-10-09", description: "Israel resumed military campaign after negotiations broke down.", escalationLevel: 5 },
        { id: "me-5", label: "Second Ceasefire & Iran War", startDate: "2025-10-10", description: "Second ceasefire holds while US-Israel launched strikes on Iran.", escalationLevel: 5 },
      ],
      milestones: [
        { date: "2023-10-07", title: "Hamas October 7 Attack", description: "1,195 killed and 247 hostages taken in deadliest day in Israeli history.", phase: "me-1", category: "military", significance: "major" },
        { date: "2023-10-27", title: "Ground Invasion of Gaza", description: "Israel launched large-scale ground operation into northern Gaza.", phase: "me-1", category: "military", significance: "major" },
        { date: "2024-01-26", title: "ICJ Provisional Measures", description: "Court ordered Israel to prevent genocide and ensure humanitarian aid.", phase: "me-2", category: "diplomatic", significance: "major" },
        { date: "2024-09-27", title: "Nasrallah Assassinated", description: "Israel killed Hezbollah leader in massive Beirut airstrike.", phase: "me-2", category: "military", significance: "major" },
        { date: "2025-01-19", title: "First Gaza Ceasefire", description: "Three-phase ceasefire began with hostage releases.", phase: "me-3", category: "diplomatic", significance: "major" },
        { date: "2025-03-18", title: "Israel Resumes Campaign", description: "Ceasefire collapsed; 400+ killed on first day of renewed assault.", phase: "me-4", category: "military", significance: "major" },
        { date: "2025-08-15", title: "Famine Declared in Gaza", description: "IPC declared famine conditions in Gaza City.", phase: "me-4", category: "humanitarian", significance: "major" },
        { date: "2025-10-10", title: "Second Ceasefire", description: "All 20 living hostages released; stabilization force planned.", phase: "me-5", category: "diplomatic", significance: "major" },
        { date: "2026-02-28", title: "US-Israel Strike Iran", description: "Coordinated strikes on Iranian nuclear sites and leadership.", phase: "me-5", category: "military", significance: "major" },
      ],
    },
    escalation: {
      level: "critical",
      trend: "escalating",
      lastAssessed: "2026-03-01",
      summary: "Gaza ceasefire nominally holds, but US-Israeli war on Iran has dramatically escalated the regional crisis.",
      factors: [
        { label: "Iran war", direction: "up", detail: "US-Israeli strikes on Iran since Feb 2026" },
        { label: "Gaza ceasefire fragility", direction: "up", detail: "Phase 2 on disarmament and withdrawal stalled" },
        { label: "Humanitarian catastrophe", direction: "stable", detail: "75,000+ killed; famine persists" },
        { label: "Axis of Resistance weakened", direction: "down", detail: "Hezbollah degraded; Assad fell; Iran under attack" },
        { label: "West Bank instability", direction: "up", detail: "Escalating violence and settlement expansion" },
      ],
    },
    actors: [
      { name: "Israel", type: "state", side: "Israeli Government", objectives: "Destroy Hamas military capacity, recover hostages, establish new Gaza security architecture.", backedBy: ["United States"], strength: "~170,000 active IDF" },
      { name: "Hamas", type: "non-state", side: "Palestinian Resistance", objectives: "Survive as political entity, secure prisoner releases, end Gaza blockade.", backedBy: ["Iran", "Qatar"], strength: "Severely degraded from 30-40K fighters" },
      { name: "United States", type: "state", side: "Mediator / Israeli ally", objectives: "Broker peace deal, neutralize Iran's nuclear program.", strength: "Lead broker; massive military presence" },
      { name: "Iran", type: "state", side: "Axis of Resistance", objectives: "Maintain regional influence through proxies, advance nuclear program.", backedBy: ["Russia", "China"], strength: "Severely weakened by 2026 strikes" },
      { name: "Hezbollah", type: "non-state", side: "Axis of Resistance", objectives: "Defend Lebanon and maintain armed resistance as Iran's regional deterrent.", backedBy: ["Iran"], strength: "Dramatically weakened; Nasrallah killed" },
      { name: "Palestinian Authority", type: "state", side: "Palestinian", objectives: "Reassert governance over Gaza and advance statehood.", backedBy: ["EU", "Arab League"], strength: "Limited forces in West Bank" },
    ],
    humanitarian: {
      casualties: {
        military: { value: "2,039+", subtext: "Israeli military & civilian (incl. Oct 7)" },
        civilian: { value: "73,000+", subtext: "Palestinian deaths per Gaza Health Ministry" },
      },
      displacement: {
        internal: { value: "1.9M", subtext: "~90% of Gaza's 2.3M displaced" },
        refugees: { value: "N/A", subtext: "Gaza borders largely sealed" },
      },
      foodSecurity: { value: "100% of Gaza", subtext: "Entire population at crisis or worse; famine declared Aug 2025", severity: "famine" },
      aidAccess: { status: "restricted", detail: "Improved during ceasefire but infrastructure destroyed and services collapsed." },
      lastUpdated: "Feb 2026",
    },
    diplomatic: {
      peaceStatus: { label: "Ceasefire Holding / Region Escalating", detail: "Gaza ceasefire holds but Phase 2 stalled. US-Iran war overshadows peace process.", lastTalkDate: "2025-10-10" },
      entries: [
        { type: "un-action", date: "2024-01-26", title: "ICJ Genocide Provisional Measures", detail: "Court ordered Israel to prevent genocide and ensure humanitarian access.", actors: ["ICJ", "South Africa"], status: "active" },
        { type: "ceasefire-attempt", date: "2025-01-19", title: "First Gaza Ceasefire", detail: "Three-phase ceasefire with hostage releases; collapsed March 18.", actors: ["US", "Israel", "Hamas", "Qatar"], status: "failed" },
        { type: "negotiation", date: "2025-09-29", title: "Trump's Gaza Peace Plan", detail: "20-point plan with stabilization force and technocratic governance.", actors: ["US", "Israel"], status: "active" },
        { type: "ceasefire-attempt", date: "2025-10-10", title: "Second Gaza Ceasefire", detail: "20 living hostages released; Phase 2 on disarmament pending.", actors: ["US", "Israel", "Hamas"], status: "active" },
        { type: "statement", date: "2026-02-28", title: "US-Israel Launch Iran Strikes", detail: "Coordinated strikes on Iranian leadership, nuclear sites, and military.", actors: ["US", "Israel", "Iran"], status: "active" },
      ],
    },
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
        description: "Reports of ethnic violence and mass killings in West Darfur",
        type: "humanitarian",
      },
      {
        lat: 19.62,
        lng: 37.22,
        title: "Port Sudan — government seat",
        description: "SAF relocated government functions to Port Sudan",
        type: "political",
      },
      {
        lat: 14.4,
        lng: 33.52,
        title: "Gezira State",
        description: "RSF atrocities and mass displacement in agricultural heartland",
        type: "humanitarian",
      },
      {
        lat: 12.05,
        lng: 24.88,
        title: "Nyala battles",
        description: "Continued RSF control, SAF airstrikes on city",
        type: "battle",
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
    timeline: {
      phases: [
        { id: "sd-1", label: "Outbreak & Khartoum", startDate: "2023-04-15", endDate: "2023-12-31", description: "RSF seized airport and palace; civil war devastated the capital.", escalationLevel: 5 },
        { id: "sd-2", label: "RSF Expansion & Darfur Atrocities", startDate: "2024-01-01", endDate: "2024-09-30", description: "RSF expanded across Darfur with mass atrocities; El Fasher besieged.", escalationLevel: 5 },
        { id: "sd-3", label: "SAF Counteroffensive", startDate: "2024-10-01", endDate: "2025-09-11", description: "SAF recaptured Khartoum tri-cities; RSF took El Fasher.", escalationLevel: 5 },
        { id: "sd-4", label: "Quad Roadmap & Stalemate", startDate: "2025-09-12", description: "Peace roadmap issued but fighting continues unabated.", escalationLevel: 5 },
      ],
      milestones: [
        { date: "2023-04-15", title: "Civil War Erupts", description: "RSF launched attacks in Khartoum, seizing airport and presidential palace.", phase: "sd-1", category: "military", significance: "major" },
        { date: "2023-11-15", title: "RSF Takes El Geneina", description: "Mass killings of Masalit civilians in West Darfur capital.", phase: "sd-1", category: "humanitarian", significance: "major" },
        { date: "2024-05-10", title: "Siege of El Fasher Begins", description: "RSF encircled last SAF-held Darfur capital, trapping 260,000.", phase: "sd-2", category: "military", significance: "major" },
        { date: "2024-10-01", title: "SAF Khartoum Counteroffensive", description: "SAF launched coordinated offensive to recapture the capital.", phase: "sd-3", category: "military", significance: "major" },
        { date: "2025-01-15", title: "SAF Recaptures Omdurman", description: "RSF driven from Omdurman; SAF regained Khartoum tri-cities.", phase: "sd-3", category: "military", significance: "major" },
        { date: "2025-08-01", title: "Famine Confirmed", description: "IPC Phase 5 famine in El Fasher and Kadugli.", phase: "sd-3", category: "humanitarian", significance: "major" },
        { date: "2025-09-12", title: "Quad Roadmap Issued", description: "US, Saudi, UAE, Egypt peace plan: truce, ceasefire, civilian transition.", phase: "sd-4", category: "diplomatic", significance: "major" },
        { date: "2025-10-26", title: "RSF Captures El Fasher", description: "18-month siege ended with mass killings of civilians.", phase: "sd-4", category: "military", significance: "major" },
      ],
    },
    escalation: {
      level: "critical",
      trend: "escalating",
      lastAssessed: "2026-03-01",
      summary: "World's worst humanitarian catastrophe with up to 400,000 killed and 14M displaced. Neither side willing to negotiate.",
      factors: [
        { label: "Famine", direction: "up", detail: "21M+ face acute food insecurity; famine spreading" },
        { label: "Foreign interference", direction: "up", detail: "UAE backs RSF; Egypt, Turkey, Iran support SAF" },
        { label: "Territorial fragmentation", direction: "up", detail: "Neither side can achieve decisive victory" },
        { label: "Aid access", direction: "up", detail: "Both sides systematically block humanitarian aid" },
        { label: "Mass atrocities", direction: "stable", detail: "Ethnic targeting continues in Darfur" },
      ],
    },
    actors: [
      { name: "SAF", type: "state", side: "Government", objectives: "Defeat RSF and restore control over entire country.", backedBy: ["Egypt", "Iran", "Turkey"], strength: "~200,000 troops" },
      { name: "RSF", type: "non-state", side: "Paramilitary", objectives: "Seize power or negotiate from position of strength.", backedBy: ["UAE", "Russia (Wagner)"], strength: "~100,000 troops" },
      { name: "UAE", type: "state", side: "RSF supporter", objectives: "Expand regional influence and secure economic interests.", strength: "Major arms supplier via Chad" },
      { name: "Egypt", type: "state", side: "SAF supporter", objectives: "Prevent RSF control threatening Nile security.", strength: "Provides jets, ammunition, intelligence" },
      { name: "US / Saudi Arabia", type: "state", side: "Mediator", objectives: "Achieve ceasefire and civilian-led transition.", strength: "Lead Jeddah process and Quad roadmap" },
    ],
    humanitarian: {
      casualties: {
        military: { value: "Unknown", subtext: "Neither side reports losses" },
        civilian: { value: "150,000-400,000", subtext: "Estimates vary widely; official count far lower" },
      },
      displacement: {
        internal: { value: "9M+", subtext: "One of history's largest displacement crises" },
        refugees: { value: "3.5M+", subtext: "Fled to Chad, Ethiopia, South Sudan, Egypt" },
      },
      foodSecurity: { value: "21M+", subtext: "Famine in El Fasher, Kadugli; 20 areas at risk", severity: "famine" },
      aidAccess: { status: "blocked", detail: "Both sides obstruct access; only 28% of $4.16B appeal funded." },
      lastUpdated: "Feb 2026",
    },
    diplomatic: {
      peaceStatus: { label: "Stalled", detail: "Despite Quad roadmap, no ceasefire achieved. Both sides believe they can win militarily.", lastTalkDate: "2025-09-12" },
      entries: [
        { type: "negotiation", date: "2023-05-20", title: "Jeddah Declaration", detail: "Neither side implemented agreed humanitarian provisions.", actors: ["US", "Saudi Arabia"], status: "failed" },
        { type: "negotiation", date: "2024-08-15", title: "Geneva Peace Talks", detail: "SAF boycotted US-Saudi-Swiss convened talks.", actors: ["US", "Saudi Arabia", "Switzerland"], status: "stalled" },
        { type: "sanction", date: "2025-01-15", title: "US Sanctions RSF Commanders", detail: "Targeted sanctions for El Fasher atrocities.", actors: ["US"], status: "active" },
        { type: "ceasefire-attempt", date: "2025-09-12", title: "Quad Roadmap for Peace", detail: "3-month truce, permanent ceasefire, 9-month civilian transition plan.", actors: ["US", "Saudi Arabia", "UAE", "Egypt"], status: "stalled" },
      ],
    },
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
        description: "Resistance forces advancing through northern Shan State",
        type: "battle",
      },
      {
        lat: 25.4,
        lng: 97.4,
        title: "Kachin clashes",
        description: "KIA forces engaging junta troops near Chinese border",
        type: "battle",
      },
      {
        lat: 19.0,
        lng: 95.0,
        title: "Rakhine State",
        description: "Arakan Army expanding territorial control, junta losing ground",
        type: "battle",
      },
      {
        lat: 17.0,
        lng: 96.5,
        title: "Karen State",
        description: "KNLA controlling border crossings with Thailand",
        type: "political",
      },
      {
        lat: 21.97,
        lng: 96.08,
        title: "Mandalay region",
        description: "PDF attacks on junta military installations",
        type: "battle",
      },
      {
        lat: 19.76,
        lng: 96.07,
        title: "Naypyidaw operations",
        description: "Resistance drone strikes near the capital",
        type: "strike",
      },
      {
        lat: 16.87,
        lng: 96.2,
        title: "Yangon unrest",
        description: "Urban resistance and targeted assassinations",
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
    timeline: {
      phases: [
        { id: "mm-1", label: "Coup & Mass Protests", startDate: "2021-02-01", endDate: "2021-12-31", description: "Tatmadaw overthrew elected NLD government; violently suppressed protests.", escalationLevel: 4 },
        { id: "mm-2", label: "Armed Resistance Organizes", startDate: "2022-01-01", endDate: "2023-10-26", description: "NUG formed People's Defense Force; armed resistance spread nationwide.", escalationLevel: 4 },
        { id: "mm-3", label: "Operation 1027", startDate: "2023-10-27", endDate: "2024-12-31", description: "Three Brotherhood Alliance offensive captured hundreds of military positions.", escalationLevel: 5 },
        { id: "mm-4", label: "Earthquake & Sham Elections", startDate: "2025-01-01", endDate: "2026-01-25", description: "Devastating earthquake paused fighting; junta held rigged elections.", escalationLevel: 4 },
        { id: "mm-5", label: "Post-Election Entrenchment", startDate: "2026-01-26", description: "Junta claims electoral legitimacy; resistance holds ~60% of territory.", escalationLevel: 4 },
      ],
      milestones: [
        { date: "2021-02-01", title: "Military Coup", description: "Tatmadaw seized power, detained Aung San Suu Kyi.", phase: "mm-1", category: "political", significance: "major" },
        { date: "2021-04-16", title: "NUG Formed", description: "Ousted lawmakers formed shadow government.", phase: "mm-1", category: "political", significance: "major" },
        { date: "2021-05-05", title: "People's Defense Force", description: "NUG established armed wing; thousands of civilians joined.", phase: "mm-1", category: "military", significance: "major" },
        { date: "2023-10-27", title: "Operation 1027 Launched", description: "Three Brotherhood Alliance captured 220+ junta positions.", phase: "mm-3", category: "military", significance: "major" },
        { date: "2024-08-03", title: "Capture of Lashio", description: "First regional military command headquarters to fall.", phase: "mm-3", category: "military", significance: "major" },
        { date: "2024-12-20", title: "Western Command Captured", description: "Arakan Army took second regional command HQ.", phase: "mm-3", category: "military", significance: "major" },
        { date: "2025-03-28", title: "Magnitude 7.7 Earthquake", description: "3,600+ killed; NUG declared pause; junta announced temporary ceasefire.", phase: "mm-4", category: "humanitarian", significance: "major" },
        { date: "2026-01-25", title: "Sham Elections", description: "Military-allied landslide widely condemned as illegitimate.", phase: "mm-4", category: "political", significance: "major" },
      ],
    },
    escalation: {
      level: "high",
      trend: "stable",
      lastAssessed: "2026-03-01",
      summary: "Fragmented stalemate: resistance holds ~60% of territory but cannot take cities; junta retains airpower and Chinese backing.",
      factors: [
        { label: "China's pro-junta shift", direction: "up", detail: "Beijing supports junta, cuts off supplies to ethnic armies" },
        { label: "Resistance gains", direction: "stable", detail: "~60% territory but momentum stalled" },
        { label: "Junta airpower", direction: "up", detail: "Intensified airstrikes on civilian areas" },
        { label: "Humanitarian crisis", direction: "up", detail: "5.2M displaced; 12M facing acute hunger" },
        { label: "ASEAN diplomacy", direction: "stable", detail: "Suspended chairmanship but constrained by non-interference" },
      ],
    },
    actors: [
      { name: "Tatmadaw (SSPC)", type: "state", side: "Military Junta", objectives: "Maintain power through manufactured electoral legitimacy and suppress resistance.", backedBy: ["China", "Russia", "North Korea"], strength: "~150-200K troops; air superiority" },
      { name: "NUG / PDF", type: "non-state", side: "Democratic Resistance", objectives: "Overthrow military rule and establish federal democratic union.", strength: "Tens of thousands of fighters; limited arms" },
      { name: "Three Brotherhood Alliance", type: "non-state", side: "Ethnic Armed Orgs", objectives: "Secure ethnic self-determination and weaken Tatmadaw.", strength: "~15,000+ fighters; captured 2 commands" },
      { name: "Arakan Army", type: "non-state", side: "Ethnic Armed Orgs", objectives: "Establish autonomous governance in Rakhine State.", strength: "Controls ~88% of Rakhine" },
      { name: "China", type: "state", side: "Junta supporter", objectives: "Maintain border stability and protect economic investments.", strength: "Dominant external influence; controls border trade" },
    ],
    humanitarian: {
      casualties: {
        military: { value: "Unknown", subtext: "Neither side reports comprehensive losses" },
        civilian: { value: "6,000+", subtext: "Documented kills by junta; true figure much higher" },
      },
      displacement: {
        internal: { value: "3.6-5.2M", subtext: "Average displaced person moved 8 times" },
        refugees: { value: "~1.6M", subtext: "In Thailand, India, Bangladesh" },
      },
      foodSecurity: { value: "12M facing hunger", subtext: "One-third of population; 400K+ children malnourished", severity: "emergency" },
      aidAccess: { status: "restricted", detail: "Active fighting, checkpoints, and administrative delays block deliveries." },
      lastUpdated: "Feb 2026",
    },
    diplomatic: {
      peaceStatus: { label: "No Negotiations", detail: "ASEAN Five-Point Consensus failed. Sham elections and Chinese backing eliminated near-term prospects.", lastTalkDate: "2021-04-24" },
      entries: [
        { type: "statement", date: "2021-02-01", title: "International Condemnation", detail: "US, EU, UK condemned coup and demanded release of detained leaders.", actors: ["US", "EU", "UK"], status: "active" },
        { type: "sanction", date: "2021-03-22", title: "Sanctions on Junta Leadership", detail: "Targeted sanctions on military leaders and economic conglomerates.", actors: ["US", "EU", "UK"], status: "active" },
        { type: "negotiation", date: "2021-04-24", title: "ASEAN Five-Point Consensus", detail: "Junta failed to implement any commitments.", actors: ["ASEAN"], status: "failed" },
        { type: "sanction", date: "2025-08-01", title: "US 40% Tariff on Myanmar", detail: "Added economic pressure; also banned entry of Myanmar nationals.", actors: ["US"], status: "active" },
        { type: "statement", date: "2026-01-26", title: "Rejection of Sham Elections", detail: "UN and Western governments condemned elections as illegitimate.", actors: ["UN", "US", "EU"], status: "active" },
      ],
    },
  },
];
