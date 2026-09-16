import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import type { CompanyBlueprint } from "../../data/companyGenerator";
import { Button, Card, Input, TextArea } from "../../components/ui";
import { EMPLOYEE_CATALOG } from "../../data/employeeCatalog";
import type { EmployeeRoleKey, Offering } from "../../types";
import { id } from "../../utils/id";
import clsx from "clsx";

const BUSINESS_MODELS = ["ecommerce", "subscription", "marketplace", "saas", "services", "content", "other"] as const;

export function BlueprintReviewStep({
  initial,
  onBack,
  onConfirm,
}: {
  initial: CompanyBlueprint;
  onBack: () => void;
  onConfirm: (blueprint: CompanyBlueprint, hiredKeys: EmployeeRoleKey[]) => void;
}) {
  const [blueprint, setBlueprint] = useState<CompanyBlueprint>(initial);
  const [hiredKeys, setHiredKeys] = useState<EmployeeRoleKey[]>(initial.recommendedEmployeeKeys);

  function patch(p: Partial<CompanyBlueprint>) {
    setBlueprint((b) => ({ ...b, ...p }));
  }

  function toggleEmployee(key: EmployeeRoleKey) {
    setHiredKeys((keys) => (keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key]));
  }

  function updateOffering(offeringId: string, patchFields: Partial<Offering>) {
    patch({ offerings: blueprint.offerings.map((o) => (o.id === offeringId ? { ...o, ...patchFields } : o)) });
  }

  function addOffering() {
    patch({
      offerings: [
        ...blueprint.offerings,
        { id: id("off"), name: "New offering", description: "", pricingConcept: "$—", positioning: "" },
      ],
    });
  }

  function removeOffering(offeringId: string) {
    patch({ offerings: blueprint.offerings.filter((o) => o.id !== offeringId) });
  }

  return (
    <div className="min-h-screen bg-paper px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="animate-fade-up text-center">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-moss-600">Step 2 of 3</p>
          <h1 className="font-display text-[30px] font-semibold text-ink">Your company blueprint</h1>
          <p className="mt-2 text-[14.5px] text-ink-faint">Everything here is editable. Adjust anything before Mero builds it.</p>
        </div>

        <div className="mt-10 space-y-6">
          <Section title="Company">
            <Field label="Name"><Input value={blueprint.name} onChange={(e) => patch({ name: e.target.value })} /></Field>
            <Field label="Tagline"><Input value={blueprint.tagline} onChange={(e) => patch({ tagline: e.target.value })} /></Field>
            <Field label="Description"><TextArea rows={3} value={blueprint.description} onChange={(e) => patch({ description: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Industry"><Input value={blueprint.industry} onChange={(e) => patch({ industry: e.target.value })} /></Field>
              <Field label="Business model">
                <select
                  value={blueprint.businessModel}
                  onChange={(e) => patch({ businessModel: e.target.value as CompanyBlueprint["businessModel"] })}
                  className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-ink"
                >
                  {BUSINESS_MODELS.map((m) => (
                    <option key={m} value={m}>{m[0].toUpperCase() + m.slice(1)}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Target audience"><TextArea rows={2} value={blueprint.targetAudience} onChange={(e) => patch({ targetAudience: e.target.value })} /></Field>
          </Section>

          <Section title="Brand">
            <Field label="Personality">
              <div className="flex flex-wrap gap-2">
                {blueprint.brand.personality.map((p, i) => (
                  <span key={i} className="rounded-full border border-line bg-paper-dim px-3 py-1 text-[12.5px] text-ink-soft">{p}</span>
                ))}
              </div>
            </Field>
            <Field label="Voice"><TextArea rows={2} value={blueprint.brand.voice} onChange={(e) => patch({ brand: { ...blueprint.brand, voice: e.target.value } })} /></Field>
            <Field label="Colors">
              <div className="flex gap-3">
                {blueprint.brand.colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3">
                    <span className="h-6 w-6 rounded-full border border-line" style={{ background: c.hex }} />
                    <span className="text-[12.5px] text-ink-soft">{c.name}</span>
                  </div>
                ))}
              </div>
            </Field>
            <Field label="Logo concept"><TextArea rows={2} value={blueprint.brand.logoConcept} onChange={(e) => patch({ brand: { ...blueprint.brand, logoConcept: e.target.value } })} /></Field>
          </Section>

          <Section title="Products & Services">
            <div className="space-y-3">
              {blueprint.offerings.map((o) => (
                <div key={o.id} className="rounded-xl border border-line p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2.5">
                      <Input value={o.name} onChange={(e) => updateOffering(o.id, { name: e.target.value })} placeholder="Offering name" />
                      <TextArea rows={2} value={o.description} onChange={(e) => updateOffering(o.id, { description: e.target.value })} placeholder="Description" />
                      <div className="grid grid-cols-2 gap-2.5">
                        <Input value={o.pricingConcept} onChange={(e) => updateOffering(o.id, { pricingConcept: e.target.value })} placeholder="Pricing" />
                        <Input value={o.positioning} onChange={(e) => updateOffering(o.id, { positioning: e.target.value })} placeholder="Positioning" />
                      </div>
                    </div>
                    <button onClick={() => removeOffering(o.id)} className="rounded-lg p-2 text-ink-faint hover:bg-paper-dim hover:text-rose-500" aria-label="Remove offering">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addOffering} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-moss-600 hover:text-moss-700">
              <Plus className="h-3.5 w-3.5" /> Add offering
            </button>
          </Section>

          <Section title="Goals">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Launch goal"><Input value={blueprint.goalSummary.launch} onChange={(e) => patch({ goalSummary: { ...blueprint.goalSummary, launch: e.target.value } })} /></Field>
              <Field label="Customer goal"><Input value={blueprint.goalSummary.customer} onChange={(e) => patch({ goalSummary: { ...blueprint.goalSummary, customer: e.target.value } })} /></Field>
              <Field label="Revenue goal"><Input value={blueprint.goalSummary.revenue} onChange={(e) => patch({ goalSummary: { ...blueprint.goalSummary, revenue: e.target.value } })} /></Field>
              <Field label="Growth goal"><Input value={blueprint.goalSummary.growth} onChange={(e) => patch({ goalSummary: { ...blueprint.goalSummary, growth: e.target.value } })} /></Field>
            </div>
          </Section>

          <Section title="AI Workforce" description="Mero recommended these employees. Toggle who gets hired — everyone else stays available on the Workforce page.">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {EMPLOYEE_CATALOG.filter((e) => e.roleKey !== "ceo").map((entry) => {
                const active = hiredKeys.includes(entry.roleKey);
                const recommended = initial.recommendedEmployeeKeys.includes(entry.roleKey);
                return (
                  <button
                    key={entry.roleKey}
                    onClick={() => toggleEmployee(entry.roleKey)}
                    className={clsx(
                      "flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                      active ? "border-ink bg-paper-dim" : "border-line hover:border-ink-faint"
                    )}
                  >
                    <div className={clsx("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", active ? "border-ink bg-ink text-paper" : "border-line")}>
                      {active && <Check className="h-3.5 w-3.5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[13.5px] font-semibold text-ink">{entry.name}</p>
                        {recommended && <span className="rounded-full bg-moss-50 px-1.5 py-0.5 text-[10px] font-medium text-moss-600">Recommended</span>}
                      </div>
                      <p className="mt-0.5 text-[12.5px] leading-snug text-ink-faint">{entry.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button>
          <Button size="lg" onClick={() => onConfirm(blueprint, hiredKeys)}>
            Create My Company <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="animate-fade-up p-6">
      <h2 className="font-display text-[17px] font-semibold text-ink">{title}</h2>
      {description && <p className="mt-1 text-[13px] text-ink-faint">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-ink-faint">{label}</span>
      {children}
    </label>
  );
}
