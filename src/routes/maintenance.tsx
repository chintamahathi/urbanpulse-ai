import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Wrench } from "lucide-react";
import { Bar, DemoTag, PageHeader, PanelHeader, SeverityBadge, Stat, tone } from "@/components/kit/primitives";
import { useStore } from "@/state/store";
import { cn } from "@/lib/utils";
import type { MaintenanceItem } from "@/lib/types";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance Priority — UrbanSense AI" },
      {
        name: "description",
        content:
          "AI-ranked repair queue combining defect recurrence, traffic load, pedestrian risk and nearby sensitive sites into an actionable works order list.",
      },
      { property: "og:title", content: "Maintenance Priority — UrbanSense AI" },
      { property: "og:description", content: "What to repair first, and why." },
    ],
  }),
  component: MaintenancePage,
});

const CATEGORIES: (MaintenanceItem["category"] | "All")[] = ["All", "Roads", "Signs", "Dividers", "Waterlogging"];

function MaintenancePage() {
  const { maintenance, setMaintenanceStatus } = useStore();
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(
    () => maintenance.filter((m) => cat === "All" || m.category === cat).sort((a, b) => a.rank - b.rank),
    [maintenance, cat],
  );
  const active = filtered.find((m) => m.id === activeId) ?? filtered[0];

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        eyebrow="works prioritisation"
        title="Maintenance Priority"
        subtitle="A ranked repair queue: severity, recurrence, exposure and nearby sensitive locations are weighted into one priority score."
        right={<DemoTag />}
      />

      <div className="grid grid-cols-2 gap-3 px-5 py-4 lg:grid-cols-4">
        <Stat label="open interventions" value={maintenance.length} sev="intel" />
        <Stat label="critical priority" value={maintenance.filter((m) => m.severity === "critical").length} sev="critical" />
        <Stat label="assigned" value={maintenance.filter((m) => m.status === "ASSIGNED").length} sev="high" />
        <Stat label="resolved" value={maintenance.filter((m) => m.status === "RESOLVED").length} sev="low" />
      </div>

      <div className="grid gap-3 px-5 pb-5 xl:grid-cols-[1fr_400px]">
        <div className="panel">
          <PanelHeader
            title="priority queue"
            subtitle={`${filtered.length} items · ranked by AI priority score`}
            icon={<ClipboardList className="h-3.5 w-3.5" />}
            right={
              <div className="flex flex-wrap overflow-hidden rounded-sm border border-border">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCat(c)}
                    className={cn(
                      "px-2 py-1 font-mono text-[9px] tracking-[0.1em] uppercase",
                      cat === c ? "bg-intel/20 text-intel" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            }
          />
          <div className="divide-y divide-border">
            {filtered.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveId(m.id)}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-panel-raised/60",
                  m.id === active?.id && "bg-intel/10",
                )}
              >
                <span className={cn("metric w-8 shrink-0 text-lg font-semibold", tone(m.severity).text)}>
                  #{m.rank}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-medium">{m.road}</span>
                    <SeverityBadge sev={m.severity} />
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">{m.problem}</span>
                  <span className="mt-1 flex items-center gap-3 text-[10px] tracking-wide text-muted-foreground uppercase">
                    <span>traffic {m.trafficLoad}</span>
                    <span>pedestrian {m.pedestrianRisk}</span>
                    <span>{m.recurrence} observations</span>
                    <span className="text-intel">{m.status}</span>
                  </span>
                  <Bar value={m.priorityScore} sev={m.severity} className="mt-1.5" />
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nothing queued in this category.</p>
            )}
          </div>
        </div>

        <div className="panel h-fit">
          <PanelHeader title="works order" subtitle={active?.id} icon={<Wrench className="h-3.5 w-3.5" />} />
          {active ? (
            <div className="space-y-3 p-4">
              <div>
                <div className="label-mono">priority #{active.rank}</div>
                <h2 className="text-lg font-semibold tracking-tight uppercase">{active.road}</h2>
                <p className="text-xs text-muted-foreground">
                  {active.category} · near {active.nearby}
                </p>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="label-mono">priority score</div>
                  <div className={cn("metric text-3xl leading-none font-semibold", tone(active.severity).text)}>
                    {active.priorityScore}
                  </div>
                </div>
                <SeverityBadge sev={active.severity} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Stat label="problem" value={active.problem} />
                <Stat label="recurrence" value={`${active.recurrence} obs`} sev="intel" />
                <Stat label="traffic load" value={active.trafficLoad} sev="high" />
                <Stat label="pedestrian risk" value={active.pedestrianRisk} sev="critical" />
              </div>
              <div className="rounded-sm border border-intel/40 bg-intel/10 p-3">
                <div className="label-mono text-intel">ai recommendation</div>
                <p className="mt-1 text-[12px]">{active.recommendation}</p>
              </div>
              <div className="rounded-sm border border-border bg-panel-raised/40 px-3 py-2">
                <div className="label-mono">assignment</div>
                <p className="metric mt-1 text-[12px]">{active.assignee ?? "Unassigned"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["ASSIGNED", "Road Works Division"],
                    ["IN PROGRESS", "Road Works Division"],
                    ["RESOLVED", "Road Works Division"],
                  ] as const
                ).map(([s, who]) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setMaintenanceStatus(active.id, s, who)}
                    className={cn(
                      "rounded-sm border px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase transition-colors",
                      active.status === s
                        ? "border-intel/60 bg-intel/20 text-intel"
                        : "border-border text-muted-foreground hover:border-intel/40 hover:text-foreground",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="p-4 text-sm text-muted-foreground">Select a queue item to open its works order.</p>
          )}
        </div>
      </div>
    </div>
  );
}
