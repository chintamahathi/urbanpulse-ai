import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Gauge, Layers, TrendingDown } from "lucide-react";
import LiveMap, { type MapMarkerSpec } from "@/components/map/LiveMap";
import { Bar, DemoTag, PageHeader, PanelHeader, SeverityBadge, Stat, tone } from "@/components/kit/primitives";
import { roads } from "@/mock/roads";
import { useStore } from "@/state/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roads")({
  head: () => ({
    meta: [
      { title: "Road Intelligence — UrbanSense AI" },
      {
        name: "description",
        content:
          "Network-wide road health scoring built from repeated bus observations: potholes, cracks, waterlogging, deterioration timelines and score explanations.",
      },
      { property: "og:title", content: "Road Intelligence — UrbanSense AI" },
      { property: "og:description", content: "Understand why every road segment scores the way it does." },
    ],
  }),
  component: RoadsPage,
});

function RoadsPage() {
  const { selectedRoadId, selectRoad, events, selectEvent } = useStore();
  const active = roads.find((r) => r.id === (selectedRoadId ?? roads[0]!.id)) ?? roads[0]!;
  const [sort, setSort] = useState<"health" | "name">("health");

  const sorted = useMemo(
    () => [...roads].sort((a, b) => (sort === "health" ? a.health - b.health : a.name.localeCompare(b.name))),
    [sort],
  );

  const markers = useMemo<MapMarkerSpec[]>(
    () =>
      events
        .filter((e) => ["pothole", "crack", "waterlogging"].includes(e.type))
        .slice(0, 40)
        .map((e) => ({
          id: e.id,
          kind: e.type,
          severity: e.severity,
          position: e.position,
          label: `${e.id} · ${e.title}`,
          pulse: e.severity === "critical",
        })),
    [events],
  );

  const scoreDrop = active.factors.reduce((s, f) => s + f.impact, 0);

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        eyebrow="road asset intelligence"
        title="Road Intelligence"
        subtitle="Every segment scores 0–100 from fused fleet observations. Lower means faster structural and safety decline."
        right={<DemoTag />}
      />

      <div className="grid gap-3 p-5 xl:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-3">
          <div className="panel relative min-h-[380px] overflow-hidden">
            <LiveMap
              className="absolute inset-0"
              markers={markers}
              lines={roads.map((r) => ({ id: r.id, path: r.path, severity: r.severity, width: r.id === active.id ? 7 : 4 }))}
              onSelect={(m) => selectEvent(m.id)}
              fitTo={active.path}
            />
            <div className="panel absolute top-3 left-3 px-3 py-2">
              <div className="label-mono">road health map</div>
              <div className="metric mt-1 text-sm">{roads.length} monitored segments</div>
            </div>
          </div>

          <div className="panel">
            <PanelHeader
              title="network segments"
              subtitle="Click a segment to inspect its intelligence profile"
              icon={<Layers className="h-3.5 w-3.5" />}
              right={
                <div className="flex overflow-hidden rounded-sm border border-border">
                  {(["health", "name"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSort(s)}
                      className={cn(
                        "px-2 py-1 font-mono text-[10px] tracking-[0.12em] uppercase",
                        sort === s ? "bg-intel/20 text-intel" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              }
            />
            <div className="grid gap-2 p-3 md:grid-cols-2">
              {sorted.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => selectRoad(r.id)}
                  className={cn(
                    "rounded-sm border px-3 py-2 text-left transition-colors",
                    r.id === active.id
                      ? "border-intel/50 bg-intel/10"
                      : "border-border bg-panel-raised/40 hover:border-intel/30",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px]">{r.name}</span>
                    <span className={cn("metric text-sm font-semibold", tone(r.severity).text)}>HEALTH {r.health}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{r.area}</span>
                    <span>{r.potholes} potholes · {r.trafficLoad}</span>
                  </div>
                  <Bar value={r.health} sev={r.severity} className="mt-1.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* road detail */}
        <div className="flex flex-col gap-3">
          <div className="panel">
            <PanelHeader title="road detail" icon={<Gauge className="h-3.5 w-3.5" />} />
            <div className="space-y-3 p-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight uppercase">{active.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {active.area} · near {active.nearby}
                </p>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="label-mono">road health</div>
                  <div className={cn("metric text-4xl leading-none font-semibold", tone(active.severity).text)}>
                    {active.health}
                    <span className="text-base text-muted-foreground"> / 100</span>
                  </div>
                </div>
                <SeverityBadge sev={active.severity}>{active.severity}</SeverityBadge>
              </div>
              <Bar value={active.health} sev={active.severity} />
              <div className="grid grid-cols-2 gap-2">
                <Stat label="potholes" value={active.potholes} sev="critical" />
                <Stat label="cracks" value={active.cracks} sev="high" />
                <Stat label="waterlogging" value={active.waterlogging} sev="medium" />
                <Stat label="infrastructure issues" value={active.infraIssues} sev="high" />
                <Stat label="near misses" value={active.nearMisses} sev="critical" />
                <Stat label="traffic load" value={active.trafficLoad} sev="intel" />
              </div>
            </div>
          </div>

          <div className="panel">
            <PanelHeader title="deterioration timeline" subtitle="Jan – Sep, fused observations" icon={<TrendingDown className="h-3.5 w-3.5" />} />
            <div className="h-44 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={active.timeline} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="roadHealthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--intel)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--intel)" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--grid-line)" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} stroke="var(--border)" />
                  <YAxis domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} stroke="var(--border)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="health" stroke="var(--intel)" strokeWidth={2} fill="url(#roadHealthFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel">
            <PanelHeader title="why is this road critical?" subtitle={`Score impact ${scoreDrop} points`} />
            <div className="space-y-2 p-4">
              {active.factors.map((f) => (
                <div key={f.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className="metric text-critical">{f.impact}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-panel-raised">
                    <div
                      className="h-full rounded-full bg-critical/80"
                      style={{ width: `${Math.min(100, Math.abs(f.impact) * 2.6)}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="pt-1 text-[11px] text-muted-foreground">
                Baseline 100 minus weighted deductions from defect density, repeat detections, traffic exposure,
                pedestrian conflict and incidents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
