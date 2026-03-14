# Space Globe View & Deep Space Probes Design

## Overview

Two additions to the existing Space page:
1. **Earth Globe View** — A new "Globe" sub-tab in the Earth section showing a 3D Earth with spaceport locations, launch trajectories, and target orbits
2. **Deep Space Probes** — Man-made deep space objects added to the Solar System view in the Deep Space tab

Tab unification (merging Earth/Orbit/Deep Space into a continuous zoom) is deferred — the user will propose an approach after these features land.

## Feature 1: Earth Globe View

### Sub-tab placement

New "Globe" sub-tab added as the first tab in the Earth section: **Globe | Upcoming | Past Launches | Rockets**. Existing tabs remain unchanged. The default active tab remains `upcoming` — Globe is available but not the landing view. The tab type union expands from `"upcoming" | "past" | "rockets"` to `"globe" | "upcoming" | "past" | "rockets"`.

### 3D Globe Scene

- **Rendering**: React Three Fiber (consistent with existing Orbit tab)
- **Earth texture**: NASA Blue Marble (public domain). Desktop: 8192x4096 (~5MB). Mobile fallback: 4096x2048 (~1.5MB) to avoid memory issues on low-end devices. Load via `useLoader(TextureLoader, ...)` from R3F. Show a low-res placeholder (1024x512) immediately while the full texture loads.
- **Controls**: OrbitControls for rotation and zoom
- **Atmosphere**: Glow effect around the globe edge
- **Background**: Starfield

### Spaceport Locations (~30-40)

- **Data source**: Hardcoded in `lib/spaceports.ts`, initially sourced from The Space Devs API `/locations/` and `/launch-pads/` endpoints
- **Data model**:
  ```typescript
  interface SpaceportLocation {
    id: number;
    name: string;
    country: string;
    lat: number;
    lon: number;
    pads: LaunchPad[];
  }

  interface LaunchPad {
    id: number;
    name: string;
    lat: number;
    lon: number;
  }
  ```
- **Globe-level rendering**: Glowing dot markers at each location's lat/lon on the sphere surface
- **Hover**: Tooltip showing location name and count of upcoming launches
- **Click**: Smooth camera zoom animation to the location (lerp camera over ~1s with ease-out, similar to `CameraController` pattern in `SatelliteScene.tsx`)

### Pad-Level Detail (zoomed in)

- When camera is zoomed to a location, individual pad markers appear (smaller dots, slightly offset)
- Side panel slides in listing upcoming launches for that location
- Launch tiles rendered as compact cards in a scrollable panel (not the full `LaunchCard` which is too large for a side panel — use a simplified variant showing name, date, rocket, and status)
- Cross-reference launches to spaceports by exact match on `pad.location.name` from cached launch data against `SpaceportLocation.name`. The hardcoded spaceport names must exactly match the strings returned by The Space Devs API (verified during the data sourcing step)

### Launch Trajectory & Orbit Visualization

- **Trigger**: Click a launch tile from the side panel
- **Trajectory arc**: Generic ascent profile from pad location curving to the target orbit
- **Templates by orbit type** (~5 types):
  - LEO — circular ~400km, steep ascent
  - GTO — elliptical 250km × 35,786km, longer arc to transfer orbit
  - SSO — polar ~600-800km, northward trajectory
  - MEO — circular ~20,200km (GPS/navigation)
  - HEO/Molniya — highly elliptical
- **Visual elements**:
  - Smooth curved arc from pad to orbit insertion point
  - Staging event markers along the trajectory (1st/2nd stage separation, fairing deploy)
  - Target orbit rendered as a ring around the globe at the appropriate altitude and inclination
- **Orbit type matching**: Uses `mission.orbit.abbrev` from The Space Devs API data. Fallback to LEO template if orbit type is unknown or missing.
- **Info panel**: Launch details shown alongside (reuses content from existing `LaunchModal`)

### Trajectory Template Data Model

```typescript
interface TrajectoryTemplate {
  orbitAbbrev: string;          // matches mission.orbit.abbrev (e.g., "LEO", "GTO", "SSO")
  orbitName: string;            // human-readable name
  altitudeKm: number;           // target orbit altitude (or apogee for elliptical)
  perigeeKm?: number;           // for elliptical orbits
  inclinationDeg: number;       // orbit inclination
  ascentProfile: [number, number][]; // normalized (progress 0-1, altitude fraction 0-1) curve points
  stagingEvents: StagingEvent[];
}

interface StagingEvent {
  label: string;                // e.g., "MECO", "Stage 2 Ignition", "Fairing Sep"
  progressFraction: number;     // 0-1 along the trajectory arc
}
```

## Feature 2: Deep Space Probes

### Placement

Integrated into the existing Deep Space tab's Solar System view level. Probes appear alongside the planets.

### Probe Dataset (~10-15 missions)

Hardcoded in `lib/deep-space-probes.ts`.

