import type { GeoPoint, Severity } from "@/lib/types";

/** Deterministic PRNG so mock data is stable between renders/SSR. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const CITY = {
  name: "HYDERABAD URBAN NETWORK",
  center: { lat: 17.412, lng: 78.462 } as GeoPoint,
  zoom: 11.4,
};

export const AREAS = [
  "Banjara Hills",
  "Jubilee Junction",
  "Begumpet",
  "Ameerpet",
  "Kukatpally",
  "Hitec City",
  "Gachibowli",
  "Secunderabad",
  "Uppal",
  "LB Nagar",
  "Mehdipatnam",
  "Charminar",
  "Kompally",
  "Nampally",
  "Miyapur",
];

export const AREA_POINTS: Record<string, GeoPoint> = {
  "Banjara Hills": { lat: 17.4126, lng: 78.4392 },
  "Jubilee Junction": { lat: 17.4319, lng: 78.4073 },
  Begumpet: { lat: 17.4436, lng: 78.4645 },
  Ameerpet: { lat: 17.437, lng: 78.4483 },
  Kukatpally: { lat: 17.4849, lng: 78.4138 },
  "Hitec City": { lat: 17.4483, lng: 78.3808 },
  Gachibowli: { lat: 17.4401, lng: 78.3489 },
  Secunderabad: { lat: 17.4399, lng: 78.4983 },
  Uppal: { lat: 17.4009, lng: 78.5588 },
  "LB Nagar": { lat: 17.3457, lng: 78.5522 },
  Mehdipatnam: { lat: 17.3953, lng: 78.4392 },
  Charminar: { lat: 17.3616, lng: 78.4747 },
  Kompally: { lat: 17.5316, lng: 78.4869 },
  Nampally: { lat: 17.3894, lng: 78.4652 },
  Miyapur: { lat: 17.4948, lng: 78.3578 },
};

export function jitter(p: GeoPoint, amount: number, r: () => number): GeoPoint {
  return {
    lat: +(p.lat + (r() - 0.5) * amount).toFixed(5),
    lng: +(p.lng + (r() - 0.5) * amount).toFixed(5),
  };
}

export function severityFromScore(score: number): Severity {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export function severityFromHealth(health: number): Severity {
  if (health < 35) return "critical";
  if (health < 55) return "high";
  if (health < 75) return "medium";
  return "low";
}

export const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** Interpolate along a polyline at t in [0,1). */
export function pointOnPath(path: GeoPoint[], t: number): { point: GeoPoint; heading: number } {
  if (path.length < 2) return { point: path[0], heading: 0 };
  const total = path.length - 1;
  const scaled = (t % 1) * total;
  const i = Math.min(Math.floor(scaled), total - 1);
  const f = scaled - i;
  const a = path[i];
  const b = path[i + 1];
  const point = { lat: a.lat + (b.lat - a.lat) * f, lng: a.lng + (b.lng - a.lng) * f };
  const heading = (Math.atan2(b.lng - a.lng, b.lat - a.lat) * 180) / Math.PI;
  return { point, heading };
}

export function formatClock(date: Date) {
  return date.toLocaleTimeString("en-GB", { hour12: false });
}

export function relTime(minutesAgo: number) {
  if (minutesAgo < 1) return "just now";
  if (minutesAgo < 60) return `${Math.round(minutesAgo)} min ago`;
  const h = Math.floor(minutesAgo / 60);
  return `${h} hr ago`;
}
