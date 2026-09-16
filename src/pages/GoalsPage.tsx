import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SectionHeading, Badge, Button, Card, EmptyState } from "../components/ui";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { NewGoalModal } from "../features/goals/NewGoalModal";
import type { GoalStatus } from "../types";
import { formatDate } from "../utils/format";

const STATUS_LABEL: Record<GoalStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  at_risk: "At risk",
  achieved: "Achieved",
};
const STATUS_TONE: Record<GoalStatus, "neutral" | "moss" | "amber" | "rose"> = {
  not_started: "neutral",
  in_progress: "amber",
  at_risk: "rose",
  achieved: "moss",
};

export default function GoalsPage() {
  const goals = useWorkspaceStore((s) => s.goals);
  const tasks = useWorkspaceStore((s) => s.tasks);
  const removeGoal = useWorkspaceStore((s) => s.removeGoal);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Company Goals"
        title="Goals"
        description="What the company is working toward. Progress reflects connected data only — nothing is estimated."
        action={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> New goal</Button>}
      />

      {goals.length === 0 ? (
        <EmptyState title="No goals yet" description="Add a goal to give your AI workforce something concrete to work toward." action={<Button className="mt-2" onClick={() => setModalOpen(true)}>Create a goal</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((g) => {
            const related = tasks.filter((t) => g.relatedTaskIds.includes(t.id));
            return (
              <Card key={g.id} className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[14.5px] font-semibold leading-snug text-ink">{g.title}</p>
                  <button onClick={() => removeGoal(g.id)} className="shrink-0 rounded-md p-1 text-ink-faint hover:bg-paper-dim hover:text-rose-500" aria-label="Remove goal">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge tone={STATUS_TONE[g.status]}>{STATUS_LABEL[g.status]}</Badge>
                  {g.deadline && <span className="text-[12px] text-ink-faint">Due {formatDate(g.deadline)}</span>}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Target</p>
                    <p className="mt-0.5 text-ink">{g.targetValue}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Current</p>
                    <p className="mt-0.5 text-ink-faint">{g.currentValue ?? "No connected data"}</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-line pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">AI strategy</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{g.strategy}</p>
                </div>

                {related.length > 0 && (
                  <div className="mt-3 text-[12px] text-ink-faint">{related.length} related task{related.length === 1 ? "" : "s"}</div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <NewGoalModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
