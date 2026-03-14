# Space Globe View & Deep Space Probes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 3D globe with spaceport locations and launch trajectories to the Earth tab, and man-made deep space probe markers to the Deep Space solar system view.

**Architecture:** Two independent features sharing no code. Feature 1 (Globe) is a new React Three Fiber component added as a sub-tab in the launch tracker. Feature 2 (Probes) adds SVG/CSS markers into the existing DeepSpaceView solar system rendering. Both use hardcoded datasets.

**Tech Stack:** React Three Fiber, Three.js, @react-three/drei, NASA Blue Marble textures, SVG paths, Framer Motion

**Spec:** `docs/superpowers/specs/2026-03-14-space-globe-deepspace-probes-design.md`

---

## Chunk 1: Data Layers

### Task 1: Spaceport Location Data

**Files:**
- Create: `lib/spaceports.ts`

- [ ] **Step 1: Fetch spaceport data from Space Devs API for reference**

Run in browser or curl to get the real location/pad data for hardcoding:
```bash
curl -s "https://ll.thespacedevs.com/2.3.0/locations/?limit=100&has_active_pads=true" -H "User-Agent: OrbitIntel/1.0" | python3 -m json.tool > /tmp/spaceport-locations.json
curl -s "https://ll.thespacedevs.com/2.3.0/pads/?limit=200&active=true" -H "User-Agent: OrbitIntel/1.0" | python3 -m json.tool > /tmp/spaceport-pads.json
```

Review the JSON output to extract names, lat/lon, and pad details. Use these exact names so they match `pad.location.name` in cached launch data. Key field mapping from API response:
- `results[].name` → `SpaceportLocation.name` (must be exact match)
- `results[].latitude` → `SpaceportLocation.lat`  (string, parse to float)
- `results[].longitude` → `SpaceportLocation.lon` (string, parse to float)
- `results[].country.name` → `SpaceportLocation.country`
- `results[].id` → `SpaceportLocation.id`
- For pads: filter the pads response by `location.id` to group pads under locations

- [ ] **Step 2: Create spaceports data file**

Create `lib/spaceports.ts` with interfaces and hardcoded data sourced from the API response:

```typescript
export interface LaunchPad {
  id: number;
  name: string;
  lat: number;
  lon: number;
}

export interface SpaceportLocation {
  id: number;
  name: string;           // Must exactly match pad.location.name from Space Devs API
  country: string;
  lat: number;
  lon: number;
  pads: LaunchPad[];
}

// Sourced from https://ll.thespacedevs.com/2.3.0/locations/ and /pads/
// Names must exactly match pad.location.name in launch data
export const SPACEPORT_LOCATIONS: SpaceportLocation[] = [
  // Populate from API response — example structure:
  {
    id: 12,
    name: "Kennedy Space Center, FL, USA",
    country: "USA",
    lat: 28.5728,
    lon: -80.649,
    pads: [
      { id: 87, name: "Launch Complex 39A", lat: 28.6084, lon: -80.6043 },
      { id: 88, name: "Launch Complex 39B", lat: 28.6272, lon: -80.6208 },
    ],
  },
  // ... ~30-40 active locations
];

// Helper: convert lat/lon to 3D position on a unit sphere
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/spaceports.ts
git commit -m "feat: add hardcoded spaceport location data"
```

---

### Task 2: Trajectory Template Data

**Files:**
- Create: `lib/trajectory-templates.ts`

- [ ] **Step 1: Create trajectory templates file**

```typescript
export interface StagingEvent {
  label: string;
  progressFraction: number; // 0-1 along the trajectory arc
}

export interface TrajectoryTemplate {
  orbitAbbrev: string;      // matches mission.orbit.abbrev
  orbitName: string;
  altitudeKm: number;       // target orbit altitude (apogee for elliptical)
  perigeeKm?: number;
  inclinationDeg: number;
  ascentProfile: [number, number][]; // [progress 0-1, altitude fraction 0-1]
  stagingEvents: StagingEvent[];
}

export const TRAJECTORY_TEMPLATES: TrajectoryTemplate[] = [
  {
    orbitAbbrev: "LEO",
    orbitName: "Low Earth Orbit",
    altitudeKm: 400,
    inclinationDeg: 51.6,
    ascentProfile: [
      [0, 0], [0.05, 0.02], [0.15, 0.1], [0.3, 0.35],
      [0.5, 0.6], [0.7, 0.82], [0.85, 0.93], [1, 1],
    ],
    stagingEvents: [
      { label: "Liftoff", progressFraction: 0 },
      { label: "Max-Q", progressFraction: 0.12 },
      { label: "MECO", progressFraction: 0.25 },
      { label: "Stage Sep", progressFraction: 0.27 },
      { label: "SES-1", progressFraction: 0.3 },
      { label: "Fairing Sep", progressFraction: 0.35 },
      { label: "SECO", progressFraction: 0.95 },
    ],
  },
  {
    orbitAbbrev: "GTO",
    orbitName: "Geostationary Transfer Orbit",
    altitudeKm: 35786,
    perigeeKm: 250,
    inclinationDeg: 28.5,
    ascentProfile: [
      [0, 0], [0.05, 0.01], [0.15, 0.05], [0.3, 0.15],
      [0.5, 0.3], [0.7, 0.5], [0.85, 0.7], [1, 1],
    ],
    stagingEvents: [
      { label: "Liftoff", progressFraction: 0 },
      { label: "Max-Q", progressFraction: 0.1 },
      { label: "MECO", progressFraction: 0.2 },
      { label: "Stage Sep", progressFraction: 0.22 },
      { label: "SES-1", progressFraction: 0.25 },
      { label: "Fairing Sep", progressFraction: 0.3 },
      { label: "SECO-1", progressFraction: 0.6 },
      { label: "Coast", progressFraction: 0.75 },
      { label: "SES-2", progressFraction: 0.85 },
      { label: "SECO-2", progressFraction: 0.95 },
    ],
  },
  {
    orbitAbbrev: "SSO",
    orbitName: "Sun-Synchronous Orbit",
    altitudeKm: 700,
    inclinationDeg: 97.8,
    ascentProfile: [
      [0, 0], [0.05, 0.02], [0.15, 0.1], [0.3, 0.3],
      [0.5, 0.55], [0.7, 0.78], [0.85, 0.91], [1, 1],
    ],
    stagingEvents: [
      { label: "Liftoff", progressFraction: 0 },
      { label: "Max-Q", progressFraction: 0.12 },
      { label: "MECO", progressFraction: 0.25 },
      { label: "Stage Sep", progressFraction: 0.27 },
      { label: "SES-1", progressFraction: 0.3 },
      { label: "Fairing Sep", progressFraction: 0.35 },
      { label: "SECO", progressFraction: 0.92 },
    ],
  },
  {
    orbitAbbrev: "MEO",
    orbitName: "Medium Earth Orbit",
    altitudeKm: 20200,
    inclinationDeg: 55,
    ascentProfile: [
      [0, 0], [0.05, 0.01], [0.15, 0.06], [0.3, 0.18],
      [0.5, 0.35], [0.7, 0.55], [0.85, 0.78], [1, 1],
    ],
    stagingEvents: [
      { label: "Liftoff", progressFraction: 0 },
      { label: "MECO", progressFraction: 0.22 },
      { label: "Stage Sep", progressFraction: 0.24 },
      { label: "Fairing Sep", progressFraction: 0.3 },
      { label: "Coast", progressFraction: 0.6 },
      { label: "Circularization", progressFraction: 0.9 },
    ],
  },
  {
    orbitAbbrev: "HEO",
    orbitName: "Highly Elliptical Orbit",
    altitudeKm: 39750,
    perigeeKm: 500,
    inclinationDeg: 63.4,
    ascentProfile: [
      [0, 0], [0.05, 0.01], [0.15, 0.04], [0.3, 0.12],
      [0.5, 0.25], [0.7, 0.45], [0.85, 0.65], [1, 1],
    ],
    stagingEvents: [
      { label: "Liftoff", progressFraction: 0 },
      { label: "MECO", progressFraction: 0.2 },
      { label: "Stage Sep", progressFraction: 0.22 },
      { label: "Fairing Sep", progressFraction: 0.28 },
      { label: "Coast", progressFraction: 0.55 },
      { label: "Apogee Burn", progressFraction: 0.85 },
    ],
  },
];

// Find template for a given orbit abbreviation, default to LEO
export function getTrajectoryTemplate(orbitAbbrev?: string): TrajectoryTemplate {
  if (!orbitAbbrev) return TRAJECTORY_TEMPLATES[0];
  return (
    TRAJECTORY_TEMPLATES.find(
      (t) => t.orbitAbbrev.toLowerCase() === orbitAbbrev.toLowerCase()
    ) ?? TRAJECTORY_TEMPLATES[0]
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/trajectory-templates.ts
git commit -m "feat: add trajectory templates per orbit type"
```

