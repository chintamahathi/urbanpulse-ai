import type {
  FusionCluster,
  Incident,
  InfrastructureIssue,
  MaintenanceItem,
  Notification,
  PedestrianZone,
  TrafficHotspot,
} from "@/lib/types";
import { AREA_POINTS, jitter, rng, severityFromScore } from "./geo";
import { roads } from "./roads";
import { buses } from "./fleet";

/* ------------------------------- incidents ------------------------------- */

const INCIDENT_TYPES: [string, string][] = [
  ["HIT & RUN", "critical"],
  ["NEAR MISS", "high"],
  ["RASH DRIVING", "medium"],
  ["WRONG-SIDE DRIVING", "high"],
  ["SIGNAL JUMP", "medium"],
  ["PEDESTRIAN CONFLICT", "critical"],
  ["LANE OBSTRUCTION", "medium"],
  ["MINOR COLLISION", "high"],
  ["OVERSPEEDING", "medium"],
  ["ILLEGAL PARKING", "low"],
  ["NEAR MISS", "high"],
  ["RASH DRIVING", "medium"],
];

const VEHICLES = [
  "White Sedan",
  "Silver Hatchback",
  "Black SUV",
  "Blue Motorcycle",
  "Yellow Auto-Rickshaw",
  "Grey Pickup",
];

export const seedIncidents: Incident[] = INCIDENT_TYPES.map(([type, sev], i) => {
  const r = rng(3300 + i);
  const road = roads[(i * 3) % roads.length]!;
  const base = road.path[1]!;
  const minutesAgo = +(2 + i * 3.6 + r() * 3).toFixed(0);
  return {
    id: `INC-${2930 + i}`,
    type,
    severity: sev as Incident["severity"],
    minutesAgo,
    time: new Date(Date.UTC(2026, 8, 10, 7, 5) - minutesAgo * 60_000)
      .toISOString()
      .slice(11, 19),
    location: `${road.name}, ${road.area}`,
    position: jitter(base, 0.01, r),
    vehicle: VEHICLES[i % VEHICLES.length]!,
    registration: `TS ${10 + i} ${String.fromCharCode(65 + i)}${String.fromCharCode(70 + i)} ${1200 + i * 37}`,
    ocrConfidence: +(0.84 + r() * 0.14).toFixed(2),
    aiMatch: +(0.8 + r() * 0.18).toFixed(2),
    direction: ["NORTH EAST", "SOUTH", "WEST", "NORTH WEST", "EAST"][i % 5]!,
    track: Array.from({ length: 6 }, (_, k) => jitter(base, 0.004 * (k + 1), r)),
    observations: [0, 1, 2].map((k) => ({
      busId: buses[(i + k * 4) % buses.length]!.id,
      time: new Date(Date.UTC(2026, 8, 10, 7, 5) - (minutesAgo - k) * 60_000)
        .toISOString()
        .slice(11, 16),
    })),
    status: i < 7 ? "DETECTED" : "VERIFIED",
  } satisfies Incident;
});

export const safetyStats = {
  activeIncidents: 7,
  nearMisses: 42,
  highRiskZones: 12,
  anprMatches: 19,
};

/* ---------------------------- infrastructure ---------------------------- */

const INFRA_TYPES: InfrastructureIssue["type"][] = [
  "Missing Zebra Crossing",
  "Missing Sign",
  "Damaged Divider",
  "Waterlogging Zone",
];

const EXPECTED: Record<InfrastructureIssue["type"], string> = {
  "Missing Zebra Crossing": "Marked crossing with tactile approach at school gate",
  "Missing Sign": "Regulatory speed + pedestrian warning signage pair",
  "Damaged Divider": "Continuous median with reflective delineators",
  "Waterlogging Zone": "Functional stormwater inlet with 15 min drain time",
};

const RISK: Record<InfrastructureIssue["type"], string> = {
  "Missing Zebra Crossing": "Children crossing mid-block in mixed traffic",
  "Missing Sign": "Drivers unaware of speed restriction near junction",
  "Damaged Divider": "Head-on conflict and wrong-side entry risk",
  "Waterlogging Zone": "Two-wheeler skidding and pothole acceleration",
};

const RECO: Record<InfrastructureIssue["type"], string> = {
  "Missing Zebra Crossing": "Restore zebra markings + pedestrian refuge within 7 days",
  "Missing Sign": "Install signage pair in next works cycle",
  "Damaged Divider": "Replace damaged median segment, add delineators",
  "Waterlogging Zone": "De-silt inlet before monsoon peak",
};

export const seedInfrastructure: InfrastructureIssue[] = Array.from({ length: 22 }, (_, i) => {
  const r = rng(5500 + i);
  const road = roads[i % roads.length]!;
  const type = INFRA_TYPES[i % INFRA_TYPES.length]!;
  const score = 40 + Math.round(r() * 55);
  return {
    id: `INF-${400 + i}`,
    road: road.name,
    type,
    severity: i % 7 === 0 ? "critical" : severityFromScore(score),
    position: jitter(road.path[2]!, 0.01, r),
    detected: `${type} — ${Math.round(2 + r() * 30)} fleet observations`,
    expected: EXPECTED[type],
    risk: RISK[type],
    recommendation: RECO[type],
    status: "DETECTED",
  } satisfies InfrastructureIssue;
});

