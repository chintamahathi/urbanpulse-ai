import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bus, Cctv, Cpu, WifiOff } from "lucide-react";
import LiveMap, { type MapMarkerSpec } from "@/components/map/LiveMap";
import { KpiCard, PageHeader, PanelHeader, SeverityBadge, StatusDot, DemoTag } from "@/components/kit/primitives";
import { useStore } from "@/state/store";
import { fleetStats, FLEET_TOTAL, routes } from "@/mock/fleet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/fleet")({
  head: () => ({
    meta: [
      { title: "Live Fleet Operations — UrbanSense AI" },
      {
        name: "description",
        content:
          "Track every mobile sensing bus: online status, edge AI health, camera arrays, speed and detections in a live fleet operations view.",
      },
      { property: "og:title", content: "Live Fleet Operations — UrbanSense AI" },
      { property: "og:description", content: "1,248 of 1,300 sensing buses online with live edge AI telemetry." },
    ],
  }),
  component: FleetPage,
});

function FleetPage() {
  const { buses, kpis, selectBus, events } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "issues">("all");

  const filtered = useMemo(
    () =>
      buses.filter((b) => {
        const matches =
          !query ||
          b.id.toLowerCase().includes(query.toLowerCase()) ||
          b.area.toLowerCase().includes(query.toLowerCase()) ||
          b.routeCode.toLowerCase().includes(query.toLowerCase());
        const state =
          filter === "all" ||
          (filter === "online" && b.aiOnline && b.camerasOnline === b.camerasTotal) ||
          (filter === "issues" && (!b.aiOnline || b.camerasOnline < b.camerasTotal || !b.gpsOnline));
        return matches && state;
      }),
    [buses, query, filter],
  );

  const markers = useMemo<MapMarkerSpec[]>(
    () =>
      filtered.map((b) => ({
        id: b.id,
        kind: "bus",
        severity: b.aiOnline ? "low" : "critical",
        position: b.position,
        label: `${b.id} · ${b.routeCode}`,
        heading: b.heading,
      })),
    [filtered],
  );

  const lines = useMemo(() => routes.map((r) => ({ id: r.id, path: r.path, severity: "medium" as const, width: 2 })), []);

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        eyebrow="fleet operations"
        title="Live Fleet"
        subtitle="Every bus is a mobile sensing unit: edge inference, camera health and GPS integrity are monitored continuously."
        right={
          <>
            <span className="metric text-lg">
              {kpis.activeBuses.toLocaleString()} <span className="text-muted-foreground">/ {FLEET_TOTAL}</span>
            </span>
            <span className="label-mono">buses online</span>
            <DemoTag />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 px-5 py-4 lg:grid-cols-4">
        <KpiCard label="online" value={kpis.activeBuses.toLocaleString()} sev="low" icon={<Bus className="h-4 w-4" />} live />
        <KpiCard label="offline" value={fleetStats.offline} sev="critical" icon={<WifiOff className="h-4 w-4" />} hint="last 15 min" />
        <KpiCard label="ai processing" value={fleetStats.aiProcessing.toLocaleString()} sev="intel" icon={<Cpu className="h-4 w-4" />} live />
        <KpiCard label="camera issues" value={fleetStats.cameraIssues} sev="medium" icon={<Cctv className="h-4 w-4" />} hint="open tickets" />
      </div>

      <div className="grid gap-3 px-5 xl:grid-cols-[1fr_340px]">
        <div className="panel relative min-h-[380px] overflow-hidden">
          <LiveMap className="absolute inset-0" markers={markers} lines={lines} onSelect={(m) => selectBus(m.id)} />
          <div className="panel absolute bottom-3 left-3 px-3 py-2">
            <div className="label-mono">tracked units</div>
            <div className="metric mt-1 text-sm">{filtered.length} of {buses.length} sampled</div>
            <div className="text-[10px] text-muted-foreground uppercase">demo sample of the 1,300-bus fleet</div>
          </div>
        </div>

        <div className="panel flex flex-col">
          <PanelHeader title="fleet statistics" subtitle="Rolling 60-minute window" />
          <div className="space-y-3 p-4">
            {[
              { label: "Edge inference healthy", value: 94, sev: "low" as const },
              { label: "Camera array complete", value: 88, sev: "medium" as const },
              { label: "GPS integrity", value: 97, sev: "low" as const },
              { label: "Uplink bandwidth headroom", value: 82, sev: "intel" as const },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="metric">{s.value}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-panel-raised">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      s.sev === "low" ? "bg-ok" : s.sev === "medium" ? "bg-warn" : "bg-intel",
                    )}
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="rounded-sm border border-border bg-panel-raised/40 p-3">
              <div className="label-mono">events contributed today</div>
              <div className="metric mt-1 text-xl">{events.length * 49}</div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Metadata-only uplink keeps average payload under 2 KB per detection.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* table */}
      <div className="panel mx-5 my-4 flex-1 overflow-hidden">
        <PanelHeader
          title="bus table"
          subtitle="Click any unit for the full sensing profile"
          right={
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter units…"
                className="h-7 w-40 rounded-sm border border-border bg-background/70 px-2 text-[12px] outline-none focus:border-intel/50"
              />
              <div className="flex overflow-hidden rounded-sm border border-border">
                {(["all", "online", "issues"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-2 py-1 font-mono text-[10px] tracking-[0.12em] uppercase",
                      filter === f ? "bg-intel/20 text-intel" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border">
                {["Bus ID", "Route", "Location", "Speed", "AI Status", "Camera Status", "Events", "Last Seen"].map((h) => (
                  <th key={h} className="label-mono px-3 py-2 font-normal whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => selectBus(b.id)}
                  className="cursor-pointer border-b border-border/60 transition-colors hover:bg-panel-raised/60"
                >
                  <td className="metric px-3 py-2 whitespace-nowrap text-intel">{b.id}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{b.routeCode}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{b.area}</td>
                  <td className="metric px-3 py-2 whitespace-nowrap">{b.speedKph} km/h</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <StatusDot sev={b.aiOnline ? "low" : "critical"} />
                      <span className="font-mono text-[11px] tracking-wider">
                        {b.aiOnline ? "AI ONLINE" : "AI OFFLINE"}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <SeverityBadge sev={b.camerasOnline === b.camerasTotal ? "low" : "medium"}>
                      {b.camerasOnline} cameras
                    </SeverityBadge>
                  </td>
                  <td className="metric px-3 py-2 whitespace-nowrap">{b.eventsToday} events</td>
                  <td className="metric px-3 py-2 whitespace-nowrap text-muted-foreground">{b.lastSeenSec} sec ago</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No units match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