---

### Task 3: Deep Space Probe Data

**Files:**
- Create: `lib/deep-space-probes.ts`

- [ ] **Step 1: Create deep space probes data file**

```typescript
// Probes beyond this threshold render as edge-anchored directional indicators
// rather than positioned markers. Matches getOrbitRadius calibration (logMax = log(30.07)).
export const EDGE_INDICATOR_THRESHOLD_AU = 30;

export interface TrajectoryWaypoint {
  body: string;
  year: number;
  distanceAU: number;
  eclipticLonDeg: number;    // Direction in ecliptic plane (degrees)
  eclipticLatDeg: number;    // Elevation from ecliptic (degrees, 0 = in-plane)
  type: "launch" | "gravity-assist" | "arrival" | "current";
}

export interface DeepSpaceProbe {
  name: string;
  distanceAU: number;
  eclipticLonDeg: number;    // Direction in ecliptic plane
  eclipticLatDeg: number;    // Elevation from ecliptic (used for future 3D view)
  status: "active" | "inactive";
  launchYear: number;
  speedKmS: number;
  description: string;
  keyDiscoveries: string[];
  trajectory: TrajectoryWaypoint[];
  lastUpdated: string;       // ISO date for staleness tracking
}

export const DEEP_SPACE_PROBES: DeepSpaceProbe[] = [
  {
    name: "Voyager 1",
    distanceAU: 165,
    eclipticLonDeg: 60,
    eclipticLatDeg: 35,
    status: "active",
    launchYear: 1977,
    speedKmS: 17.0,
    description:
      "Launched in 1977, Voyager 1 is the most distant human-made object. It entered interstellar space in 2012 and continues to send data from beyond the heliosphere.",
    keyDiscoveries: [
      "Discovered active volcanoes on Jupiter's moon Io",
      "Detailed imaging of Saturn's rings",
      "First spacecraft to enter interstellar space (2012)",
      "Measured cosmic ray intensity beyond the heliosphere",
    ],
    trajectory: [
      { body: "Earth", year: 1977, distanceAU: 1, eclipticLonDeg: 0, eclipticLatDeg: 0, type: "launch" },
      { body: "Jupiter", year: 1979, distanceAU: 5.2, eclipticLonDeg: 15, eclipticLatDeg: 1, type: "gravity-assist" },
      { body: "Saturn", year: 1980, distanceAU: 9.5, eclipticLonDeg: 30, eclipticLatDeg: 10, type: "gravity-assist" },
      { body: "Voyager 1", year: 2026, distanceAU: 165, eclipticLonDeg: 60, eclipticLatDeg: 35, type: "current" },
    ],
    lastUpdated: "2026-03",
  },
  {
    name: "Voyager 2",
    distanceAU: 140,
    eclipticLonDeg: 220,
    eclipticLatDeg: -48,
    status: "active",
    launchYear: 1977,
    speedKmS: 15.4,
    description:
      "The only spacecraft to visit all four giant planets. Voyager 2 entered interstellar space in 2018 and continues transmitting scientific data.",
    keyDiscoveries: [
      "Only spacecraft to visit Uranus and Neptune",
      "Discovered 11 new moons across the giant planets",
      "Revealed Neptune's Great Dark Spot",
      "Entered interstellar space in 2018",
    ],
    trajectory: [
      { body: "Earth", year: 1977, distanceAU: 1, eclipticLonDeg: 0, eclipticLatDeg: 0, type: "launch" },
      { body: "Jupiter", year: 1979, distanceAU: 5.2, eclipticLonDeg: 50, eclipticLatDeg: -1, type: "gravity-assist" },
      { body: "Saturn", year: 1981, distanceAU: 9.5, eclipticLonDeg: 100, eclipticLatDeg: -5, type: "gravity-assist" },
      { body: "Uranus", year: 1986, distanceAU: 19.2, eclipticLonDeg: 150, eclipticLatDeg: -15, type: "gravity-assist" },
      { body: "Neptune", year: 1989, distanceAU: 30, eclipticLonDeg: 190, eclipticLatDeg: -30, type: "gravity-assist" },
      { body: "Voyager 2", year: 2026, distanceAU: 140, eclipticLonDeg: 220, eclipticLatDeg: -48, type: "current" },
    ],
    lastUpdated: "2026-03",
  },
  {
    name: "Pioneer 10",
    distanceAU: 135,
    eclipticLonDeg: 85,
    eclipticLatDeg: 3,
    status: "inactive",
    launchYear: 1972,
    speedKmS: 12.0,
    description:
      "First spacecraft to travel through the asteroid belt and make a flyby of Jupiter. Contact lost in 2003. Heading toward Aldebaran.",
    keyDiscoveries: [
      "First close-up images of Jupiter",
      "First spacecraft through the asteroid belt",
      "Carried the Pioneer plaque for extraterrestrial communication",
    ],
    trajectory: [
      { body: "Earth", year: 1972, distanceAU: 1, eclipticLonDeg: 0, eclipticLatDeg: 0, type: "launch" },
      { body: "Jupiter", year: 1973, distanceAU: 5.2, eclipticLonDeg: 30, eclipticLatDeg: 1, type: "gravity-assist" },
      { body: "Pioneer 10", year: 2026, distanceAU: 135, eclipticLonDeg: 85, eclipticLatDeg: 3, type: "current" },
    ],
    lastUpdated: "2026-03",
  },
  {
    name: "Pioneer 11",
    distanceAU: 110,
    eclipticLonDeg: 310,
    eclipticLatDeg: 17,
    status: "inactive",
    launchYear: 1973,
    speedKmS: 11.4,
    description:
      "First spacecraft to study Saturn up close. Contact lost in 1995. Heading toward the constellation Aquila.",
    keyDiscoveries: [
      "First spacecraft to fly by Saturn",
      "Discovered Saturn's F ring",
      "Measured Jupiter's magnetic field",
    ],
    trajectory: [
      { body: "Earth", year: 1973, distanceAU: 1, eclipticLonDeg: 0, eclipticLatDeg: 0, type: "launch" },
      { body: "Jupiter", year: 1974, distanceAU: 5.2, eclipticLonDeg: 340, eclipticLatDeg: 2, type: "gravity-assist" },
      { body: "Saturn", year: 1979, distanceAU: 9.5, eclipticLonDeg: 320, eclipticLatDeg: 8, type: "gravity-assist" },
      { body: "Pioneer 11", year: 2026, distanceAU: 110, eclipticLonDeg: 310, eclipticLatDeg: 17, type: "current" },
    ],
    lastUpdated: "2026-03",
  },
  {
    name: "New Horizons",
    distanceAU: 60,
    eclipticLonDeg: 280,
    eclipticLatDeg: 2,
    status: "active",
    launchYear: 2006,
    speedKmS: 13.8,
    description:
      "First spacecraft to fly by Pluto (2015) and Kuiper Belt object Arrokoth (2019). Now exploring the outer heliosphere.",
    keyDiscoveries: [
      "First detailed images of Pluto's surface",
      "Discovered Pluto's heart-shaped nitrogen glacier",
      "First flyby of a Kuiper Belt object (Arrokoth)",
      "Measured dust environment of outer solar system",
    ],
    trajectory: [
      { body: "Earth", year: 2006, distanceAU: 1, eclipticLonDeg: 0, eclipticLatDeg: 0, type: "launch" },
      { body: "Jupiter", year: 2007, distanceAU: 5.2, eclipticLonDeg: 260, eclipticLatDeg: 0, type: "gravity-assist" },
      { body: "Pluto", year: 2015, distanceAU: 33, eclipticLonDeg: 275, eclipticLatDeg: 2, type: "arrival" },
      { body: "Arrokoth", year: 2019, distanceAU: 44, eclipticLonDeg: 278, eclipticLatDeg: 2, type: "arrival" },
      { body: "New Horizons", year: 2026, distanceAU: 60, eclipticLonDeg: 280, eclipticLatDeg: 2, type: "current" },
    ],
    lastUpdated: "2026-03",
  },
  {
    name: "Parker Solar Probe",
    distanceAU: 0.15,
    eclipticLonDeg: 180,
    eclipticLatDeg: 3,
    status: "active",
    launchYear: 2018,
    speedKmS: 190,
    description:
      "The closest human-made object to the Sun. Studying the solar corona and solar wind at unprecedented distances.",
    keyDiscoveries: [
      "First spacecraft to 'touch' the Sun's corona",
      "Discovered switchbacks in the solar magnetic field",
      "Fastest human-made object (692,000 km/h)",
    ],
    trajectory: [
      { body: "Earth", year: 2018, distanceAU: 1, eclipticLonDeg: 0, eclipticLatDeg: 0, type: "launch" },
      { body: "Venus", year: 2019, distanceAU: 0.72, eclipticLonDeg: 120, eclipticLatDeg: 1, type: "gravity-assist" },
      { body: "Parker Solar Probe", year: 2026, distanceAU: 0.15, eclipticLonDeg: 180, eclipticLatDeg: 3, type: "current" },
    ],
    lastUpdated: "2026-03",
  },
  {
    name: "Juno",
    distanceAU: 5.2,
    eclipticLonDeg: 135,
    eclipticLatDeg: 0,
    status: "active",
    launchYear: 2011,
    speedKmS: 13.0,
    description:
      "Orbiting Jupiter since 2016, studying the planet's atmosphere, magnetic field, and interior structure.",
    keyDiscoveries: [
      "Revealed Jupiter's core is diffuse, not solid",
      "Mapped Jupiter's magnetic field in detail",
      "Discovered new cyclone patterns at Jupiter's poles",
      "Stunning close-up images of Jupiter's clouds",
    ],
    trajectory: [
      { body: "Earth", year: 2011, distanceAU: 1, eclipticLonDeg: 0, eclipticLatDeg: 0, type: "launch" },
      { body: "Earth", year: 2013, distanceAU: 1, eclipticLonDeg: 60, eclipticLatDeg: 0, type: "gravity-assist" },
      { body: "Jupiter", year: 2016, distanceAU: 5.2, eclipticLonDeg: 135, eclipticLatDeg: 0, type: "arrival" },
    ],
    lastUpdated: "2026-03",
  },
  {
    name: "JWST",
    distanceAU: 1.01,
    eclipticLonDeg: 200,
    eclipticLatDeg: 0,
    status: "active",
    launchYear: 2021,
    speedKmS: 0.3,
    description:
      "The James Webb Space Telescope orbits the Sun-Earth L2 Lagrange point, 1.5 million km from Earth. The most powerful space telescope ever built.",
    keyDiscoveries: [
      "Deepest infrared images of the universe",
      "First direct image of an exoplanet with MIRI",
      "Detected CO2 in an exoplanet atmosphere",
      "Revealed earliest galaxies in cosmic history",
    ],
    trajectory: [
      { body: "Earth", year: 2021, distanceAU: 1, eclipticLonDeg: 0, eclipticLatDeg: 0, type: "launch" },
      { body: "L2", year: 2022, distanceAU: 1.01, eclipticLonDeg: 200, eclipticLatDeg: 0, type: "arrival" },
    ],
    lastUpdated: "2026-03",
  },
  {
    name: "Cassini",
    distanceAU: 9.5,
    eclipticLonDeg: 250,
    eclipticLatDeg: 0,
    status: "inactive",
    launchYear: 1997,
    speedKmS: 0,
    description:
      "Studied Saturn and its moons for 13 years before its planned destruction in Saturn's atmosphere in 2017.",
    keyDiscoveries: [
      "Discovered geysers on Enceladus (possible subsurface ocean)",
      "Landed Huygens probe on Titan",
      "Revealed methane lakes on Titan",
      "Detailed study of Saturn's ring structure",
    ],
    trajectory: [
      { body: "Earth", year: 1997, distanceAU: 1, eclipticLonDeg: 0, eclipticLatDeg: 0, type: "launch" },
      { body: "Venus", year: 1998, distanceAU: 0.72, eclipticLonDeg: 30, eclipticLatDeg: 0, type: "gravity-assist" },
      { body: "Venus", year: 1999, distanceAU: 0.72, eclipticLonDeg: 80, eclipticLatDeg: 0, type: "gravity-assist" },
      { body: "Earth", year: 1999, distanceAU: 1, eclipticLonDeg: 120, eclipticLatDeg: 0, type: "gravity-assist" },
      { body: "Jupiter", year: 2000, distanceAU: 5.2, eclipticLonDeg: 180, eclipticLatDeg: 0, type: "gravity-assist" },
      { body: "Saturn", year: 2004, distanceAU: 9.5, eclipticLonDeg: 250, eclipticLatDeg: 0, type: "arrival" },
    ],
    lastUpdated: "2026-03",
  },
  {
    name: "OSIRIS-APEX",
    distanceAU: 1.1,
    eclipticLonDeg: 240,
    eclipticLatDeg: 2,
    status: "active",
    launchYear: 2016,
    speedKmS: 6.0,
    description:
      "Originally OSIRIS-REx, which successfully returned samples from asteroid Bennu in 2023. Now renamed OSIRIS-APEX, heading to study asteroid Apophis during its close Earth approach in 2029.",
    keyDiscoveries: [
      "Successfully collected and returned samples from asteroid Bennu",
      "Revealed Bennu's surface is loose rubble, not solid rock",
      "Found water-bearing minerals on Bennu",
    ],
    trajectory: [
      { body: "Earth", year: 2016, distanceAU: 1, eclipticLonDeg: 0, eclipticLatDeg: 0, type: "launch" },
      { body: "Bennu", year: 2018, distanceAU: 1.12, eclipticLonDeg: 150, eclipticLatDeg: 6, type: "arrival" },
      { body: "Earth", year: 2023, distanceAU: 1, eclipticLonDeg: 200, eclipticLatDeg: 0, type: "gravity-assist" },
      { body: "OSIRIS-APEX", year: 2026, distanceAU: 1.1, eclipticLonDeg: 240, eclipticLatDeg: 2, type: "current" },
    ],
    lastUpdated: "2026-03",
  },
  {
    name: "Lucy",
    distanceAU: 5.0,
    eclipticLonDeg: 160,
    eclipticLatDeg: 1,
    status: "active",
    launchYear: 2021,
    speedKmS: 15.5,
    description:
      "On a 12-year mission to explore Jupiter's Trojan asteroids — remnants from the early solar system.",
    keyDiscoveries: [
      "Discovered Dinkinesh's contact binary moon",
      "First mission to Jupiter's Trojan asteroids",
    ],
    trajectory: [
      { body: "Earth", year: 2021, distanceAU: 1, eclipticLonDeg: 0, eclipticLatDeg: 0, type: "launch" },
      { body: "Dinkinesh", year: 2023, distanceAU: 1.6, eclipticLonDeg: 80, eclipticLatDeg: 0, type: "arrival" },
      { body: "Earth", year: 2024, distanceAU: 1, eclipticLonDeg: 100, eclipticLatDeg: 0, type: "gravity-assist" },
      { body: "Lucy", year: 2026, distanceAU: 5.0, eclipticLonDeg: 160, eclipticLatDeg: 1, type: "current" },
    ],
    lastUpdated: "2026-03",
  },
  {
    name: "BepiColombo",
    distanceAU: 0.39,
    eclipticLonDeg: 320,
    eclipticLatDeg: 7,
    status: "active",
    launchYear: 2018,
    speedKmS: 47.0,
    description:
      "Joint ESA-JAXA mission to Mercury. Performing gravity assists to slow down for Mercury orbit insertion in 2025.",
    keyDiscoveries: [
      "Close flyby imaging of Mercury during approach",
      "Measured Mercury's magnetic field during flybys",
    ],
    trajectory: [
      { body: "Earth", year: 2018, distanceAU: 1, eclipticLonDeg: 0, eclipticLatDeg: 0, type: "launch" },
      { body: "Venus", year: 2020, distanceAU: 0.72, eclipticLonDeg: 200, eclipticLatDeg: 2, type: "gravity-assist" },
      { body: "Mercury", year: 2025, distanceAU: 0.39, eclipticLonDeg: 320, eclipticLatDeg: 7, type: "arrival" },
    ],
    lastUpdated: "2026-03",
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add lib/deep-space-probes.ts
git commit -m "feat: add deep space probe data with trajectory waypoints"
```

