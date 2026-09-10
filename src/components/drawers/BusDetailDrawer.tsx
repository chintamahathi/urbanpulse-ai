import { Link } from "@tanstack/react-router";
import { Cctv, Cpu, Gauge, Satellite } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bar, DemoTag, SeverityBadge, Stat, StatusDot } from "@/components/kit/primitives";
import { useStore } from "@/state/store";
import { routeById } from "@/mock/fleet";
import { cn } from "@/lib/utils";

const CAMERAS = ["FRONT CAMERA", "SIDE CAMERA", "REAR CAMERA", "CABIN CAMERA"];

export default function BusDetailDrawer() {
  const { selectedBusId, selectBus, buses, events, setMonitorBus } = useStore();
  const bus = buses.find((b) => b.id === selectedBusId) ?? null;
  const route = bus ? routeById(bus.routeId) : undefined;
  const detections = bus ? events.filter((e) => e.busId === bus.id).slice(0, 6) : [];

  return (
    <Sheet open={!!bus} onOpenChange={(o) => !o && selectBus(null)}>
      <SheetContent className="w-full gap-0 overflow-y-auto border-l border-border bg-panel p-0 sm:max-w-md">
        {bus && (
          <>
            <SheetHeader className="gap-2 border-b border-border p-4">
              <div className="flex items-center justify-between">
                <span className="label-mono text-intel">mobile sensing unit</span>
                <DemoTag />
              </div>
              <SheetTitle className="metric text-xl tracking-tight">{bus.id}</SheetTitle>
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge sev="intel">{bus.routeCode}</SeverityBadge>
                <SeverityBadge sev={bus.aiOnline ? "low" : "critical"}>
                  {bus.aiOnline ? "AI ONLINE" : "AI OFFLINE"}
                </SeverityBadge>
                <SeverityBadge sev={bus.gpsOnline ? "low" : "critical"}>
                  {bus.gpsOnline ? "GPS ONLINE" : "GPS LOST"}
                </SeverityBadge>
                <SeverityBadge sev={bus.camerasOnline === bus.camerasTotal ? "low" : "medium"}>
                  {bus.camerasOnline} / {bus.camerasTotal} CAMERAS
                </SeverityBadge>
              </div>
            </SheetHeader>

            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-2">
                <Stat label="current location" value={bus.area} />
                <Stat label="current route" value={route?.name ?? bus.routeCode} />
                <Stat label="speed" value={`${bus.speedKph} km/h`} sev="intel" />
                <Stat label="last seen" value={`${bus.lastSeenSec} sec ago`} />
              </div>

              <div>
                <div className="label-mono flex items-center gap-1.5">
                  <Cctv className="h-3 w-3" /> camera array
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {CAMERAS.map((c, i) => {
                    const online = i < bus.camerasOnline;
                    return (
                      <div
                        key={c}
                        className={cn(
                          "scanline relative h-20 overflow-hidden rounded-sm border",
                          online ? "border-border" : "border-critical/40",
                        )}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-panel-raised via-background to-panel-raised" />
                        <div className="absolute inset-0 grid-backdrop" />
                        {online ? (
                          <span className="absolute top-1.5 right-1.5 flex items-center gap-1 font-mono text-[9px] text-ok">
                            <StatusDot sev="low" /> LIVE
                          </span>
                        ) : (
                          <span className="absolute top-1.5 right-1.5 font-mono text-[9px] text-critical">NO SIGNAL</span>
                        )}
                        <span className="absolute bottom-1.5 left-2 font-mono text-[9px] tracking-widest text-muted-foreground">
                          {c}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-sm border border-border bg-panel-raised/40 p-3">
                  <div className="label-mono flex items-center gap-1.5">
                    <Cpu className="h-3 w-3" /> ai confidence
                  </div>
                  <div className="metric mt-1 text-lg">{Math.round(bus.aiConfidence * 100)}%</div>
                  <Bar value={bus.aiConfidence * 100} sev="intel" className="mt-1.5" />
                </div>
                <div className="rounded-sm border border-border bg-panel-raised/40 p-3">
                  <div className="label-mono flex items-center gap-1.5">
                    <Gauge className="h-3 w-3" /> bandwidth saved
                  </div>
                  <div className="metric mt-1 text-lg text-ok">{bus.bandwidthSavedPct}%</div>
                  <Bar value={bus.bandwidthSavedPct} sev="low" className="mt-1.5" />
                </div>
              </div>

              <div className="rounded-sm border border-border bg-panel-raised/40 p-3">
                <div className="label-mono flex items-center gap-1.5">
                  <Satellite className="h-3 w-3" /> gps fix
                </div>
                <div className="metric mt-1 text-sm">
                  {bus.position.lat.toFixed(4)}, {bus.position.lng.toFixed(4)}
                </div>
              </div>

              <div>
                <div className="label-mono">recent detections</div>
                <div className="mt-1.5 divide-y divide-border rounded-sm border border-border">
                  {detections.length === 0 && (
                    <div className="px-3 py-3 text-xs text-muted-foreground">
                      No detections from this unit in the current window.
                    </div>
                  )}
                  {detections.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-2 px-3 py-2">
                      <div className="min-w-0">
                        <div className="truncate text-xs">{d.title}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{d.location}</div>
                      </div>
                      <SeverityBadge sev={d.severity} />
                    </div>
                  ))}
                </div>
              </div>

              <Button asChild size="sm" className="w-full">
                <Link
                  to="/edge-ai"
                  onClick={() => {
                    setMonitorBus(bus.id);
                    selectBus(null);
                  }}
                >
                  Open in Edge AI Monitor
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
