import { useMemo, useState } from "react";
import { RefreshCw, TrendingUp, Users2, Target, Percent, Globe2, ListChecks } from "lucide-react";
import { SectionHeading, Card, DemoTag } from "../components/ui";
import { ChatThread } from "../components/ChatThread";
import { useAIChat } from "../features/ai/useAIChat";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { orchestrator } from "../ai/orchestrator";
import { personaFor } from "../ai/personas";

export default function OverviewPage() {
  const company = useWorkspaceStore((s) => s.company)!;
  const tasks = useWorkspaceStore((s) => s.tasks);
  const integrations = useWorkspaceStore((s) => s.integrations);
  const hasConnectedData = integrations.some((i) => i.status === "connected");
  const activeTasks = tasks.filter((t) => t.status === "pending" || t.status === "working" || t.status === "awaiting_approval").length;

  const { messages, send, sending } = useAIChat("ceo", "ceo");
  const ceoPersona = personaFor("ceo");

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Company Health"
        title={`Good to see you, ${useWorkspaceStore.getState().user.name}.`}
        description={`Here's where ${company.name} stands right now.`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <MetricCard icon={TrendingUp} label="Revenue" value={hasConnectedData ? "$0" : null} />
        <MetricCard icon={Users2} label="Customers" value={hasConnectedData ? "0" : null} />
        <MetricCard icon={Target} label="Leads" value={hasConnectedData ? "0" : null} />
        <MetricCard icon={Percent} label="Conversion" value={hasConnectedData ? "0%" : null} />
        <MetricCard icon={Globe2} label="Website visitors" value={hasConnectedData ? "0" : null} />
        <MetricCard icon={ListChecks} label="Active tasks" value={String(activeTasks)} isLive />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="flex h-[480px] flex-col p-5 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[12px] font-semibold text-paper">M</div>
                <h2 className="font-display text-[15px] font-semibold text-ink">AI CEO</h2>
              </div>
              <p className="mt-1 text-[12.5px] text-ink-faint">{ceoPersona.greeting(company.name)}</p>
            </div>
            <DemoTag />
          </div>
          <div className="min-h-0 flex-1">
            <ChatThread
              messages={messages}
              onSend={send}
              sending={sending}
              placeholder="Ask the AI CEO anything about the company…"
              emptyState={
                <div className="space-y-1.5 py-4">
                  <p className="mb-2 text-[11.5px] font-medium uppercase tracking-wide text-ink-faint">Try asking</p>
                  {["Sales are slow. What should we do?", "What should I focus on today?", "What are you working on?"].map((ex) => (
                    <button key={ex} onClick={() => send(ex)} className="block w-full rounded-lg px-3 py-2 text-left text-[13.5px] text-ink-soft hover:bg-paper-dim">
                      {ex}
                    </button>
                  ))}
                </div>
              }
            />
          </div>
        </Card>

        <div className="lg:col-span-2">
          <BriefingPanel />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, isLive }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | null; isLive?: boolean }) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <Icon className="h-4 w-4 text-ink-faint" />
        {!isLive && <span className="text-[10px] font-medium uppercase tracking-wide text-ink-faint/60">No data</span>}
      </div>
      <p className="text-[12.5px] font-medium text-ink-faint">{label}</p>
      {value !== null ? (
        <p className="mt-0.5 font-display text-[22px] font-semibold text-ink">{value}</p>
      ) : (
        <p className="mt-1 text-[12px] leading-snug text-ink-faint/80">Connect your data to see live metrics.</p>
      )}
    </Card>
  );
}

function BriefingPanel() {
  const company = useWorkspaceStore((s) => s.company)!;
  const employees = useWorkspaceStore((s) => s.employees);
  const tasks = useWorkspaceStore((s) => s.tasks);
  const approvals = useWorkspaceStore((s) => s.approvals);
  const activity = useWorkspaceStore((s) => s.activity);
  const opportunities = useWorkspaceStore((s) => s.opportunities);
  const [generatedAt, setGeneratedAt] = useState(() => new Date().toISOString());

  const briefing = useMemo(
    () => orchestrator.generateBriefing({ company, employees, tasks, approvals, activity, opportunities }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [company, employees, tasks, approvals, activity, opportunities, generatedAt]
  );

  return (
    <Card className="flex h-[480px] flex-col p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[15px] font-semibold text-ink">AI CEO Briefing</h2>
        <button onClick={() => setGeneratedAt(new Date().toISOString())} className="rounded-md p-1.5 text-ink-faint hover:bg-paper-dim hover:text-ink" aria-label="Refresh briefing">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mero-scrollbar flex-1 space-y-4 overflow-y-auto pr-1">
        {briefing.sections.map((section) => (
          <div key={section.heading}>
            <p className="mb-1.5 text-[12px] font-semibold text-ink-faint">{section.heading}</p>
            <ul className="space-y-1">
              {section.items.map((item, i) => (
                <li key={i} className="flex gap-2 text-[13px] leading-snug text-ink-soft">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-3 border-t border-line pt-3">
        <DemoTag />
      </div>
    </Card>
  );
}
