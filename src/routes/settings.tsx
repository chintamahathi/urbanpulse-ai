import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Monitor, Moon, Plug, SlidersHorizontal, Sun } from "lucide-react";
import { DemoTag, PageHeader, PanelHeader, SeverityBadge } from "@/components/kit/primitives";
import { Button } from "@/components/ui/button";
import { useStore } from "@/state/store";
import { cn } from "@/lib/utils";
import { useTheme, type ThemePreference } from "@/theme/ThemeProvider";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "System Settings — UrbanSense AI" },
      {
        name: "description",
        content:
          "Control simulation speed, layer defaults, alert thresholds and review the data sources this command center will connect to.",
      },
      { property: "og:title", content: "System Settings — UrbanSense AI" },
      { property: "og:description", content: "Operator preferences and future data source wiring." },
    ],
  }),
  component: SettingsPage,
});

function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between gap-3 rounded-sm border border-border bg-panel-raised/40 px-3 py-2.5 text-left transition-colors hover:border-intel/40"
    >
      <span>
        <span className="block text-[13px]">{label}</span>
        <span className="block text-[11px] text-muted-foreground">{hint}</span>
      </span>
      <span className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", on ? "bg-intel/60" : "bg-border")}>
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition-all",
            on ? "left-[1.15rem]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

const SOURCES = [
  ["Fleet telemetry API", "Bus position, speed, camera and edge health", "MOCK"],
  ["Edge detection stream", "Structured YOLO detections with GPS metadata", "MOCK"],
  ["Road health service", "Segment scoring and deterioration history", "MOCK"],
  ["Incident & ANPR service", "Incident detection and plate matching", "MOCK"],
  ["Works order system", "Authority assignment and status sync", "MOCK"],
  ["City copilot model", "Natural-language reasoning layer", "MOCK"],
] as const;

const THEMES: Array<{
  value: ThemePreference;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  { value: "light", label: "Light", description: "Clean and bright", icon: Sun },
  { value: "dark", label: "Dark", description: "Focused command-center mode", icon: Moon },
  { value: "system", label: "System", description: "Follow device preference", icon: Monitor },
];

function SettingsPage() {
  const { live, setLive } = useStore();
  const { theme, setTheme } = useTheme();
  const [alerts, setAlerts] = useState(true);
  const [sound, setSound] = useState(false);
  const [autoFocus, setAutoFocus] = useState(true);
  const [threshold, setThreshold] = useState(85);

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        eyebrow="operator preferences"
        title="System Settings"
        subtitle="Configure the command center behaviour. Data sources are simulated in this build and ready to be pointed at live services."
        right={<DemoTag />}
      />

      <div className="grid gap-3 p-5 xl:grid-cols-2">
        <div className="panel h-fit xl:col-span-2">
          <PanelHeader title="appearance" subtitle="Choose how UrbanSense AI looks" icon={<Sun className="h-3.5 w-3.5" />} />
          <div className="grid gap-2 p-4 md:grid-cols-3" role="radiogroup" aria-label="Appearance theme">
            {THEMES.map(({ value, label, description, icon: Icon }) => {
              const selected = theme === value;
              return (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "h-auto min-h-16 justify-start rounded-sm px-3 py-3 text-left shadow-none transition-colors",
                    selected
                      ? "border-intel/60 bg-intel/10 text-foreground hover:bg-intel/10"
                      : "border-border bg-panel-raised/30 text-foreground hover:border-intel/40 hover:bg-panel-raised/60",
                  )}
                >
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border", selected ? "border-intel/40 bg-intel/10 text-intel" : "border-border bg-panel text-muted-foreground")}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium">{label}</span>
                    <span className="block text-[11px] font-normal text-muted-foreground">{description}</span>
                  </span>
                  <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", selected ? "border-intel bg-intel text-primary-foreground" : "border-border text-transparent")}>
                    <Check className="h-3 w-3" />
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="panel h-fit">
          <PanelHeader title="simulation & alerts" icon={<SlidersHorizontal className="h-3.5 w-3.5" />} />
          <div className="space-y-2 p-4">
            <Toggle on={live} onChange={setLive} label="Live simulation" hint="Buses move and events stream every few seconds" />
            <Toggle on={alerts} onChange={setAlerts} label="Critical alert notifications" hint="Push high-severity events into the notification tray" />
            <Toggle on={sound} onChange={setSound} label="Audible alert tone" hint="Play a tone for critical detections" />
            <Toggle on={autoFocus} onChange={setAutoFocus} label="Auto-focus map on new critical events" hint="Recenter the map when severity escalates" />
            <div className="rounded-sm border border-border bg-panel-raised/40 px-3 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px]">Detection confidence threshold</span>
                <span className="metric text-intel">{threshold}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={99}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="mt-2 w-full accent-[var(--intel)]"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Detections below this confidence stay in review instead of raising an alert.
              </p>
            </div>
          </div>
        </div>

        <div className="panel h-fit">
          <PanelHeader title="data sources" subtitle="Interfaces ready for live connection" icon={<Plug className="h-3.5 w-3.5" />} />
          <div className="divide-y divide-border">
            {SOURCES.map(([name, detail, status]) => (
              <div key={name} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-[13px]">{name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{detail}</span>
                </span>
                <SeverityBadge sev="intel">{status}</SeverityBadge>
              </div>
            ))}
          </div>
          <div className="border-t border-border px-4 py-3 text-[11px] text-muted-foreground">
            Each source is defined by a typed interface in the data layer, so swapping mock data for a real API needs no
            interface redesign.
          </div>
        </div>
      </div>
    </div>
  );
}
