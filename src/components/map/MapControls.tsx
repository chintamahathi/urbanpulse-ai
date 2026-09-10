import { cn } from "@/lib/utils";

export const LAYER_KEYS = ["traffic", "roadHealth", "incidents", "buses", "safety", "infrastructure"] as const;
export type LayerKey = (typeof LAYER_KEYS)[number];

export const LAYER_LABELS: Record<LayerKey, string> = {
  traffic: "Traffic",
  roadHealth: "Road Health",
  incidents: "Incidents",
  buses: "Buses",
  safety: "Safety",
  infrastructure: "Infrastructure",
};

export type LayerState = Record<LayerKey, boolean>;

export const DEFAULT_LAYERS: LayerState = {
  traffic: true,
  roadHealth: true,
  incidents: true,
  buses: true,
  safety: true,
  infrastructure: false,
};

export const TIME_FILTERS = ["LIVE", "1H", "6H", "24H", "7D"] as const;
export type TimeFilter = (typeof TIME_FILTERS)[number];

export function LayerToggles({
  layers,
  onToggle,
  className,
}: {
  layers: LayerState;
  onToggle: (k: LayerKey) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {LAYER_KEYS.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onToggle(k)}
          aria-pressed={layers[k]}
          className={cn(
            "rounded-sm border px-2 py-1 font-mono text-[10px] tracking-[0.12em] uppercase transition-colors",
            layers[k]
              ? "border-intel/50 bg-intel/15 text-intel"
              : "border-border bg-panel/80 text-muted-foreground hover:text-foreground",
          )}
        >
          {LAYER_LABELS[k]}
        </button>
      ))}
    </div>
  );
}

export function TimeFilters({
  value,
  onChange,
  className,
}: {
  value: TimeFilter;
  onChange: (t: TimeFilter) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex overflow-hidden rounded-sm border border-border bg-panel/80", className)}>
      {TIME_FILTERS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            "px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] transition-colors",
            value === t ? "bg-intel/20 text-intel" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

const LEGEND = [
  { label: "Bus", tone: "bg-intel" },
  { label: "Pothole", tone: "bg-elevated" },
  { label: "Traffic", tone: "bg-warn" },
  { label: "Incident", tone: "bg-critical" },
  { label: "Waterlogging", tone: "bg-intel" },
  { label: "Pedestrian risk", tone: "bg-critical" },
  { label: "Infrastructure", tone: "bg-ok" },
];

export function MapLegend({ className }: { className?: string }) {
  return (
    <div className={cn("panel px-3 py-2", className)}>
      <div className="label-mono mb-1.5">legend</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-sm", l.tone)} />
            <span className="text-[11px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 border-t border-border pt-1.5">
        <div className="label-mono">road health</div>
        <div className="mt-1 flex items-center gap-1">
          <span className="h-1.5 flex-1 rounded-full bg-critical" />
          <span className="h-1.5 flex-1 rounded-full bg-elevated" />
          <span className="h-1.5 flex-1 rounded-full bg-warn" />
          <span className="h-1.5 flex-1 rounded-full bg-ok" />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
          <span>0</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}
