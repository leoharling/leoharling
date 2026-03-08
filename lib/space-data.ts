export interface Moon {
  name: string;
  radiusKm: number;
  color: string;
  orbitDays: number;
  distanceKm: number;
  description: string;
}

export interface Planet {
  name: string;
  distanceAU: number;
  radiusKm: number;
  orbitalPeriodYears: number;
  color: string;
  hasRings?: boolean;
  description: string;
  surfaceTemp: string;
  moons: number;
  type: string;
  massKg: string;
  gravity: number;
  dayLength: string;
  atmosphere: string;
  namedMoons: Moon[];
}

export interface NearbyStar {
  name: string;
  distanceLY: number;
  spectralType: string;
  color: string;
  x: number;
  y: number;
  magnitude: number;
  description: string;
}

export type GalaxyVisualType = "barred-spiral" | "spiral" | "elliptical" | "irregular";

export interface NearbyGalaxy {
  name: string;
  type: string;
  visualType: GalaxyVisualType;
  distanceMly: number;
  diameterKly: number;
  color: string;
  colorSecondary: string;
  x: number;
  y: number;
  tilt: number;       // degrees of inclination (0 = face-on, 90 = edge-on)
  rotation: number;   // degrees of rotation
  description: string;
  stars: string;
}

export const PLANETS: Planet[] = [
  {
    name: "Mercury",
    distanceAU: 0.387,
    radiusKm: 2440,
    orbitalPeriodYears: 0.24,
    color: "#b5a18e",
    description:
      "The smallest and innermost planet. Despite being closest to the Sun, it's not the hottest due to its lack of atmosphere.",
    surfaceTemp: "-180 to 430°C",
    moons: 0,
    type: "Terrestrial",
    massKg: "3.30 × 10²³",
    gravity: 3.7,
    dayLength: "58.6 Earth days",
    atmosphere: "Virtually none — trace O₂, Na, H₂",
    namedMoons: [],
  },
  {
    name: "Venus",
    distanceAU: 0.723,
    radiusKm: 6052,
    orbitalPeriodYears: 0.62,
    color: "#e8cda0",
    description:
      "Earth's twin in size but with a runaway greenhouse effect, making it the hottest planet in our solar system at 462°C.",
    surfaceTemp: "462°C avg",
    moons: 0,
    type: "Terrestrial",
    massKg: "4.87 × 10²⁴",
    gravity: 8.87,
    dayLength: "243 Earth days",
    atmosphere: "96.5% CO₂, 3.5% N₂ — 90× Earth's pressure",
    namedMoons: [],
  },
  {
    name: "Earth",
    distanceAU: 1.0,
    radiusKm: 6371,
    orbitalPeriodYears: 1.0,
    color: "#4a90d9",
    description:
      "Our home. The only known planet to harbor life, with liquid water covering 71% of its surface.",
    surfaceTemp: "15°C avg",
    moons: 1,
    type: "Terrestrial",
    massKg: "5.97 × 10²⁴",
    gravity: 9.81,
    dayLength: "24 hours",
    atmosphere: "78% N₂, 21% O₂, 1% Ar",
    namedMoons: [
      { name: "Moon", radiusKm: 1737, color: "#c8c8c8", orbitDays: 27.3, distanceKm: 384400, description: "Earth's only natural satellite. Its gravitational pull drives our tides." },
    ],
  },
  {
    name: "Mars",
    distanceAU: 1.524,
    radiusKm: 3390,
    orbitalPeriodYears: 1.88,
    color: "#c1440e",
    description:
      "The Red Planet. Home to the tallest volcano (Olympus Mons) and deepest canyon (Valles Marineris) in the solar system.",
    surfaceTemp: "-65°C avg",
    moons: 2,
    type: "Terrestrial",
    massKg: "6.42 × 10²³",
    gravity: 3.72,
    dayLength: "24h 37min",
    atmosphere: "95% CO₂, 2.7% N₂ — 0.6% of Earth's pressure",
    namedMoons: [
      { name: "Phobos", radiusKm: 11, color: "#8a7d6b", orbitDays: 0.32, distanceKm: 9376, description: "Irregularly shaped, slowly spiraling inward. Will crash into Mars in ~50M years." },
      { name: "Deimos", radiusKm: 6, color: "#9c8e7c", orbitDays: 1.26, distanceKm: 23463, description: "Mars' smaller, outer moon. Only 12 km across." },
    ],
  },
  {
    name: "Jupiter",
    distanceAU: 5.203,
    radiusKm: 69911,
    orbitalPeriodYears: 11.86,
    color: "#c88b3a",
    description:
      "The largest planet, a gas giant with a mass 2.5× all other planets combined. Its Great Red Spot is a storm larger than Earth.",
    surfaceTemp: "-110°C avg",
    moons: 95,
    type: "Gas Giant",
    massKg: "1.90 × 10²⁷",
    gravity: 24.79,
    dayLength: "9h 56min",
    atmosphere: "90% H₂, 10% He — no solid surface",
    namedMoons: [
      { name: "Io", radiusKm: 1822, color: "#e8c44a", orbitDays: 1.77, distanceKm: 421700, description: "Most volcanically active body in the solar system. Over 400 active volcanoes." },
      { name: "Europa", radiusKm: 1561, color: "#c8d8e8", orbitDays: 3.55, distanceKm: 671100, description: "Ice-covered ocean world. Top candidate for extraterrestrial life." },
      { name: "Ganymede", radiusKm: 2634, color: "#a8a098", orbitDays: 7.15, distanceKm: 1070400, description: "Largest moon in the solar system. Bigger than Mercury, has its own magnetosphere." },
      { name: "Callisto", radiusKm: 2410, color: "#6b6560", orbitDays: 16.69, distanceKm: 1882700, description: "Most heavily cratered object in the solar system. May have a subsurface ocean." },
    ],
  },
  {
    name: "Saturn",
    distanceAU: 9.537,
    radiusKm: 58232,
    orbitalPeriodYears: 29.46,
    color: "#e4d08e",
    hasRings: true,
    description:
      "Famous for its stunning ring system of ice and rock. The least dense planet — it would float in water.",
    surfaceTemp: "-140°C avg",
    moons: 146,
    type: "Gas Giant",
    massKg: "5.68 × 10²⁶",
    gravity: 10.44,
    dayLength: "10h 42min",
    atmosphere: "96% H₂, 3% He — fastest winds up to 1,800 km/h",
    namedMoons: [
      { name: "Titan", radiusKm: 2575, color: "#d4a040", orbitDays: 15.95, distanceKm: 1221870, description: "Only moon with a dense atmosphere. Has lakes of liquid methane and ethane." },
      { name: "Enceladus", radiusKm: 252, color: "#f0f0f0", orbitDays: 1.37, distanceKm: 237948, description: "Geysers shoot water ice into space. Subsurface ocean may harbor life." },
      { name: "Mimas", radiusKm: 198, color: "#c0c0c0", orbitDays: 0.94, distanceKm: 185539, description: "Has a giant crater making it look like the Death Star." },
      { name: "Rhea", radiusKm: 764, color: "#b0b0b0", orbitDays: 4.52, distanceKm: 527108, description: "Saturn's second-largest moon. May have its own thin ring system." },
    ],
  },
  {
    name: "Uranus",
    distanceAU: 19.19,
    radiusKm: 25362,
    orbitalPeriodYears: 84.01,
    color: "#72b5c4",
    hasRings: true,
    description:
      "An ice giant tilted on its side at 98°. It rotates in the opposite direction to most planets.",
    surfaceTemp: "-195°C avg",
    moons: 28,
    type: "Ice Giant",
    massKg: "8.68 × 10²⁵",
    gravity: 8.87,
    dayLength: "17h 14min",
    atmosphere: "83% H₂, 15% He, 2% CH₄ — methane gives it blue-green color",
    namedMoons: [
      { name: "Titania", radiusKm: 789, color: "#b8b0a8", orbitDays: 8.71, distanceKm: 435910, description: "Uranus' largest moon. Has canyons up to 1,500 km long." },
      { name: "Oberon", radiusKm: 761, color: "#a09890", orbitDays: 13.46, distanceKm: 583520, description: "Outermost major moon. Dark surface with bright impact craters." },
      { name: "Miranda", radiusKm: 236, color: "#c0b8b0", orbitDays: 1.41, distanceKm: 129390, description: "Has the tallest cliff in the solar system — Verona Rupes at 20 km high." },
    ],
  },
  {
    name: "Neptune",
    distanceAU: 30.07,
    radiusKm: 24622,
    orbitalPeriodYears: 164.8,
    color: "#3f54ba",
    description:
      "The windiest planet with gusts up to 2,100 km/h. First planet predicted mathematically before being observed.",
    surfaceTemp: "-200°C avg",
    moons: 16,
    type: "Ice Giant",
    massKg: "1.02 × 10²⁶",
    gravity: 11.15,
    dayLength: "16h 6min",
    atmosphere: "80% H₂, 19% He, 1% CH₄ — deep blue from methane absorption",
    namedMoons: [
      { name: "Triton", radiusKm: 1353, color: "#d0c8c0", orbitDays: 5.88, distanceKm: 354759, description: "Orbits backwards (retrograde). Has nitrogen geysers. Likely a captured Kuiper Belt object." },
      { name: "Proteus", radiusKm: 210, color: "#707070", orbitDays: 1.12, distanceKm: 117647, description: "Irregularly shaped, one of the darkest objects in the solar system." },
    ],
  },
];

