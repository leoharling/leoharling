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

export const SPACEPORT_LOCATIONS: SpaceportLocation[] = [
  {
    id: 12,
    name: "Cape Canaveral, FL, USA",
    country: "United States of America",
    lat: 28.4889,
    lon: -80.5778,
    pads: [
      { id: 87,  name: "Space Launch Complex 40 (SLC-40)",     lat: 28.5619, lon: -80.5772 },
      { id: 80,  name: "Space Launch Complex 41 (SLC-41)",     lat: 28.5833, lon: -80.5830 },
      { id: 188, name: "Space Launch Complex 37B (SLC-37B)",   lat: 28.5311, lon: -80.5656 },
      { id: 16,  name: "Space Launch Complex 17A (SLC-17A)",   lat: 28.4472, lon: -80.5656 },
      { id: 15,  name: "Space Launch Complex 17B (SLC-17B)",   lat: 28.4467, lon: -80.5628 },
    ],
  },
  {
    id: 27,
    name: "Kennedy Space Center, FL, USA",
    country: "United States of America",
    lat: 28.5729,
    lon: -80.6490,
    pads: [
      { id: 84,  name: "Launch Complex 39A (LC-39A)",          lat: 28.6083, lon: -80.6042 },
      { id: 4,   name: "Launch Complex 39B (LC-39B)",          lat: 28.6272, lon: -80.6208 },
    ],
  },
  {
    id: 11,
    name: "Vandenberg SFB, CA, USA",
    country: "United States of America",
    lat: 34.7420,
    lon: -120.5724,
    pads: [
      { id: 96,  name: "Space Launch Complex 4E (SLC-4E)",     lat: 34.6322, lon: -120.6108 },
      { id: 13,  name: "Space Launch Complex 4W (SLC-4W)",     lat: 34.6306, lon: -120.6136 },
      { id: 25,  name: "Space Launch Complex 6 (SLC-6)",       lat: 34.5814, lon: -120.6264 },
      { id: 161, name: "Space Launch Complex 2 (SLC-2W)",      lat: 34.7558, lon: -120.6261 },
      { id: 170, name: "Space Launch Complex 3E (SLC-3E)",     lat: 34.6428, lon: -120.5914 },
    ],
  },
  {
    id: 6,
    name: "Baikonur Cosmodrome, Republic of Kazakhstan",
    country: "Kazakhstan",
    lat: 45.9650,
    lon: 63.3050,
    pads: [
      { id: 20,  name: "Site 1/5 (Gagarin's Start)",           lat: 45.9208, lon: 63.3422 },
      { id: 21,  name: "Site 31/6",                            lat: 45.9961, lon: 63.5644 },
      { id: 22,  name: "Site 200/39 (Proton-M)",               lat: 46.0667, lon: 62.9833 },
    ],
  },
  {
    id: 7,
    name: "Plesetsk Cosmodrome, Russian Federation",
    country: "Russia",
    lat: 62.9272,
    lon: 40.5777,
    pads: [
      { id: 33,  name: "Site 43/3",                            lat: 62.9278, lon: 40.4592 },
      { id: 34,  name: "Site 43/4",                            lat: 62.9294, lon: 40.4533 },
      { id: 132, name: "Site 35/1 (Angara)",                   lat: 62.8583, lon: 40.6875 },
    ],
  },
  {
    id: 8,
    name: "Guiana Space Centre, French Guiana",
    country: "France",
    lat: 5.2320,
    lon: -52.7692,
    pads: [
      { id: 45,  name: "ELA-2 (Ariane 5)",                     lat: 5.2392, lon: -52.7731 },
      { id: 46,  name: "ELS (Soyuz)",                          lat: 5.3072, lon: -52.8333 },
      { id: 143, name: "ELA-4 (Ariane 6)",                     lat: 5.2397, lon: -52.8022 },
      { id: 111, name: "ELV (Vega)",                           lat: 5.2450, lon: -52.7711 },
    ],
  },
  {
    id: 9,
    name: "Tanegashima Space Center, Japan",
    country: "Japan",
    lat: 30.4013,
    lon: 130.9681,
    pads: [
      { id: 58,  name: "Yoshinobu Launch Complex Pad 1",       lat: 30.4013, lon: 130.9753 },
      { id: 59,  name: "Yoshinobu Launch Complex Pad 2",       lat: 30.3992, lon: 130.9764 },
    ],
  },
  {
    id: 10,
    name: "Jiuquan Satellite Launch Center, People's Republic of China",
    country: "China",
    lat: 40.9608,
    lon: 100.2986,
    pads: [
      { id: 60,  name: "Launch Area 4 (SLS-2 / 921)",         lat: 41.1180, lon: 100.3250 },
      { id: 61,  name: "Launch Area 4 (SLS-1 / 603)",         lat: 40.9608, lon: 100.2986 },
    ],
  },
  {
    id: 14,
    name: "Xichang Satellite Launch Center, People's Republic of China",
    country: "China",
    lat: 28.2463,
    lon: 102.0267,
    pads: [
      { id: 70,  name: "Launch Complex 2 (LC-2)",              lat: 28.2464, lon: 102.0264 },
      { id: 71,  name: "Launch Complex 3 (LC-3)",              lat: 28.2544, lon: 102.0267 },
    ],
  },
  {
    id: 15,
    name: "Taiyuan Satellite Launch Center, People's Republic of China",
    country: "China",
    lat: 38.8486,
    lon: 111.6083,
    pads: [
      { id: 72,  name: "Launch Complex 9 (LC-9)",              lat: 38.8486, lon: 111.6083 },
    ],
  },
  {
    id: 16,
    name: "Wenchang Space Launch Site, People's Republic of China",
    country: "China",
    lat: 19.6145,
    lon: 110.9513,
    pads: [
      { id: 128, name: "Launch Complex 1 (LC-1)",              lat: 19.6147, lon: 110.9511 },
      { id: 183, name: "Launch Complex 2 (LC-2)",              lat: 19.6092, lon: 110.9511 },
    ],
  },
  {
    id: 17,
    name: "Satish Dhawan Space Centre, India",
    country: "India",
    lat: 13.7330,
    lon: 80.2350,
    pads: [
      { id: 81,  name: "First Launch Pad (FLP)",               lat: 13.7340, lon: 80.2344 },
      { id: 82,  name: "Second Launch Pad (SLP)",              lat: 13.7196, lon: 80.2306 },
    ],
  },
  {
    id: 18,
    name: "Wallops Flight Facility, VA, USA",
    country: "United States of America",
    lat: 37.9402,
    lon: -75.4664,
    pads: [
      { id: 93,  name: "Launch Pad 0A",                        lat: 37.8331, lon: -75.4886 },
      { id: 94,  name: "Launch Pad 0B",                        lat: 37.8345, lon: -75.4889 },
    ],
  },
  {
    id: 19,
    name: "Rocket Lab Launch Complex, Mahia Peninsula, New Zealand",
    country: "New Zealand",
    lat: -39.2611,
    lon: 177.8647,
    pads: [
      { id: 116, name: "Launch Complex 1A",                    lat: -39.2611, lon: 177.8647 },
      { id: 140, name: "Launch Complex 1B",                    lat: -39.2619, lon: 177.8653 },
    ],
  },
  {
    id: 20,
    name: "Rocket Lab Launch Complex 2, Virginia, USA",
    country: "United States of America",
    lat: 37.8331,
    lon: -75.4886,
    pads: [
      { id: 167, name: "Launch Complex 2 (LC-2)",              lat: 37.8331, lon: -75.4886 },
    ],
  },
  {
    id: 21,
    name: "Vostochny Cosmodrome, Russia",
    country: "Russia",
    lat: 51.8840,
    lon: 128.3330,
    pads: [
      { id: 112, name: "Site 1S (Soyuz-2)",                   lat: 51.8840, lon: 128.3330 },
      { id: 222, name: "Site 1A (Angara)",                     lat: 51.7883, lon: 128.2611 },
    ],
  },
  {
    id: 22,
    name: "Naro Space Center, South Korea",
    country: "Republic of Korea",
    lat: 34.4325,
    lon: 127.5347,
    pads: [
      { id: 97,  name: "Naro-1 Launch Pad",                    lat: 34.4325, lon: 127.5347 },
    ],
  },
  {
    id: 23,
    name: "Palmachim Airbase, Israel",
    country: "Israel",
    lat: 31.8964,
    lon: 34.6906,
    pads: [
      { id: 98,  name: "Palmachim Launch Pad",                 lat: 31.8964, lon: 34.6906 },
    ],
  },
  {
    id: 24,
    name: "Svobodny Cosmodrome, Russia",
    country: "Russia",
    lat: 51.5300,
    lon: 128.4600,
    pads: [
      { id: 99,  name: "Launch Pad 5",                         lat: 51.5300, lon: 128.4600 },
    ],
  },
  {
    id: 25,
    name: "Uchinoura Space Center, Japan",
    country: "Japan",
    lat: 31.2511,
    lon: 131.0811,
    pads: [
      { id: 102, name: "M-V Launch Pad",                       lat: 31.2511, lon: 131.0811 },
    ],
  },
  {
    id: 26,
    name: "Semnan Space Center (Imam Khomeini), Iran",
    country: "Iran",
    lat: 35.2344,
    lon: 53.9214,
    pads: [
      { id: 103, name: "Semnan Launch Pad 1",                  lat: 35.2344, lon: 53.9214 },
    ],
  },
  {
    id: 29,
    name: "SpaceX South Texas Launch Site, TX, USA",
    country: "United States of America",
    lat: 25.9969,
    lon: -97.1546,
    pads: [
      { id: 175, name: "Starbase Orbital Launch Mount A (OLM-A)", lat: 25.9972, lon: -97.1547 },
      { id: 203, name: "Starbase Orbital Launch Mount B (OLM-B)", lat: 25.9975, lon: -97.1549 },
    ],
  },
  {
    id: 30,
    name: "Shahroud Missile Range, Iran",
    country: "Iran",
    lat: 36.2083,
    lon: 55.4667,
    pads: [
      { id: 176, name: "Shahroud Launch Pad",                  lat: 36.2083, lon: 55.4667 },
    ],
  },
  {
    id: 31,
    name: "Alcântara Launch Center, Brazil",
    country: "Brazil",
    lat: -2.3722,
    lon: -44.3969,
    pads: [
      { id: 126, name: "Launch Pad 1 (VLS)",                   lat: -2.3722, lon: -44.3969 },
    ],
  },
  {
    id: 32,
    name: "Hammaguira Space Track Station, Algeria",
    country: "Algeria",
    lat: 30.9200,
    lon: -3.1000,
    pads: [
      { id: 127, name: "Brigitte Launch Pad",                  lat: 30.9200, lon: -3.1000 },
    ],
  },
  {
    id: 33,
    name: "Kapustin Yar, Russia",
    country: "Russia",
    lat: 48.4486,
    lon: 45.7800,
    pads: [
      { id: 129, name: "Site 107",                             lat: 48.4486, lon: 45.7800 },
    ],
  },
  {
    id: 34,
    name: "Pacific Spaceport Complex, Kodiak, AK, USA",
    country: "United States of America",
    lat: 57.4356,
    lon: -152.3375,
    pads: [
      { id: 130, name: "Launch Pad 1 (LP-1)",                  lat: 57.4356, lon: -152.3375 },
    ],
  },
  {
    id: 35,
    name: "Esrange Space Center, Sweden",
    country: "Sweden",
    lat: 67.8881,
    lon: 21.0681,
    pads: [
      { id: 131, name: "MAXUS Pad",                            lat: 67.8881, lon: 21.0681 },
    ],
  },
  {
    id: 36,
    name: "Mid-Atlantic Regional Spaceport, Wallops Island, Virginia, USA",
    country: "United States of America",
    lat: 37.8331,
    lon: -75.4886,
    pads: [
      { id: 93,  name: "Launch Pad 0A",                        lat: 37.8331, lon: -75.4886 },
    ],
  },
  {
    id: 37,
    name: "Corn Ranch / West Texas, USA",
    country: "United States of America",
    lat: 31.4228,
    lon: -104.7575,
    pads: [
      { id: 135, name: "Launch Site One",                      lat: 31.4228, lon: -104.7575 },
    ],
  },
  {
    id: 38,
    name: "Qom Launchpad, Iran",
    country: "Iran",
    lat: 34.8456,
    lon: 50.7289,
    pads: [
      { id: 179, name: "Qom Launchpad",                        lat: 34.8456, lon: 50.7289 },
    ],
  },
  {
    id: 39,
    name: "Pacific Ocean Platform, USA",
    country: "United States of America",
    lat: 0.0,
    lon: -154.0,
    pads: [
      { id: 137, name: "Ocean Odyssey (Sea Launch)",           lat: 0.0, lon: -154.0 },
    ],
  },
  {
    id: 41,
    name: "Vandenberg Space Force Base, CA, USA",
    country: "United States of America",
    lat: 34.7420,
    lon: -120.5724,
    pads: [
      { id: 251, name: "Space Launch Complex 2W (SLC-2W)",    lat: 34.7558, lon: -120.6261 },
    ],
  },
  {
    id: 44,
    name: "SaxaVord Spaceport, Shetland, UK",
    country: "United Kingdom",
    lat: 60.7625,
    lon: -0.7783,
    pads: [
      { id: 220, name: "SaxaVord Launch Pad",                  lat: 60.7625, lon: -0.7783 },
    ],
  },
  {
    id: 45,
    name: "North Sea (Ørsted) Sea Launch Platform",
    country: "Denmark",
    lat: 56.0000,
    lon: 8.0000,
    pads: [
      { id: 221, name: "Sea Launch Platform",                  lat: 56.0000, lon: 8.0000 },
    ],
  },
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
