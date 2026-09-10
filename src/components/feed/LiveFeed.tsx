import { Radio } from "lucide-react";
import { PanelHeader, SeverityBadge, StatusDot } from "@/components/kit/primitives";
import { useStore } from "@/state/store";
import { cn } from "@/lib/utils";

export default function LiveFeed({ className, limit = 40 }: { className?: string; limit?: number }) {
  const { events, selectEvent, live } = useStore();

  return (
    <div className={cn("panel flex min-h-0 flex-col", className)}>
      <PanelHeader
        title="live intelligence feed"
        icon={<Radio className="h-3.5 w-3.5" />}
        right={
          <span className="flex items-center gap-1.5">
            <StatusDot sev={live ? "low" : "medium"} />
            <span className="label-mono">{live ? "streaming" : "paused"}</span>
          </span>
        }
      />
      <div className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
        {events.slice(0, limit).map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => selectEvent(e.id)}
            className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-panel-raised/70"
          >
            <StatusDot sev={e.severity} pulse={e.severity === "critical"} className="mt-1.5" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="metric text-[11px] text-muted-foreground">
                  {new Date(e.timestamp).toISOString().slice(11, 19)}
                </span>
                <span className="metric text-[11px] text-intel">{e.busId}</span>
              </span>
              <span className="mt-0.5 block truncate text-[13px]">{e.title}</span>
              <span className="block truncate text-[11px] text-muted-foreground">{e.location}</span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              <SeverityBadge sev={e.severity} />
              <span className="metric text-[10px] text-muted-foreground">{Math.round(e.confidence * 100)}%</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
