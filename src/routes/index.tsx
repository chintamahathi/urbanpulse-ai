import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bus,
  Cpu,
  Droplets,
  Layers,
  Radar,
  ShieldAlert,
  TrafficCone,
} from "lucide-react";
import LiveMap, { type MapMarkerSpec } from "@/components/map/LiveMap";
import {
  DEFAULT_LAYERS,
  LayerToggles,
  MapLegend,
  TimeFilters,
  type LayerKey,
  type LayerState,
  type TimeFilter,
} from "@/components/map/MapControls";
import LiveFeed from "@/components/feed/LiveFeed";
import { DemoTag, KpiCard, StatusDot } from "@/components/kit/primitives";
import { useStore } from "@/state/store";
import { roads } from "@/mock/roads";
import { pedestrianZones, trafficHotspots } from "@/mock/city";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "City Intelligence — UrbanSense AI Command Center" },
      {
        name: "description",
        content:
          "Live urban situational awareness: fleet perception, road defects, congestion hotspots, incidents and safety risks on one command-center map.",
      },
      { property: "og:title", content: "City Intelligence — UrbanSense AI Command Center" },
      {
        property: "og:description",
        content: "Live urban situational awareness across 1,248 mobile sensing units.",
      },
    ],
  }),
  component: Overview,
});

const TIME_WINDOW_MIN: Record<TimeFilter, number> = { LIVE: 25, "1H": 60, "6H": 360, "24H": 1440, "7D": 10080 };

