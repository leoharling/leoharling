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
