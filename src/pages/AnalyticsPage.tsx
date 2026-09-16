import { Lightbulb, Link2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeading, Badge, Button, Card, DemoTag, EmptyState } from "../components/ui";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

export default function AnalyticsPage() {
  const integrations = useWorkspaceStore((s) => s.integrations);
  const allOpportunities = useWorkspaceStore((s) => s.opportunities);
  const opportunities = allOpportunities.filter((o) => !o.dismissed);
  const dismissOpportunity = useWorkspaceStore((s) => s.dismissOpportunity);
  const employees = useWorkspaceStore((s) => s.employees);
  const hasConnectedData = integrations.some((i) => i.status === "connected");

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Analytics" title="Analytics" description="Real analysis requires connected data. Nothing here is estimated or invented." />

      {!hasConnectedData ? (
        <EmptyState
          icon={<Link2 className="h-6 w-6" />}
          title="No data connected yet"
          description="Connect Google Analytics, Stripe, Shopify, or another integration to see real traffic, revenue, and conversion analysis."
          action={
            <Link to="/app/integrations" className="mt-2 inline-block">
              <Button>Go to Integrations</Button>
            </Link>
          }
        />
      ) : (
        <Card className="p-6">
          <p className="text-[13.5px] text-ink-faint">Live analytics will render here once connected data is flowing in.</p>
        </Card>
      )}

      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint">Opportunity Engine</h2>
          <DemoTag />
        </div>
        {opportunities.length === 0 ? (
          <EmptyState icon={<Lightbulb className="h-6 w-6" />} title="No opportunities detected" description="Mero looks for patterns in connected data to surface opportunities worth acting on." />
        ) : (
          <div className="space-y-3">
            {opportunities.map((o) => {
              const employee = employees.find((e) => e.id === o.relatedEmployeeId);
              return (
                <Card key={o.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge tone="amber">Opportunity</Badge>
                      <p className="mt-2 text-[15px] font-semibold text-ink">{o.title}</p>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-faint">{o.description}</p>
                    </div>
                    <button onClick={() => dismissOpportunity(o.id)} className="shrink-0 rounded-md p-1 text-ink-faint hover:bg-paper-dim" aria-label="Dismiss">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 rounded-lg bg-paper-dim px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Recommended action</p>
                    <p className="mt-0.5 text-[13px] text-ink-soft">{o.recommendedAction}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[12px] text-ink-faint">{employee ? `Flagged by ${employee.name}` : "Flagged by Mero"}</span>
                    {o.requiresIntegration ? (
                      <Link to="/app/integrations" className="text-[12.5px] font-medium text-moss-600 hover:text-moss-700">Connect data</Link>
                    ) : (
                      <Button size="sm" variant="secondary">Review</Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
