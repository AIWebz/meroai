import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Employee } from "../../types";
import { Badge, Button, Card, StatusDot } from "../../components/ui";
import { catalogFor } from "../../data/employeeCatalog";

const STATUS_LABEL: Record<Employee["status"], string> = {
  active: "Active",
  working: "Working",
  idle: "Idle",
  paused: "Paused",
};

export function EmployeeCard({ employee, activityCount }: { employee: Employee; activityCount: number }) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-display text-[14px] font-semibold text-paper">
            {employee.avatarGlyph}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-ink">{employee.name}</p>
            <p className="text-[12px] text-ink-faint">{employee.title}</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5">
          <StatusDot status={employee.status} />
          <span className="text-[12px] font-medium text-ink-soft">{STATUS_LABEL[employee.status]}</span>
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Current task</p>
          <p className="mt-0.5 text-[13px] text-ink-soft">{employee.currentTask ?? "No active task"}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Goal</p>
          <p className="mt-0.5 text-[13px] text-ink-soft">{employee.goal}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {employee.permissions.slice(0, 3).map((p) => (
          <Badge key={p}>{p.replace(/_/g, " ")}</Badge>
        ))}
        {employee.permissions.length > 3 && <Badge>+{employee.permissions.length - 3} more</Badge>}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <div className="text-[12px] text-ink-faint">
          <span className="font-semibold text-ink">{employee.tasksCompleted}</span> completed · {activityCount} recent
        </div>
        <Link to={`/app/workforce/${employee.id}`}>
          <Button size="sm" variant="secondary">
            Open Employee <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export function AvailableEmployeeCard({ roleKey, onHire }: { roleKey: Employee["roleKey"]; onHire: () => void }) {
  const entry = catalogFor(roleKey);
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-dim font-display text-[14px] font-semibold text-ink-faint">
          {entry.avatarGlyph}
        </div>
        <div>
          <p className="text-[14px] font-semibold text-ink">{entry.name}</p>
          <p className="text-[12px] text-ink-faint">{entry.title}</p>
        </div>
      </div>
      <p className="mt-3 flex-1 text-[13px] leading-relaxed text-ink-faint">{entry.description}</p>
      <Button size="sm" className="mt-4 self-start" onClick={onHire}>Hire</Button>
    </Card>
  );
}