---

## Chunk 2: Earth Globe View Components

### Task 4: Download NASA Blue Marble Textures

**Files:**
- Create: `public/textures/earth-blue-marble-8k.jpg`
- Create: `public/textures/earth-blue-marble-4k.jpg`
- Create: `public/textures/earth-blue-marble-1k.jpg`

- [ ] **Step 1: Create textures directory and download Blue Marble images**

```bash
mkdir -p public/textures

# Download from NASA Visible Earth (public domain)
# Try the 8K (8192x4096) version first, fall back to 5400x2700 if unavailable
curl -L "https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74393/world.200412.3x8192x4096.jpg" -o public/textures/earth-blue-marble-8k.jpg || \
curl -L "https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74393/world.200412.3x5400x2700.jpg" -o public/textures/earth-blue-marble-8k.jpg

# Generate smaller versions using sips (macOS built-in)
sips -z 2048 4096 public/textures/earth-blue-marble-8k.jpg --out public/textures/earth-blue-marble-4k.jpg
sips -z 512 1024 public/textures/earth-blue-marble-8k.jpg --out public/textures/earth-blue-marble-1k.jpg
```

Note: If the NASA URL is unavailable, search for "NASA Blue Marble" at https://visibleearth.nasa.gov/ and download the highest resolution "world topo" JPEG. The key is an equirectangular projection suitable for sphere mapping.

