import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bot,
  Building2,
  ChevronsLeft,
  ChevronsRight,
  Cpu,
  Gauge,
  LayoutDashboard,
  Network,
  PlayCircle,
  Route as RouteIcon,
  Settings,
  Shield,
  Wrench,
} from "lucide-react";
import { StatusDot } from "@/components/kit/primitives";
import { useStore } from "@/state/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/fleet", label: "Live Fleet", icon: RouteIcon },
  { to: "/edge-ai", label: "Edge AI", icon: Cpu },
  { to: "/roads", label: "Road Intelligence", icon: Gauge },
  { to: "/traffic", label: "Traffic Intelligence", icon: Activity },
  { to: "/safety", label: "Safety & Incidents", icon: Shield },
  { to: "/infrastructure", label: "Infrastructure", icon: Building2 },
  { to: "/fusion", label: "Fleet Event Fusion", icon: Network },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/copilot", label: "AI Copilot", icon: Bot },
] as const;

export default function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { kpis, live } = useStore();

  return (
    <aside
      className={cn(
        "z-30 flex h-full shrink-0 flex-col border-r border-border bg-panel transition-[width] duration-200",
        collapsed ? "w-[64px]" : "w-[236px]",
      )}
    >
      <div className={cn("flex items-center gap-2 border-b border-border px-3 py-3", collapsed && "justify-center")}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-intel/40 bg-intel/10">
          <Network className="h-4 w-4 text-intel" />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-sm leading-none font-semibold tracking-[0.08em] uppercase">
              UrbanSense <span className="text-intel">AI</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <StatusDot sev={live ? "low" : "medium"} />
              <span className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
                city network {live ? "online" : "paused"}
              </span>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {NAV.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              title={item.label}
              className={cn(
                "group flex items-center gap-2.5 rounded-sm border border-transparent px-2 py-2 text-[13px] transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "border-intel/30 bg-intel/10 text-intel"
                  : "text-muted-foreground hover:bg-panel-raised hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-intel" />}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-0.5 border-t border-border p-2">
        {!collapsed && (
          <div className="mb-1 rounded-sm border border-border bg-panel-raised/50 px-2.5 py-2">
            <div className="label-mono">system status</div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Fleet online</span>
              <span className="metric text-ok">{kpis.activeBuses.toLocaleString()}</span>
            </div>
            <div className="mt-0.5 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Critical events</span>
              <span className="metric text-critical">{kpis.criticalEvents}</span>
            </div>
          </div>
        )}
        <Link
          to="/demo"
          title="Demo Mode"
          className={cn(
            "flex items-center gap-2.5 rounded-sm border border-intel/30 bg-intel/10 px-2 py-2 text-[13px] text-intel transition-colors hover:bg-intel/20",
            collapsed && "justify-center px-0",
          )}
        >
          <PlayCircle className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Demo Mode</span>}
        </Link>
        <Link
          to="/settings"
          title="Settings"
          className={cn(
            "flex items-center gap-2.5 rounded-sm px-2 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-panel-raised hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-panel-raised hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
