import { useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import EventDrawer from "@/components/drawers/EventDrawer";
import BusDetailDrawer from "@/components/drawers/BusDetailDrawer";
import IncidentDrawer from "@/components/drawers/IncidentDrawer";

export default function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
      <EventDrawer />
      <BusDetailDrawer />
      <IncidentDrawer />
    </div>
  );
}
