import { useState } from "react";
import { Laptop, Smartphone, Tablet } from "lucide-react";
import clsx from "clsx";
import { SectionHeading, Card } from "../components/ui";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { WebsitePreview, type PreviewDevice } from "../features/website/WebsitePreview";
import { PublishToGithub } from "../features/site/PublishToGithub";

export default function SitePage() {
  const website = useWorkspaceStore((s) => s.website);
  const company = useWorkspaceStore((s) => s.company)!;
  const [activePageId, setActivePageId] = useState(website?.pages[0]?.id ?? "");
  const [device, setDevice] = useState<PreviewDevice>("desktop");

  if (!website) return null;
  const page = website.pages.find((p) => p.id === activePageId) ?? website.pages[0];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={company.productType === "tool" ? "Your Tool" : "Your Shop"}
        title="Your site"
        description="Written by your connected AI when your company was created. Publish it to GitHub to make it real."
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
            <WebsitePreview website={website} page={page} device={device} offerings={company.offerings} />
          </Card>
        </div>

        <div className="xl:col-span-2">
          <PublishToGithub />
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
