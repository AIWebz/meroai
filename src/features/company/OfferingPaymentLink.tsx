import { useState } from "react";
import { CreditCard, Pencil, Trash2 } from "lucide-react";
import { Badge, Button, Input } from "../../components/ui";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import type { Offering } from "../../types";

function isPlausibleStripeLink(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith("stripe.com");
  } catch {
    return false;
  }
}

export function OfferingPaymentLink({ offering }: { offering: Offering }) {
  const setOfferingPaymentLink = useWorkspaceStore((s) => s.setOfferingPaymentLink);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(offering.stripePaymentLinkUrl ?? "");
  const [error, setError] = useState<string | null>(null);

  const connected = Boolean(offering.stripePaymentLinkUrl);

  function save() {
    const trimmed = draft.trim();
    if (!isPlausibleStripeLink(trimmed)) {
      setError("That doesn't look like a Stripe link — it should start with https:// and be on a stripe.com domain, e.g. https://buy.stripe.com/...");
      return;
    }
    setError(null);
    setOfferingPaymentLink(offering.id, trimmed);
    setEditing(false);
  }

  function remove() {
    setOfferingPaymentLink(offering.id, null);
    setDraft("");
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="mt-2 flex items-center gap-2">
        {connected ? (
          <>
            <Badge tone="moss">
              <CreditCard className="h-3 w-3" /> Stripe connected
            </Badge>
            <button onClick={() => setEditing(true)} className="text-[11.5px] font-medium text-ink-faint hover:text-ink" aria-label="Edit payment link">
              <Pencil className="h-3 w-3" />
            </button>
            <button onClick={remove} className="text-[11.5px] font-medium text-ink-faint hover:text-rose-500" aria-label="Remove payment link">
              <Trash2 className="h-3 w-3" />
            </button>
          </>
        ) : (
          <button onClick={() => setEditing(true)} className="text-[12px] font-medium text-moss-600 hover:text-moss-700">
            + Connect Stripe payment link
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-2">
        <Input
          autoFocus
          placeholder="https://buy.stripe.com/..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="text-[12.5px]"
        />
        <Button size="sm" onClick={save}>Save</Button>
        <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setError(null); setDraft(offering.stripePaymentLinkUrl ?? ""); }}>
          Cancel
        </Button>
      </div>
      {error && <p className="text-[11.5px] text-rose-500">{error}</p>}
      <p className="text-[11px] text-ink-faint">
        Create a free Payment Link in your Stripe Dashboard (Product catalog → create a product → Create payment
        link) and paste it here. Stripe hosts the actual checkout — no backend needed on Mero's side.
      </p>
    </div>
  );
}
