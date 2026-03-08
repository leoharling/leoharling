export type RocketCategory =
  | "super-heavy"
  | "heavy"
  | "medium"
  | "small"
  | "historical";

export type RocketOverridable = Pick<
  Rocket,
  | "fullName"
  | "description"
  | "heightM"
  | "diameterM"
  | "massKg"
  | "payloadLeoKg"
  | "payloadGtoKg"
  | "thrustKn"
  | "stages"
  | "costPerLaunchUsd"
  | "reusable"
  | "maidenFlight"
  | "status"
  | "engines"
  | "propellant"
>;

export interface RocketVariant {
  id: string;
  name: string;
  overrides: Partial<RocketOverridable>;
}

export interface Rocket {
  id: string;
  name: string;
  fullName: string;
  operator: string;
  country: string;
  countryFlag: string;
  status: "active" | "retired" | "in-development";
  category: RocketCategory;
  description: string;
  heightM: number;
  diameterM: number;
  massKg: number;
  payloadLeoKg: number | null;
  payloadGtoKg: number | null;
  thrustKn: number;
  stages: number;
  costPerLaunchUsd: number | null;
  reusable: boolean;
  maidenFlight: string | null;
  lastFlight: string | null;
  successfulLaunches: number;
  failedLaunches: number;
  propellant: string;
  engines: string;
  variants?: RocketVariant[];
}

export function resolveVariant(rocket: Rocket, variantId?: string): Rocket {
  if (!variantId || !rocket.variants) return rocket;
  const variant = rocket.variants.find((v) => v.id === variantId);
  if (!variant) return rocket;
  return { ...rocket, ...variant.overrides };
}

export const CATEGORY_LABELS: Record<RocketCategory, string> = {
  "super-heavy": "Super Heavy (>50 t LEO)",
  heavy: "Heavy (20-50 t LEO)",
  medium: "Medium (2-20 t LEO)",
  small: "Small (<2 t LEO)",
  historical: "Historical",
};

