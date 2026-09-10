import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, TrendingUp } from "lucide-react";
import { DemoTag, PageHeader, PanelHeader, Stat } from "@/components/kit/primitives";
import {
  busDelayTrend,
  incidentTrend,
  infraDeficiencies,
  odMatrix,
  pedestrianRiskTrend,
  roadHealthTrend,
  trafficTrend,
} from "@/mock/analytics";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "City Analytics — UrbanSense AI" },
      {
        name: "description",
        content:
          "Nine months of network road health, traffic, incident, bus delay, pedestrian risk and origin-destination analytics for the demo city.",
      },
      { property: "og:title", content: "City Analytics — UrbanSense AI" },
      { property: "og:description", content: "Long-horizon trends across every sensing layer." },
    ],
  }),
  component: AnalyticsPage,
});

const AXIS = { fill: "var(--muted-foreground)", fontSize: 10 };
const TIP = {
  contentStyle: { background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)", borderRadius: 4, fontSize: 12 },
};

function AnalyticsPage() {
  const maxTrips = Math.max(...odMatrix.map((o) => o.trips));

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        eyebrow="long-horizon intelligence"
        title="City Analytics"
        subtitle="Nine months of fused fleet perception, aggregated for planning, budgeting and policy decisions."
        right={
          <>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase transition-colors hover:border-intel/50 hover:text-intel"
            >
              <Download className="h-3.5 w-3.5" /> export view
            </button>
            <DemoTag />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 px-5 py-4 lg:grid-cols-5">
        <Stat label="network road health" value="54 / 100" sev="medium" />
        <Stat label="critical segments" value="23" sev="critical" />
        <Stat label="avg network speed" value="31 km/h" sev="high" />
        <Stat label="incidents (9 mo)" value="1,284" sev="critical" />
        <Stat label="events indexed" value="2.4 M" sev="intel" />
      </div>

      <div className="grid gap-3 px-5 pb-5 xl:grid-cols-2">
        <div className="panel">
          <PanelHeader title="road health trend" subtitle="Network score vs critical segment count" icon={<TrendingUp className="h-3.5 w-3.5" />} />
          <div className="h-56 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={roadHealthTrend} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--intel)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--intel)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--grid-line)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="month" tick={AXIS} stroke="var(--border)" />
                <YAxis tick={AXIS} stroke="var(--border)" />
                <Tooltip {...TIP} />
                <Area type="monotone" dataKey="network" stroke="var(--intel)" strokeWidth={2} fill="url(#netFill)" />
                <Line type="monotone" dataKey="critical" stroke="var(--critical)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <PanelHeader title="traffic trend" subtitle="Average speed vs vehicles detected (millions)" />
          <div className="h-56 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficTrend} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="var(--grid-line)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="month" tick={AXIS} stroke="var(--border)" />
                <YAxis tick={AXIS} stroke="var(--border)" />
                <Tooltip {...TIP} />
                <Line type="monotone" dataKey="avgSpeed" stroke="var(--ok)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="vehiclesM" stroke="var(--warn)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <PanelHeader title="incidents & near misses" subtitle="Monthly counts" />
          <div className="h-56 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentTrend} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="var(--grid-line)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="month" tick={AXIS} stroke="var(--border)" />
                <YAxis tick={AXIS} stroke="var(--border)" />
                <Tooltip {...TIP} />
                <Bar dataKey="nearMisses" fill="var(--elevated)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="incidents" fill="var(--critical)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <PanelHeader title="bus delay trend" subtitle="Average delay in minutes" />
          <div className="h-56 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={busDelayTrend} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="delayFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--warn)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--warn)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--grid-line)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="month" tick={AXIS} stroke="var(--border)" />
                <YAxis tick={AXIS} stroke="var(--border)" />
                <Tooltip {...TIP} />
                <Area type="monotone" dataKey="delayMin" stroke="var(--warn)" strokeWidth={2} fill="url(#delayFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <PanelHeader title="infrastructure deficiencies" subtitle="Open findings by category" />
          <div className="h-56 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={infraDeficiencies} layout="vertical" margin={{ top: 6, right: 12, left: 40, bottom: 0 }}>
                <CartesianGrid stroke="var(--grid-line)" strokeDasharray="2 4" horizontal={false} />
                <XAxis type="number" tick={AXIS} stroke="var(--border)" />
                <YAxis type="category" dataKey="name" tick={AXIS} stroke="var(--border)" width={110} />
                <Tooltip {...TIP} />
                <Bar dataKey="value" fill="var(--intel)" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <PanelHeader title="pedestrian risk index" subtitle="Fused risk score by month" />
          <div className="h-56 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pedestrianRiskTrend} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="var(--grid-line)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="month" tick={AXIS} stroke="var(--border)" />
                <YAxis tick={AXIS} stroke="var(--border)" />
                <Tooltip {...TIP} />
                <Line type="monotone" dataKey="riskIndex" stroke="var(--critical)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel xl:col-span-2">
          <PanelHeader title="origin – destination demand" subtitle="Estimated daily trips between demo zones" />
          <div className="space-y-2 p-4">
            {odMatrix.map((o) => (
              <div key={`${o.from}-${o.to}`} className="flex items-center gap-3">
                <span className="metric w-40 shrink-0 text-[11px] text-muted-foreground">
                  {o.from} → {o.to}
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-panel-raised">
                  <span className="block h-full rounded-full bg-intel" style={{ width: `${(o.trips / maxTrips) * 100}%` }} />
                </span>
                <span className="metric w-20 shrink-0 text-right text-[12px]">{o.trips.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
