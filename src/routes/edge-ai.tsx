import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Cpu, Gauge, MapPin, Radio, Signal, Waves } from "lucide-react";
import { DemoTag, PageHeader, PanelHeader, SeverityBadge, StatusDot, Bar } from "@/components/kit/primitives";
import { useStore } from "@/state/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/edge-ai")({
  head: () => ({
    meta: [
      { title: "Edge AI Monitor — UrbanSense AI" },
      {
        name: "description",
        content:
          "Watch on-bus edge inference in action: live detection overlays, model telemetry, latency, and metadata-only transmission.",
      },
      { property: "og:title", content: "Edge AI Monitor — UrbanSense AI" },
      { property: "og:description", content: "Process locally. Transmit intelligently." },
    ],
  }),
  component: EdgeAiPage,
});

interface Box {
  id: string;
  label: string;
  cls: "car" | "motorcycle" | "pedestrian" | "pothole";
  x: number;
  y: number;
  w: number;
  h: number;
  conf: number;
}

const CLASS_TONE: Record<Box["cls"], string> = {
  car: "border-intel text-intel",
  motorcycle: "border-warn text-warn",
  pedestrian: "border-ok text-ok",
  pothole: "border-critical text-critical",
};

const BASE_BOXES: Box[] = [
  { id: "b1", label: "CAR", cls: "car", x: 12, y: 46, w: 22, h: 20, conf: 0.96 },
  { id: "b2", label: "CAR", cls: "car", x: 41, y: 42, w: 17, h: 16, conf: 0.93 },
  { id: "b3", label: "CAR", cls: "car", x: 63, y: 40, w: 13, h: 13, conf: 0.88 },
  { id: "b4", label: "MOTORCYCLE", cls: "motorcycle", x: 32, y: 58, w: 9, h: 12, conf: 0.9 },
  { id: "b5", label: "MOTORCYCLE", cls: "motorcycle", x: 76, y: 52, w: 8, h: 11, conf: 0.85 },
  { id: "b6", label: "PEDESTRIAN", cls: "pedestrian", x: 86, y: 47, w: 6, h: 16, conf: 0.91 },
  { id: "b7", label: "PEDESTRIAN", cls: "pedestrian", x: 5, y: 44, w: 5, h: 15, conf: 0.87 },
  { id: "b8", label: "POTHOLE", cls: "pothole", x: 46, y: 76, w: 16, h: 9, conf: 0.94 },
];

