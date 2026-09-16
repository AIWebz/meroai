import { useParams, Navigate, Link } from "react-router-dom";
import { ArrowLeft, Pause, Play } from "lucide-react";
import { Badge, Button, Card, DemoTag, StatusDot } from "../components/ui";
import { ChatThread } from "../components/ChatThread";
import { useAIChat } from "../features/ai/useAIChat";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { personaFor } from "../ai/personas";
import { timeAgo } from "../utils/format";

export default function EmployeeDetailPage() {
  const { employeeId } = useParams();
  const employee = useWorkspaceStore((s) => s.employees.find((e) => e.id === employeeId));
  const allTasks = useWorkspaceStore((s) => s.tasks);
  const tasks = allTasks.filter((t) => t.employeeId === employeeId);
  const pauseEmployee = useWorkspaceStore((s) => s.pauseEmployee);
  const activateEmployee = useWorkspaceStore((s) => s.activateEmployee);

  if (!employee) return <Navigate to="/app/workforce" replace />;

  const persona = personaFor(employee.roleKey);
  const { messages, send, sending } = useAIChat(employee.roleKey, employee.id);

  return (
    <div className="space-y-6">
      <Link to="/app/workforce" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-faint hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Workforce
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink font-display text-[20px] font-semibold text-paper">
            {employee.avatarGlyph}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[22px] font-semibold text-ink">{employee.name}</h1>
              <StatusDot status={employee.status} />
            </div>
            <p className="text-[13.5px] text-ink-faint">{employee.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {employee.status === "paused" ? (
            <Button size="sm" variant="secondary" onClick={() => activateEmployee(employee.id)}><Play className="h-3.5 w-3.5" /> Resume</Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => pauseEmployee(employee.id)}><Pause className="h-3.5 w-3.5" /> Pause</Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="flex h-[520px] flex-col p-5 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] text-ink-faint">{persona.greeting(useWorkspaceStore.getState().company?.name ?? "the company")}</p>
            <DemoTag />
          </div>
          <div className="min-h-0 flex-1">
            <ChatThread
              messages={messages}
              onSend={send}
              sending={sending}
              placeholder={`Message ${employee.name}…`}
              emptyState={
                <button onClick={() => send("What are you working on?")} className="block rounded-lg px-3 py-2 text-left text-[13.5px] text-ink-soft hover:bg-paper-dim">
                  What are you working on?
                </button>
              }
            />
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Goal</p>
            <p className="text-[13.5px] leading-relaxed text-ink-soft">{employee.goal}</p>
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Permissions</p>
            <div className="flex flex-wrap gap-1.5">
              {employee.permissions.map((p) => (
                <Badge key={p} tone="moss">{p.replace(/_/g, " ")}</Badge>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Tasks ({tasks.length})</p>
            {tasks.length === 0 ? (
              <p className="text-[13px] text-ink-faint">No tasks assigned yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {tasks.slice(0, 6).map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] text-ink-soft">{t.title}</span>
                    <span className="shrink-0 text-[11px] text-ink-faint">{timeAgo(t.updatedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