- [ ] **Step 2: Commit**

```bash
git add public/textures/
git commit -m "feat: add NASA Blue Marble Earth textures (8k, 4k, 1k)"
```

---

### Task 5: SpaceportGlobe Component — 3D Scene

**Files:**
- Create: `components/space/SpaceportGlobe.tsx`

This is the main component. It renders:
- Blue Marble Earth sphere
- Atmosphere glow
- Starfield background
- Spaceport markers on the surface
- Camera controls with zoom-to-spaceport animation
- Side panel for launch list
- Trajectory + orbit visualization on launch click

Reference `components/tools/SatelliteScene.tsx` for Earth rendering patterns (sphere geometry, atmosphere mesh, OrbitControls, CameraController lerp pattern, `<Html>` for labels).

- [ ] **Step 1: Create the base SpaceportGlobe component with Earth sphere**

Create `components/space/SpaceportGlobe.tsx` with:
- React Three Fiber `<Canvas>` setup (camera at [0, 2, 5], fov 45)
- Earth sphere using `useLoader(TextureLoader, ...)` for Blue Marble texture
- Progressive texture loading: start with 1k placeholder, swap to 4k on mobile or 8k on desktop (detect via `window.innerWidth < 768`)
- Atmosphere: outer sphere at 1.015× radius with blue tint, `THREE.BackSide`, transparent
- Starfield: use `<Stars>` from `@react-three/drei` or scatter point geometry
- `OrbitControls` with `enablePan={false}`, `minDistance={1.8}`, `maxDistance={8}`
- Auto-rotate when no spaceport selected (`autoRotate`, `autoRotateSpeed={0.3}`)
- Wrap in dynamic import with `ssr: false` in the parent

```typescript
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import {
  SPACEPORT_LOCATIONS,
  latLonToVector3,
  type SpaceportLocation,
} from "@/lib/spaceports";
import { getTrajectoryTemplate } from "@/lib/trajectory-templates";

const EARTH_RADIUS = 2;

function Earth() {
  // Progressive texture loading: start with 1k placeholder, then load full res
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const placeholder = useLoader(THREE.TextureLoader, "/textures/earth-blue-marble-1k.jpg");
  const [fullTexture, setFullTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const path = isMobile
      ? "/textures/earth-blue-marble-4k.jpg"
      : "/textures/earth-blue-marble-8k.jpg";
    loader.load(path, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setFullTexture(tex);
    });
  }, [isMobile]);

  const texture = fullTexture ?? placeholder;
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <group>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS * 1.015, 48, 48]} />
        <meshBasicMaterial
          color="#4a9eff"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// ... rest of component continues in subsequent steps
```

