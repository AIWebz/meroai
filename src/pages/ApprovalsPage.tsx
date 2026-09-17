import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import clsx from "clsx";
import { SectionHeading, Badge, Button, Card, EmptyState } from "../components/ui";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import type { Approval } from "../types";
import { formatDate } from "../utils/format";

export default function ApprovalsPage() {
  const approvals = useWorkspaceStore((s) => s.approvals);
  const pending = approvals.filter((a) => a.status === "pending");
  const resolved = approvals.filter((a) => a.status !== "pending").sort((a, b) => (b.resolvedAt ?? "").localeCompare(a.resolvedAt ?? ""));

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Approval Center"
        title="Approvals"
        description="Important actions wait here until you approve or reject them."
      />

      {pending.length === 0 ? (
        <EmptyState title="Nothing waiting on you" description="Tasks you flag as needing approval will show up here." />
      ) : (
        <div className="space-y-3">
          {pending.map((a) => (
            <ApprovalCard key={a.id} approval={a} />
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-faint">History</h2>
          <div className="space-y-2">
            {resolved.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                <div>
                  <p className="text-[13.5px] font-medium text-ink">{a.title}</p>
                  <p className="text-[12px] text-ink-faint">{formatDate(a.resolvedAt ?? a.createdAt)}</p>
                </div>
                <Badge tone={a.status === "approved" ? "moss" : "rose"}>{a.status === "approved" ? "Approved" : "Rejected"}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ApprovalCard({ approval }: { approval: Approval }) {
  const approveApproval = useWorkspaceStore((s) => s.approveApproval);
  const rejectApproval = useWorkspaceStore((s) => s.rejectApproval);
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-ink">{approval.title}</p>
        </div>
        <Badge tone="amber">Pending</Badge>
      </div>

      <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
        <span className="font-medium text-ink">Reason: </span>
        {approval.reason}
      </p>

      <button onClick={() => setExpanded((e) => !e)} className="mt-3 flex items-center gap-1 text-[12.5px] font-medium text-ink-faint hover:text-ink">
        Review details <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
      </button>
      {expanded && <p className="mt-2 rounded-lg bg-paper-dim px-3 py-2.5 text-[13px] leading-relaxed text-ink-soft">{approval.details}</p>}

      <div className="mt-4 flex gap-2 border-t border-line pt-4">
        <Button size="sm" onClick={() => approveApproval(approval.id)}><Check className="h-3.5 w-3.5" /> Approve</Button>
        <Button size="sm" variant="secondary" onClick={() => rejectApproval(approval.id)}><X className="h-3.5 w-3.5" /> Reject</Button>
      </div>
    </Card>
  );
}