function Overview() {
  const { kpis, buses, events, incidents, infrastructure, selectEvent, selectBus, selectIncident, live } = useStore();
  const [layers, setLayers] = useState<LayerState>(DEFAULT_LAYERS);
  const [time, setTime] = useState<TimeFilter>("LIVE");
  const toggle = (k: LayerKey) => setLayers((prev) => ({ ...prev, [k]: !prev[k] }));

  const windowedEvents = useMemo(() => {
    const cutoff = Date.now() - TIME_WINDOW_MIN[time] * 60_000;
    const list = events.filter((e) => new Date(e.timestamp).getTime() > cutoff || time !== "LIVE");
    return (list.length ? list : events).slice(0, time === "LIVE" ? 34 : 90);
  }, [events, time]);

  const markers = useMemo<MapMarkerSpec[]>(() => {
    const out: MapMarkerSpec[] = [];
    if (layers.buses)
      buses.forEach((b) =>
        out.push({
          id: b.id,
          kind: "bus",
          severity: "low",
          position: b.position,
          label: `${b.id} · ${b.routeCode}`,
          heading: b.heading,
        }),
      );
    windowedEvents.forEach((e) => {
      const layerOn =
        (e.type === "traffic" && layers.traffic) ||
        ((e.type === "pothole" || e.type === "crack" || e.type === "waterlogging") && layers.roadHealth) ||
        (e.type === "incident" && layers.incidents) ||
        (e.type === "pedestrian_risk" && layers.safety) ||
        (e.type === "infrastructure" && layers.infrastructure);
      if (!layerOn) return;
      out.push({
        id: e.id,
        kind: e.type,
        severity: e.severity,
        position: e.position,
        label: `${e.id} · ${e.title}`,
        pulse: e.severity === "critical",
      });
    });
    if (layers.incidents)
      incidents.forEach((i) =>
        out.push({
          id: i.id,
          kind: "incident",
          severity: i.severity,
          position: i.position,
          label: `${i.id} · ${i.type}`,
          pulse: i.severity === "critical",
        }),
      );
    if (layers.safety)
      pedestrianZones.forEach((z) =>
        out.push({
          id: z.id,
          kind: "pedestrian_risk",
          severity: z.severity,
          position: z.position,
          label: `${z.name} · risk ${z.riskScore}`,
        }),
      );
    if (layers.infrastructure)
      infrastructure.forEach((i) =>
        out.push({
          id: i.id,
          kind: "infrastructure",
          severity: i.severity,
          position: i.position,
          label: `${i.road} · ${i.type}`,
        }),
      );
    return out;
  }, [layers, buses, windowedEvents, incidents, infrastructure]);

  const lines = useMemo(
    () => (layers.roadHealth ? roads.map((r) => ({ id: r.id, path: r.path, severity: r.severity, width: 4 })) : []),
    [layers.roadHealth],
  );

  const heat = useMemo(
    () => (layers.traffic ? trafficHotspots.map((h) => ({ position: h.position, weight: h.densityIndex / 100 })) : []),
    [layers.traffic],
  );

  const onSelect = (m: MapMarkerSpec) => {
    if (m.kind === "bus") selectBus(m.id);
    else if (m.id.startsWith("INC-")) selectIncident(m.id);
    else if (m.id.startsWith("PRZ-") || m.id.startsWith("INF-")) selectEvent(null);
    else selectEvent(m.id);
  };

  return (
    <div className="flex min-h-full flex-col">
      {/* intelligence header */}
      <div className="relative overflow-hidden border-b border-border bg-panel/70 px-5 py-5">
        <div className="grid-backdrop pointer-events-none absolute inset-0" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="label-mono flex items-center gap-2 text-intel">
              <Radar className="h-3.5 w-3.5" /> city intelligence
            </div>
            <h1 className="mt-1.5 text-3xl leading-none font-semibold tracking-tight uppercase">
              Live urban situational awareness
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <StatusDot sev={live ? "low" : "medium"} />
              Fleet perception active across {kpis.activeBuses.toLocaleString()} mobile sensing units.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <DemoTag />
            <span className="max-w-xs text-right text-[11px] text-muted-foreground">
              BUS FLEET → EDGE AI → CITY INTELLIGENCE → ACTION
            </span>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 px-5 py-4 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="active buses" value={kpis.activeBuses.toLocaleString()} sev="intel" icon={<Bus className="h-4 w-4" />} live delta="+12" />
        <KpiCard label="ai events today" value={kpis.aiEventsToday.toLocaleString()} sev="intel" icon={<Cpu className="h-4 w-4" />} live />
        <KpiCard label="critical events" value={kpis.criticalEvents} sev="critical" icon={<AlertTriangle className="h-4 w-4" />} live />
        <KpiCard label="congestion hotspots" value={kpis.congestionHotspots} sev="high" icon={<TrafficCone className="h-4 w-4" />} live />
        <KpiCard label="road defects" value={kpis.roadDefects} sev="medium" icon={<Layers className="h-4 w-4" />} live />
        <KpiCard label="safety risks" value={kpis.safetyRisks} sev="critical" icon={<ShieldAlert className="h-4 w-4" />} live />
      </div>

      {/* map + feed */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 px-5 pb-5 xl:grid-cols-[1fr_360px]">
        <div className="panel relative min-h-[520px] overflow-hidden">
          <LiveMap className="absolute inset-0" markers={markers} lines={lines} heat={heat} onSelect={onSelect} />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3">
            <div className="pointer-events-auto flex flex-wrap items-center gap-2">
              <LayerToggles layers={layers} onToggle={toggle} />
            </div>
            <div className="pointer-events-auto flex items-center gap-2 pr-10">
              <TimeFilters value={time} onChange={setTime} />
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-end gap-2">
            <MapLegend className="pointer-events-auto w-52" />
            <div className="panel pointer-events-auto px-3 py-2">
              <div className="label-mono flex items-center gap-1.5">
                <Droplets className="h-3 w-3" /> rendering
              </div>
              <div className="metric mt-1 text-sm">{markers.length} objects</div>
              <div className="text-[10px] text-muted-foreground uppercase">
                {time === "LIVE" ? "live window" : `${time} history`}
              </div>
            </div>
          </div>
        </div>

        <LiveFeed className="min-h-[420px] xl:max-h-[calc(100vh-330px)]" />
      </div>
    </div>
  );
}
