/**
 * UrbanSense AI — domain types.
 *
 * These interfaces are the contract between the UI and the data layer.
 * The mock layer in `src/mock/*` implements them today; a real API client
 * can implement the same shapes later without any UI changes.
 */

export type Severity = "low" | "medium" | "high" | "critical";

export type EventStatus = "DETECTED" | "VERIFIED" | "ASSIGNED" | "IN PROGRESS" | "RESOLVED";

export type EventType =
  | "pothole"
  | "crack"
  | "traffic"
  | "incident"
  | "waterlogging"
  | "pedestrian_risk"
  | "infrastructure";

export type CameraId = "front" | "side" | "rear" | "cabin";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface BusRoute {
  id: string;
  name: string;
  code: string;
  corridor: string;
  stops: number;
  lengthKm: number;
  avgDelayMin: number;
  path: GeoPoint[];
}

export interface Bus {
  id: string;
  routeId: string;
  routeCode: string;
  area: string;
  position: GeoPoint;
  heading: number;
  speedKph: number;
  aiOnline: boolean;
  gpsOnline: boolean;
  camerasOnline: number;
  camerasTotal: number;
  eventsToday: number;
  lastSeenSec: number;
  bandwidthSavedPct: number;
  aiConfidence: number;
  pathIndex: number;
}

export interface UrbanEvent {
  id: string;
  type: EventType;
  title: string;
  severity: Severity;
  confidence: number;
  busId: string;
  camera: CameraId;
  position: GeoPoint;
  location: string;
  roadId: string;
  timestamp: string;
  observations: number;
  observedBy: string[];
  status: EventStatus;
  recommendation: string;
  history: { label: string; value: string }[];
}

export interface RoadSegment {
  id: string;
  name: string;
  area: string;
  health: number;
  severity: Severity;
  potholes: number;
  cracks: number;
  waterlogging: number;
  infraIssues: number;
  nearMisses: number;
  trafficLoad: "LOW" | "MODERATE" | "HIGH" | "SEVERE";
  path: GeoPoint[];
  timeline: { month: string; health: number }[];
  factors: { label: string; impact: number }[];
  nearby: string;
}

export interface Incident {
  id: string;
  type: string;
  severity: Severity;
  minutesAgo: number;
  time: string;
  location: string;
  position: GeoPoint;
  vehicle: string;
  registration: string;
  ocrConfidence: number;
  aiMatch: number;
  direction: string;
  track: GeoPoint[];
  observations: { busId: string; time: string }[];
  status: EventStatus;
}

export interface InfrastructureIssue {
  id: string;
  road: string;
  type: "Missing Sign" | "Damaged Divider" | "Missing Zebra Crossing" | "Waterlogging Zone";
  severity: Severity;
  position: GeoPoint;
  detected: string;
  expected: string;
  risk: string;
  recommendation: string;
  status: EventStatus;
}

export interface PedestrianZone {
  id: string;
  name: string;
  riskScore: number;
  severity: Severity;
  position: GeoPoint;
  nearby: string;
  nearMisses: number;
}

export interface TrafficHotspot {
  id: string;
  name: string;
  severity: Severity;
  delayMin: number;
  densityIndex: number;
  avgSpeedKph: number;
  position: GeoPoint;
}

export interface FusionCluster {
  id: string;
  label: string;
  type: EventType;
  observations: number;
  buses: number;
  confidence: number;
  severity: Severity;
  firstObserved: string;
  lastConfirmed: string;
  position: GeoPoint;
  points: { busId: string; position: GeoPoint; time: string; confidence: number }[];
}

export interface MaintenanceItem {
  id: string;
  rank: number;
  road: string;
  category: "Roads" | "Signs" | "Dividers" | "Waterlogging";
  severity: Severity;
  problem: string;
  trafficLoad: string;
  pedestrianRisk: string;
  recurrence: number;
  nearby: string;
  recommendation: string;
  priorityScore: number;
  status: EventStatus;
  assignee?: string;
}

export interface Notification {
  id: string;
  title: string;
  detail: string;
  severity: Severity;
  minutesAgo: number;
  read: boolean;
  eventId?: string;
}

export interface CopilotAnswer {
  question: string;
  answer: string;
  cards: { label: string; value: string; tone?: Severity | "intel" }[];
  focusRoadId?: string;
}

export interface SearchResult {
  id: string;
  kind: "Bus" | "Road" | "Event" | "Route" | "Incident";
  label: string;
  detail: string;
  href: string;
}