- [ ] **Step 2: Add SpaceportMarker sub-component**

Within the same file, add marker rendering. Each marker is a small glowing sphere positioned on the Earth surface using `latLonToVector3`. On hover, show a tooltip via `<Html>`. On click, dispatch the selection.

```typescript
function SpaceportMarker({
  location,
  isSelected,
  launchCount,
  onClick,
}: {
  location: SpaceportLocation;
  isSelected: boolean;
  launchCount: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const position = useMemo(
    () => latLonToVector3(location.lat, location.lon, EARTH_RADIUS * 1.005),
    [location.lat, location.lon]
  );

  return (
    <group position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[isSelected ? 0.04 : 0.025, 16, 16]} />
        <meshBasicMaterial
          color={isSelected ? "#22d3ee" : launchCount > 0 ? "#4ade80" : "#6b7280"}
          transparent
          opacity={hovered || isSelected ? 1 : 0.8}
        />
      </mesh>
      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.03, 0.06, 32]} />
        <meshBasicMaterial
          color={isSelected ? "#22d3ee" : "#4ade80"}
          transparent
          opacity={hovered || isSelected ? 0.4 : 0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Tooltip */}
      {(hovered || isSelected) && (
        <Html distanceFactor={8} style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-lg bg-card/95 px-3 py-1.5 text-xs font-medium text-foreground border border-white/10 backdrop-blur-sm shadow-lg">
            <div>{location.name}</div>
            {launchCount > 0 && (
              <div className="text-[10px] text-muted-foreground">
                {launchCount} upcoming launch{launchCount !== 1 ? "es" : ""}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
```

- [ ] **Step 3: Add CameraController for zoom-to-spaceport animation**

Lerp camera position toward selected spaceport. When no spaceport is selected, return to default orbit. Pattern from `SatelliteScene.tsx` CameraController.

```typescript
function CameraController({
  target,
  controlsRef,
}: {
  target: [number, number, number] | null;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const defaultPos = useRef(new THREE.Vector3(0, 2, 5));

  useFrame(() => {
    if (!controlsRef.current) return;

    if (target) {
      // Zoom toward target, positioned slightly outward from surface
      const targetVec = new THREE.Vector3(...target);
      const dir = targetVec.clone().normalize();
      const cameraTarget = dir.multiplyScalar(EARTH_RADIUS + 1.5);

      camera.position.lerp(cameraTarget, 0.025);
      controlsRef.current.target.lerp(
        new THREE.Vector3(...target),
        0.025
      );
    } else {
      camera.position.lerp(defaultPos.current, 0.02);
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.02);
    }
    controlsRef.current.update();
  });

  return null;
}
```

- [ ] **Step 4: Add LaunchTrajectory sub-component**

Renders a curved arc from the pad to orbit insertion, plus the target orbit ring.

```typescript
function LaunchTrajectory({
  padLat,
  padLon,
  template,
}: {
  padLat: number;
  padLon: number;
  template: import("@/lib/trajectory-templates").TrajectoryTemplate;
}) {
  const points = useMemo(() => {
    const start = new THREE.Vector3(
      ...latLonToVector3(padLat, padLon, EARTH_RADIUS * 1.005)
    );
    const altScale = Math.min(template.altitudeKm / 35786, 1); // normalize to GTO max
    const maxHeight = EARTH_RADIUS * (0.3 + altScale * 1.2);

    // Build curve from ascent profile
    const curvePoints: THREE.Vector3[] = [];
    const dir = start.clone().normalize();

    for (const [progress, altFrac] of template.ascentProfile) {
      const height = EARTH_RADIUS + altFrac * maxHeight * 0.5;
      // Rotate along the trajectory direction
      const angle = progress * Math.PI * 0.4;
      const rotAxis = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
      const point = dir
        .clone()
        .applyAxisAngle(rotAxis, angle)
        .multiplyScalar(height);
      curvePoints.push(point);
    }

    return new THREE.CatmullRomCurve3(curvePoints).getPoints(64);
  }, [padLat, padLon, template]);

  // Trajectory line object (same pattern as OrbitPath in SolarSystemScene)
  const trajectoryLine = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: "#f59e0b",
      transparent: true,
      opacity: 0.8,
    });
    return new THREE.Line(geo, mat);
  }, [points]);

  // Orbit ring
  const orbitRadius = useMemo(() => {
    const altScale = Math.min(template.altitudeKm / 35786, 1);
    return EARTH_RADIUS + 0.15 + altScale * 0.6;
  }, [template.altitudeKm]);

  return (
    <group>
      {/* Trajectory arc — using primitive to match codebase pattern */}
      <primitive object={trajectoryLine} />
      {/* Target orbit ring — tilted by inclination */}
      <mesh rotation={[Math.PI / 2 - (template.inclinationDeg * Math.PI) / 180, 0, 0]}>
        <ringGeometry args={[orbitRadius - 0.005, orbitRadius + 0.005, 128]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 5: Compose the main SpaceportGlobe export**

Wire everything together: state for selected location, selected launch, launch data fetching, side panel rendering.

```typescript
// Re-use the Launch interface from the launch tracker page.
// Since it's defined locally there, copy it here for now. In a future refactor,
// extract to a shared types file (e.g., lib/types.ts).
interface Launch {
  id: string;
  name: string;
  net: string;
  status: { name: string };
  launch_service_provider: { name: string };
  rocket: { configuration: { name: string } };
  pad: { name: string; location: { name: string } };
  image?: { image_url?: string } | null;
  mission?: {
    description?: string;
    type?: string;
    orbit?: { name?: string; abbrev?: string };
  } | null;
}

interface SpaceportGlobeProps {
  launches: Launch[];
}