```typescript
interface DeepSpaceProbe {
  name: string;
  distanceAU: number;          // Current distance from Sun
  eclipticLonDeg: number;      // Direction in ecliptic plane
  eclipticLatDeg: number;      // Elevation from ecliptic
  status: 'active' | 'inactive';
  launchYear: number;
  speedKmS: number;            // Current speed
  description: string;
  keyDiscoveries: string[];
  trajectory: TrajectoryWaypoint[];
  lastUpdated: string;          // ISO date when positions were last verified (e.g., "2026-03")
}

interface TrajectoryWaypoint {
  body: string;        // e.g., "Earth", "Jupiter", "Saturn"
  year: number;
  distanceAU: number;
  eclipticLonDeg: number;
  eclipticLatDeg: number;
  type: 'launch' | 'gravity-assist' | 'arrival' | 'current';
}
```

**Notable probes to include**:
- Voyager 1 (~165 AU) & Voyager 2 (~140 AU)
- Pioneer 10 (~135 AU, inactive) & Pioneer 11 (~110 AU, inactive)
- New Horizons (~60 AU)
- Parker Solar Probe (~0.1-1 AU, close to Sun)
- Juno (Jupiter orbit, ~5 AU)
- JWST (L2 point, ~1.01 AU)
- Cassini (final position at Saturn, ~9.5 AU, inactive)
- OSIRIS-REx/OSIRIS-APEX (near-Earth, ~1 AU)
- Lucy (Jupiter Trojans, variable)
- BepiColombo (Mercury approach, ~0.4 AU)

### Visualization

- **Markers**: Small distinct shape/color from planets (e.g., diamond or triangle icon vs planet circles)
- **Labels**: Probe name visible at default zoom
- **Scale strategy**: The current solar system view uses a log-scale radius function (`getOrbitRadius` in `lib/space-data.ts`) calibrated to ~30 AU (Neptune). For probes beyond Neptune:
  - Probes within 30 AU (Juno, JWST, Parker, Cassini, BepiColombo, Lucy): positioned using the existing `getOrbitRadius` function
  - Probes beyond 30 AU (Voyager 1/2, Pioneer 10/11, New Horizons): rendered as edge-anchored directional indicators — small arrow markers positioned at the view boundary pointing in the probe's actual direction, with a distance label (e.g., "Voyager 1 → 165 AU"). Clicking these opens the same info panel with full trajectory history.
  - This avoids distorting the solar system scale while still representing all probes

### Rendering Approach

The Deep Space tab's solar system view is **SVG/CSS-based** (absolute-positioned divs with `requestAnimationFrame` animation in `DeepSpaceView.tsx`), not React Three Fiber. The probe components must match:
- Probe markers: absolutely positioned `<div>` elements (consistent with planet rendering)
- Edge indicators for far probes: positioned at the container boundary with CSS transforms for rotation
- Trajectory paths on click: SVG `<path>` elements using cubic bezier curves overlaid on the solar system view, connecting waypoint positions computed via `getOrbitRadius`

### Click Interaction

- **Info panel** slides in (similar style to existing planet detail panel):
  - Name, mission status badge (active/inactive)
  - Launch year, current distance from Sun/Earth
  - Current speed
  - Mission description
  - Key discoveries list
- **Trajectory history**: Curved path drawn from Earth through gravity assist waypoints to current position
  - Waypoints marked with planet icons and year labels
  - e.g., Voyager 2: Earth (1977) → Jupiter (1979) → Saturn (1981) → Uranus (1986) → Neptune (1989) → current position
- Trajectory only visible when probe is selected (click to show, click elsewhere to hide)

## New Files

| File | Purpose |
|------|---------|
| `lib/spaceports.ts` | Hardcoded spaceport locations and pad data |
| `lib/trajectory-templates.ts` | Generic ascent profiles per orbit type |
| `lib/deep-space-probes.ts` | Probe positions, metadata, trajectory waypoints |
| `components/space/SpaceportGlobe.tsx` | Main 3D globe scene with Blue Marble texture |
| `components/space/SpaceportMarker.tsx` | Clickable location/pad markers on globe |
| `components/space/LaunchTrajectory.tsx` | Trajectory arc + orbit ring visualization |
| `components/space/DeepSpaceProbes.tsx` | Probe markers + edge indicators + trajectories (SVG/CSS, integrated into DeepSpaceView's solar system level) |
| `components/space/ProbeInfoPanel.tsx` | Info panel for selected probe |
| `components/space/CompactLaunchCard.tsx` | Simplified launch card for globe side panel |

## Modified Files

| File | Change |
|------|--------|
| `app/tools/launch-tracker/page.tsx` | Add "Globe" sub-tab |
| `components/space/DeepSpaceView.tsx` | Integrate probe markers into solar system view |

## No New API Routes

- Launch data: already cached in Supabase via existing `/api/launches` endpoint
- Spaceport data: hardcoded (sourced once from Space Devs API during development)
- Probe data: hardcoded

## Assets

- NASA Blue Marble textures in `public/textures/`:
  - `earth-blue-marble-8k.jpg` (8192x4096, ~5MB, desktop)
  - `earth-blue-marble-4k.jpg` (4096x2048, ~1.5MB, mobile fallback)
  - `earth-blue-marble-1k.jpg` (1024x512, ~50KB, placeholder during load)

## Out of Scope

- Tab unification (Earth → Orbit → Deep Space continuous zoom) — deferred, user will propose approach
- Real-time probe position updates (hardcoded is sufficient)
- Mission-specific trajectory data (generic templates per orbit type)
