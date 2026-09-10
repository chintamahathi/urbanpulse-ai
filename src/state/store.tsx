import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Bus,
  EventStatus,
  Incident,
  InfrastructureIssue,
  MaintenanceItem,
  Notification,
  SearchResult,
  UrbanEvent,
} from "@/lib/types";
import { buses as seedBuses, routes, FLEET_TOTAL } from "@/mock/fleet";
import { roads } from "@/mock/roads";
import { HERO_EVENT_ID, kpiSeed, seedEvents } from "@/mock/events";
import {
  seedIncidents,
  seedInfrastructure,
  seedMaintenance,
  seedNotifications,
} from "@/mock/city";
import { pointOnPath, rng } from "@/mock/geo";

export interface Kpis {
  activeBuses: number;
  aiEventsToday: number;
  criticalEvents: number;
  congestionHotspots: number;
  roadDefects: number;
  safetyRisks: number;
}

interface StoreValue {
  live: boolean;
  setLive: (v: boolean) => void;
  tick: number;
  buses: Bus[];
  events: UrbanEvent[];
  incidents: Incident[];
  infrastructure: InfrastructureIssue[];
  maintenance: MaintenanceItem[];
  notifications: Notification[];
  kpis: Kpis;
  /* selection */
  selectedEventId: string | null;
  selectEvent: (id: string | null) => void;
  selectedBusId: string | null;
  selectBus: (id: string | null) => void;
  selectedIncidentId: string | null;
  selectIncident: (id: string | null) => void;
  selectedRoadId: string | null;
  selectRoad: (id: string | null) => void;
  monitorBusId: string;
  setMonitorBus: (id: string) => void;
  /* mutations */
  setEventStatus: (id: string, status: EventStatus) => void;
  setMaintenanceStatus: (id: string, status: EventStatus, assignee?: string) => void;
  setInfraStatus: (id: string, status: EventStatus) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  pushNotification: (n: Omit<Notification, "id" | "minutesAgo" | "read">) => void;
  search: (q: string) => SearchResult[];
  /* demo mode */
  demo: DemoState;
  demoPlay: () => void;
  demoPause: () => void;
  demoRestart: () => void;
}

export interface DemoState {
  running: boolean;
  step: number;
  started: boolean;
}

export const DEMO_STEPS: { title: string; detail: string; tone: "intel" | "warn" | "ok" | "critical" }[] = [
  { title: "BUS-104 ONLINE", detail: "Edge unit booted · 4 cameras handshake complete", tone: "intel" },
  { title: "FRONT CAMERA PROCESSING", detail: "31 FPS · 28 ms inference latency", tone: "intel" },
  { title: "POTHOLE DETECTED", detail: "Confidence 94% · bounding box locked", tone: "warn" },
  { title: "GPS ATTACHED", detail: "17.3850, 78.4867 · ±3.1 m", tone: "intel" },
  { title: "EVENT TRANSMITTED", detail: "1.8 KB metadata · raw video not transmitted", tone: "intel" },
  { title: "BUS-205 DETECTS SAME LOCATION", detail: "Independent observation, 6 min later", tone: "warn" },
  { title: "FLEET FUSION", detail: "37 observations from 11 buses clustered", tone: "intel" },
  { title: "EVENT VERIFIED", detail: "PTH-1024 · confidence 99.1%", tone: "ok" },
  { title: "ROAD HEALTH 68 → 31", detail: "School Road reclassified CRITICAL", tone: "critical" },
  { title: "MAINTENANCE PRIORITY", detail: "Ranked #1 of 7 open interventions", tone: "critical" },
  { title: "AI RECOMMENDATION GENERATED", detail: "Immediate repair + zebra crossing restoration", tone: "ok" },
  { title: "AUTHORITY ACTION", detail: "Works order acknowledged by road authority", tone: "ok" },
];

const StoreContext = createContext<StoreValue | null>(null);

