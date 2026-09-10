import type { Bus, BusRoute, GeoPoint } from "@/lib/types";
import { AREAS, AREA_POINTS, jitter, pointOnPath, rng } from "./geo";

const CORRIDORS: [string, string, string][] = [
  ["Secunderabad", "Hitec City", "IT Corridor"],
  ["Charminar", "Kukatpally", "Old City Link"],
  ["LB Nagar", "Miyapur", "East-West Trunk"],
  ["Mehdipatnam", "Uppal", "Ring Radial"],
  ["Gachibowli", "Nampally", "University Line"],
  ["Kompally", "Banjara Hills", "North Spine"],
  ["Ameerpet", "LB Nagar", "Central Feeder"],
  ["Begumpet", "Miyapur", "Airport Feeder"],
  ["Jubilee Junction", "Charminar", "Heritage Loop"],
  ["Uppal", "Hitec City", "Tech Express"],
  ["Secunderabad", "Mehdipatnam", "Cantonment Link"],
  ["Kukatpally", "Nampally", "Metro Interchange"],
];

function buildPath(from: string, to: string, seed: number): GeoPoint[] {
  const r = rng(seed);
  const a = AREA_POINTS[from]!;
  const b = AREA_POINTS[to]!;
  const mid1 = jitter({ lat: (a.lat * 2 + b.lat) / 3, lng: (a.lng * 2 + b.lng) / 3 }, 0.03, r);
  const mid2 = jitter({ lat: (a.lat + b.lat * 2) / 3, lng: (a.lng + b.lng * 2) / 3 }, 0.03, r);
  return [a, mid1, mid2, b, mid2, mid1];
}

export const routes: BusRoute[] = CORRIDORS.map(([from, to, corridor], i) => {
  const r = rng(900 + i);
  const code = `Route ${200 + i * 7 + (i % 3)}`;
  return {
    id: `RT-${200 + i * 7}`,
    name: `${from} → ${to}`,
    code,
    corridor,
    stops: 18 + Math.floor(r() * 24),
    lengthKm: +(11 + r() * 21).toFixed(1),
    avgDelayMin: +(3 + r() * 16).toFixed(1),
    path: buildPath(from, to, 1500 + i),
  };
});

export const FLEET_TOTAL = 1300;
export const FLEET_ONLINE = 1248;

export const buses: Bus[] = Array.from({ length: 24 }, (_, i) => {
  const r = rng(4200 + i);
  const route = routes[i % routes.length]!;
  const t = r();
  const { point, heading } = pointOnPath(route.path, t);
  const camerasOnline = r() > 0.88 ? 3 : 4;
  const aiOnline = r() > 0.07;
  return {
    id: `BUS-${101 + i * 4}`,
    routeId: route.id,
    routeCode: route.code,
    area: AREAS[i % AREAS.length]!,
    position: point,
    heading,
    speedKph: Math.round(12 + r() * 44),
    aiOnline,
    gpsOnline: r() > 0.03,
    camerasOnline: aiOnline ? camerasOnline : 2,
    camerasTotal: 4,
    eventsToday: Math.floor(r() * 9),
    lastSeenSec: Math.floor(r() * 24),
    bandwidthSavedPct: 93 + Math.round(r() * 6),
    aiConfidence: +(0.86 + r() * 0.12).toFixed(2),
    pathIndex: t,
  } satisfies Bus;
});

export const fleetStats = {
  online: FLEET_ONLINE,
  offline: FLEET_TOTAL - FLEET_ONLINE,
  aiProcessing: 1201,
  cameraIssues: 7,
};

export const busById = (id: string) => buses.find((b) => b.id === id);
export const routeById = (id: string) => routes.find((r) => r.id === id);
