import type { CameraId, EventType, Severity, UrbanEvent } from "@/lib/types";
import { jitter, rng } from "./geo";
import { buses } from "./fleet";
import { roads } from "./roads";

const TYPES: EventType[] = [
  "pothole",
  "pothole",
  "crack",
  "traffic",
  "incident",
  "waterlogging",
  "pedestrian_risk",
  "infrastructure",
];

const TITLES: Record<EventType, string> = {
  pothole: "Pothole detected",
  crack: "Surface cracking detected",
  traffic: "Traffic density increased",
  incident: "Traffic incident detected",
  waterlogging: "Waterlogging detected",
  pedestrian_risk: "Pedestrian risk elevated",
  infrastructure: "Infrastructure deficiency detected",
};

const RECS: Record<EventType, string> = {
  pothole: "Schedule surface patching within 72 hours; segment carries high bus frequency.",
  crack: "Add to preventive resurfacing batch for the next maintenance window.",
  traffic: "Adjust signal cycle at the upstream junction and re-evaluate in 20 minutes.",
  incident: "Dispatch traffic enforcement unit and preserve ANPR evidence chain.",
  waterlogging: "Inspect stormwater inlet; flag segment during monsoon advisories.",
  pedestrian_risk: "Restore crossing markings and add speed calming near the school zone.",
  infrastructure: "Raise works order for signage/divider restoration on this segment.",
};

const CAMERAS: CameraId[] = ["front", "front", "side", "rear", "cabin"];

function severityFor(type: EventType, r: number): Severity {
  if (type === "incident") return r > 0.5 ? "critical" : "high";
  if (type === "pedestrian_risk") return r > 0.6 ? "critical" : "high";
  if (type === "pothole") return r > 0.75 ? "critical" : r > 0.4 ? "high" : "medium";
  if (type === "waterlogging") return r > 0.6 ? "high" : "medium";
  if (type === "traffic") return r > 0.7 ? "high" : "medium";
  return r > 0.8 ? "high" : "low";
}

function stamp(minutesAgo: number) {
  const d = new Date(Date.UTC(2026, 8, 10, 7, 5, 0) - minutesAgo * 60_000);
  return d.toISOString();
}

export const seedEvents: UrbanEvent[] = Array.from({ length: 58 }, (_, i) => {
  const r = rng(9100 + i);
  const type = TYPES[i % TYPES.length];
  const road = roads[i % roads.length];
  const bus = buses[(i * 5) % buses.length];
  const rv = r();
  const severity = severityFor(type, rv);
  const observations = 1 + Math.floor(r() * 36);
  const observers = Array.from(
    new Set(Array.from({ length: Math.min(observations, 6) }, () => buses[Math.floor(r() * buses.length)].id)),
  );
  const minutesAgo = +(i * 3.4 + r() * 4).toFixed(1);
  return {
    id: `${type === "pothole" ? "PTH" : type === "incident" ? "INC" : "EVT"}-${1000 + i}`,
    type,
    title: TITLES[type],
    severity,
    confidence: +(0.78 + r() * 0.21).toFixed(2),
    busId: bus.id,
    camera: CAMERAS[i % CAMERAS.length],
    position: jitter(road.path[1], 0.012, r),
    location: `${road.name}, ${road.area}`,
    roadId: road.id,
    timestamp: stamp(minutesAgo),
    observations,
    observedBy: observers,
    status: observations > 12 ? "VERIFIED" : "DETECTED",
    recommendation: RECS[type],
    history: [
      { label: "First observed", value: "JAN 12, 2026" },
      { label: "Last confirmed", value: "SEP 10, 2026" },
      { label: "Distinct buses", value: `${observers.length + Math.floor(r() * 6)}` },
      { label: "Repeat interval", value: `${(2 + r() * 9).toFixed(1)} days` },
    ],
  } satisfies UrbanEvent;
});

/** The hero pothole cluster used across fusion / demo mode / copilot. */
export const HERO_EVENT_ID = "PTH-1024";

export const kpiSeed = {
  activeBuses: 1248,
  aiEventsToday: 2847,
  criticalEvents: 27,
  congestionHotspots: 18,
  roadDefects: 423,
  safetyRisks: 12,
};