const NEW_EVENT_TEMPLATES: Pick<UrbanEvent, "type" | "title" | "severity" | "recommendation">[] = [
  {
    type: "pothole",
    title: "Pothole detected",
    severity: "high",
    recommendation: "Schedule surface patching within 72 hours.",
  },
  {
    type: "traffic",
    title: "Traffic density increased",
    severity: "medium",
    recommendation: "Adjust signal cycle at the upstream junction.",
  },
  {
    type: "pedestrian_risk",
    title: "Pedestrian risk elevated",
    severity: "critical",
    recommendation: "Restore crossing markings and add speed calming.",
  },
  {
    type: "waterlogging",
    title: "Waterlogging detected",
    severity: "medium",
    recommendation: "Inspect stormwater inlet.",
  },
  {
    type: "crack",
    title: "Surface cracking detected",
    severity: "low",
    recommendation: "Add to preventive resurfacing batch.",
  },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState(true);
  const [tick, setTick] = useState(0);
  const [buses, setBuses] = useState<Bus[]>(seedBuses);
  const [events, setEvents] = useState<UrbanEvent[]>(seedEvents);
  const [incidents, setIncidents] = useState<Incident[]>(seedIncidents);
  const [infrastructure, setInfrastructure] = useState<InfrastructureIssue[]>(seedInfrastructure);
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>(seedMaintenance);
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);
  const [kpis, setKpis] = useState<Kpis>(kpiSeed);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedRoadId, setSelectedRoadId] = useState<string | null>(null);
  const [monitorBusId, setMonitorBus] = useState<string>("BUS-105");

  const [demo, setDemo] = useState<DemoState>({ running: false, step: 0, started: false });
  const counter = useRef(0);

  /* ---------------- simulated live data engine ---------------- */
  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      counter.current += 1;
      const n = counter.current;
      setTick(n);

      setBuses((prev) =>
        prev.map((bus, i) => {
          const route = routes.find((r) => r.id === bus.routeId) ?? routes[0]!;
          const advance = 0.0035 + (i % 5) * 0.0009;
          const nextIndex = (bus.pathIndex + advance) % 1;
          const { point, heading } = pointOnPath(route.path, nextIndex);
          const r = rng(n * 97 + i)();
          return {
            ...bus,
            pathIndex: nextIndex,
            position: point,
            heading,
            speedKph: Math.max(6, Math.min(58, Math.round(bus.speedKph + (r - 0.5) * 9))),
            lastSeenSec: Math.floor(r * 6),
          };
        }),
      );

      setKpis((prev) => {
        const r = rng(n * 31)();
        return {
          activeBuses: Math.max(1180, Math.min(FLEET_TOTAL, prev.activeBuses + Math.round((r - 0.45) * 5))),
          aiEventsToday: prev.aiEventsToday + Math.round(r * 4),
          criticalEvents: Math.max(18, prev.criticalEvents + (r > 0.86 ? 1 : r < 0.06 ? -1 : 0)),
          congestionHotspots: Math.max(11, Math.min(28, prev.congestionHotspots + (r > 0.9 ? 1 : r < 0.1 ? -1 : 0))),
          roadDefects: prev.roadDefects + (r > 0.7 ? 1 : 0),
          safetyRisks: Math.max(6, Math.min(22, prev.safetyRisks + (r > 0.93 ? 1 : r < 0.05 ? -1 : 0))),
        };
      });

      if (n % 2 === 0) {
        const r = rng(n * 17);
        const tpl = NEW_EVENT_TEMPLATES[Math.floor(r() * NEW_EVENT_TEMPLATES.length)]!;
        const road = roads[Math.floor(r() * roads.length)]!;
        const bus = seedBuses[Math.floor(r() * seedBuses.length)]!;
        const id = `${tpl.type === "pothole" ? "PTH" : "EVT"}-${9000 + n}`;
        const fresh: UrbanEvent = {
          ...tpl,
          id,
          confidence: +(0.8 + r() * 0.19).toFixed(2),
          busId: bus.id,
          camera: "front",
          position: { lat: road.path[1]!.lat + (r() - 0.5) * 0.01, lng: road.path[1]!.lng + (r() - 0.5) * 0.01 },
          location: `${road.name}, ${road.area}`,
          roadId: road.id,
          timestamp: new Date().toISOString(),
          observations: 1 + Math.floor(r() * 5),
          observedBy: [bus.id],
          status: "DETECTED",
          history: [
            { label: "First observed", value: "just now" },
            { label: "Distinct buses", value: "1" },
          ],
        };
        setEvents((prev) => [fresh, ...prev].slice(0, 160));
        if (fresh.severity === "critical") {
          setNotifications((prev) =>
            [
              {
                id: `N-${id}`,
                title: `New critical ${tpl.type.replace("_", " ")} detected`,
                detail: `${fresh.location} · ${bus.id} · ${Math.round(fresh.confidence * 100)}% confidence`,
                severity: "critical" as const,
                minutesAgo: 0,
                read: false,
                eventId: id,
              },
              ...prev,
            ].slice(0, 30),
          );
        }
      }
    }, 3000);
    return () => window.clearInterval(id);
  }, [live]);

  /* ---------------- demo mode sequencer ---------------- */
  useEffect(() => {
    if (!demo.running) return;
    const id = window.setInterval(() => {
      setDemo((prev) => {
        if (prev.step >= DEMO_STEPS.length - 1) return { ...prev, running: false, step: DEMO_STEPS.length - 1 };
        return { ...prev, step: prev.step + 1 };
      });
    }, 2200);
    return () => window.clearInterval(id);
  }, [demo.running]);

  const setEventStatus = useCallback((id: string, status: EventStatus) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    setIncidents((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  }, []);

  const setMaintenanceStatus = useCallback((id: string, status: EventStatus, assignee?: string) => {
    setMaintenance((prev) => prev.map((m) => (m.id === id ? { ...m, status, ...(assignee ? { assignee } : {}) } : m)));
  }, []);

  const setInfraStatus = useCallback((id: string, status: EventStatus) => {
    setInfrastructure((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }, []);

  const search = useCallback(
    (q: string): SearchResult[] => {
      const query = q.trim().toLowerCase();
      if (!query) return [];
      const out: SearchResult[] = [];
      for (const b of buses) {
        if (b.id.toLowerCase().includes(query) || b.area.toLowerCase().includes(query))
          out.push({ id: b.id, kind: "Bus", label: b.id, detail: `${b.routeCode} · ${b.area}`, href: "/fleet" });
      }
      for (const r of roads) {
        if (r.name.toLowerCase().includes(query) || r.area.toLowerCase().includes(query))
          out.push({ id: r.id, kind: "Road", label: r.name, detail: `Health ${r.health} · ${r.area}`, href: "/roads" });
      }
      for (const rt of routes) {
        if (rt.code.toLowerCase().includes(query) || rt.name.toLowerCase().includes(query))
          out.push({ id: rt.id, kind: "Route", label: rt.code, detail: rt.name, href: "/fleet" });
      }
      for (const e of events.slice(0, 80)) {
        if (e.id.toLowerCase().includes(query) || e.title.toLowerCase().includes(query) || e.location.toLowerCase().includes(query))
          out.push({ id: e.id, kind: "Event", label: `${e.id} — ${e.title}`, detail: e.location, href: "/" });
      }
      for (const i of incidents) {
        if (i.id.toLowerCase().includes(query) || i.type.toLowerCase().includes(query) || i.registration.toLowerCase().includes(query))
          out.push({ id: i.id, kind: "Incident", label: `${i.id} — ${i.type}`, detail: i.location, href: "/safety" });
      }
      return out.slice(0, 12);
    },
    [buses, events, incidents],
  );

  const value = useMemo<StoreValue>(
    () => ({
      live,
      setLive,
      tick,
      buses,
      events,
      incidents,
      infrastructure,
      maintenance,
      notifications,
      kpis,
      selectedEventId,
      selectEvent: setSelectedEventId,
      selectedBusId,
      selectBus: setSelectedBusId,
      selectedIncidentId,
      selectIncident: setSelectedIncidentId,
      selectedRoadId,
      selectRoad: setSelectedRoadId,
      monitorBusId,
      setMonitorBus,
      setEventStatus,
      setMaintenanceStatus,
      setInfraStatus,
      markNotificationRead: (id) =>
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
      markAllNotificationsRead: () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
      pushNotification: (n) =>
        setNotifications((prev) => [{ ...n, id: `N-${Date.now()}`, minutesAgo: 0, read: false }, ...prev].slice(0, 30)),
      search,
      demo,
      demoPlay: () => setDemo((p) => ({ running: true, started: true, step: p.step >= DEMO_STEPS.length - 1 ? 0 : p.step })),
      demoPause: () => setDemo((p) => ({ ...p, running: false })),
      demoRestart: () => setDemo({ running: true, started: true, step: 0 }),
      HERO_EVENT_ID,
    }) as StoreValue,
    [
      live,
      tick,
      buses,
      events,
      incidents,
      infrastructure,
      maintenance,
      notifications,
      kpis,
      selectedEventId,
      selectedBusId,
      selectedIncidentId,
      selectedRoadId,
      monitorBusId,
      demo,
      search,
      setEventStatus,
      setMaintenanceStatus,
      setInfraStatus,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
