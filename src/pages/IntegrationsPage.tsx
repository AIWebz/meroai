import { Check } from "lucide-react";
import { SectionHeading, Badge, Button, Card } from "../components/ui";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import type { Integration, IntegrationCategory } from "../types";

const CATEGORY_LABEL: Record<IntegrationCategory, string> = {
  communication: "Communication",
  commerce: "Commerce",
  analytics: "Analytics",
  productivity: "Productivity",
};

const CATEGORY_ORDER: IntegrationCategory[] = ["communication", "commerce", "analytics", "productivity"];

export default function IntegrationsPage() {
  const integrations = useWorkspaceStore((s) => s.integrations);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Integrations"
        title="Integrations"
        description="Connect real data so your AI workforce can act on real information instead of guessing."
      />
      {CATEGORY_ORDER.map((cat) => {
        const items = integrations.filter((i) => i.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat}>
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-faint">{CATEGORY_LABEL[cat]}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((i) => (
                <IntegrationCard key={i.id} integration={i} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const connectIntegration = useWorkspaceStore((s) => s.connectIntegration);
  const disconnectIntegration = useWorkspaceStore((s) => s.disconnectIntegration);

  return (
    <Card className="flex flex-col p-4">
      <div className="flex items-start justify-between">
        <p className="text-[14px] font-semibold text-ink">{integration.name}</p>
        {integration.status === "connected" && <Badge tone="moss"><Check className="h-3 w-3" /> Connected</Badge>}
        {integration.status === "coming_soon" && <Badge>Coming soon</Badge>}
      </div>
      <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-ink-faint">{integration.description}</p>
      <div className="mt-3">
        {integration.status === "available" && <Button size="sm" onClick={() => connectIntegration(integration.id)}>Connect</Button>}
        {integration.status === "connected" && <Button size="sm" variant="secondary" onClick={() => disconnectIntegration(integration.id)}>Disconnect</Button>}
        {integration.status === "coming_soon" && <Button size="sm" variant="ghost" disabled>Coming soon</Button>}
      </div>
    </Card>
  );
}
