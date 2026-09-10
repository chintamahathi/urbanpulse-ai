import { createFileRoute } from "@tanstack/react-router";
import { GitMerge, Layers, ShieldCheck } from "lucide-react";
import LiveMap, { type MapMarkerSpec } from "@/components/map/LiveMap";
import { DemoTag, PageHeader, PanelHeader, SeverityBadge, Stat } from "@/components/kit/primitives";
import { fusionCluster, fusionFlow } from "@/mock/city";
import { useStore } from "@/state/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/fusion")({
  head: () => ({
    meta: [
      { title: "Fleet Event Fusion — UrbanSense AI" },
      {
        name: "description",
        content:
          "How independent bus observations become one verified city event: GPS clustering, cross-bus confirmation and confidence escalation.",
      },
      { property: "og:title", content: "Fleet Event Fusion — UrbanSense AI" },
      { property: "og:description", content: "One road defect. Eleven buses. One verified truth." },
    ],
  }),
  component: FusionPage,
});

const TONE_CLASS = {
  intel: "border-intel/50 bg-intel/10 text-intel",
  warn: "border-warn/50 bg-warn/10 text-warn",
  ok: "border-ok/50 bg-ok/10 text-ok",
  critical: "border-critical/50 bg-critical/10 text-critical",
} as const;

function FusionPage() {
  const { selectEvent, events } = useStore();
  const heroExists = events.some((e) => e.id === fusionCluster.id);

  const markers: MapMarkerSpec[] = [
    ...fusionCluster.points.map((p) => ({
      id: p.busId,
      kind: "bus" as const,
      severity: "medium" as const,
      position: p.position,
      label: `${p.busId} · ${p.time} · ${Math.round(p.confidence * 100)}%`,
    })),
    {
      id: fusionCluster.id,
      kind: "pothole",
      severity: fusionCluster.severity,
      position: fusionCluster.position,
      label: `${fusionCluster.id} · verified`,
      pulse: true,
    },
  ];

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        eyebrow="multi-observer fusion"
        title="Fleet Event Fusion"
        subtitle="A single bus produces a detection. Many buses produce truth. Fusion turns repeated observations into verified city intelligence."
        right={<DemoTag />}
      />

      <div className="grid gap-3 p-5 xl:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-3">
          <div className="panel relative min-h-[360px] overflow-hidden">
            <LiveMap className="absolute inset-0" markers={markers} fitTo={fusionCluster.points.map((p) => p.position)} />
            <div className="panel absolute top-3 left-3 px-3 py-2">
              <div className="label-mono">gps observation cluster</div>
              <div className="metric mt-1 text-sm">radius 4.1 m · {fusionCluster.buses} buses</div>
            </div>
          </div>

          <div className="panel">
            <PanelHeader title="fusion pipeline" subtitle="Independent observations → verified defect" icon={<GitMerge className="h-3.5 w-3.5" />} />
            <div className="flex flex-wrap items-center gap-2 p-4">
              {fusionFlow.map((s, i) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "rounded-sm border px-3 py-2",
                      TONE_CLASS[(s.tone as keyof typeof TONE_CLASS) ?? "intel"],
                    )}
                  >
                    <div className="font-mono text-[10px] tracking-[0.14em] uppercase">{s.label}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{s.detail}</div>
                  </div>
                  {i < fusionFlow.length - 1 && <span className="animate-flow h-px w-6 bg-intel/60" />}
                </div>
              ))}
            </div>
          </div>

          <div className="panel overflow-hidden">
            <PanelHeader title="contributing observations" subtitle={`${fusionCluster.observations} observations across ${fusionCluster.buses} buses`} />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    {["Bus", "Time", "Confidence", "Latitude", "Longitude"].map((h) => (
                      <th key={h} className="label-mono px-3 py-2 font-normal whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fusionCluster.points.map((p) => (
                    <tr key={p.busId} className="border-b border-border/60">
                      <td className="metric px-3 py-2 text-intel">{p.busId}</td>
                      <td className="metric px-3 py-2">{p.time}</td>
                      <td className="metric px-3 py-2">{Math.round(p.confidence * 100)}%</td>
                      <td className="metric px-3 py-2 text-muted-foreground">{p.position.lat.toFixed(5)}</td>
                      <td className="metric px-3 py-2 text-muted-foreground">{p.position.lng.toFixed(5)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="panel">
            <PanelHeader title="verified cluster" subtitle={fusionCluster.id} icon={<ShieldCheck className="h-3.5 w-3.5" />} />
            <div className="space-y-3 p-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{fusionCluster.label}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <SeverityBadge sev={fusionCluster.severity} />
                  <SeverityBadge sev="low">verified</SeverityBadge>
                </div>
              </div>
              <div>
                <div className="label-mono">fused confidence</div>
                <div className="metric text-4xl leading-none font-semibold text-ok">{fusionCluster.confidence}%</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Stat label="observations" value={fusionCluster.observations} sev="intel" />
                <Stat label="buses" value={fusionCluster.buses} sev="intel" />
                <Stat label="first observed" value={fusionCluster.firstObserved} />
                <Stat label="last confirmed" value={fusionCluster.lastConfirmed} />
              </div>
              {heroExists && (
                <button
                  type="button"
                  onClick={() => selectEvent(fusionCluster.id)}
                  className="w-full rounded-sm border border-intel/50 bg-intel/15 px-3 py-2 font-mono text-[10px] tracking-[0.14em] text-intel uppercase transition-colors hover:bg-intel/25"
                >
                  open event intelligence
                </button>
              )}
            </div>
          </div>

          <div className="panel">
            <PanelHeader title="confidence escalation" subtitle="Each independent pass raises certainty" icon={<Layers className="h-3.5 w-3.5" />} />
            <div className="space-y-2 p-4">
              {[
                ["1 observation", 91],
                ["3 observations", 95],
                ["7 observations", 97],
                ["11 buses / 37 observations", 99],
              ].map(([label, v]) => (
                <div key={label as string}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="metric">{v}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-panel-raised">
                    <div className="h-full rounded-full bg-ok" style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
              <p className="pt-1 text-[11px] text-muted-foreground">
                Duplicate reports are collapsed by GPS proximity, defect signature and time window, so authorities see
                one work item instead of thirty-seven alerts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
