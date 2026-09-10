import { Link } from "@tanstack/react-router";
import { Camera, MapPin, Radio, ShieldCheck, Wand2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bar, DemoTag, SeverityBadge, Stat, StatusDot, tone } from "@/components/kit/primitives";
import { useStore } from "@/state/store";
import type { EventStatus } from "@/lib/types";
import { roadById } from "@/mock/roads";
import { cn } from "@/lib/utils";

const STATUSES: EventStatus[] = ["DETECTED", "VERIFIED", "ASSIGNED", "IN PROGRESS", "RESOLVED"];

export default function EventDrawer() {
  const { selectedEventId, selectEvent, events, setEventStatus, pushNotification } = useStore();
  const event = events.find((e) => e.id === selectedEventId) ?? null;
  const road = event ? roadById(event.roadId) : undefined;

  return (
    <Sheet open={!!event} onOpenChange={(o) => !o && selectEvent(null)}>
      <SheetContent className="w-full gap-0 overflow-y-auto border-l border-border bg-panel p-0 sm:max-w-md">
        {event && (
          <>
            <SheetHeader className="gap-2 border-b border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="label-mono text-intel">event intelligence</span>
                <DemoTag />
              </div>
              <SheetTitle className="flex items-center gap-2 text-lg tracking-tight uppercase">
                {event.title}
              </SheetTitle>
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge sev={event.severity} />
                <span className="metric text-[11px] text-muted-foreground">{event.id}</span>
                <span className="metric text-[11px] text-muted-foreground">
                  {new Date(event.timestamp).toISOString().slice(11, 19)}
                </span>
              </div>
            </SheetHeader>

            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-2">
                <Stat label="type" value={event.type.replace("_", " ").toUpperCase()} />
                <Stat label="confidence" value={`${Math.round(event.confidence * 100)}%`} sev="intel" />
                <Stat label="bus" value={event.busId} sev="intel" />
                <Stat label="camera" value={event.camera.toUpperCase()} />
                <Stat label="gps" value={`${event.position.lat.toFixed(4)}, ${event.position.lng.toFixed(4)}`} />
                <Stat label="observations" value={event.observations} sev="intel" />
              </div>

              <div className="rounded-sm border border-border bg-panel-raised/40 p-3">
                <div className="label-mono flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> location
                </div>
                <p className="mt-1 text-sm">{event.location}</p>
                {road && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Road health</span>
                      <span className="metric">{road.health}/100</span>
                    </div>
                    <Bar value={road.health} sev={road.severity} className="mt-1" />
                  </div>
                )}
              </div>

              <div>
                <div className="label-mono flex items-center gap-1.5">
                  <Camera className="h-3 w-3" /> evidence frame
                </div>
                <div className="scanline relative mt-1.5 h-36 overflow-hidden rounded-sm border border-border bg-gradient-to-br from-panel-raised to-background">
                  <div className="absolute inset-0 grid-backdrop" />
                  <div
                    className={cn(
                      "absolute top-[46%] left-[38%] h-12 w-20 rounded-sm border-2",
                      tone(event.severity).border,
                    )}
                  >
                    <span
                      className={cn(
                        "absolute -top-4 left-0 font-mono text-[9px] tracking-widest uppercase",
                        tone(event.severity).text,
                      )}
                    >
                      {event.type} {Math.round(event.confidence * 100)}%
                    </span>
                  </div>
                  <span className="absolute bottom-1.5 left-2 font-mono text-[9px] text-muted-foreground">
                    {event.busId} · {event.camera.toUpperCase()} CAM · SIMULATED FRAME
                  </span>
                </div>
              </div>

              <div>
                <div className="label-mono flex items-center gap-1.5">
                  <Radio className="h-3 w-3" /> other buses observing
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {event.observedBy.map((b) => (
                    <span
                      key={b}
                      className="metric rounded-sm border border-intel/30 bg-intel/10 px-1.5 py-0.5 text-[11px] text-intel"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="label-mono">history</div>
                <div className="mt-1.5 divide-y divide-border rounded-sm border border-border">
                  {event.history.map((h) => (
                    <div key={h.label} className="flex items-center justify-between px-3 py-1.5 text-xs">
                      <span className="text-muted-foreground">{h.label}</span>
                      <span className="metric">{h.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-sm border border-intel/30 bg-intel/5 p-3">
                <div className="label-mono flex items-center gap-1.5 text-intel">
                  <Wand2 className="h-3 w-3" /> ai recommendation
                </div>
                <p className="mt-1 text-sm">{event.recommendation}</p>
              </div>

              <div>
                <div className="label-mono flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3" /> status
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setEventStatus(event.id, s);
                        pushNotification({
                          title: `${event.id} marked ${s}`,
                          detail: event.location,
                          severity: "medium",
                        });
                      }}
                      className={cn(
                        "rounded-sm border px-2 py-1 font-mono text-[10px] tracking-[0.1em] transition-colors",
                        event.status === s
                          ? "border-ok/50 bg-ok/15 text-ok"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <StatusDot sev={event.status === "RESOLVED" ? "low" : "intel"} />
                  Current status: <span className="metric text-foreground">{event.status}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button asChild size="sm" className="flex-1">
                  <Link to="/fusion" onClick={() => selectEvent(null)}>
                    View fleet fusion
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link to="/roads" onClick={() => selectEvent(null)}>
                    Road intelligence
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