export default function SpaceportGlobe({ launches }: SpaceportGlobeProps) {
  const [selectedLocation, setSelectedLocation] =
    useState<SpaceportLocation | null>(null);
  const [selectedLaunch, setSelectedLaunch] = useState<Launch | null>(null);
  const controlsRef = useRef<any>(null);

  // Count launches per location
  const launchCountByLocation = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const launch of launches) {
      const locName = launch.pad?.location?.name;
      if (locName) counts[locName] = (counts[locName] || 0) + 1;
    }
    return counts;
  }, [launches]);

  // Launches for selected location
  const locationLaunches = useMemo(() => {
    if (!selectedLocation) return [];
    return launches.filter(
      (l) => l.pad?.location?.name === selectedLocation.name
    );
  }, [launches, selectedLocation]);

  const cameraTarget = useMemo(() => {
    if (!selectedLocation) return null;
    return latLonToVector3(
      selectedLocation.lat,
      selectedLocation.lon,
      EARTH_RADIUS * 1.005
    );
  }, [selectedLocation]);

  const trajectoryTemplate = useMemo(() => {
    if (!selectedLaunch) return null;
    return getTrajectoryTemplate(selectedLaunch.mission?.orbit?.abbrev);
  }, [selectedLaunch]);

  return (
    <div className="relative h-[600px] w-full rounded-xl overflow-hidden border border-white/5">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "#030712" }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 3, 5]} intensity={0.8} />
        <Suspense fallback={null}>
          <Earth />
          {SPACEPORT_LOCATIONS.map((loc) => (
            <SpaceportMarker
              key={loc.id}
              location={loc}
              isSelected={selectedLocation?.id === loc.id}
              launchCount={launchCountByLocation[loc.name] || 0}
              onClick={() => {
                setSelectedLocation(
                  selectedLocation?.id === loc.id ? null : loc
                );
                setSelectedLaunch(null);
              }}
            />
          ))}
          {selectedLaunch && trajectoryTemplate && selectedLocation && (
            <LaunchTrajectory
              padLat={selectedLocation.lat}
              padLon={selectedLocation.lon}
              template={trajectoryTemplate}
            />
          )}
        </Suspense>
        <Stars radius={100} depth={50} count={2000} factor={4} fade speed={1} />
        <CameraController target={cameraTarget} controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={1.8}
          maxDistance={8}
          autoRotate={!selectedLocation}
          autoRotateSpeed={0.3}
        />
      </Canvas>

      {/* Side panel for launches at selected location */}
      {selectedLocation && (
        <div className="absolute top-4 right-4 bottom-4 w-80 overflow-y-auto rounded-xl bg-card/90 backdrop-blur-md border border-white/10 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">{selectedLocation.name}</h3>
              <p className="text-xs text-muted-foreground">
                {selectedLocation.country} · {selectedLocation.pads.length} pad
                {selectedLocation.pads.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedLocation(null);
                setSelectedLaunch(null);
              }}
              className="p-1 rounded hover:bg-white/10"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          {locationLaunches.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No upcoming launches
            </p>
          ) : (
            locationLaunches.map((launch) => (
              <button
                key={launch.id}
                onClick={() =>
                  setSelectedLaunch(
                    selectedLaunch?.id === launch.id ? null : launch
                  )
                }
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  selectedLaunch?.id === launch.id
                    ? "border-accent bg-accent/10"
                    : "border-white/5 hover:border-white/15 bg-white/5"
                }`}
              >
                <p className="text-xs font-medium truncate">{launch.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {launch.rocket.configuration.name}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(launch.net).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {launch.mission?.orbit?.abbrev && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent">
                      {launch.mission.orbit.abbrev}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Verify the component renders**

Run the dev server and test:
```bash
npm run dev
```
Navigate to the space page, click the Globe tab. Verify:
- Earth renders with Blue Marble texture
- Spaceport markers visible as glowing dots
- Clicking a marker zooms camera and shows side panel
- Clicking a launch shows trajectory arc and orbit ring

- [ ] **Step 7: Commit**

```bash
git add components/space/SpaceportGlobe.tsx
git commit -m "feat: add SpaceportGlobe component with markers, trajectories, and side panel"
```

---

### Task 6: Integrate Globe Tab into Launch Tracker

**Files:**
- Modify: `app/tools/launch-tracker/page.tsx` (lines 32-38 for Tab type/TABS array, line 143+ for tab content)

- [ ] **Step 1: Add Globe tab to the type and TABS array**

In `app/tools/launch-tracker/page.tsx`:

Update the Tab type (line 32):
```typescript
// Before:
type Tab = "upcoming" | "past" | "rockets";

// After:
type Tab = "globe" | "upcoming" | "past" | "rockets";
```

Update TABS array (lines 34-38) — add Globe as first entry:
```typescript
const TABS: { key: Tab; label: string; icon: typeof CalendarClock }[] = [
  { key: "globe", label: "Globe", icon: Globe2 },
  { key: "upcoming", label: "Upcoming", icon: CalendarClock },
  { key: "past", label: "Past Launches", icon: History },
  { key: "rockets", label: "Rockets", icon: RocketIcon },
];
```

Add import for `Globe2` from lucide-react and the dynamic SpaceportGlobe import:
```typescript
import { Loader2, CalendarClock, History, Rocket as RocketIcon, X, Globe2 } from "lucide-react";
import dynamic from "next/dynamic";

const SpaceportGlobe = dynamic(
  () => import("@/components/space/SpaceportGlobe"),
  { ssr: false }
);
```

Default tab stays `upcoming` (no change to `useState<Tab>("upcoming")`).

- [ ] **Step 2: Add Globe tab content rendering**

Add before the `{tab === "upcoming" && (...)}` block (before line 143):

```typescript
{tab === "globe" && (
  <SpaceportGlobe launches={launches} />
)}
```

- [ ] **Step 3: Verify integration**

```bash
npm run dev
```
Navigate to Space → Earth tab. Verify:
- Globe tab appears first in the tab bar
- Default tab is still Upcoming
- Clicking Globe shows the 3D earth with markers
- Other tabs still work

- [ ] **Step 4: Commit**

```bash
git add app/tools/launch-tracker/page.tsx
git commit -m "feat: integrate Globe sub-tab into launch tracker"
```

---

## Chunk 3: Deep Space Probes Integration

### Task 7: Add Probe Markers to Solar System Scene

**Important context:** The solar system in the Deep Space tab is rendered via the 3D React Three Fiber component `SolarSystemScene.tsx`, NOT the dead 2D `SolarSystemView` function in `DeepSpaceView.tsx`. Probes must be added as R3F components inside `SolarSystemScene.tsx`, following the same patterns as `PlanetBody`.

**Files:**
- Modify: `components/space/SolarSystemScene.tsx` (add probe R3F components, lines 306-342 Scene function)
- Modify: `components/space/DeepSpaceView.tsx` (add probe state, info panel, pass callbacks to SolarSystemScene)
- Create: `components/space/ProbeInfoPanel.tsx`

- [ ] **Step 1: Create ProbeInfoPanel component**

Create `components/space/ProbeInfoPanel.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";
import type { DeepSpaceProbe } from "@/lib/deep-space-probes";

interface ProbeInfoPanelProps {
  probe: DeepSpaceProbe;
  onClose: () => void;
}

export default function ProbeInfoPanel({ probe, onClose }: ProbeInfoPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-4 top-4 bottom-4 w-80 max-md:w-full max-md:right-0 max-md:top-auto max-md:bottom-0 max-md:h-[50vh] overflow-y-auto rounded-xl max-md:rounded-b-none bg-card/90 backdrop-blur-md border border-white/10 p-5 z-30"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-bold">{probe.name}</h3>
          <span
            className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${
              probe.status === "active"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-zinc-500/20 text-zinc-400"
            }`}
          >
            {probe.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 mt-1"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
        {probe.description}
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
            Distance
          </p>
          <p className="text-sm font-medium">{probe.distanceAU} AU</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
            Speed
          </p>
          <p className="text-sm font-medium">{probe.speedKmS} km/s</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
            Launched
          </p>
          <p className="text-sm font-medium">{probe.launchYear}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
            Mission Age
          </p>
          <p className="text-sm font-medium">
            {new Date().getFullYear() - probe.launchYear} years
          </p>
        </div>
      </div>

      {/* Key Discoveries */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold mb-2">Key Discoveries</h4>
        <ul className="space-y-1.5">
          {probe.keyDiscoveries.map((discovery, i) => (
            <li
              key={i}
              className="text-xs text-muted-foreground flex items-start gap-2"
            >
              <span className="text-accent mt-0.5">•</span>
              {discovery}
            </li>
          ))}
        </ul>
      </div>

      {/* Trajectory Timeline */}
      <div>
        <h4 className="text-xs font-semibold mb-2">Trajectory</h4>
        <div className="relative pl-4 border-l border-white/10 space-y-3">
          {probe.trajectory.map((wp, i) => (
            <div key={i} className="relative">
              <div
                className={`absolute -left-[21px] w-2.5 h-2.5 rounded-full border-2 ${
                  wp.type === "current"
                    ? "bg-accent border-accent"
                    : wp.type === "gravity-assist"
                    ? "bg-amber-500 border-amber-500"
                    : wp.type === "launch"
                    ? "bg-emerald-500 border-emerald-500"
                    : "bg-blue-500 border-blue-500"
                }`}
              />
              <p className="text-xs font-medium">{wp.body}</p>
              <p className="text-[10px] text-muted-foreground">
                {wp.year} · {wp.distanceAU} AU
                {wp.type === "gravity-assist" && " · Gravity assist"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit ProbeInfoPanel**

```bash
git add components/space/ProbeInfoPanel.tsx
git commit -m "feat: add ProbeInfoPanel component for deep space probe details"
```

- [ ] **Step 3: Add ProbeMarker R3F component to SolarSystemScene.tsx**

In `components/space/SolarSystemScene.tsx`, add imports and a `ProbeMarker` component. This follows the same pattern as `PlanetBody` — uses `orbitRadius()` for positioning, `<Html>` from drei for labels, and click handlers.

Add imports at the top of the file:
```typescript
import {
  DEEP_SPACE_PROBES,
  EDGE_INDICATOR_THRESHOLD_AU,
  type DeepSpaceProbe,
} from "@/lib/deep-space-probes";
```

Add the `ProbeMarker` component (before the `Scene` function):

```typescript
// ── Probe marker ─────────────────────────────────────────────
function ProbeMarker({
  probe,
  isSelected,
  onSelect,
}: {
  probe: DeepSpaceProbe;
  isSelected: boolean;
  onSelect: (probe: DeepSpaceProbe) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isNearby = probe.distanceAU <= EDGE_INDICATOR_THRESHOLD_AU;

  // Position: use orbitRadius for nearby, clamp at edge for far probes
  const r = isNearby
    ? orbitRadius(probe.distanceAU)
    : orbitRadius(30) + 1.5; // just beyond Neptune orbit
  const angle = (probe.eclipticLonDeg * Math.PI) / 180;
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;

  return (
    <group position={[x, 0, z]}>
      {/* Diamond-shaped marker (rotated cube) */}
      <mesh
        rotation={[Math.PI / 4, 0, Math.PI / 4]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(probe);
        }}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <boxGeometry args={[
          isSelected ? 0.18 : 0.12,
          isSelected ? 0.18 : 0.12,
          isSelected ? 0.18 : 0.12,
        ]} />
        <meshBasicMaterial
          color={probe.status === "active" ? "#22d3ee" : "#6b7280"}
          transparent
          opacity={hovered || isSelected ? 1 : 0.7}
        />
      </mesh>

      {/* Glow effect when selected */}
      {isSelected && (
        <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.15} />
        </mesh>
      )}

      {/* Label */}
      <Html
        distanceFactor={14}
        style={{ pointerEvents: "none" }}
        position={[0, 0.25, 0]}
      >
        <div
          className={`whitespace-nowrap text-center text-[9px] font-medium transition-all duration-200 ${
            hovered || isSelected
              ? "text-cyan-300 bg-card/90 border border-cyan-500/20 rounded-md px-2 py-0.5 backdrop-blur-sm shadow-lg"
              : "text-cyan-400/50"
          }`}
        >
          {probe.name}
          {!isNearby && (
            <span className="text-[8px] text-cyan-300/40 ml-1">
              {probe.distanceAU} AU →
            </span>
          )}
        </div>
      </Html>
    </group>
  );
}
```

- [ ] **Step 4: Add ProbeTrajectory R3F component**

Add a trajectory path component that renders when a probe is selected. Uses `THREE.Line` with `<primitive>` (same pattern as `OrbitPath` in the file).

```typescript
// ── Probe trajectory path ────────────────────────────────────
function ProbeTrajectory({ probe }: { probe: DeepSpaceProbe }) {
  const line = useMemo(() => {
    const points = probe.trajectory
      .filter((wp) => wp.distanceAU <= EDGE_INDICATOR_THRESHOLD_AU)
      .map((wp) => {
        const r = orbitRadius(wp.distanceAU);
        const angle = (wp.eclipticLonDeg * Math.PI) / 180;
        return new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      });

    if (points.length < 2) return null;

    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(64));
    const mat = new THREE.LineDashedMaterial({
      color: "#22d3ee",
      transparent: true,
      opacity: 0.6,
      dashSize: 0.15,
      gapSize: 0.1,
    });
    const l = new THREE.Line(geo, mat);
    l.computeLineDistances();
    return l;
  }, [probe]);

  if (!line) return null;

  return (
    <>
      <primitive object={line} />
      {/* Waypoint markers */}
      {probe.trajectory
        .filter((wp) => wp.distanceAU <= EDGE_INDICATOR_THRESHOLD_AU)
        .map((wp, i) => {
          const r = orbitRadius(wp.distanceAU);
          const angle = (wp.eclipticLonDeg * Math.PI) / 180;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
            >
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshBasicMaterial
                color={
                  wp.type === "gravity-assist"
                    ? "#f59e0b"
                    : wp.type === "launch"
                    ? "#22c55e"
                    : "#22d3ee"
                }
              />
            </mesh>
          );
        })}
    </>
  );
}
```

- [ ] **Step 5: Update Scene function to include probes**

Modify the `Scene` function (line 306-342) to accept a probe selection callback and render probes:

Update the `Scene` function signature and add to the `SolarSystemScene` export:

```typescript
function Scene({
  onSelectPlanet,
  onSelectProbe,
  selectedProbeName,
}: {
  onSelectPlanet: (planet: Planet) => void;
  onSelectProbe: (probe: DeepSpaceProbe | null) => void;
  selectedProbeName: string | null;
}) {
  const handleMiss = useCallback(() => {
    onSelectProbe(null); // Clear probe selection on background click
  }, [onSelectProbe]);

  const selectedProbe = selectedProbeName
    ? DEEP_SPACE_PROBES.find((p) => p.name === selectedProbeName) ?? null
    : null;

  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#b1c5ff", "#2a1a00", 0.3]} />

      <mesh onClick={handleMiss}>
        <sphereGeometry args={[50, 8, 8]} />
        <meshBasicMaterial visible={false} side={THREE.BackSide} />
      </mesh>

      <Sun />

      {PLANETS.map((p) => (
        <PlanetBody key={p.name} planet={p} onSelect={onSelectPlanet} />
      ))}

      {/* Deep space probes */}
      {DEEP_SPACE_PROBES.map((probe) => (
        <ProbeMarker
          key={probe.name}
          probe={probe}
          isSelected={selectedProbeName === probe.name}
          onSelect={onSelectProbe}
        />
      ))}

      {/* Selected probe trajectory */}
      {selectedProbe && <ProbeTrajectory probe={selectedProbe} />}

      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={30}
        autoRotate
        autoRotateSpeed={0.15}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.15}
      />
    </>
  );
}
```

Update the `SolarSystemScene` export to pass the new props:

```typescript
export default function SolarSystemScene({
  onSelectPlanet,
  onSelectProbe,
  selectedProbeName,
}: {
  onSelectPlanet: (planet: Planet) => void;
  onSelectProbe: (probe: DeepSpaceProbe | null) => void;
  selectedProbeName: string | null;
}) {
  return (
    <Canvas
      camera={{ position: [0, 6, 16], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Scene
        onSelectPlanet={onSelectPlanet}
        onSelectProbe={onSelectProbe}
        selectedProbeName={selectedProbeName}
      />
    </Canvas>
  );
}
```

- [ ] **Step 6: Update DeepSpaceView to manage probe state and pass callbacks**

In `components/space/DeepSpaceView.tsx`:

Add imports (note: `AnimatePresence` is already imported, do not duplicate):
```typescript
import { type DeepSpaceProbe } from "@/lib/deep-space-probes";
import ProbeInfoPanel from "@/components/space/ProbeInfoPanel";
```

Add state near existing `selectedPlanet` state:
```typescript
const [selectedProbe, setSelectedProbe] = useState<DeepSpaceProbe | null>(null);
```

Update the `SolarSystemScene` usage at line 1135-1141 to pass probe props:
```typescript
<SolarSystemScene
  onSelectPlanet={(p) => {
    setSelectedStar(null);
    setSelectedGalaxy(null);
    setSelectedProbe(null);  // Clear probe on planet select
    setSelectedPlanet(p);
  }}
  onSelectProbe={(probe) => {
    setSelectedPlanet(null);  // Clear planet on probe select
    setSelectedStar(null);
    setSelectedGalaxy(null);
    setSelectedProbe(probe);
  }}
  selectedProbeName={selectedProbe?.name ?? null}
/>
```

Add ProbeInfoPanel rendering (use existing `AnimatePresence`):
```typescript
<AnimatePresence>
  {selectedProbe && viewMode === "solar-system" && (
    <ProbeInfoPanel
      probe={selectedProbe}
      onClose={() => setSelectedProbe(null)}
    />
  )}
</AnimatePresence>
```

Update the `clearSelections` callback in `DeepSpaceView` to include probe state. Find the existing `clearSelections` function (which clears `selectedPlanet`, `selectedStar`, `selectedGalaxy`, `showSolInfo`) and add `setSelectedProbe(null)`:

```typescript
// In clearSelections callback, add:
setSelectedProbe(null);
```

Also update `handleBackgroundClick` — its condition check must include `selectedProbe`:
```typescript
// Update the condition from:
if (selectedPlanet || selectedStar || selectedGalaxy || showSolInfo) {
// To:
if (selectedPlanet || selectedStar || selectedGalaxy || showSolInfo || selectedProbe) {
```
And add `selectedProbe` to the `handleBackgroundClick` dependency array.

- [ ] **Step 7: Verify probe rendering**

```bash
npm run dev
```
Navigate to Space → Deep Space → Solar System view. Verify:
- Nearby probes (JWST, Parker, Juno, Cassini, BepiColombo, Lucy, OSIRIS-APEX) show as diamond markers among planets
- Far probes (Voyager 1/2, Pioneer 10/11, New Horizons) show as markers just beyond Neptune with distance labels
- Clicking a probe shows the info panel with stats, discoveries, and trajectory timeline
- Clicking a probe draws the dashed trajectory path through waypoints
- Clicking background or close button dismisses the panel
- Selecting a probe clears any selected planet and vice versa

- [ ] **Step 8: Commit**

```bash
git add components/space/ProbeInfoPanel.tsx components/space/SolarSystemScene.tsx components/space/DeepSpaceView.tsx
git commit -m "feat: add deep space probe markers and info panels to solar system view"
```

---

## Chunk 4: Polish and Final Integration

### Task 8: Visual Polish and Edge Cases

**Files:**
- Modify: `components/space/SpaceportGlobe.tsx`
- Modify: `components/space/DeepSpaceView.tsx`

- [ ] **Step 1: Add loading fallback for Globe**

In `SpaceportGlobe.tsx`, replace the `<Suspense fallback={null}>` wrapper with a meaningful fallback. Also add `Loader2` import:

```typescript
import { Loader2 } from "lucide-react";

// In the component JSX, replace <Suspense fallback={null}> with:
<Suspense
  fallback={
    <Html center>
      <div className="text-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto" />
        <p className="text-xs text-muted-foreground mt-2">Loading Earth...</p>
      </div>
    </Html>
  }
>
```

- [ ] **Step 2: Handle empty launches gracefully on Globe**

When `launches` is empty (still loading), show a message. Note: `SpaceportGlobe` does not have access to `tab` — it's only rendered when tab is "globe", so just check `launches.length`:

```typescript
// In the globe container, if no launches loaded yet
{launches.length === 0 && (
  <p className="absolute bottom-4 left-4 text-xs text-muted-foreground z-10">
    Loading launch data...
  </p>
)}
```

- [ ] **Step 3: Ensure probe selection clears on view mode change**

In `DeepSpaceView.tsx`, add to the view mode change handler:

```typescript
// When changing viewMode
setSelectedProbe(null);
```

- [ ] **Step 4: Add mobile responsiveness for Globe side panel**

In `SpaceportGlobe.tsx`, update the side panel div's className to use responsive breakpoints:

```typescript
// Replace the side panel className with:
className="absolute top-4 right-4 bottom-4 w-80
  max-md:w-full max-md:right-0 max-md:left-0 max-md:top-auto max-md:bottom-0 max-md:h-[50vh] max-md:rounded-b-none
  overflow-y-auto rounded-xl bg-card/90 backdrop-blur-md border border-white/10 p-4 space-y-3"
```

Verify at mobile viewport widths in browser dev tools.

- [ ] **Step 5: Final commit**

```bash
git add components/space/SpaceportGlobe.tsx components/space/DeepSpaceView.tsx
git commit -m "feat: polish globe loading states and mobile responsiveness"
```

---

### Task 9: Verify Full Integration

- [ ] **Step 1: Full verification checklist**

```bash
npm run dev
```

Test the following:
1. Space → Earth → Globe tab shows 3D Earth with Blue Marble texture
2. Spaceport markers render at correct locations
3. Hovering a marker shows tooltip with name and launch count
4. Clicking a marker zooms camera and shows side panel with launches
5. Clicking a launch shows trajectory arc and orbit ring
6. Clicking back to no selection returns camera to default
7. Upcoming/Past/Rockets tabs still work correctly
8. Space → Deep Space → Solar System shows probe markers
9. Near probes (JWST, Juno, etc.) positioned correctly among planets
10. Far probes (Voyager, Pioneer) show as edge indicators with distance
11. Clicking a probe shows info panel with stats and discoveries
12. Clicking a probe draws trajectory path
13. Switching between Deep Space sub-views clears probe selection
14. Mobile viewport renders correctly

- [ ] **Step 2: Build check**

```bash
npm run build
```
Verify no TypeScript errors or build warnings.

- [ ] **Step 3: Final commit if any fixes needed**

```bash
# Only stage the specific files that were modified
git add components/space/SpaceportGlobe.tsx components/space/SolarSystemScene.tsx components/space/DeepSpaceView.tsx app/tools/launch-tracker/page.tsx
git commit -m "fix: address integration issues from verification"
```
