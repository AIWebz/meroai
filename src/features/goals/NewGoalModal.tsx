import { useState } from "react";
import { Modal } from "../../components/Modal";
import { Button, Input } from "../../components/ui";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

export function NewGoalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addGoal = useWorkspaceStore((s) => s.addGoal);
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [deadline, setDeadline] = useState("");

  function submit() {
    if (!title.trim() || !targetValue.trim()) return;
    addGoal({ title: title.trim(), targetValue: targetValue.trim(), deadline: deadline || null });
    setTitle("");
    setTargetValue("");
    setDeadline("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="New goal">
      <div className="space-y-4">
        <Input placeholder="e.g. Reach $10,000 monthly revenue" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="Target (e.g. $10,000/mo)" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} />
        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-medium text-ink-faint">Deadline (optional)</span>
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!title.trim() || !targetValue.trim()}>Create goal</Button>
        </div>
      </div>
    </Modal>
  );
}
