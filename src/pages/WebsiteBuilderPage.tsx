import { useState } from "react";
import { Laptop, Smartphone, Sparkles, Tablet, ArrowUp } from "lucide-react";
import clsx from "clsx";
import { SectionHeading, Badge, Button, Card, DemoTag, Input, TextArea } from "../components/ui";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { WebsitePreview, type PreviewDevice } from "../features/website/WebsitePreview";
import { applyWebsiteCommand } from "../features/website/websiteCommands";

export default function WebsiteBuilderPage() {
  const website = useWorkspaceStore((s) => s.website);
  const company = useWorkspaceStore((s) => s.company)!;
  const approvals = useWorkspaceStore((s) => s.approvals);
  const employees = useWorkspaceStore((s) => s.employees);
  const updateWebsite = useWorkspaceStore((s) => s.updateWebsite);
  const updateWebsiteComponent = useWorkspaceStore((s) => s.updateWebsiteComponent);
  const createTask = useWorkspaceStore((s) => s.createTask);

  const [activePageId, setActivePageId] = useState(website?.pages[0]?.id ?? "");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [command, setCommand] = useState("");
  const [log, setLog] = useState<{ command: string; message: string }[]>([]);

  if (!website) return null;
  const page = website.pages.find((p) => p.id === activePageId) ?? website.pages[0];
  const pendingPublish = approvals.some((a) => a.kind === "publish_website" && a.status === "pending");

  function runCommand() {
    if (!command.trim()) return;
    const result = applyWebsiteCommand(command.trim(), website!, page.id, company);
    updateWebsite(result.website);
    setLog((l) => [...l, { command: command.trim(), message: result.message }]);
    setCommand("");
  }

  function requestPublish() {
    const developer = employees.find((e) => e.roleKey === "developer" && e.isHired) ?? employees.find((e) => e.roleKey === "ceo")!;
    createTask({
      title: "Publish website",
      description: "Publish the current website so it's publicly visible.",
      employeeId: developer.id,
      priority: "medium",
      requiresApproval: true,
      approvalKind: "publish_website",
      approvalReason: "Publishing makes the current website draft publicly visible.",
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Website Builder"
        title="Your website"
        description="Generated automatically when your company was created. Edit sections directly or ask Mero to change it."
        action={
          website.isPublished ? (
            <Badge tone="moss">Published</Badge>
          ) : pendingPublish ? (
            <Badge tone="amber">Pending approval</Badge>
          ) : (
            <Button onClick={requestPublish}>Request to publish</Button>
          )
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {website.pages.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePageId(p.id)}
            className={clsx(
              "rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
              p.id === activePageId ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink-faint"
            )}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-4 xl:col-span-2">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Sections</p>
              <DemoTag />
            </div>
            <div className="space-y-3">
              {page.components.map((c) => (
                <details key={c.id} className="rounded-xl border border-line p-3">
                  <summary className="cursor-pointer text-[13px] font-medium capitalize text-ink">{c.type}</summary>
                  <div className="mt-3 space-y-2">
                    {c.heading !== undefined && (
                      <Input value={c.heading} onChange={(e) => updateWebsiteComponent(page.id, c.id, { heading: e.target.value })} placeholder="Heading" />
                    )}
                    {c.subheading !== undefined && (
                      <Input value={c.subheading} onChange={(e) => updateWebsiteComponent(page.id, c.id, { subheading: e.target.value })} placeholder="Subheading" />
                    )}
                    {c.body !== undefined && (
                      <TextArea rows={2} value={c.body} onChange={(e) => updateWebsiteComponent(page.id, c.id, { body: e.target.value })} placeholder="Body" />
                    )}
                    {c.buttonLabel !== undefined && (
                      <Input value={c.buttonLabel} onChange={(e) => updateWebsiteComponent(page.id, c.id, { buttonLabel: e.target.value })} placeholder="Button label" />
                    )}
                  </div>
                </details>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-moss-500" />
              <p className="text-[13px] font-semibold text-ink">AI Website Editor</p>
            </div>
            <p className="mb-3 text-[12px] text-ink-faint">Try: "Add a section explaining our services." or "Create an FAQ section."</p>
            {log.length > 0 && (
              <div className="mero-scrollbar mb-3 max-h-40 space-y-2 overflow-y-auto">
                {log.map((entry, i) => (
                  <div key={i} className="rounded-lg bg-paper-dim p-2.5 text-[12px]">
                    <p className="font-medium text-ink">{entry.command}</p>
                    <p className="mt-0.5 text-ink-faint">{entry.message}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl border border-line px-3 py-1.5">
              <input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runCommand()}
                placeholder="Make the homepage more premium…"
                className="flex-1 bg-transparent py-1.5 text-[13px] text-ink placeholder:text-ink-faint/70 outline-none"
              />
              <button onClick={runCommand} disabled={!command.trim()} className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-paper disabled:opacity-30" aria-label="Run command">
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-3">
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <p className="text-[12.5px] font-medium text-ink-faint">Preview</p>
              <div className="flex gap-1 rounded-full border border-line p-0.5">
                <DeviceButton icon={Laptop} active={device === "desktop"} onClick={() => setDevice("desktop")} />
                <DeviceButton icon={Tablet} active={device === "tablet"} onClick={() => setDevice("tablet")} />
                <DeviceButton icon={Smartphone} active={device === "mobile"} onClick={() => setDevice("mobile")} />
              </div>
            </div>
            <WebsitePreview website={website} page={page} device={device} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function DeviceButton({ icon: Icon, active, onClick }: { icon: React.ComponentType<{ className?: string }>; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={clsx("flex h-7 w-7 items-center justify-center rounded-full transition-colors", active ? "bg-ink text-paper" : "text-ink-faint hover:bg-paper-dim")}>
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
