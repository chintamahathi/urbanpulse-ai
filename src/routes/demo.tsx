import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, RotateCcw } from "lucide-react";
import LiveMap, { type MapMarkerSpec } from "@/components/map/LiveMap";
import { DemoTag, PageHeader, PanelHeader, SeverityBadge } from "@/components/kit/primitives";
import { DEMO_STEPS, useStore } from "@/state/store";
import { fusionCluster } from "@/mock/city";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo Mode — UrbanSense AI" },
      {
        name: "description",
        content:
          "Watch the full UrbanSense story end to end: bus online, edge detection, GPS tagging, fleet fusion, verification, road health collapse and authority action.",
      },
      { property: "og:title", content: "Demo Mode — UrbanSense AI" },
      { property: "og:description", content: "Every Bus Sees. Every Road Learns. Every City Acts." },
    ],
  }),
  component: DemoPage,
});

const TONE = {
  intel: { text: "text-intel", border: "border-intel/50", bg: "bg-intel/10", dot: "bg-intel" },
  warn: { text: "text-warn", border: "border-warn/50", bg: "bg-warn/10", dot: "bg-warn" },
  ok: { text: "text-ok", border: "border-ok/50", bg: "bg-ok/10", dot: "bg-ok" },
  critical: { text: "text-critical", border: "border-critical/50", bg: "bg-critical/10", dot: "bg-critical" },
} as const;

function DemoPage() {
  const { demo, demoPlay, demoPause, demoRestart, buses } = useStore();
  const step = demo.step;
  const progress = ((step + 1) / DEMO_STEPS.length) * 100;

  const markers: MapMarkerSpec[] = [
    ...buses.slice(0, Math.min(buses.length, 2 + step)).map((b) => ({
      id: b.id,
      kind: "bus" as const,
      severity: "low" as const,
      position: b.position,
      label: b.id,
      heading: b.heading,
    })),
    ...(step >= 2
      ? [
          {
            id: fusionCluster.id,
            kind: "pothole" as const,
            severity: step >= 8 ? ("critical" as const) : ("high" as const),
            position: fusionCluster.position,
            label: `${fusionCluster.id} · ${step >= 7 ? "VERIFIED" : "DETECTED"}`,
            pulse: true,
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        eyebrow="guided walkthrough"
        title="Demo Mode"
        subtitle="Every Bus Sees. Every Road Learns. Every City Acts. — the full detection-to-action story in twelve steps."
        right={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={demo.running ? demoPause : demoPlay}
              className="flex items-center gap-1.5 rounded-sm border border-intel/50 bg-intel/15 px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-intel uppercase transition-colors hover:bg-intel/25"
            >
              {demo.running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {demo.running ? "pause" : demo.started ? "resume" : "play story"}
            </button>
            <button
              type="button"
              onClick={demoRestart}
              className="flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase transition-colors hover:border-intel/50 hover:text-intel"
            >
              <RotateCcw className="h-3.5 w-3.5" /> restart
            </button>
            <DemoTag />
          </div>
        }
      />

      <div className="px-5 pt-4">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="label-mono">
            step {step + 1} / {DEMO_STEPS.length}
          </span>
          <span className="metric">{demo.running ? "PLAYING" : demo.started ? "PAUSED" : "READY"}</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-panel-raised">
          <div className="h-full rounded-full bg-intel transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid gap-3 p-5 xl:grid-cols-[1fr_420px]">
        <div className="flex flex-col gap-3">
          <div className="panel relative min-h-[400px] overflow-hidden">
            <LiveMap className="absolute inset-0" markers={markers} fitTo={[fusionCluster.position]} />
            <div className="panel absolute top-3 left-3 max-w-xs px-3 py-2">
              <div className={cn("label-mono", TONE[DEMO_STEPS[step]!.tone].text)}>{DEMO_STEPS[step]!.title}</div>
              <p className="mt-1 text-[12px] text-muted-foreground">{DEMO_STEPS[step]!.detail}</p>
            </div>
          </div>

          <div className="panel">
            <PanelHeader title="story pipeline" subtitle="Detection → fusion → decision → action" />
            <div className="grid gap-2 p-4 md:grid-cols-4">
              {[
                ["bus fleet", "1,248 mobile sensors", step >= 1],
                ["edge ai", "on-vehicle inference", step >= 4],
                ["city intelligence", "fusion & scoring", step >= 8],
                ["action", "works order issued", step >= 11],
              ].map(([label, detail, done]) => (
                <div
                  key={label as string}
                  className={cn(
                    "rounded-sm border px-3 py-2 transition-colors",
                    done ? "border-ok/50 bg-ok/10" : "border-border bg-panel-raised/30",
                  )}
                >
                  <div className={cn("label-mono", done ? "text-ok" : "text-muted-foreground")}>{label}</div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <PanelHeader title="narrative timeline" subtitle="Twelve simulated steps" />
          <div className="divide-y divide-border">
            {DEMO_STEPS.map((s, i) => {
              const t = TONE[s.tone];
              const state = i < step ? "done" : i === step ? "active" : "pending";
              return (
                <div
                  key={s.title}
                  className={cn(
                    "flex items-start gap-3 px-4 py-2.5 transition-colors",
                    state === "active" && cn(t.bg),
                    state === "pending" && "opacity-45",
                  )}
                >
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", state === "pending" ? "bg-border" : t.dot)} />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block font-mono text-[11px] tracking-[0.12em] uppercase", state !== "pending" && t.text)}>
                      {s.title}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">{s.detail}</span>
                  </span>
                  {state === "active" && <SeverityBadge sev="intel">now</SeverityBadge>}
                </div>
              );
            })}
          </div>
          <div className="border-t border-border px-4 py-3 text-[11px] text-muted-foreground">
            Demo Mode replays a scripted sequence on simulated data so the full value chain can be shown without live
            infrastructure.
          </div>
        </div>
      </div>
    </div>
  );
}
