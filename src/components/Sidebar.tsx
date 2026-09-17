import { NavLink } from "react-router-dom";
import clsx from "clsx";
import {
  LayoutGrid,
  Building2,
  ListChecks,
  CheckSquare,
  Activity as ActivityIcon,
  Globe,
  BarChart3,
  BookOpen,
  Settings,
  UserCircle,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

const NAV_ITEMS = [
  { to: "/app", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/app/company", label: "Company", icon: Building2 },
  { to: "/app/tasks", label: "Tasks", icon: ListChecks },
  { to: "/app/approvals", label: "Approvals", icon: CheckSquare, badgeKey: "approvals" as const },
  { to: "/app/activity", label: "Activity", icon: ActivityIcon },
  { to: "/app/site", label: "Site", icon: Globe },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/knowledge", label: "Knowledge", icon: BookOpen },
];

export function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  const company = useWorkspaceStore((s) => s.company);
  const pendingApprovals = useWorkspaceStore((s) => s.approvals.filter((a) => a.status === "pending").length);

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Logo />
        <button onClick={onCloseMobile} className="rounded-md p-1 text-ink-faint hover:bg-paper-dim md:hidden" aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      {company && (
        <div className="mx-4 mb-3 rounded-xl bg-paper-dim px-3 py-2.5">
          <p className="truncate text-[13px] font-semibold text-ink">{company.name}</p>
          <p className="truncate text-[11.5px] text-ink-faint">{company.industry}</p>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 mero-scrollbar" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              clsx(
                "flex items-center justify-between rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                isActive ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-dim hover:text-ink"
              )
            }
          >
            <span className="flex items-center gap-2.5">
              <item.icon className="h-[17px] w-[17px]" />
              {item.label}
            </span>
            {item.badgeKey === "approvals" && pendingApprovals > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10.5px] font-semibold text-white">{pendingApprovals}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-line px-3 py-3">
        <NavLink
          to="/app/settings"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            clsx("flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors", isActive ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-dim hover:text-ink")
          }
        >
          <Settings className="h-[17px] w-[17px]" /> Settings
        </NavLink>
        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium text-ink-soft">
          <UserCircle className="h-[17px] w-[17px]" /> Account
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-line bg-surface md:flex md:flex-col">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-ink/30" onClick={onCloseMobile} />
          <div className="relative flex w-72 animate-[fade-in_0.2s_ease] flex-col bg-surface shadow-[var(--shadow-pop)]">{content}</div>
        </div>
      )}
    </>
  );
}