export const ROCKETS: Rocket[] = [
  // ═══════════════════════════════════════════
  //  SUPER HEAVY
  // ═══════════════════════════════════════════
  {
    id: "starship",
    name: "Starship",
    fullName: "Starship / Super Heavy",
    operator: "SpaceX",
    country: "United States",
    countryFlag: "US",
    status: "active",
    category: "super-heavy",
    description:
      "The largest and most powerful rocket ever flown. Designed for full reusability, Starship aims to make humanity multiplanetary. Super Heavy's 33 Raptor engines produce nearly twice the thrust of Saturn V.",
    heightM: 121,
    diameterM: 9,
    massKg: 5000000,
    payloadLeoKg: 150000,
    payloadGtoKg: 21000,
    thrustKn: 74400,
    stages: 2,
    costPerLaunchUsd: 100_000_000,
    reusable: true,
    maidenFlight: "2023-04-20",
    lastFlight: null,
    successfulLaunches: 4,
    failedLaunches: 2,
    propellant: "CH4 / LOX (Methalox)",
    engines: "33x Raptor 2 (booster) + 6x Raptor 2 (ship)",
    variants: [
      {
        id: "block-1",
        name: "Block 1 (Current)",
        overrides: {},
      },
      {
        id: "block-2",
        name: "Block 2",
        overrides: {
          fullName: "Starship Block 2 / Super Heavy",
          description:
            "The upgraded Starship with Raptor 3 engines offering higher thrust and efficiency, a stretched ship tank section, and improved heat shield. Targeting significantly higher payload to orbit with full reusability.",
          heightM: 124,
          massKg: 5200000,
          payloadLeoKg: 200000,
          payloadGtoKg: 28000,
          thrustKn: 82000,
          costPerLaunchUsd: 50_000_000,
          engines: "33x Raptor 3 (booster) + 6x Raptor 3 (ship)",
          status: "in-development",
        },
      },
      {
        id: "block-3",
        name: "Block 3",
        overrides: {
          fullName: "Starship Block 3 / Super Heavy",
          description:
            "The future ultra-heavy variant with a significantly enlarged vehicle, targeting unprecedented payload capacity. Intended for large-scale Mars colonisation infrastructure and deep-space missions.",
          heightM: 150,
          diameterM: 12,
          massKg: 9000000,
          payloadLeoKg: 300000,
          payloadGtoKg: 50000,
          thrustKn: 120000,
          costPerLaunchUsd: null,
          engines: "TBD (next-gen Raptor)",
          status: "in-development",
        },
      },
    ],
  },
  {
    id: "sls",
    name: "SLS",
    fullName: "Space Launch System Block 1",
    operator: "NASA",
    country: "United States",
    countryFlag: "US",
    status: "active",
    category: "super-heavy",
    description:
      "NASA's deep-space mega-rocket for the Artemis programme. Derived from Space Shuttle hardware, SLS uses four RS-25 engines and two five-segment solid boosters to send the Orion spacecraft toward the Moon.",
    heightM: 98,
    diameterM: 8.4,
    massKg: 2608000,
    payloadLeoKg: 95000,
    payloadGtoKg: 27000,
    thrustKn: 39144,
    stages: 2,
    costPerLaunchUsd: 2_200_000_000,
    reusable: false,
    maidenFlight: "2022-11-16",
    lastFlight: null,
    successfulLaunches: 1,
    failedLaunches: 0,
    propellant: "LH2 / LOX + Solid boosters",
    engines: "4x RS-25 + 2x 5-seg SRB + 1x RL-10 (ICPS)",
    variants: [
      {
        id: "block-1",
        name: "Block 1 (Current)",
        overrides: {},
      },
      {
        id: "block-1b",
        name: "Block 1B",
        overrides: {
          fullName: "Space Launch System Block 1B",
          description:
            "The upgraded SLS replacing the Interim Cryogenic Propulsion Stage with the more powerful Exploration Upper Stage (EUS), featuring four RL-10C-3 engines. Enables heavier payloads to the Moon and co-manifested cargo.",
          heightM: 111,
          massKg: 2850000,
          payloadLeoKg: 105000,
          payloadGtoKg: 37000,
          engines: "4x RS-25 + 2x 5-seg SRB + 4x RL-10C-3 (EUS)",
          status: "in-development",
        },
      },
      {
        id: "block-2",
        name: "Block 2",
        overrides: {
          fullName: "Space Launch System Block 2",
          description:
            "The ultimate SLS configuration with advanced liquid or solid boosters and the Exploration Upper Stage, targeting 130 tonnes to LEO for deep-space missions to Mars and beyond.",
          heightM: 111,
          massKg: 3200000,
          payloadLeoKg: 130000,
          payloadGtoKg: 45000,
          thrustKn: 44000,
          costPerLaunchUsd: 2_500_000_000,
          engines: "4x RS-25 + Advanced Boosters + 4x RL-10C-3 (EUS)",
          status: "in-development",
        },
      },
    ],
  },
  {
    id: "falcon-heavy",
    name: "Falcon Heavy",
    fullName: "Falcon Heavy",
    operator: "SpaceX",
    country: "United States",
    countryFlag: "US",
    status: "active",
    category: "super-heavy",
    description:
      "The most powerful operational rocket by a factor of two, Falcon Heavy is made from three Falcon 9 first-stage cores. It can deliver payloads to Mars and beyond, with all three boosters capable of landing for reuse.",
    heightM: 70,
    diameterM: 12.2,
    massKg: 1420788,
    payloadLeoKg: 63800,
    payloadGtoKg: 26700,
    thrustKn: 22819,
    stages: 2,
    costPerLaunchUsd: 97_000_000,
    reusable: true,
    maidenFlight: "2018-02-06",
    lastFlight: null,
    successfulLaunches: 11,
    failedLaunches: 0,
    propellant: "RP-1 / LOX",
    engines: "27x Merlin 1D + 1x Merlin Vacuum",
    variants: [
      {
        id: "expendable",
        name: "Expendable",
        overrides: {},
      },
      {
        id: "reusable",
        name: "Reusable (All Cores)",
        overrides: {
          description:
            "Falcon Heavy in fully reusable configuration with all three boosters recovered. Reduces payload capacity significantly but dramatically lowers cost per flight through hardware recovery.",
          payloadLeoKg: 30000,
          payloadGtoKg: 8000,
          costPerLaunchUsd: 97_000_000,
        },
      },
    ],
  },

  // ═══════════════════════════════════════════
  //  HEAVY (20-50 t LEO)
  // ═══════════════════════════════════════════
  {
    id: "falcon-9",
    name: "Falcon 9",
    fullName: "Falcon 9 Block 5",
    operator: "SpaceX",
    country: "United States",
    countryFlag: "US",
    status: "active",
    category: "heavy",
    description:
      "The world's most-flown orbital rocket. The first orbital-class booster to land and re-fly, Falcon 9 has revolutionised launch economics and dominates the global launch market with Starlink and commercial missions.",
    heightM: 70,
    diameterM: 3.7,
    massKg: 549054,
    payloadLeoKg: 22800,
    payloadGtoKg: 8300,
    thrustKn: 7607,
    stages: 2,
    costPerLaunchUsd: 67_000_000,
    reusable: true,
    maidenFlight: "2010-06-04",
    lastFlight: null,
    successfulLaunches: 330,
    failedLaunches: 2,
    propellant: "RP-1 / LOX",
    engines: "9x Merlin 1D + 1x Merlin Vacuum",
    variants: [
      {
        id: "expendable",
        name: "Expendable",
        overrides: {},
      },
      {
        id: "reusable-asds",
        name: "Reusable (Droneship)",
        overrides: {
          description:
            "Falcon 9 with booster recovery on an autonomous droneship at sea. The most common flight profile, balancing payload capacity with booster reuse economics.",
          payloadLeoKg: 15600,
          payloadGtoKg: 5500,
          costPerLaunchUsd: 67_000_000,
        },
      },
      {
        id: "reusable-rtls",
        name: "Reusable (Return to Launch Site)",
        overrides: {
          description:
            "Falcon 9 with booster returning to the launch site. Uses more fuel for boostback, reducing payload but enabling fastest turnaround between flights.",
          payloadLeoKg: 11500,
          payloadGtoKg: null,
          costPerLaunchUsd: 67_000_000,
        },
      },
    ],
  },
  {
    id: "new-glenn",
    name: "New Glenn",
    fullName: "New Glenn",
    operator: "Blue Origin",
    country: "United States",
    countryFlag: "US",
    status: "active",
    category: "heavy",
    description:
      "Blue Origin's orbital heavy-lift rocket, named after astronaut John Glenn. Features a reusable first stage powered by seven BE-4 engines and a second stage with two BE-3U hydrogen-oxygen engines.",
    heightM: 98,
    diameterM: 7,
    massKg: 1500000,
    payloadLeoKg: 45000,
    payloadGtoKg: 13000,
    thrustKn: 17100,
    stages: 2,
    costPerLaunchUsd: 70_000_000,
    reusable: true,
    maidenFlight: "2025-01-13",
    lastFlight: null,
    successfulLaunches: 1,
    failedLaunches: 1,
    propellant: "CH4 / LOX (1st) + LH2 / LOX (2nd)",
    engines: "7x BE-4 + 2x BE-3U",
  },
  {
    id: "terran-r",
    name: "Terran R",
    fullName: "Terran R",
    operator: "Relativity Space",
    country: "United States",
    countryFlag: "US",
    status: "in-development",
    category: "heavy",
    description:
      "A 3D-printed medium-to-heavy-lift reusable rocket targeting the Falcon 9 market. Features the largest 3D-printed structures ever flown, with Aeon R methalox engines. First flight targeted for late 2026.",
    heightM: 86.6,
    diameterM: 5.4,
    massKg: 720000,
    payloadLeoKg: 23500,
    payloadGtoKg: 5500,
    thrustKn: 14900,
    stages: 2,
    costPerLaunchUsd: null,
    reusable: true,
    maidenFlight: null,
    lastFlight: null,
    successfulLaunches: 0,
    failedLaunches: 0,
    propellant: "CH4 / LOX (Methalox)",
    engines: "13x Aeon R + 1x Aeon Vac",
  },
  {
    id: "vulcan-centaur",
    name: "Vulcan Centaur",
    fullName: "Vulcan Centaur",
    operator: "United Launch Alliance",
    country: "United States",
    countryFlag: "US",
    status: "active",
    category: "heavy",
    description:
      "ULA's next-generation launch vehicle replacing both Atlas V and Delta IV. Powered by Blue Origin's BE-4 methane engines and featuring the high-performance Centaur V upper stage with RL-10C engines.",
    heightM: 61.6,
    diameterM: 5.4,
    massKg: 546700,
    payloadLeoKg: 27200,
    payloadGtoKg: 14400,
    thrustKn: 11000,
    stages: 2,
    costPerLaunchUsd: 110_000_000,
    reusable: false,
    maidenFlight: "2024-01-08",
    lastFlight: null,
    successfulLaunches: 4,
    failedLaunches: 0,
    propellant: "CH4 / LOX + Solid boosters",
    engines: "2x BE-4 + 1-2x RL-10C + 0-6 GEM-63XL SRBs",
    variants: [
      {
        id: "vc2",
        name: "VC2 (2 SRBs)",
        overrides: {
          fullName: "Vulcan Centaur VC2",
          description:
            "The lightest Vulcan Centaur configuration with two GEM-63XL solid rocket boosters. Suited for medium-weight government and commercial payloads.",
          massKg: 546700,
          payloadLeoKg: 20100,
          payloadGtoKg: 10300,
          thrustKn: 7600,
          costPerLaunchUsd: 100_000_000,
          engines: "2x BE-4 + 1x RL-10C + 2x GEM-63XL SRB",
        },
      },
      {
        id: "vc4",
        name: "VC4 (4 SRBs)",
        overrides: {
          fullName: "Vulcan Centaur VC4",
          description:
            "Mid-configuration Vulcan Centaur with four GEM-63XL solid rocket boosters. Offers a balance of cost and performance for heavier GTO missions.",
          massKg: 630000,
          payloadLeoKg: 24100,
          payloadGtoKg: 12700,
          thrustKn: 9200,
          costPerLaunchUsd: 105_000_000,
          engines: "2x BE-4 + 2x RL-10C + 4x GEM-63XL SRB",
        },
      },
      {
        id: "vc6",
        name: "VC6 (6 SRBs)",
        overrides: {},
      },
    ],
  },
  {
    id: "long-march-5",
    name: "Long March 5",
    fullName: "Chang Zheng 5",
    operator: "CASC",
    country: "China",
    countryFlag: "CN",
    status: "active",
    category: "heavy",
    description:
      "China's largest operational rocket, used for heavy GTO payloads, lunar missions, and space station modules. Its development marked a major step forward in Chinese launch capability with modern kerolox and hydrolox engines.",
    heightM: 57,
    diameterM: 5,
    massKg: 867000,
    payloadLeoKg: 25000,
    payloadGtoKg: 14000,
    thrustKn: 10565,
    stages: 2,
    costPerLaunchUsd: 100_000_000,
    reusable: false,
    maidenFlight: "2016-11-03",
    lastFlight: null,
    successfulLaunches: 13,
    failedLaunches: 1,
    propellant: "LH2 / LOX (core) + RP-1 / LOX (boosters)",
    engines: "2x YF-77 + 8x YF-100",
    variants: [
      {
        id: "cz-5",
        name: "CZ-5 (Standard)",
        overrides: {},
      },
      {
        id: "cz-5b",
        name: "CZ-5B (LEO Direct)",
        overrides: {
          fullName: "Chang Zheng 5B",
          description:
            "A single-stage-to-LEO variant without the second stage, used for direct insertion of heavy payloads to low Earth orbit. Launched all Chinese space station modules. Notable for its uncontrolled re-entries of the large core stage.",
          heightM: 53.7,
          massKg: 849000,
          payloadLeoKg: 22000,
          payloadGtoKg: null,
          stages: 1,
          engines: "2x YF-77 + 8x YF-100 (single core stage)",
        },
      },
    ],
  },
  {
    id: "ariane-6",
    name: "Ariane 6",
    fullName: "Ariane 64",
    operator: "Arianespace",
    country: "France",
    countryFlag: "EU",
    status: "active",
    category: "heavy",
    description:
      "Europe's new-generation heavy-lift launcher, replacing Ariane 5. Available in two configurations: A62 (2 boosters) and A64 (4 boosters). Features the re-ignitable Vinci upper-stage engine for flexible mission profiles.",
    heightM: 63,
    diameterM: 5.4,
    massKg: 860000,
    payloadLeoKg: 21650,
    payloadGtoKg: 11500,
    thrustKn: 8000,
    stages: 2,
    costPerLaunchUsd: 115_000_000,
    reusable: false,
    maidenFlight: "2024-07-09",
    lastFlight: null,
    successfulLaunches: 2,
    failedLaunches: 0,
    propellant: "LH2 / LOX + Solid boosters",
    engines: "1x Vulcain 2.1 + 1x Vinci + 2-4x P120C SRB",
    variants: [
      {
        id: "a62",
        name: "A62 (2 Boosters)",
        overrides: {
          fullName: "Ariane 62",
          description:
            "The lighter Ariane 6 configuration with two P120C solid rocket boosters. Designed for institutional and medium-weight commercial missions, filling the gap left by Vega-C for heavier payloads.",
          massKg: 530000,
          payloadLeoKg: 10350,
          payloadGtoKg: 4500,
          thrustKn: 5400,
          costPerLaunchUsd: 77_000_000,
          engines: "1x Vulcain 2.1 + 1x Vinci + 2x P120C SRB",
        },
      },
      {
        id: "a64",
        name: "A64 (4 Boosters)",
        overrides: {},
      },
    ],
  },

  // ═══════════════════════════════════════════
  //  MEDIUM (2-20 t LEO)
  // ═══════════════════════════════════════════
  {
    id: "atlas-v",
    name: "Atlas V",
    fullName: "Atlas V",
    operator: "United Launch Alliance",
    country: "United States",
    countryFlag: "US",
    status: "active",
    category: "medium",
    description:
      "One of the most reliable rockets ever built, Atlas V is being retired in favour of Vulcan Centaur. Its RD-180 engine, a Russian-built kerolox powerhouse, provided unmatched performance for two decades of national security and science missions.",
    heightM: 58.3,
    diameterM: 3.81,
    massKg: 334500,
    payloadLeoKg: 18850,
    payloadGtoKg: 8900,
    thrustKn: 4152,
    stages: 2,
    costPerLaunchUsd: 110_000_000,
    reusable: false,
    maidenFlight: "2002-08-21",
    lastFlight: null,
    successfulLaunches: 101,
    failedLaunches: 1,
    propellant: "RP-1 / LOX (1st) + LH2 / LOX (2nd)",
    engines: "1x RD-180 + 1-2x RL-10A + 0-5 AJ-60A SRBs",
    variants: [
      {
        id: "401",
        name: "401 (No SRBs)",
        overrides: {
          fullName: "Atlas V 401",
          description:
            "The base Atlas V configuration with no solid rocket boosters and a 4-metre fairing. The lightest and most affordable variant, used for lighter-weight government and commercial payloads.",
          massKg: 334500,
          payloadLeoKg: 9800,
          payloadGtoKg: 4750,
          thrustKn: 4152,
          engines: "1x RD-180 + 1x RL-10A",
        },
      },
      {
        id: "541",
        name: "541 (4 SRBs, 5m Fairing)",
        overrides: {
          fullName: "Atlas V 541",
          description:
            "A heavy-lift Atlas V configuration with four AJ-60A solid rocket boosters and a 5-metre fairing. Used for the largest national security payloads and interplanetary missions like OSIRIS-REx and Mars 2020.",
          massKg: 569000,
          payloadLeoKg: 17443,
          payloadGtoKg: 8290,
          thrustKn: 6900,
          engines: "1x RD-180 + 1x RL-10A + 4x AJ-60A SRB",
        },
      },
      {
        id: "551",
        name: "551 (5 SRBs, 5m Fairing)",
        overrides: {},
      },
    ],
  },
  {
    id: "neutron",
    name: "Neutron",
    fullName: "Neutron",
    operator: "Rocket Lab",
    country: "United States",
    countryFlag: "US",
    status: "in-development",
    category: "medium",
    description:
      "Rocket Lab's medium-lift reusable rocket designed to compete with Falcon 9. Features a novel 'Hungry Hippo' fairing that opens and closes as part of the first stage, enabling full first-stage reuse.",
    heightM: 43,
    diameterM: 7,
    massKg: 480000,
    payloadLeoKg: 13000,
    payloadGtoKg: 1500,
    thrustKn: 4000,
    stages: 2,
    costPerLaunchUsd: 50_000_000,
    reusable: true,
    maidenFlight: null,
    lastFlight: null,
    successfulLaunches: 0,
    failedLaunches: 0,
    propellant: "CH4 / LOX (Methalox)",
    engines: "7x Archimedes + 1x Archimedes Vacuum",
  },
  {
    id: "lvm3",
    name: "LVM3",
    fullName: "Launch Vehicle Mark-3 (GSLV Mk III)",
    operator: "ISRO",
    country: "India",
    countryFlag: "IN",
    status: "active",
    category: "medium",
    description:
      "India's heaviest operational rocket, designed for GTO payloads and human spaceflight under the Gaganyaan programme. Successfully launched Chandrayaan-3 to the Moon, making India the fourth country to soft-land on the lunar surface.",
    heightM: 43.5,
    diameterM: 4,
    massKg: 640000,
    payloadLeoKg: 10000,
    payloadGtoKg: 4000,
    thrustKn: 6870,
    stages: 3,
    costPerLaunchUsd: 51_000_000,
    reusable: false,
    maidenFlight: "2017-06-05",
    lastFlight: null,
    successfulLaunches: 7,
    failedLaunches: 0,
    propellant: "Solid / UDMH+N2O4 / LH2+LOX",
    engines: "2x S200 SRB + 2x Vikas + 1x CE-20",
  },
  {
    id: "soyuz-2",
    name: "Soyuz-2",
    fullName: "Soyuz-2.1b / Fregat",
    operator: "Roscosmos",
    country: "Russia",
    countryFlag: "RU",
    status: "active",
    category: "medium",
    description:
      "The modernised descendant of the R-7, the world's first ICBM and orbital rocket. The Soyuz family has been flying since 1966, making it the most-launched rocket family in history with over 1,900 flights.",
    heightM: 46.3,
    diameterM: 10.3,
    massKg: 312000,
    payloadLeoKg: 8200,
    payloadGtoKg: 3250,
    thrustKn: 4150,
    stages: 3,
    costPerLaunchUsd: 48_000_000,
    reusable: false,
    maidenFlight: "2004-11-08",
    lastFlight: null,
    successfulLaunches: 130,
    failedLaunches: 3,
    propellant: "RP-1 / LOX",
    engines: "4x RD-107A + 1x RD-108A + 1x RD-0124",
    variants: [
      {
        id: "2-1a",
        name: "Soyuz-2.1a",
        overrides: {
          fullName: "Soyuz-2.1a / Fregat",
          description:
            "The baseline modernised Soyuz with digital flight control and the RD-0110 third-stage engine. Used for Progress cargo ships to the ISS and lighter satellite payloads.",
          payloadLeoKg: 7020,
          payloadGtoKg: 2800,
          engines: "4x RD-107A + 1x RD-108A + 1x RD-0110",
        },
      },
      {
        id: "2-1b",
        name: "Soyuz-2.1b",
        overrides: {},
      },
      {
        id: "2-1v",
        name: "Soyuz-2.1v (Light)",
        overrides: {
          fullName: "Soyuz-2.1v",
          description:
            "A lightweight Soyuz variant without the four strap-on boosters, using an NK-33 (later RD-193) engine on the core stage. Designed for small military payloads to low Earth orbit.",
          massKg: 157000,
          payloadLeoKg: 2850,
          payloadGtoKg: null,
          thrustKn: 1920,
          engines: "1x RD-193 + 1x RD-0124",
        },
      },
    ],
  },
  {
    id: "h3",
    name: "H3",
    fullName: "H3-24",
    operator: "JAXA / MHI",
    country: "Japan",
    countryFlag: "JP",
    status: "active",
    category: "medium",
    description:
      "Japan's next-generation flagship rocket replacing H-IIA. Designed to halve launch costs through simplified manufacturing and an innovative expander-bleed-cycle LE-9 engine. Recovered from a 2023 first-flight failure to fly successfully.",
    heightM: 63,
    diameterM: 5.27,
    massKg: 574000,
    payloadLeoKg: 6500,
    payloadGtoKg: 6500,
    thrustKn: 4200,
    stages: 2,
    costPerLaunchUsd: 50_000_000,
    reusable: false,
    maidenFlight: "2024-02-17",
    lastFlight: null,
    successfulLaunches: 3,
    failedLaunches: 1,
    propellant: "LH2 / LOX",
    engines: "2-3x LE-9 + 1x LE-5B-3 + 0-4 SRBs",
    variants: [
      {
        id: "h3-22",
        name: "H3-22 (2 SRBs, Short Fairing)",
        overrides: {
          fullName: "H3-22S",
          description:
            "The lightest H3 configuration with 2 LE-9 engines and 2 SRB-3 solid boosters. Designed for medium-weight government satellites with a short or long payload fairing.",
          massKg: 420000,
          payloadLeoKg: 4000,
          payloadGtoKg: 3600,
          thrustKn: 3200,
          engines: "2x LE-9 + 1x LE-5B-3 + 2x SRB-3",
        },
      },
      {
        id: "h3-24",
        name: "H3-24 (4 SRBs)",
        overrides: {},
      },
      {
        id: "h3-30",
        name: "H3-30 (3 Engines, No SRBs)",
        overrides: {
          fullName: "H3-30",
          description:
            "The boosterless H3 configuration with 3 LE-9 engines and no solid rocket boosters. Optimised for heavy Sun-synchronous orbit missions and bulk LEO payloads.",
          massKg: 430000,
          payloadLeoKg: 6500,
          payloadGtoKg: null,
          thrustKn: 4350,
          engines: "3x LE-9 + 1x LE-5B-3",
        },
      },
    ],
  },
  {
    id: "pslv",
    name: "PSLV",
    fullName: "Polar Satellite Launch Vehicle",
    operator: "ISRO",
    country: "India",
    countryFlag: "IN",
    status: "active",
    category: "medium",
    description:
      "India's workhorse rocket, famous for its reliability and cost-effectiveness. PSLV set a world record by deploying 104 satellites in a single mission and launched both Chandrayaan-1 and Mars Orbiter Mission.",
    heightM: 44,
    diameterM: 2.8,
    massKg: 320000,
    payloadLeoKg: 3800,
    payloadGtoKg: 1425,
    thrustKn: 4860,
    stages: 4,
    costPerLaunchUsd: 28_000_000,
    reusable: false,
    maidenFlight: "1993-09-20",
    lastFlight: null,
    successfulLaunches: 57,
    failedLaunches: 2,
    propellant: "Solid / UDMH+N2O4 / Solid / MMH+MON",
    engines: "S139 + 6x Vikas + S-7 + 2x L-2-5",
    variants: [
      {
        id: "pslv-ca",
        name: "PSLV-CA (Core Alone)",
        overrides: {
          fullName: "PSLV-CA",
          description:
            "The lightest PSLV configuration without any strap-on boosters. Used for lighter payloads to low Earth orbit where the cost-savings of omitting SRBs is worthwhile.",
          massKg: 230000,
          payloadLeoKg: 1100,
          payloadGtoKg: null,
          thrustKn: 4860,
          engines: "S139 core + PS2 + PS3 + PS4 (no strap-ons)",
        },
      },
      {
        id: "pslv-dl",
        name: "PSLV-DL (2 Strap-ons)",
        overrides: {
          fullName: "PSLV-DL",
          description:
            "An intermediate PSLV configuration with two PS0M strap-on boosters, bridging the gap between Core Alone and the standard six-booster configurations.",
          massKg: 260000,
          payloadLeoKg: 2100,
          payloadGtoKg: null,
          engines: "S139 + 2x PSOM-XL + PS2 + PS3 + PS4",
        },
      },
      {
        id: "pslv-ql",
        name: "PSLV-QL (4 Strap-ons)",
        overrides: {
          fullName: "PSLV-QL",
          description:
            "PSLV with four PS0M-XL strap-on boosters. Provides more payload capacity than the DL variant while being lighter than the full XL configuration.",
          massKg: 290000,
          payloadLeoKg: 3000,
          payloadGtoKg: 1000,
          engines: "S139 + 4x PSOM-XL + PS2 + PS3 + PS4",
        },
      },
      {
        id: "pslv-xl",
        name: "PSLV-XL (6 Strap-ons)",
        overrides: {},
      },
    ],
  },
  {
    id: "long-march-2d",
    name: "Long March 2D",
    fullName: "Chang Zheng 2D",
    operator: "CASC",
    country: "China",
    countryFlag: "CN",
    status: "active",
    category: "medium",
    description:
      "A reliable Chinese medium-lift rocket used primarily for Sun-synchronous and LEO missions. Long March 2D has maintained an excellent success record across decades of service, launching Earth observation and scientific satellites.",
    heightM: 41.1,
    diameterM: 3.35,
    massKg: 232250,
    payloadLeoKg: 3500,
    payloadGtoKg: null,
    thrustKn: 2962,
    stages: 2,
    costPerLaunchUsd: 29_000_000,
    reusable: false,
    maidenFlight: "1992-08-09",
    lastFlight: null,
    successfulLaunches: 85,
    failedLaunches: 0,
    propellant: "N2O4 / UDMH",
    engines: "4x YF-21C + 1x YF-24C cluster",
  },
  {
    id: "vega-c",
    name: "Vega-C",
    fullName: "Vega-C",
    operator: "Arianespace",
    country: "France",
    countryFlag: "EU",
    status: "active",
    category: "medium",
    description:
      "Europe's small-to-medium satellite launcher, upgraded from Vega with a more powerful P120C first stage shared with Ariane 6. Serves the growing European institutional and commercial small-sat market.",
    heightM: 35,
    diameterM: 3.4,
    massKg: 210000,
    payloadLeoKg: 2200,
    payloadGtoKg: null,
    thrustKn: 3015,
    stages: 4,
    costPerLaunchUsd: 37_000_000,
    reusable: false,
    maidenFlight: "2022-07-13",
    lastFlight: null,
    successfulLaunches: 1,
    failedLaunches: 1,
    propellant: "Solid (1-3) + UDMH/N2O4 (4th)",
    engines: "P120C + Zefiro-40 + Zefiro-9A + AVUM+",
  },

  // ═══════════════════════════════════════════
  //  SMALL (<2 t LEO)
  // ═══════════════════════════════════════════
  {
    id: "electron",
    name: "Electron",
    fullName: "Electron",
    operator: "Rocket Lab",
    country: "United States",
    countryFlag: "US",
    status: "active",
    category: "small",
    description:
      "A dedicated small-satellite launcher and the first orbital rocket to use electric pump-fed engines and 3D-printed combustion chambers. Electron has become the leading Western small-sat launcher with rapid cadence.",
    heightM: 18,
    diameterM: 1.2,
    massKg: 12550,
    payloadLeoKg: 300,
    payloadGtoKg: null,
    thrustKn: 224,
    stages: 2,
    costPerLaunchUsd: 7_500_000,
    reusable: true,
    maidenFlight: "2017-05-25",
    lastFlight: null,
    successfulLaunches: 48,
    failedLaunches: 4,
    propellant: "RP-1 / LOX",
    engines: "9x Rutherford + 1x Rutherford Vacuum",
  },
  {
    id: "firefly-alpha",
    name: "Firefly Alpha",
    fullName: "Firefly Alpha",
    operator: "Firefly Aerospace",
    country: "United States",
    countryFlag: "US",
    status: "active",
    category: "small",
    description:
      "A two-stage small-lift launch vehicle built with patented tap-off cycle engines. Alpha targets the growing small-sat market with a cost-effective dedicated ride to orbit, competing with rideshare options.",
    heightM: 29.5,
    diameterM: 1.8,
    massKg: 54000,
    payloadLeoKg: 1170,
    payloadGtoKg: null,
    thrustKn: 736,
    stages: 2,
    costPerLaunchUsd: 15_000_000,
    reusable: false,
    maidenFlight: "2021-09-03",
    lastFlight: null,
    successfulLaunches: 2,
    failedLaunches: 2,
    propellant: "RP-1 / LOX",
    engines: "4x Reaver + 1x Lightning",
  },
  {
    id: "spectrum",
    name: "Spectrum",
    fullName: "Spectrum",
    operator: "Isar Aerospace",
    country: "Germany",
    countryFlag: "DE",
    status: "in-development",
    category: "small",
    description:
      "A European small-lift launcher developed by Munich-based Isar Aerospace. Powered by nine Aquila engines burning liquid oxygen and propane, Spectrum is designed and manufactured entirely in-house in Germany. First test flight attempted March 2025.",
    heightM: 28,
    diameterM: 2,
    massKg: 55000,
    payloadLeoKg: 1000,
    payloadGtoKg: null,
    thrustKn: 675,
    stages: 2,
    costPerLaunchUsd: 12_000_000,
    reusable: false,
    maidenFlight: "2025-03-29",
    lastFlight: null,
    successfulLaunches: 0,
    failedLaunches: 1,
    propellant: "Propane / LOX",
    engines: "9x Aquila + 1x Aquila Vacuum",
  },
  {
    id: "rfa-one",
    name: "RFA ONE",
    fullName: "RFA ONE",
    operator: "Rocket Factory Augsburg",
    country: "Germany",
    countryFlag: "DE",
    status: "in-development",
    category: "small",
    description:
      "A German micro-launcher designed to provide affordable access to orbit for small satellites. Features nine Helix engines on the first stage and an optional Redshift orbital transfer vehicle. Launches from SaxaVord Spaceport in Shetland, UK.",
    heightM: 30,
    diameterM: 2,
    massKg: 60000,
    payloadLeoKg: 1300,
    payloadGtoKg: null,
    thrustKn: 900,
    stages: 3,
    costPerLaunchUsd: 10_000_000,
    reusable: false,
    maidenFlight: null,
    lastFlight: null,
    successfulLaunches: 0,
    failedLaunches: 0,
    propellant: "RP-1 / LOX",
    engines: "9x Helix + 1x Helix Vacuum + Fenix (OTV)",
  },

  // ═══════════════════════════════════════════
  //  HISTORICAL
  // ═══════════════════════════════════════════
  {
    id: "saturn-v",
    name: "Saturn V",
    fullName: "Saturn V",
    operator: "NASA",
    country: "United States",
    countryFlag: "US",
    status: "retired",
    category: "historical",
    description:
      "The legendary Moon rocket. Saturn V remains the tallest and heaviest rocket ever to have completed a successful orbital flight before Starship. It launched every Apollo lunar mission and the Skylab space station.",
    heightM: 110.6,
    diameterM: 10.1,
    massKg: 2970000,
    payloadLeoKg: 140000,
    payloadGtoKg: 48600,
    thrustKn: 35100,
    stages: 3,
    costPerLaunchUsd: 1_160_000_000,
    reusable: false,
    maidenFlight: "1967-11-09",
    lastFlight: "1973-05-14",
    successfulLaunches: 12,
    failedLaunches: 1,
    propellant: "RP-1 / LOX (1st) + LH2 / LOX (2nd, 3rd)",
    engines: "5x F-1 + 5x J-2 + 1x J-2",
  },
  {
    id: "space-shuttle",
    name: "Space Shuttle",
    fullName: "Space Transportation System",
    operator: "NASA",
    country: "United States",
    countryFlag: "US",
    status: "retired",
    category: "historical",
    description:
      "The world's first reusable orbital spacecraft. Over 30 years the Shuttle built the ISS, deployed Hubble, and expanded human spaceflight, though the Challenger and Columbia disasters remain sobering reminders of spaceflight's risks.",
    heightM: 56.1,
    diameterM: 8.7,
    massKg: 2030000,
    payloadLeoKg: 27500,
    payloadGtoKg: null,
    thrustKn: 30160,
    stages: 2,
    costPerLaunchUsd: 450_000_000,
    reusable: true,
    maidenFlight: "1981-04-12",
    lastFlight: "2011-07-08",
    successfulLaunches: 133,
    failedLaunches: 2,
    propellant: "LH2 / LOX + Solid (SRBs)",
    engines: "3x RS-25 (SSME) + 2x SRB",
  },
  {
    id: "ariane-5",
    name: "Ariane 5",
    fullName: "Ariane 5 ECA",
    operator: "Arianespace",
    country: "France",
    countryFlag: "EU",
    status: "retired",
    category: "historical",
    description:
      "Europe's heavyweight champion for over 25 years. Ariane 5 became synonymous with reliable GTO delivery and dual-satellite launches. Its final mission was the flawless deployment of the James Webb Space Telescope.",
    heightM: 52,
    diameterM: 5.4,
    massKg: 780000,
    payloadLeoKg: 20000,
    payloadGtoKg: 10500,
    thrustKn: 13000,
    stages: 2,
    costPerLaunchUsd: 165_000_000,
    reusable: false,
    maidenFlight: "1996-06-04",
    lastFlight: "2023-07-05",
    successfulLaunches: 112,
    failedLaunches: 5,
    propellant: "LH2 / LOX + Solid boosters",
    engines: "1x Vulcain 2 + 1x HM7B + 2x P241 SRB",
    variants: [
      {
        id: "eca",
        name: "ECA (GTO Optimised)",
        overrides: {},
      },
      {
        id: "es",
        name: "ES (LEO / ISS)",
        overrides: {
          fullName: "Ariane 5 ES",
          description:
            "The LEO-optimised Ariane 5 variant with a restartable EPS upper stage, used to deliver ATV cargo ships to the International Space Station. Lower GTO capacity but capable of complex orbital manoeuvres.",
          payloadLeoKg: 21000,
          payloadGtoKg: 7600,
          engines: "1x Vulcain 2 + 1x Aestus (EPS) + 2x P241 SRB",
        },
      },
    ],
  },
  {
    id: "delta-iv-heavy",
    name: "Delta IV Heavy",
    fullName: "Delta IV Heavy",
    operator: "United Launch Alliance",
    country: "United States",
    countryFlag: "US",
    status: "retired",
    category: "historical",
    description:
      "ULA's triple-core heavy lifter, the backbone of US national security space for two decades. Known for its dramatic ignition fireballs, Delta IV Heavy launched critical NRO payloads before its retirement in 2024.",
    heightM: 72,
    diameterM: 5,
    massKg: 733000,
    payloadLeoKg: 28790,
    payloadGtoKg: 14220,
    thrustKn: 9420,
    stages: 2,
    costPerLaunchUsd: 400_000_000,
    reusable: false,
    maidenFlight: "2004-12-21",
    lastFlight: "2024-04-09",
    successfulLaunches: 15,
    failedLaunches: 1,
    propellant: "LH2 / LOX",
    engines: "3x RS-68A + 1x RL-10B-2",
  },
];