export const NEARBY_STARS: NearbyStar[] = [
  {
    name: "Alpha Centauri",
    distanceLY: 4.37,
    spectralType: "G2V + K1V",
    color: "#fff4e0",
    x: 2.5,
    y: 3.5,
    magnitude: -0.27,
    description: "Triple star system, closest to the Sun",
  },
  {
    name: "Barnard's Star",
    distanceLY: 5.96,
    spectralType: "M4V",
    color: "#ffb3b3",
    x: -4.0,
    y: -4.3,
    magnitude: 9.5,
    description: "Red dwarf with the fastest known stellar proper motion",
  },
  {
    name: "Wolf 359",
    distanceLY: 7.86,
    spectralType: "M6.5V",
    color: "#ff9999",
    x: 5.8,
    y: -5.2,
    magnitude: 13.5,
    description: "One of the faintest and lowest-mass stars near the Sun",
  },
  {
    name: "Sirius",
    distanceLY: 8.6,
    spectralType: "A1V",
    color: "#cce0ff",
    x: 3.0,
    y: -8.0,
    magnitude: -1.46,
    description: "Brightest star in the night sky, a binary system",
  },
  {
    name: "Lalande 21185",
    distanceLY: 8.31,
    spectralType: "M2V",
    color: "#ffaaaa",
    x: -6.5,
    y: 5.0,
    magnitude: 7.5,
    description: "Red dwarf visible from the Northern Hemisphere",
  },
  {
    name: "Ross 154",
    distanceLY: 9.69,
    spectralType: "M3.5V",
    color: "#ffaaaa",
    x: 8.0,
    y: 5.5,
    magnitude: 10.4,
    description: "Flare star in the constellation Sagittarius",
  },
  {
    name: "Epsilon Eridani",
    distanceLY: 10.5,
    spectralType: "K2V",
    color: "#ffe0b3",
    x: -3.0,
    y: -10.0,
    magnitude: 3.7,
    description: "Sun-like star with confirmed exoplanets",
  },
  {
    name: "Procyon",
    distanceLY: 11.5,
    spectralType: "F5V",
    color: "#fff5e0",
    x: 10.0,
    y: -5.5,
    magnitude: 0.34,
    description: "Binary star, 8th brightest in Earth's sky",
  },
  {
    name: "Tau Ceti",
    distanceLY: 11.9,
    spectralType: "G8.5V",
    color: "#fff2cc",
    x: -9.0,
    y: 7.5,
    magnitude: 3.5,
    description: "Sun-like star, candidate for habitable exoplanets",
  },
  {
    name: "Luyten's Star",
    distanceLY: 12.36,
    spectralType: "M3.5V",
    color: "#ffaaaa",
    x: -7.0,
    y: -8.5,
    magnitude: 9.9,
    description: "Red dwarf with two confirmed exoplanets",
  },
];

