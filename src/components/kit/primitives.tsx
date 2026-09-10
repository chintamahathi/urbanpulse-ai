import type { ReactNode } from "react";
import type { Severity } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONE: Record<Severity | "intel", { text: string; bg: string; border: string; dot: string }> = {
  critical: { text: "text-critical", bg: "bg-critical/10", border: "border-critical/40", dot: "bg-critical" },
  high: { text: "text-elevated", bg: "bg-elevated/10", border: "border-elevated/40", dot: "bg-elevated" },
  medium: { text: "text-warn", bg: "bg-warn/10", border: "border-warn/40", dot: "bg-warn" },
  low: { text: "text-ok", bg: "bg-ok/10", border: "border-ok/40", dot: "bg-ok" },
  intel: { text: "text-intel", bg: "bg-intel/10", border: "border-intel/40", dot: "bg-intel" },
};

export function tone(sev: Severity | "intel") {
  return TONE[sev] ?? TONE.intel;
}

export function StatusDot({
  sev = "low",
  pulse = true,
  className,
}: {
  sev?: Severity | "intel";
  pulse?: boolean;
  className?: string;
}) {
  const t = tone(sev);
  return (
    <span className={cn("relative inline-flex h-2 w-2 shrink-0", className)}>
      {pulse && <span className={cn("absolute inset-0 rounded-full animate-pulse-ring", t.dot)} />}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", t.dot)} />
    </span>
  );
}

export function SeverityBadge({
  sev,
  children,
  className,
}: {
  sev: Severity | "intel";
  children?: ReactNode;
  className?: string;
}) {
  const t = tone(sev);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.12em] uppercase",
        t.text,
        t.bg,
        t.border,
        className,
      )}
    >
      {children ?? sev}
    </span>
  );
}

export function PanelHeader({
  title,
  subtitle,
  right,
  icon,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 border-b border-border px-4 py-2.5", className)}>
      <div className="flex min-w-0 items-center gap-2">
        {icon && <span className="text-intel">{icon}</span>}
        <div className="min-w-0">
          <h3 className="truncate font-mono text-[11px] tracking-[0.16em] uppercase">{title}</h3>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("panel", className)}>{children}</div>;
}

export function KpiCard({
  label,
  value,
  delta,
  sev = "intel",
  icon,
  hint,
  live,
}: {
  label: string;
  value: string | number;
  delta?: string;
  sev?: Severity | "intel";
  icon?: ReactNode;
  hint?: string;
  live?: boolean;
}) {
  const t = tone(sev);
  return (
    <div className="panel group relative overflow-hidden px-4 py-3">
      <div className={cn("absolute inset-x-0 top-0 h-px", t.dot, "opacity-60")} />
      {live && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity group-hover:opacity-100">
          <div className="animate-sweep h-full w-1/4 bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <span className="label-mono">{label}</span>
        <span className={cn("shrink-0", t.text)}>{icon}</span>
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="metric text-2xl leading-none font-semibold">{value}</span>
        {delta && <span className={cn("metric text-[11px] leading-none", t.text)}>{delta}</span>}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        {live && <StatusDot sev={sev} />}
        <span className="text-[10px] tracking-wide text-muted-foreground uppercase">{hint ?? "live telemetry"}</span>
      </div>
    </div>
  );
}

export function DemoTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border border-intel/40 bg-intel/10 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.18em] text-intel uppercase",
        className,
      )}
    >
      demo data
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden border-b border-border bg-panel/60 px-5 py-4">
      <div className="grid-backdrop pointer-events-none absolute inset-0" />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow && <div className="label-mono text-intel">{eyebrow}</div>}
          <h1 className="mt-1 text-2xl leading-none font-semibold tracking-tight uppercase">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </div>
  );
}

export function Stat({ label, value, sev }: { label: string; value: ReactNode; sev?: Severity | "intel" }) {
  return (
    <div className="rounded-sm border border-border bg-panel-raised/50 px-3 py-2">
      <div className="label-mono">{label}</div>
      <div className={cn("metric mt-1 text-sm font-semibold", sev ? tone(sev).text : "text-foreground")}>{value}</div>
    </div>
  );
}

export function Bar({ value, sev = "intel", className }: { value: number; sev?: Severity | "intel"; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-panel-raised", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-700", tone(sev).dot)}
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </div>
  );
}
