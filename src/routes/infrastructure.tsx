import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Construction, Droplets, SignpostBig, SplitSquareVertical } from "lucide-react";
import LiveMap, { type MapMarkerSpec } from "@/components/map/LiveMap";
import { DemoTag, KpiCard, PageHeader, PanelHeader, SeverityBadge } from "@/components/kit/primitives";
import { infraStats } from "@/mock/city";
import { useStore } from "@/state/store";
import { cn } from "@/lib/utils";
import type { InfrastructureIssue } from "@/lib/types";

export const Route = createFileRoute("/infrastructure")({
  head: () => ({
    meta: [
      { title: "Infrastructure Monitoring — UrbanSense AI" },
      {
        name: "description",
        content:
          "Detect missing signs, damaged dividers, missing zebra crossings and waterlogging zones from repeated fleet observations.",
      },
      { property: "og:title", content: "Infrastructure Monitoring — UrbanSense AI" },
      { property: "og:description", content: "What exists, what is missing, and what it puts at risk." },
    ],
  }),
  component: InfrastructurePage,
});

const TYPES: (InfrastructureIssue["type"] | "All")[] = [
  "All",
  "Missing Sign",
  "Damaged Divider",
  "Missing Zebra Crossing",
  "Waterlogging Zone",
];

function InfrastructurePage() {
  const { infrastructure, setInfraStatus } = useStore();
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(
    () => infrastructure.filter((i) => type === "All" || i.type === type),
    [infrastructure, type],
  );
  const active = filtered.find((i) => i.id === activeId) ?? filtered[0];

  const markers = useMemo<MapMarkerSpec[]>(
    () =>
      filtered.map((i) => ({
        id: i.id,
        kind: "infrastructure",
        severity: i.severity,
        position: i.position,
        label: `${i.type} · ${i.road}`,
        pulse: i.id === active?.id,
      })),
    [filtered, active?.id],
  );

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        eyebrow="asset & infrastructure"
        title="Infrastructure Monitoring"
        subtitle="Absence detection: the fleet reports not only what is damaged, but what should exist and does not."
        right={<DemoTag />}
      />

      <div className="grid grid-cols-2 gap-3 px-5 py-4 lg:grid-cols-4">
        <KpiCard label="missing signs" value={infraStats.missingSigns} sev="high" icon={<SignpostBig className="h-4 w-4" />} hint="network wide" />
        <KpiCard label="damaged dividers" value={infraStats.damagedDividers} sev="critical" icon={<SplitSquareVertical className="h-4 w-4" />} hint="network wide" />
        <KpiCard label="missing zebra crossings" value={infraStats.missingZebra} sev="critical" icon={<Construction className="h-4 w-4" />} hint="school zones flagged" />
        <KpiCard label="waterlogging zones" value={infraStats.waterlogging} sev="medium" icon={<Droplets className="h-4 w-4" />} hint="monsoon watchlist" />
      </div>

      <div className="grid gap-3 px-5 pb-5 xl:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-3">
          <div className="panel relative min-h-[320px] overflow-hidden">
            <LiveMap className="absolute inset-0" markers={markers} onSelect={(m) => setActiveId(m.id)} />
          </div>

          <div className="panel">
            <PanelHeader
              title="infrastructure findings"
              subtitle={`${filtered.length} open findings`}
              right={
                <div className="flex flex-wrap overflow-hidden rounded-sm border border-border">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        "px-2 py-1 font-mono text-[9px] tracking-[0.1em] uppercase",
                        type === t ? "bg-intel/20 text-intel" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              }
            />
            <div className="max-h-[420px] divide-y divide-border overflow-y-auto">
              {filtered.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => setActiveId(i.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-panel-raised/60",
                    i.id === active?.id && "bg-intel/10",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px]">
                      {i.type} — {i.road}
                    </span>
                    <span className="metric block truncate text-[10px] text-muted-foreground">
                      {i.id} · {i.detected}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="metric text-[10px] text-intel">{i.status}</span>
                    <SeverityBadge sev={i.severity} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="panel h-fit">
          <PanelHeader title="finding detail" subtitle={active ? active.id : undefined} />
          {active ? (
            <div className="space-y-3 p-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight uppercase">{active.type}</h2>
                <p className="text-xs text-muted-foreground">{active.road}</p>
              </div>
              <SeverityBadge sev={active.severity} />
              <div className="space-y-2">
                {[
                  ["what the fleet detected", active.detected],
                  ["what should exist", active.expected],
                  ["risk created", active.risk],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-sm border border-border bg-panel-raised/40 px-3 py-2">
                    <div className="label-mono">{k}</div>
                    <p className="mt-1 text-[12px]">{v}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-sm border border-intel/40 bg-intel/10 p-3">
                <div className="label-mono text-intel">ai recommendation</div>
                <p className="mt-1 text-[12px]">{active.recommendation}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {(["VERIFIED", "ASSIGNED", "RESOLVED"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInfraStatus(active.id, s)}
                    className={cn(
                      "rounded-sm border px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase transition-colors",
                      active.status === s
                        ? "border-intel/60 bg-intel/20 text-intel"
                        : "border-border text-muted-foreground hover:border-intel/40 hover:text-foreground",
                    )}
                  >
                    mark {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="p-4 text-sm text-muted-foreground">No findings for this filter.</p>
          )}
        </div>
      </div>
    </div>
  );
}
