import { useState } from "react";
import { Plus } from "lucide-react";
import { SectionHeading, Button, EmptyState } from "../components/ui";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { TaskCard, STATUS_LABEL } from "../features/tasks/TaskCard";
import { NewTaskModal } from "../features/tasks/NewTaskModal";
import type { TaskStatus } from "../types";
import clsx from "clsx";

const FILTERS: (TaskStatus | "all")[] = ["all", "pending", "working", "awaiting_approval", "completed", "failed", "cancelled"];

export default function TasksPage() {
  const tasks = useWorkspaceStore((s) => s.tasks);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  const sorted = [...filtered].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Task System"
        title="Tasks"
        description="Track what's next for your company."
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> New task
          </Button>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              "rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
              filter === f ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink-faint"
            )}
          >
            {f === "all" ? "All" : STATUS_LABEL[f]}
            <span className="ml-1.5 opacity-60">{f === "all" ? tasks.length : tasks.filter((t) => t.status === f).length}</span>
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Create a task to start tracking what's next."
          action={<Button className="mt-2" onClick={() => setModalOpen(true)}>Create a task</Button>}
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((t) => (
            <TaskCard key={t.id} task={t} />
          ))}
        </div>
      )}

      <NewTaskModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
