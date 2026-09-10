import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bar as RBar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Car, Gauge, Timer, TriangleAlert } from "lucide-react";
import LiveMap, { type MapMarkerSpec } from "@/components/map/LiveMap";
import { DemoTag, KpiCard, PageHeader, PanelHeader, SeverityBadge, tone } from "@/components/kit/primitives";
import {
  congestionForecast,
  congestionTrend,
  trafficByHour,
  trafficHotspots,
  trafficStats,
  vehicleComposition,
} from "@/mock/city";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/traffic")({
  head: () => ({
    meta: [
      { title: "Traffic Intelligence — UrbanSense AI" },
      {
        name: "description",
        content:
          "Live congestion density, hotspot ranking, vehicle composition, hourly flow patterns and short-horizon congestion forecasting.",
      },
      { property: "og:title", content: "Traffic Intelligence — UrbanSense AI" },
      { property: "og:description", content: "Congestion, density and predictive traffic signals across the network." },
    ],
  }),
  component: TrafficPage,
});

const PIE_COLORS = ["var(--intel)", "var(--ok)", "var(--warn)", "var(--elevated)", "var(--critical)"];

function TrafficPage() {
  const [view, setView] = useState<"density" | "speed">("density");

  const markers = useMemo<MapMarkerSpec[]>(
    () =>
      trafficHotspots.map((h) => ({
        id: h.id,
        kind: "traffic",
        severity: h.severity,
        position: h.position,
        label: `${h.name} · +${h.delayMin} min`,
        pulse: h.severity === "critical",
      })),
    [],
  );

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        eyebrow="mobility intelligence"
        title="Traffic Intelligence"
        subtitle="Fleet-derived density, speed and delay signals, with a short-horizon congestion forecast per junction."
        right={<DemoTag />}
      />

      <div className="grid grid-cols-2 gap-3 px-5 py-4 lg:grid-cols-4">
        <KpiCard label="vehicles detected" value={trafficStats.vehiclesDetected} sev="intel" icon={<Car className="h-4 w-4" />} hint="today" live />
        <KpiCard label="current density" value={trafficStats.currentDensity} sev="high" icon={<Gauge className="h-4 w-4" />} live />
        <KpiCard label="avg network speed" value={`${trafficStats.avgNetworkSpeed} km/h`} sev="medium" icon={<Timer className="h-4 w-4" />} live />
        <KpiCard label="congestion hotspots" value={trafficStats.hotspots} sev="critical" icon={<TriangleAlert className="h-4 w-4" />} live />
      </div>

      <div className="grid gap-3 px-5 xl:grid-cols-[1fr_360px]">
        <div className="panel relative min-h-[360px] overflow-hidden">
          <LiveMap
            className="absolute inset-0"
            markers={markers}
            heat={trafficHotspots.map((h) => ({ position: h.position, weight: h.densityIndex / 100 }))}
          />
          <div className="panel absolute top-3 left-3 px-3 py-2">
            <div className="label-mono">congestion heat</div>
            <div className="metric mt-1 text-sm">{trafficHotspots.length} hotspots</div>
          </div>
        </div>

        <div className="panel flex flex-col">
          <PanelHeader title="congestion forecast" subtitle={`${congestionForecast.location} · ${congestionForecast.window}`} />
          <div className="space-y-3 p-4">
            <div className="flex items-end gap-3">
              <span className="metric text-4xl leading-none font-semibold text-elevated">
                {congestionForecast.probability}%
              </span>
              <SeverityBadge sev="high">predicted severe</SeverityBadge>
            </div>
            <p className="text-xs text-muted-foreground">
              Probability of severe congestion at {congestionForecast.location} within the {congestionForecast.window}.
            </p>
            <div className="space-y-2">
              {congestionForecast.factors.map((f) => (
                <div key={f} className="flex gap-2 rounded-sm border border-border bg-panel-raised/40 px-3 py-2 text-[12px]">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-elevated" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="rounded-sm border border-intel/40 bg-intel/10 p-3">
              <div className="label-mono text-intel">recommended action</div>
              <p className="mt-1 text-[12px]">
                Pre-emptive signal retiming at {congestionForecast.location} and fleet re-routing advisory for two
                corridors.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-5 xl:grid-cols-3">
        <div className="panel xl:col-span-2">
          <PanelHeader
            title="hourly flow pattern"
            subtitle="Vehicles detected and average speed by hour"
            right={
              <div className="flex overflow-hidden rounded-sm border border-border">
                {(["density", "speed"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className={cn(
                      "px-2 py-1 font-mono text-[10px] tracking-[0.12em] uppercase",
                      view === v ? "bg-intel/20 text-intel" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            }
          />
          <div className="h-64 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficByHour} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="var(--grid-line)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} stroke="var(--border)" interval={2} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} stroke="var(--border)" />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)", borderRadius: 4, fontSize: 12 }}
                />
                <RBar
                  dataKey={view === "density" ? "vehicles" : "speed"}
                  fill={view === "density" ? "var(--intel)" : "var(--ok)"}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <PanelHeader title="vehicle composition" subtitle="Share of detected vehicles" />
          <div className="h-64 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vehicleComposition} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                  {vehicleComposition.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="var(--panel)" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)", borderRadius: 4, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1 px-4 pb-4">
            {vehicleComposition.map((v, i) => (
              <span key={v.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {v.name} <span className="metric text-foreground">{v.value}%</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 px-5 pb-5 xl:grid-cols-[1fr_420px]">
        <div className="panel overflow-hidden">
          <PanelHeader title="congestion hotspots" subtitle="Ranked by density index" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  {["Junction", "Severity", "Delay", "Density", "Avg speed"].map((h) => (
                    <th key={h} className="label-mono px-3 py-2 font-normal whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trafficHotspots.map((h) => (
                  <tr key={h.id} className="border-b border-border/60">
                    <td className="px-3 py-2 whitespace-nowrap">{h.name}</td>
                    <td className="px-3 py-2">
                      <SeverityBadge sev={h.severity} />
                    </td>
                    <td className={cn("metric px-3 py-2 whitespace-nowrap", tone(h.severity).text)}>+{h.delayMin} min</td>
                    <td className="metric px-3 py-2">{h.densityIndex}</td>
                    <td className="metric px-3 py-2 whitespace-nowrap">{h.avgSpeedKph} km/h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <PanelHeader title="14-day congestion trend" subtitle="Hotspot count and average delay" />
          <div className="h-56 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={congestionTrend} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="var(--grid-line)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} stroke="var(--border)" />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} stroke="var(--border)" />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)", borderRadius: 4, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="hotspots" stroke="var(--intel)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="avgDelay" stroke="var(--critical)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
