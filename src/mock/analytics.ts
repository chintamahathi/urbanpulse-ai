import { rng } from "./geo";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP"];

export const roadHealthTrend = MONTHS.map((month, i) => {
  const r = rng(11 + i);
  return {
    month,
    network: +(74 - i * 2.4 + r() * 2).toFixed(1),
    critical: Math.round(6 + i * 2.1 + r() * 3),
  };
});

export const trafficTrend = MONTHS.map((month, i) => {
  const r = rng(31 + i);
  return {
    month,
    avgSpeed: +(38 - i * 0.8 + r() * 1.6).toFixed(1),
    vehiclesM: +(1.6 + i * 0.11 + r() * 0.1).toFixed(2),
  };
});

export const incidentTrend = MONTHS.map((month, i) => {
  const r = rng(51 + i);
  return {
    month,
    incidents: Math.round(120 + i * 9 + r() * 22),
    nearMisses: Math.round(280 + i * 16 + r() * 40),
  };
});

export const busDelayTrend = MONTHS.map((month, i) => {
  const r = rng(71 + i);
  return { month, delayMin: +(7.2 + i * 0.55 + r() * 1.2).toFixed(1) };
});

export const infraDeficiencies = [
  { name: "Missing signs", value: 43 },
  { name: "Damaged dividers", value: 27 },
  { name: "Missing zebra", value: 18 },
  { name: "Waterlogging", value: 12 },
  { name: "Broken kerbs", value: 9 },
];

export const pedestrianRiskTrend = MONTHS.map((month, i) => {
  const r = rng(91 + i);
  return { month, riskIndex: Math.round(38 + i * 3.2 + r() * 6) };
});

export const odMatrix = [
  { from: "AREA A", to: "AREA D", trips: 18200 },
  { from: "AREA B", to: "AREA C", trips: 12400 },
  { from: "AREA A", to: "AREA F", trips: 9800 },
  { from: "AREA C", to: "AREA E", trips: 8600 },
  { from: "AREA D", to: "AREA B", trips: 7400 },
  { from: "AREA E", to: "AREA A", trips: 6100 },
  { from: "AREA F", to: "AREA C", trips: 5200 },
  { from: "AREA B", to: "AREA E", trips: 4300 },
];