export const infraStats = {
  missingSigns: 43,
  damagedDividers: 27,
  missingZebra: 18,
  waterlogging: 12,
};

/* ------------------------- pedestrian risk zones ------------------------- */

export const pedestrianZones: PedestrianZone[] = roads.slice(0, 12).map((road, i) => {
  const r = rng(6600 + i);
  const score = Math.round(100 - road.health + r() * 12);
  return {
    id: `PRZ-${300 + i}`,
    name: `${road.name} zone`,
    riskScore: Math.min(99, score),
    severity: severityFromScore(score),
    position: jitter(road.path[0]!, 0.008, r),
    nearby: road.nearby,
    nearMisses: road.nearMisses,
  } satisfies PedestrianZone;
});

/* ------------------------------- traffic --------------------------------- */

const HOTSPOT_AREAS = [
  "Jubilee Junction",
  "School Road",
  "Market Road",
  "Ameerpet",
  "Secunderabad",
  "LB Nagar",
  "Mehdipatnam",
  "Uppal",
  "Hitec City",
  "Charminar",
  "Begumpet",
  "Kukatpally",
  "Nampally",
  "Miyapur",
  "Gachibowli",
  "Kompally",
  "Banjara Hills",
  "Kukatpally Y-Junction",
];

export const trafficHotspots: TrafficHotspot[] = HOTSPOT_AREAS.map((name, i) => {
  const r = rng(2200 + i);
  const delay = Math.round(24 - i * 1.1 + r() * 4);
  const density = Math.round(96 - i * 3 + r() * 5);
  return {
    id: `TRF-${100 + i}`,
    name,
    severity: i === 0 ? "critical" : i < 4 ? "high" : i < 10 ? "medium" : "low",
    delayMin: Math.max(3, delay),
    densityIndex: Math.max(30, density),
    avgSpeedKph: Math.max(8, Math.round(14 + i * 1.4 + r() * 6)),
    position: jitter(AREA_POINTS[name] ?? AREA_POINTS["Ameerpet"]!, 0.02, r),
  } satisfies TrafficHotspot;
});

export const trafficStats = {
  vehiclesDetected: "2.4M",
  currentDensity: "HIGH",
  avgNetworkSpeed: 31,
  hotspots: 18,
};

export const trafficByHour = Array.from({ length: 24 }, (_, h) => {
  const r = rng(120 + h);
  const peak =
    Math.exp(-((h - 9.5) ** 2) / 6) * 1 + Math.exp(-((h - 18.5) ** 2) / 7) * 1.15;
  return {
    hour: `${String(h).padStart(2, "0")}:00`,
    vehicles: Math.round(18000 + peak * 92000 + r() * 6000),
    speed: Math.round(46 - peak * 22 + r() * 4),
  };
});

export const vehicleComposition = [
  { name: "Two-wheelers", value: 44 },
  { name: "Cars", value: 27 },
  { name: "Autos", value: 14 },
  { name: "Buses", value: 8 },
  { name: "Trucks / LCV", value: 7 },
];

export const congestionTrend = Array.from({ length: 14 }, (_, d) => {
  const r = rng(330 + d);
  return {
    day: `D-${14 - d}`,
    hotspots: Math.round(11 + d * 0.5 + r() * 4),
    avgDelay: +(8 + d * 0.4 + r() * 3).toFixed(1),
  };
});

export const congestionForecast = {
  location: "Jubilee Junction",
  probability: 72,
  window: "next 20 minutes",
  factors: [
    "High vehicle density (density index 96)",
    "Slow average speed (11 km/h, falling)",
    "Repeated congestion pattern on 12 of last 14 days",
  ],
};

/* ------------------------------- fusion ---------------------------------- */

export const fusionCluster: FusionCluster = {
  id: "PTH-1024",
  label: "School Road — carriageway pothole cluster",
  type: "pothole",
  observations: 37,
  buses: 11,
  confidence: 99.1,
  severity: "high",
  firstObserved: "JAN 12",
  lastConfirmed: "SEP 10",
  position: roads[0]!.path[1]!,
  points: Array.from({ length: 11 }, (_, i) => {
    const r = rng(770 + i);
    return {
      busId: buses[(i * 2) % buses.length]!.id,
      position: jitter(roads[0]!.path[1]!, 0.004, r),
      time: `08:${String(12 + i * 3).padStart(2, "0")}`,
      confidence: +(0.82 + r() * 0.16).toFixed(2),
    };
  }),
};

