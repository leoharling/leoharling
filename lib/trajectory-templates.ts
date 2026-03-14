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
