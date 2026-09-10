import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Bot, Check, ChevronDown, Pause, Play, Search, UserRound } from "lucide-react";
import { DemoTag, SeverityBadge, StatusDot } from "@/components/kit/primitives";
import { Button } from "@/components/ui/button";
import { useStore } from "@/state/store";
import { CITY, formatClock, relTime } from "@/mock/geo";
import { cn } from "@/lib/utils";

export default function TopBar() {
  const { live, setLive, search, notifications, markNotificationRead, markAllNotificationsRead, selectEvent } =
    useStore();
  const navigate = useNavigate();
  const [now, setNow] = useState<string>("--:--:--");
  const [query, setQuery] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const [openBell, setOpenBell] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNow(formatClock(new Date()));
    const id = window.setInterval(() => setNow(formatClock(new Date())), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpenSearch(false);
        setOpenBell(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const results = useMemo(() => search(query), [query, search]);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header
      ref={wrapRef}
      className="relative z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-panel px-3 xl:gap-3 xl:px-4"
    >
      {/* left */}
      <div className="flex h-9 min-w-32 shrink-0 items-center gap-2 xl:min-w-40 xl:gap-3">
        <div className="flex min-w-0 flex-col justify-center leading-none">
          <div className="truncate whitespace-nowrap font-mono text-[11px] tracking-[0.18em] uppercase">{CITY.name}</div>
          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            <StatusDot sev={live ? "low" : "medium"} className="shrink-0" />
            <span className="truncate whitespace-nowrap font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
              {live ? "live telemetry streaming" : "telemetry paused"}
            </span>
          </div>
        </div>
        <DemoTag className="hidden lg:inline-flex" />
      </div>

      {/* center: search */}
      <div className="relative min-w-28 flex-1 xl:max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpenSearch(true);
          }}
          onFocus={() => setOpenSearch(true)}
          placeholder="Search buses, roads, incidents, routes..."
          className="h-9 w-full rounded-sm border border-border bg-background/70 pl-8 pr-3 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-intel/50"
        />
        {openSearch && query.trim() && (
          <div className="panel absolute top-11 left-0 z-30 max-h-80 w-full overflow-y-auto p-1">
            {results.length === 0 && (
              <div className="px-3 py-3 text-xs text-muted-foreground">No matches in the demo dataset.</div>
            )}
            {results.map((r) => (
              <button
                key={`${r.kind}-${r.id}`}
                type="button"
                onClick={() => {
                  setOpenSearch(false);
                  setQuery("");
                  if (r.kind === "Event") selectEvent(r.id);
                  navigate({ to: r.href });
                }}
                className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left transition-colors hover:bg-panel-raised"
              >
                <SeverityBadge sev="intel">{r.kind}</SeverityBadge>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px]">{r.label}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{r.detail}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* right */}
      <div className="flex h-9 shrink-0 items-center gap-1.5 xl:gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setLive(!live)}
          className={cn(
            "h-8 gap-1.5 rounded-sm px-2 font-mono text-[10px] tracking-[0.14em] uppercase shadow-none",
            live ? "border-ok/40 bg-ok/10 text-ok" : "border-warn/40 bg-warn/10 text-warn",
          )}
        >
          {live ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {live ? "live" : "paused"}
        </Button>

        <span className="metric hidden min-w-[4.5rem] whitespace-nowrap text-center text-sm sm:inline-block">{now}</span>

        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
            onClick={() => setOpenBell((v) => !v)}
            className="relative h-8 w-8 rounded-sm border-border text-muted-foreground shadow-none hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="metric absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-critical px-1 text-[9px] leading-none text-primary-foreground">
                {unread}
              </span>
            )}
          </Button>
          {openBell && (
            <div className="panel absolute top-10 right-0 z-30 w-80 p-1">
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="label-mono">notification center</span>
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="flex items-center gap-1 font-mono text-[10px] text-intel uppercase"
                >
                  <Check className="h-3 w-3" /> mark all
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.eventId) selectEvent(n.eventId);
                      setOpenBell(false);
                    }}
                    className={cn(
                      "flex w-full gap-2 rounded-sm px-2 py-2 text-left transition-colors hover:bg-panel-raised",
                      !n.read && "bg-panel-raised/60",
                    )}
                  >
                    <StatusDot sev={n.severity} pulse={!n.read} className="mt-1.5" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px]">{n.title}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{n.detail}</span>
                      <span className="metric block text-[10px] text-muted-foreground">{relTime(n.minutesAgo)}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Link
          to="/copilot"
          className="hidden h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm border border-intel/40 bg-intel/10 px-2 font-mono text-[10px] tracking-[0.14em] text-intel uppercase lg:flex"
        >
          <Bot className="h-3 w-3" /> ai system online
        </Link>

        <div className="flex h-8 shrink-0 items-center gap-2 rounded-sm border border-border px-1.5 lg:min-w-32 lg:px-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-panel-raised">
            <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
          <span className="hidden min-w-0 flex-1 leading-none lg:block">
            <span className="block truncate whitespace-nowrap text-[12px]">M. Vjit</span>
            <span className="mt-0.5 block truncate whitespace-nowrap font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
              city operations
            </span>
          </span>
          <ChevronDown className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground lg:block" />
        </div>
      </div>
    </header>
  );
}
