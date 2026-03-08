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
  },
  {
    name: "Jupiter",
    distanceAU: 5.203,
    radiusKm: 69911,
    orbitalPeriodYears: 11.86,
    color: "#c88b3a",
    description:
      "The largest planet, a gas giant with a mass 2.5x all other planets combined. Its Great Red Spot is a storm larger than Earth.",
    surfaceTemp: "-110°C avg",
    moons: 95,
    type: "Gas Giant",
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