export const fusionFlow = [
  { label: "BUS-101", detail: "First independent observation", tone: "intel" },
  { label: "POTHOLE DETECTED", detail: "Edge AI · 91% confidence", tone: "warn" },
  { label: "BUS-205", detail: "Second pass, same 6 m segment", tone: "intel" },
  { label: "SAME LOCATION", detail: "GPS cluster radius 4.1 m", tone: "warn" },
  { label: "BUS-317", detail: "Third independent observation", tone: "intel" },
  { label: "SAME EVENT", detail: "Signature match across cameras", tone: "warn" },
  { label: "VERIFIED ROAD DEFECT", detail: "PTH-1024 · confidence 99.1%", tone: "ok" },
];

/* ----------------------------- maintenance ------------------------------- */

export const seedMaintenance: MaintenanceItem[] = [
  {
    id: "MNT-001",
    rank: 1,
    road: "School Road",
    category: "Roads",
    severity: "critical",
    problem: "Pothole cluster + missing zebra crossing",
    trafficLoad: "HIGH",
    pedestrianRisk: "VERY HIGH",
    recurrence: 37,
    nearby: "Govt. Girls High School",
    recommendation: "IMMEDIATE REPAIR",
    priorityScore: 98,
    status: "VERIFIED",
  },
  {
    id: "MNT-002",
    rank: 2,
    road: "Old Mint Road",
    category: "Roads",
    severity: "critical",
    problem: "Continuous surface failure over 180 m",
    trafficLoad: "SEVERE",
    pedestrianRisk: "HIGH",
    recurrence: 29,
    nearby: "Heritage bazaar",
    recommendation: "IMMEDIATE REPAIR",
    priorityScore: 94,
    status: "DETECTED",
  },
  {
    id: "MNT-003",
    rank: 3,
    road: "Jubilee Junction Approach",
    category: "Signs",
    severity: "high",
    problem: "Missing regulatory signage at merge",
    trafficLoad: "HIGH",
    pedestrianRisk: "MODERATE",
    recurrence: 24,
    nearby: "Metro entry gate",
    recommendation: "SIGNAGE RESTORATION — 7 DAYS",
    priorityScore: 88,
    status: "DETECTED",
  },
  {
    id: "MNT-004",
    rank: 4,
    road: "Kukatpally Industrial Road",
    category: "Waterlogging",
    severity: "high",
    problem: "Recurring waterlogging over drain inlet",
    trafficLoad: "HIGH",
    pedestrianRisk: "MODERATE",
    recurrence: 21,
    nearby: "Industrial estate",
    recommendation: "DE-SILT + RESURFACE",
    priorityScore: 84,
    status: "DETECTED",
  },
  {
    id: "MNT-005",
    rank: 5,
    road: "Ring Radial 7",
    category: "Dividers",
    severity: "high",
    problem: "Damaged median enabling wrong-side entry",
    trafficLoad: "SEVERE",
    pedestrianRisk: "HIGH",
    recurrence: 18,
    nearby: "Flyover ramp",
    recommendation: "MEDIAN REPLACEMENT — 14 DAYS",
    priorityScore: 79,
    status: "DETECTED",
  },
  {
    id: "MNT-006",
    rank: 6,
    road: "Miyapur Feeder Lane",
    category: "Roads",
    severity: "medium",
    problem: "Edge cracking with depot turning stress",
    trafficLoad: "MODERATE",
    pedestrianRisk: "LOW",
    recurrence: 14,
    nearby: "Depot approach",
    recommendation: "PREVENTIVE RESURFACING",
    priorityScore: 68,
    status: "DETECTED",
  },
  {
    id: "MNT-007",
    rank: 7,
    road: "Nampally Station Road",
    category: "Signs",
    severity: "medium",
    problem: "Faded lane and crossing markings",
    trafficLoad: "HIGH",
    pedestrianRisk: "MODERATE",
    recurrence: 11,
    nearby: "Exhibition ground",
    recommendation: "REMARKING BATCH",
    priorityScore: 61,
    status: "DETECTED",
  },
];

/* ---------------------------- notifications ------------------------------ */

export const seedNotifications: Notification[] = [
  {
    id: "N-1",
    title: "New critical pothole detected",
    detail: "School Road, Banjara Hills · BUS-104 · 94% confidence",
    severity: "critical",
    minutesAgo: 2,
    read: false,
    eventId: "PTH-1024",
  },
  {
    id: "N-2",
    title: "BUS-205 confirmed PTH-1024",
    detail: "Fleet fusion confidence raised to 99.1%",
    severity: "high",
    minutesAgo: 6,
    read: false,
    eventId: "PTH-1024",
  },
  {
    id: "N-3",
    title: "Pedestrian risk increased near School Road",
    detail: "7 near-miss events in the last 60 minutes",
    severity: "critical",
    minutesAgo: 12,
    read: false,
  },
  {
    id: "N-4",
    title: "Route 216 delay exceeded 15 minutes",
    detail: "Jubilee Junction congestion propagating upstream",
    severity: "high",
    minutesAgo: 18,
    read: true,
  },
  {
    id: "N-5",
    title: "Waterlogging detected",
    detail: "Kukatpally Industrial Road · 3 buses reporting",
    severity: "medium",
    minutesAgo: 27,
    read: true,
  },
];