function EdgeAiPage() {
  const { monitorBusId, setMonitorBus, buses, events, live } = useStore();
  const bus = buses.find((b) => b.id === monitorBusId) ?? buses[0];
  const [frame, setFrame] = useState(0);
  const [camera, setCamera] = useState<"FRONT" | "SIDE" | "REAR" | "CABIN">("FRONT");

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => setFrame((f) => f + 1), 700);
    return () => window.clearInterval(id);
  }, [live]);

  const boxes = useMemo(
    () =>
      BASE_BOXES.map((b, i) => {
        const drift = Math.sin((frame + i * 3) / 4) * 1.6;
        const driftY = Math.cos((frame + i * 2) / 5) * 0.9;
        return { ...b, x: b.x + drift, y: b.y + driftY };
      }),
    [frame],
  );

  const counts = { car: 12, motorcycle: 4, pedestrian: 8, pothole: 1 };
  const fps = 30 + (frame % 4);
  const latency = 26 + (frame % 6);
  const detections = events.filter((e) => e.busId === bus.id).slice(0, 4);

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        eyebrow="edge inference"
        title="Edge AI Monitor"
        subtitle="On-bus perception runs at the edge. Only structured intelligence leaves the vehicle."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={bus.id}
              onChange={(e) => setMonitorBus(e.target.value)}
              className="metric h-8 rounded-sm border border-border bg-background/70 px-2 text-[12px] outline-none focus:border-intel/50"
            >
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id}
                </option>
              ))}
            </select>
            <div className="flex overflow-hidden rounded-sm border border-border">
              {(["FRONT", "SIDE", "REAR", "CABIN"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCamera(c)}
                  className={cn(
                    "px-2 py-1.5 font-mono text-[10px] tracking-[0.12em]",
                    camera === c ? "bg-intel/20 text-intel" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <DemoTag />
          </div>
        }
      />

      <div className="grid gap-3 p-5 xl:grid-cols-[1fr_360px]">
        {/* video */}
        <div className="panel overflow-hidden">
          <PanelHeader
            title={`${bus.id} / ${camera} CAMERA`}
            subtitle={`${bus.routeCode} · ${bus.area}`}
            icon={<Radio className="h-3.5 w-3.5" />}
            right={
              <span className="flex items-center gap-1.5">
                <StatusDot sev="critical" />
                <span className="label-mono">rec · simulated feed</span>
              </span>
            }
          />
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-background">
            {/* synthetic road scene */}
            <div className="absolute inset-0 bg-gradient-to-b from-panel-raised via-background to-panel" />
            <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-intel/10 to-transparent" />
            <div
              className="absolute bottom-0 left-1/2 h-3/5 w-[160%] -translate-x-1/2 border-t border-border/60"
              style={{
                background:
                  "linear-gradient(to top, color-mix(in oklab, var(--panel-raised) 90%, black), transparent)",
                clipPath: "polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%)",
              }}
            />
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-warn/50"
                style={{
                  bottom: `${((i * 14 + frame * 4) % 100) * 0.6}%`,
                  height: `${3 + i * 1.2}%`,
                  opacity: 0.25 + i * 0.1,
                }}
              />
            ))}
            <div className="scanline absolute inset-0" />

            {boxes.map((b) => (
              <div
                key={b.id}
                className={cn("absolute rounded-[2px] border-2 transition-all duration-500", CLASS_TONE[b.cls])}
                style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
              >
                <span className="absolute -top-4 left-0 font-mono text-[9px] tracking-widest whitespace-nowrap">
                  {b.label} {Math.round(b.conf * 100)}%
                </span>
              </div>
            ))}

            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {(
                [
                  ["CAR", counts.car, "text-intel"],
                  ["MOTORCYCLE", counts.motorcycle, "text-warn"],
                  ["PEDESTRIAN", counts.pedestrian, "text-ok"],
                  ["POTHOLE", counts.pothole, "text-critical"],
                ] as const
              ).map(([label, n, tone]) => (
                <span
                  key={label}
                  className={cn(
                    "metric rounded-sm border border-border bg-background/70 px-2 py-0.5 text-[10px] tracking-widest",
                    tone,
                  )}
                >
                  {label} {String(n).padStart(2, "0")}
                </span>
              ))}
            </div>

            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <span className="metric rounded-sm border border-border bg-background/70 px-2 py-0.5 text-[10px]">
                {fps} FPS
              </span>
              <span className="metric rounded-sm border border-border bg-background/70 px-2 py-0.5 text-[10px]">
                {latency} MS
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-panel">
              <div className="animate-sweep h-full w-1/4 bg-intel/70" />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-intel uppercase">
              process locally. transmit intelligently.
            </span>
            <span className="flex items-center gap-2">
              <span className="label-mono">inference pipeline</span>
              <span className="flex h-1.5 w-32 overflow-hidden rounded-full bg-panel-raised">
                <span className="animate-sweep h-full w-1/3 bg-intel" />
              </span>
            </span>
          </div>
        </div>

        {/* right column */}
        <div className="flex flex-col gap-3">
          <div className="panel">
            <PanelHeader title="ai processing" icon={<Cpu className="h-3.5 w-3.5" />} />
            <div className="grid grid-cols-2 gap-2 p-3">
              {[
                ["model", "YOLO EDGE"],
                ["inference", "ACTIVE"],
                ["fps", `${fps}`],
                ["latency", `${latency}ms`],
                ["detections", `${17 + (frame % 5)}`],
                ["unit", bus.id],
              ].map(([k, v]) => (
                <div key={k} className="rounded-sm border border-border bg-panel-raised/40 px-3 py-2">
                  <div className="label-mono">{k}</div>
                  <div className="metric mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <PanelHeader title="detections" icon={<Activity className="h-3.5 w-3.5" />} />
            <div className="divide-y divide-border">
              {[
                { label: "POTHOLE", value: "94%", note: "HIGH", sev: "critical" as const },
                { label: "VEHICLES", value: "27", note: "HIGH DENSITY", sev: "high" as const },
                { label: "PEDESTRIANS", value: "8", note: "MONITORED", sev: "medium" as const },
                { label: "WATERLOGGING", value: "—", note: "NOT DETECTED", sev: "low" as const },
              ].map((d) => (
                <div key={d.label} className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <span className="font-mono text-[11px] tracking-[0.12em]">{d.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="metric text-sm">{d.value}</span>
                    <SeverityBadge sev={d.sev}>{d.note}</SeverityBadge>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <PanelHeader title="current location" icon={<MapPin className="h-3.5 w-3.5" />} />
            <div className="p-3">
              <div className="metric text-lg">
                {bus.position.lat.toFixed(4)}
                <br />
                {bus.position.lng.toFixed(4)}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {bus.area} · {bus.routeCode} · GPS ±3.1 m
              </p>
            </div>
          </div>

          <div className="panel">
            <PanelHeader title="bandwidth" icon={<Waves className="h-3.5 w-3.5" />} />
            <div className="space-y-2 p-3">
              <div className="flex items-end justify-between">
                <span className="metric text-2xl text-ok">{bus.bandwidthSavedPct}%</span>
                <span className="label-mono">saved</span>
              </div>
              <Bar value={bus.bandwidthSavedPct} sev="low" />
              <div className="flex items-center justify-between rounded-sm border border-border bg-panel-raised/40 px-3 py-2">
                <span className="label-mono">raw video</span>
                <span className="metric text-xs text-critical">NOT TRANSMITTED</span>
              </div>
              <div className="flex items-center justify-between rounded-sm border border-border bg-panel-raised/40 px-3 py-2">
                <span className="label-mono">uplink payload</span>
                <span className="metric text-xs">1.8 KB / event</span>
              </div>
            </div>
          </div>

          <div className="panel">
            <PanelHeader title="recent uplinks" icon={<Signal className="h-3.5 w-3.5" />} />
            <div className="divide-y divide-border">
              {detections.length === 0 && (
                <div className="px-4 py-3 text-xs text-muted-foreground">
                  Awaiting the next structured detection from this unit.
                </div>
              )}
              {detections.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-2 px-4 py-2">
                  <span className="min-w-0">
                    <span className="block truncate text-xs">{d.title}</span>
                    <span className="metric block truncate text-[10px] text-muted-foreground">{d.id}</span>
                  </span>
                  <SeverityBadge sev={d.severity} />
                </div>
              ))}
            </div>
          </div>

          <div className="panel flex items-center gap-3 px-4 py-3">
            <Gauge className="h-4 w-4 text-intel" />
            <div>
              <div className="label-mono">edge health</div>
              <div className="metric text-sm">Thermal nominal · 41°C · 18% CPU headroom</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
