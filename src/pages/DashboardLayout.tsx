import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, Sparkles } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { CommandBar } from "../components/CommandBar";
import { useUIStore } from "../store/useUIStore";

const TITLES: Record<string, string> = {
  "/app": "Overview",
  "/app/company": "Company",
  "/app/workforce": "Workforce",
  "/app/tasks": "Tasks",
  "/app/approvals": "Approvals",
  "/app/activity": "Activity",
  "/app/website": "Website",
  "/app/analytics": "Analytics",
  "/app/knowledge": "Knowledge",
  "/app/settings": "Settings",
};

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const setCommandBarOpen = useUIStore((s) => s.setCommandBarOpen);
  const location = useLocation();
  const title = TITLES[location.pathname] ?? (location.pathname.startsWith("/app/workforce/") ? "Employee" : "Mero");

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-paper/90 px-5 py-3.5 backdrop-blur-sm md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="rounded-md p-1.5 text-ink-soft hover:bg-paper-dim md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-[15px] font-semibold text-ink">{title}</h1>
          </div>
          <button
            onClick={() => setCommandBarOpen(true)}
            className="flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] text-ink-faint transition-colors hover:border-ink-faint hover:text-ink"
          >
            <Sparkles className="h-3.5 w-3.5 text-moss-500" />
            <span className="hidden sm:inline">Ask Mero anything…</span>
            <kbd className="hidden rounded border border-line bg-paper-dim px-1.5 py-0.5 text-[10.5px] font-medium text-ink-faint sm:inline">⌘K</kbd>
          </button>
        </header>
        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
      <CommandBar />
    </div>
  );
}
