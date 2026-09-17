import { useState } from "react";
import { Check, Pencil } from "lucide-react";
import { SectionHeading, Button, Card, TextArea } from "../components/ui";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import type { KnowledgeDocument } from "../types";
import { formatDate } from "../utils/format";

const CATEGORY_LABEL: Record<KnowledgeDocument["category"], string> = {
  description: "Company Description",
  brand_voice: "Brand Voice",
  products: "Products",
  services: "Services",
  customers: "Customers",
  policies: "Policies",
  goals: "Goals",
  decisions: "Important Decisions",
};

export default function KnowledgePage() {
  const knowledge = useWorkspaceStore((s) => s.knowledge);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Company Memory"
        title="Knowledge"
        description="What Mero knows about the company. Edit anything — it's stored locally in your browser."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {knowledge.map((doc) => (
          <KnowledgeCard key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  );
}

function KnowledgeCard({ doc }: { doc: KnowledgeDocument }) {
  const updateKnowledge = useWorkspaceStore((s) => s.updateKnowledge);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(doc.content);

  function save() {
    updateKnowledge(doc.id, draft);
    setEditing(false);
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-moss-600">{CATEGORY_LABEL[doc.category]}</p>
          <p className="mt-1 text-[13px] font-semibold text-ink">{doc.title}</p>
        </div>
        {editing ? (
          <Button size="sm" onClick={save}><Check className="h-3.5 w-3.5" /> Save</Button>
        ) : (
          <button onClick={() => { setDraft(doc.content); setEditing(true); }} className="rounded-md p-1.5 text-ink-faint hover:bg-paper-dim hover:text-ink" aria-label="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {editing ? (
        <TextArea className="mt-3" rows={5} value={draft} onChange={(e) => setDraft(e.target.value)} />
      ) : (
        <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-ink-soft">{doc.content || "Nothing documented yet."}</p>
      )}
      <p className="mt-3 text-[11.5px] text-ink-faint">Updated {formatDate(doc.updatedAt)}</p>
    </Card>
  );
}
