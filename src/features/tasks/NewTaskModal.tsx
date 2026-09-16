import { useState } from "react";
import { Modal } from "../../components/Modal";
import { Button, Input, TextArea } from "../../components/ui";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import type { TaskPriority } from "../../types";

const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

export function NewTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const allEmployees = useWorkspaceStore((s) => s.employees);
  const employees = allEmployees.filter((e) => e.isHired);
  const createTask = useWorkspaceStore((s) => s.createTask);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [requiresApproval, setRequiresApproval] = useState(false);

  function reset() {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setRequiresApproval(false);
  }

  function submit() {
    if (!title.trim() || !employeeId) return;
    createTask({
      title: title.trim(),
      description: description.trim() || "No additional detail provided.",
      employeeId,
      priority,
      requiresApproval,
      approvalKind: "other",
      approvalReason: "This task was flagged as needing your approval before it proceeds.",
    });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="New task">
      <div className="space-y-4">
        <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextArea placeholder="What should this task accomplish?" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-ink">
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-ink">
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2.5 text-[13.5px] text-ink-soft">
          <input type="checkbox" checked={requiresApproval} onChange={(e) => setRequiresApproval(e.target.checked)} className="h-4 w-4 rounded border-line accent-[color:var(--color-ink)]" />
          Require my approval before this proceeds
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!title.trim() || !employeeId}>Create task</Button>
        </div>
      </div>
    </Modal>
  );
}
