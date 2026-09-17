import { useState } from "react";
import { Modal } from "../../components/Modal";
import { Button, Input, TextArea } from "../../components/ui";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import type { TaskPriority } from "../../types";

const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

export function NewTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createTask = useWorkspaceStore((s) => s.createTask);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  function reset() {
    setTitle("");
    setDescription("");
    setPriority("medium");
  }

  function submit() {
    if (!title.trim()) return;
    createTask({ title: title.trim(), description: description.trim() || "No additional detail provided.", priority });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="New task">
      <div className="space-y-4">
        <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextArea placeholder="What should this task accomplish?" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-ink">
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!title.trim()}>Create task</Button>
        </div>
      </div>
    </Modal>
  );
}
