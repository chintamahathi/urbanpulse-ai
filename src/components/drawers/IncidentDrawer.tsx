import { lazy, Suspense } from "react";
import { Car, Fingerprint, Navigation, Radio } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DemoTag, SeverityBadge, Stat, StatusDot } from "@/components/kit/primitives";
import { useStore } from "@/state/store";
import type { EventStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const LiveMap = lazy(() => import("@/components/map/LiveMap"));

const STATUSES: EventStatus[] = ["DETECTED", "VERIFIED", "ASSIGNED", "IN PROGRESS", "RESOLVED"];

export default function IncidentDrawer() {
  const { selectedIncidentId, selectIncident, incidents, setEventStatus } = useStore();
  const incident = incidents.find((i) => i.id === selectedIncidentId) ?? null;

  return (
    <Sheet open={!!incident} onOpenChange={(o) => !o && selectIncident(null)}>
      <SheetContent className="w-full gap-0 overflow-y-auto border-l border-border bg-panel p-0 sm:max-w-md">
        {incident && (
          <>
            <SheetHeader className="gap-2 border-b border-border p-4">
              <div className="flex items-center justify-between">
                <span className="label-mono text-intel">incident intelligence</span>
                <DemoTag />
              </div>
              <SheetTitle className="text-lg tracking-tight uppercase">{incident.type}</SheetTitle>
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge sev={incident.severity} />
                <span className="metric text-[11px] text-muted-foreground">{incident.id}</span>
              </div>
            </SheetHeader>

            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-2">
                <Stat label="time" value={incident.time} />
                <Stat label="location" value={incident.location} />
                <Stat label="vehicle" value={incident.vehicle} />
                <Stat label="registration" value={incident.registration} sev="intel" />
                <Stat label="ocr confidence" value={`${Math.round(incident.ocrConfidence * 100)}%`} sev="intel" />
                <Stat label="ai match" value={`${Math.round(incident.aiMatch * 100)}%`} sev="intel" />
                <Stat label="direction" value={incident.direction} />
                <Stat label="status" value={incident.status} sev="low" />
              </div>

              <div>
                <div className="label-mono flex items-center gap-1.5">
                  <Car className="h-3 w-3" /> evidence frame
                </div>
                <div className="scanline relative mt-1.5 h-36 overflow-hidden rounded-sm border border-border bg-gradient-to-br from-panel-raised to-background">
                  <div className="absolute inset-0 grid-backdrop" />
                  <div className="absolute top-[40%] left-[30%] h-14 w-28 rounded-sm border-2 border-critical/70">
                    <span className="absolute -top-4 left-0 font-mono text-[9px] tracking-widest text-critical uppercase">
                      vehicle {Math.round(incident.aiMatch * 100)}%
                    </span>
                  </div>
                  <div className="absolute top-[62%] left-[36%] h-5 w-16 rounded-sm border border-warn/70">
                    <span className="metric absolute -bottom-4 left-0 text-[9px] text-warn">
                      {incident.registration}
                    </span>
                  </div>
                  <span className="absolute bottom-1.5 right-2 flex items-center gap-1 font-mono text-[9px] text-muted-foreground">
                    <Fingerprint className="h-3 w-3" /> SIMULATED ANPR FRAME
                  </span>
                </div>
              </div>

              <div>
                <div className="label-mono flex items-center gap-1.5">
                  <Navigation className="h-3 w-3" /> vehicle track
                </div>
                <Suspense
                  fallback={<div className="mt-1.5 h-40 rounded-sm border border-border bg-panel-raised/40" />}
                >
                  <LiveMap
                    className="mt-1.5 h-40 rounded-sm border border-border"
                    center={incident.position}
                    zoom={14}
                    interactive={false}
                    lines={[{ id: "track", path: incident.track, severity: "critical", width: 3 }]}
                    markers={[
                      {
                        id: incident.id,
                        kind: "incident",
                        severity: incident.severity,
                        position: incident.position,
                        label: incident.type,
                        pulse: true,
                      },
                    ]}
                  />
                </Suspense>
              </div>

              <div>
                <div className="label-mono flex items-center gap-1.5">
                  <Radio className="h-3 w-3" /> other bus observations
                </div>
                <div className="mt-1.5 divide-y divide-border rounded-sm border border-border">
                  {incident.observations.map((o) => (
                    <div key={o.busId} className="flex items-center justify-between px-3 py-2 text-xs">
                      <span className="metric text-intel">{o.busId}</span>
                      <span className="metric text-muted-foreground">{o.time}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Cross-bus corroboration raises identification confidence without any roadside camera.
                </p>
              </div>

              <div>
                <div className="label-mono">status</div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEventStatus(incident.id, s)}
                      className={cn(
                        "rounded-sm border px-2 py-1 font-mono text-[10px] tracking-[0.1em] transition-colors",
                        incident.status === s
                          ? "border-ok/50 bg-ok/15 text-ok"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <StatusDot sev="intel" /> evidence chain preserved locally for this demo
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
