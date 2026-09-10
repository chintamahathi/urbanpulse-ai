import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Footprints, ScanLine, ShieldAlert, TriangleAlert } from "lucide-react";
import LiveMap, { type MapMarkerSpec } from "@/components/map/LiveMap";
import { Bar, DemoTag, KpiCard, PageHeader, PanelHeader, SeverityBadge, tone } from "@/components/kit/primitives";
import { pedestrianZones, safetyStats } from "@/mock/city";
import { useStore } from "@/state/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safety & Incidents — UrbanSense AI" },
      {
        name: "description",
        content:
          "Incident detection, ANPR-style vehicle matching, near-miss analytics and pedestrian risk zones derived from fleet cameras.",
      },
      { property: "og:title", content: "Safety & Incidents — UrbanSense AI" },
      { property: "og:description", content: "Live incident tracking and pedestrian risk intelligence." },
    ],
  }),
  component: SafetyPage,
});

function SafetyPage() {
  const { incidents, selectIncident } = useStore();
  const [tab, setTab] = useState<"incidents" | "pedestrian">("incidents");

  const markers = useMemo<MapMarkerSpec[]>(
    () =>
      tab === "incidents"
        ? incidents.map((i) => ({
            id: i.id,
            kind: "incident",
            severity: i.severity,
            position: i.position,
            label: `${i.type} · ${i.location}`,
            pulse: i.severity === "critical",
          }))
        : pedestrianZones.map((z) => ({
            id: z.id,
            kind: "pedestrian_risk",
            severity: z.severity,
            position: z.position,
            label: `${z.name} · risk ${z.riskScore}`,
          })),
    [tab, incidents],
  );

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        eyebrow="safety intelligence"
        title="Safety & Incidents"
        subtitle="Incidents are detected from fleet cameras, matched across buses, and enriched with vehicle metadata for authority review."
        right={<DemoTag />}
      />

      <div className="grid grid-cols-2 gap-3 px-5 py-4 lg:grid-cols-4">
        <KpiCard label="active incidents" value={safetyStats.activeIncidents} sev="critical" icon={<ShieldAlert className="h-4 w-4" />} live />
        <KpiCard label="near misses" value={safetyStats.nearMisses} sev="high" icon={<TriangleAlert className="h-4 w-4" />} hint="last 24 h" />
        <KpiCard label="high-risk zones" value={safetyStats.highRiskZones} sev="medium" icon={<Footprints className="h-4 w-4" />} live />
        <KpiCard label="vehicle matches" value={safetyStats.anprMatches} sev="intel" icon={<ScanLine className="h-4 w-4" />} hint="plate recognition" />
      </div>

      <div className="grid gap-3 px-5 pb-5 xl:grid-cols-[1fr_420px]">
        <div className="flex flex-col gap-3">
          <div className="panel relative min-h-[340px] overflow-hidden">
            <LiveMap className="absolute inset-0" markers={markers} onSelect={(m) => tab === "incidents" && selectIncident(m.id)} />
            <div className="panel absolute top-3 left-3 flex overflow-hidden rounded-sm p-0">
              {(["incidents", "pedestrian"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    "px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase",
                    tab === t ? "bg-intel/20 text-intel" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t === "incidents" ? "incident map" : "pedestrian risk"}
                </button>
              ))}
            </div>
          </div>

          <div className="panel overflow-hidden">
            <PanelHeader title="incident log" subtitle="Click a row for evidence, vehicle metadata and cross-bus track" />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    {["Time", "Type", "Location", "Severity", "Vehicle", "Status"].map((h) => (
                      <th key={h} className="label-mono px-3 py-2 font-normal whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((i) => (
                    <tr
                      key={i.id}
                      onClick={() => selectIncident(i.id)}
                      className="cursor-pointer border-b border-border/60 transition-colors hover:bg-panel-raised/60"
                    >
                      <td className="metric px-3 py-2 whitespace-nowrap text-muted-foreground">{i.time}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{i.type}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{i.location}</td>
                      <td className="px-3 py-2">
                        <SeverityBadge sev={i.severity} />
                      </td>
                      <td className="metric px-3 py-2 whitespace-nowrap">{i.registration}</td>
                      <td className="metric px-3 py-2 text-[11px] whitespace-nowrap text-intel">{i.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="panel">
            <PanelHeader title="pedestrian risk zones" subtitle="Ranked by fused risk score" />
            <div className="max-h-[420px] space-y-2 overflow-y-auto p-3">
              {[...pedestrianZones]
                .sort((a, b) => b.riskScore - a.riskScore)
                .map((z) => (
                  <div key={z.id} className="rounded-sm border border-border bg-panel-raised/40 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px]">{z.name}</span>
                      <span className={cn("metric text-sm", tone(z.severity).text)}>{z.riskScore}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="truncate">near {z.nearby}</span>
                      <span>{z.nearMisses} near misses</span>
                    </div>
                    <Bar value={z.riskScore} sev={z.severity} className="mt-1.5" />
                  </div>
                ))}
            </div>
          </div>

          <div className="panel">
            <PanelHeader title="near-miss analytics" subtitle="What the fleet observed this week" />
            <div className="space-y-2 p-4">
              {[
                { label: "Pedestrian crossing mid-block", value: 22, sev: "critical" as const },
                { label: "Two-wheeler lane conflict", value: 17, sev: "high" as const },
                { label: "Sudden braking clusters", value: 14, sev: "medium" as const },
                { label: "Wrong-side entry", value: 9, sev: "high" as const },
              ].map((n) => (
                <div key={n.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{n.label}</span>
                    <span className="metric">{n.value}</span>
                  </div>
                  <Bar value={n.value * 4} sev={n.sev} className="mt-1" />
                </div>
              ))}
              <p className="pt-1 text-[11px] text-muted-foreground">
                Near misses are inferred from trajectory conflict, not from reported collisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