export const COMPARISON_FIELDS: {
  key: keyof Rocket;
  label: string;
  format: (v: unknown) => string;
  higherBetter?: boolean;
  lowerBetter?: boolean;
}[] = [
  {
    key: "status",
    label: "Status",
    format: (v) => {
      const s = v as string;
      return s === "in-development"
        ? "In Development"
        : s.charAt(0).toUpperCase() + s.slice(1);
    },
  },
  { key: "operator", label: "Operator", format: (v) => String(v) },
  { key: "country", label: "Country", format: (v) => String(v) },
  {
    key: "heightM",
    label: "Height",
    format: (v) => `${v} m`,
  },
  {
    key: "diameterM",
    label: "Diameter",
    format: (v) => `${v} m`,
  },
  {
    key: "massKg",
    label: "Launch Mass",
    format: (v) => {
      const n = v as number;
      return n >= 1_000_000
        ? `${(n / 1_000_000).toFixed(1)} t`
        : `${(n / 1000).toFixed(0)} t`;
    },
  },
  {
    key: "payloadLeoKg",
    label: "Payload to LEO",
    format: (v) =>
      v == null ? "N/A" : `${((v as number) / 1000).toFixed(1)} t`,
    higherBetter: true,
  },
  {
    key: "payloadGtoKg",
    label: "Payload to GTO",
    format: (v) =>
      v == null ? "N/A" : `${((v as number) / 1000).toFixed(1)} t`,
    higherBetter: true,
  },
  {
    key: "thrustKn",
    label: "Liftoff Thrust",
    format: (v) => {
      const n = v as number;
      return n >= 10000 ? `${(n / 1000).toFixed(1)} MN` : `${n} kN`;
    },
    higherBetter: true,
  },
  { key: "stages", label: "Stages", format: (v) => String(v) },
  {
    key: "costPerLaunchUsd",
    label: "Cost per Launch",
    format: (v) =>
      v == null
        ? "Unknown"
        : `$${((v as number) / 1_000_000).toFixed(0)}M`,
    lowerBetter: true,
  },
  {
    key: "reusable",
    label: "Reusable",
    format: (v) => ((v as boolean) ? "Yes" : "No"),
  },
  { key: "propellant", label: "Propellant", format: (v) => String(v) },
  { key: "engines", label: "Engines", format: (v) => String(v) },
  {
    key: "maidenFlight",
    label: "First Flight",
    format: (v) => (v ? String(v) : "TBD"),
  },
  {
    key: "successfulLaunches",
    label: "Successful Launches",
    format: (v) => String(v),
    higherBetter: true,
  },
  {
    key: "failedLaunches",
    label: "Failed Launches",
    format: (v) => String(v),
    lowerBetter: true,
  },
];