export const NEARBY_GALAXIES: NearbyGalaxy[] = [
  {
    name: "Milky Way",
    type: "Barred Spiral (SBbc)",
    visualType: "barred-spiral",
    distanceMly: 0,
    diameterKly: 105,
    color: "#e8e0d0",
    colorSecondary: "#a89870",
    x: 0,
    y: 0,
    tilt: 30,
    rotation: -20,
    description: "Our home galaxy. Contains 100-400 billion stars and is ~13.6 billion years old. Our Sun is located ~27,000 light-years from the galactic center.",
    stars: "100–400 billion",
  },
  {
    name: "Andromeda (M31)",
    type: "Barred Spiral (SA(s)b)",
    visualType: "spiral",
    distanceMly: 2.537,
    diameterKly: 220,
    color: "#c8c0e0",
    colorSecondary: "#8878b0",
    x: 6.5,
    y: -4.0,
    tilt: 55,
    rotation: 35,
    description: "Nearest large galaxy. On a collision course with the Milky Way — the two will merge in ~4.5 billion years to form 'Milkdromeda'.",
    stars: "~1 trillion",
  },
  {
    name: "Triangulum (M33)",
    type: "Spiral (SA(s)cd)",
    visualType: "spiral",
    distanceMly: 2.73,
    diameterKly: 60,
    color: "#c0d0e8",
    colorSecondary: "#7090c0",
    x: 8.0,
    y: 2.0,
    tilt: 42,
    rotation: -60,
    description: "Third-largest in the Local Group. May be a satellite of Andromeda. Visible to the naked eye under perfect conditions.",
    stars: "~40 billion",
  },
  {
    name: "Large Magellanic Cloud",
    type: "Irregular/Spiral (SB(s)m)",
    visualType: "irregular",
    distanceMly: 0.163,
    diameterKly: 14,
    color: "#d8d0c0",
    colorSecondary: "#b0a890",
    x: -2.0,
    y: 3.5,
    tilt: 20,
    rotation: 10,
    description: "Visible from the Southern Hemisphere. Site of SN 1987A, the closest observed supernova since 1604. A satellite of the Milky Way.",
    stars: "~30 billion",
  },
  {
    name: "Small Magellanic Cloud",
    type: "Irregular (SB(s)m pec)",
    visualType: "irregular",
    distanceMly: 0.197,
    diameterKly: 7,
    color: "#c8c8c0",
    colorSecondary: "#9898a0",
    x: -3.0,
    y: 5.0,
    tilt: 15,
    rotation: -30,
    description: "Dwarf galaxy gravitationally interacting with the LMC and the Milky Way. Rich in gas and active star formation.",
    stars: "~3 billion",
  },
  {
    name: "Sagittarius Dwarf",
    type: "Elliptical (dSph)",
    visualType: "elliptical",
    distanceMly: 0.07,
    diameterKly: 10,
    color: "#d0c0b0",
    colorSecondary: "#a09080",
    x: -0.8,
    y: -1.5,
    tilt: 60,
    rotation: 45,
    description: "Being consumed by the Milky Way right now. Its stars are being stretched into tidal streams around our galaxy.",
    stars: "~10 million",
  },
  {
    name: "Canis Major Dwarf",
    type: "Irregular (dIrr)",
    visualType: "irregular",
    distanceMly: 0.025,
    diameterKly: 5,
    color: "#c0b8a8",
    colorSecondary: "#908878",
    x: 0.5,
    y: -1.0,
    tilt: 40,
    rotation: 70,
    description: "Closest known galaxy to Earth at just 25,000 light-years from the Sun. Currently being torn apart by the Milky Way's gravity.",
    stars: "~1 billion",
  },
  {
    name: "NGC 6822 (Barnard's)",
    type: "Irregular (IB(s)m)",
    visualType: "irregular",
    distanceMly: 1.63,
    diameterKly: 7,
    color: "#b0c0d0",
    colorSecondary: "#7090a8",
    x: -5.5,
    y: -6.0,
    tilt: 25,
    rotation: -45,
    description: "One of the closest galaxies outside the Milky Way's satellite system. Named after E.E. Barnard who discovered it in 1884.",
    stars: "~10 million",
  },
  {
    name: "IC 10",
    type: "Irregular (dIrr)",
    visualType: "irregular",
    distanceMly: 2.2,
    diameterKly: 5,
    color: "#a8b8d0",
    colorSecondary: "#7888a8",
    x: 4.0,
    y: -7.5,
    tilt: 35,
    rotation: 20,
    description: "The only known starburst galaxy in the Local Group. Hard to observe because it's behind the Milky Way's disk.",
    stars: "~100 million",
  },
  {
    name: "Leo I",
    type: "Elliptical (dE3)",
    visualType: "elliptical",
    distanceMly: 0.82,
    diameterKly: 2,
    color: "#d0c0c0",
    colorSecondary: "#a09090",
    x: -7.5,
    y: -2.0,
    tilt: 50,
    rotation: -15,
    description: "Dwarf spheroidal galaxy and satellite of the Milky Way. One of the most distant Milky Way satellites.",
    stars: "~10 million",
  },
];

// Display helpers
export function getOrbitRadius(distanceAU: number): number {
  const logMin = Math.log(0.387);
  const logMax = Math.log(30.07);
  const normalized = (Math.log(distanceAU) - logMin) / (logMax - logMin);
  return 40 + normalized * 210;
}

export function getPlanetSize(radiusKm: number): number {
  return Math.max(8, Math.min(28, 5 + Math.sqrt(radiusKm / 800)));
}

export function getOrbitalDuration(periodYears: number): number {
  return 25 + Math.log(periodYears + 1) * 40;
}
