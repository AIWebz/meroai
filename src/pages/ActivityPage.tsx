import {
  CheckCircle2,
  ListPlus,
  ShieldCheck,
  ShieldX,
  UserPlus,
  Target,
  Globe,
  Building2,
  Lightbulb,
  XCircle,
  CreditCard,
} from "lucide-react";
import { SectionHeading, Card, DemoTag, EmptyState } from "../components/ui";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import type { ActivityKind } from "../types";
import { timeAgo } from "../utils/format";

const ICONS: Record<ActivityKind, React.ComponentType<{ className?: string }>> = {
  task_created: ListPlus,
  task_completed: CheckCircle2,
  task_failed: XCircle,
  approval_requested: ShieldCheck,
  approval_approved: ShieldCheck,
  approval_rejected: ShieldX,
  employee_hired: UserPlus,
  goal_created: Target,
  goal_updated: Target,
  website_edited: Globe,
  company_created: Building2,
  opportunity_detected: Lightbulb,
  payment_connected: CreditCard,
};

export default function ActivityPage() {
  const activity = useWorkspaceStore((s) => s.activity);
  const employees = useWorkspaceStore((s) => s.employees);
  const sorted = [...activity].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Activity" title="Activity feed" description="A timeline of everything your AI workforce and Mero have done." />

      {sorted.length === 0 ? (
        <EmptyState title="No activity yet" description="Activity will appear here as your AI workforce starts working." />
      ) : (
        <Card className="p-2">
          <ul>
            {sorted.map((a, i) => {
              const Icon = ICONS[a.kind];
              const employee = employees.find((e) => e.id === a.employeeId);
              return (
                <li key={a.id} className={"flex gap-3 px-3 py-3.5" + (i !== sorted.length - 1 ? " border-b border-line" : "")}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-dim text-ink-soft">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13.5px] font-semibold text-ink">{employee?.name ?? "Mero"}</p>
                      {a.isDemo && <DemoTag />}
                    </div>
                    <p className="mt-0.5 text-[13.5px] text-ink-soft">{a.title}</p>
                    {a.description && <p className="mt-0.5 text-[12.5px] leading-snug text-ink-faint">{a.description}</p>}
                  </div>
                  <span className="shrink-0 text-[12px] text-ink-faint">{timeAgo(a.createdAt)}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
