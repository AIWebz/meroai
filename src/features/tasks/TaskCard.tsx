import type { Task, TaskStatus } from "../../types";
import { Badge, Button, Card } from "../../components/ui";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { formatDate } from "../../utils/format";

export const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "Pending",
  working: "Working",
  awaiting_approval: "Awaiting approval",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

export const STATUS_TONE: Record<TaskStatus, "neutral" | "moss" | "amber" | "rose" | "ink"> = {
  pending: "neutral",
  working: "amber",
  awaiting_approval: "amber",
  completed: "moss",
  failed: "rose",
  cancelled: "neutral",
};

const PRIORITY_TONE: Record<Task["priority"], string> = {
  low: "text-ink-faint",
  medium: "text-ink-soft",
  high: "text-amber-600",
  urgent: "text-rose-500",
};

export function TaskCard({ task }: { task: Task }) {
  const employee = useWorkspaceStore((s) => s.employees.find((e) => e.id === task.employeeId));
  const startTask = useWorkspaceStore((s) => s.startTask);
  const completeTask = useWorkspaceStore((s) => s.completeTask);
  const failTask = useWorkspaceStore((s) => s.failTask);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-[14px] font-semibold text-ink">{task.title}</p>
            <span className={`text-[11px] font-semibold uppercase ${PRIORITY_TONE[task.priority]}`}>{task.priority}</span>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-faint">{task.description}</p>
        </div>
        <Badge tone={STATUS_TONE[task.status]} className="shrink-0">{STATUS_LABEL[task.status]}</Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <div className="flex items-center gap-2 text-[12px] text-ink-faint">
          {employee && (
            <span className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-paper-dim text-[10px] font-semibold text-ink-soft">{employee.avatarGlyph}</span>
              {employee.name}
            </span>
          )}
          <span>·</span>
          <span>{formatDate(task.createdAt)}</span>
        </div>
        <div className="flex gap-1.5">
          {task.status === "pending" && (
            <Button size="sm" variant="secondary" onClick={() => startTask(task.id)}>Start</Button>
          )}
          {task.status === "working" && (
            <>
              <Button size="sm" variant="secondary" onClick={() => completeTask(task.id, `${task.title} completed successfully.`)}>Mark complete</Button>
              <Button size="sm" variant="ghost" onClick={() => failTask(task.id, "Task could not be completed.")}>Mark failed</Button>
            </>
          )}
        </div>
      </div>

      {task.result && (
        <div className="mt-3 rounded-lg bg-paper-dim px-3 py-2 text-[12.5px] text-ink-soft">{task.result}</div>
      )}
    </Card>
  );
}
