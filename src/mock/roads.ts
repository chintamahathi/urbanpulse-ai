import type { RoadSegment } from "@/lib/types";
import { AREA_POINTS, jitter, rng, severityFromHealth } from "./geo";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP"];

const DEF: [string, string, number, string][] = [
  ["School Road", "Banjara Hills", 31, "Govt. Girls High School"],
  ["Jubilee Junction Approach", "Jubilee Junction", 42, "Metro entry gate"],
  ["Market Road", "Ameerpet", 48, "Wholesale market"],
  ["Necklace Link Road", "Begumpet", 68, "Lakefront promenade"],
  ["Cyber Access Road", "Hitec City", 74, "IT campus gate 4"],
  ["Old Mint Road", "Charminar", 21, "Heritage bazaar"],
  ["Ring Radial 7", "LB Nagar", 55, "Flyover ramp"],
  ["University Avenue", "Gachibowli", 91, "Central university"],
  ["Cantonment Cross", "Secunderabad", 63, "Rail terminal"],
  ["Miyapur Feeder Lane", "Miyapur", 38, "Depot approach"],
  ["Uppal Bypass Service Road", "Uppal", 52, "Truck terminal"],
  ["Mehdipatnam Arch Road", "Mehdipatnam", 45, "Bus bay cluster"],
  ["Kompally North Stretch", "Kompally", 82, "Warehouse belt"],
  ["Nampally Station Road", "Nampally", 57, "Exhibition ground"],
  ["Kukatpally Industrial Road", "Kukatpally", 34, "Industrial estate"],
];

export const roads: RoadSegment[] = DEF.map(([name, area, health, nearby], i) => {
  const r = rng(7100 + i);
  const base = AREA_POINTS[area];
  const path = [jitter(base, 0.02, r), jitter(base, 0.03, r), jitter(base, 0.04, r)];
  const decay = (100 - health) / MONTHS.length;
  const timeline = MONTHS.map((month, m) => ({
    month,
    health: Math.max(health, Math.round(Math.min(99, health + decay * (MONTHS.length - m) * 0.9))),
  }));
  const potholes = Math.max(1, Math.round((100 - health) / 6 + r() * 3));
  const cracks = Math.max(1, Math.round((100 - health) / 9 + r() * 3));
  const waterlogging = Math.round(r() * 4);
  const infraIssues = Math.round(r() * 5);
  const nearMisses = Math.round((100 - health) / 10 + r() * 4);
  return {
    id: `RD-${1000 + i}`,
    name,
    area,
    health,
    severity: severityFromHealth(health),
    potholes,
    cracks,
    waterlogging,
    infraIssues,
    nearMisses,
    trafficLoad: health < 40 ? "SEVERE" : health < 60 ? "HIGH" : health < 80 ? "MODERATE" : "LOW",
    path,
    timeline,
    nearby,
    factors: [
      { label: "Potholes", impact: -Math.round(potholes * 2.6) },
      { label: "Repeated detections", impact: -Math.round(12 + r() * 10) },
      { label: "Traffic load", impact: -Math.round(6 + r() * 9) },
      { label: "Pedestrian risk", impact: -Math.round(4 + r() * 7) },
      { label: "Incidents", impact: -Math.round(4 + r() * 8) },
    ],
  } satisfies RoadSegment;
});

export const roadById = (id: string) => roads.find((r) => r.id === id);
export const roadByName = (name: string) => roads.find((r) => r.name === name);
