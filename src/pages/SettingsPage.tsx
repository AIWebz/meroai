import { useState } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { SectionHeading, Badge, Button, Card, Input } from "../components/ui";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { useUIStore } from "../store/useUIStore";
import { useAIConfigStore } from "../store/useAIConfigStore";
import { BackendAIProvider } from "../ai/backendProvider";

const TABS = ["Account", "Company", "Workforce", "AI", "Notifications", "Appearance"] as const;
type Tab = (typeof TABS)[number];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("Account");

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Settings" title="Settings" description="Manage your account, company, and how Mero behaves." />
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
              tab === t ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink-faint"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Account" && <AccountTab />}
      {tab === "Company" && <CompanyTab />}
      {tab === "Workforce" && <WorkforceTab />}
      {tab === "AI" && <AITab />}
      {tab === "Notifications" && <NotificationsTab />}
      {tab === "Appearance" && <AppearanceTab />}
    </div>
  );
}

function AccountTab() {
  const user = useWorkspaceStore((s) => s.user);
  const updateUser = useWorkspaceStore((s) => s.updateUser);
  return (
    <Card className="max-w-lg space-y-4 p-6">
      <Field label="Name"><Input value={user.name} onChange={(e) => updateUser({ name: e.target.value })} /></Field>
      <Field label="Email"><Input value={user.email} onChange={(e) => updateUser({ email: e.target.value })} type="email" /></Field>
      <Field label="Role"><p className="text-[14px] capitalize text-ink">{user.role}</p></Field>
      <p className="text-[12px] text-ink-faint">Account data is stored locally in your browser — there is no server-side account system in this build.</p>
    </Card>
  );
}

function CompanyTab() {
  const company = useWorkspaceStore((s) => s.company)!;
  const settings = useWorkspaceStore((s) => s.settings)!;
  const updateSettings = useWorkspaceStore((s) => s.updateSettings);
  return (
    <Card className="max-w-lg space-y-4 p-6">
      <Field label="Company">
        <div className="flex items-center justify-between">
          <p className="text-[14px] text-ink">{company.name}</p>
          <Link to="/app/company" className="text-[12.5px] font-medium text-moss-600 hover:text-moss-700">Edit profile</Link>
        </div>
      </Field>
      <Field label="Timezone"><p className="text-[14px] text-ink">{settings.timezone}</p></Field>
      <Field label="Currency">
        <select value={settings.currency} onChange={(e) => updateSettings({ currency: e.target.value })} className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-ink">
          {["USD", "EUR", "GBP", "CAD"].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
    </Card>
  );
}

function WorkforceTab() {
  const allEmployees = useWorkspaceStore((s) => s.employees);
  const employees = allEmployees.filter((e) => e.isHired);
  const pauseEmployee = useWorkspaceStore((s) => s.pauseEmployee);
  const activateEmployee = useWorkspaceStore((s) => s.activateEmployee);
  return (
    <Card className="max-w-lg divide-y divide-line p-2">
      {employees.map((e) => (
        <div key={e.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[13.5px] font-medium text-ink">{e.name}</p>
            <p className="text-[12px] text-ink-faint">{e.title}</p>
          </div>
          {e.status === "paused" ? (
            <Button size="sm" variant="secondary" onClick={() => activateEmployee(e.id)}>Resume</Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => pauseEmployee(e.id)}>Pause</Button>
          )}
        </div>
      ))}
    </Card>
  );
}

function AITab() {
  const settings = useWorkspaceStore((s) => s.settings)!;
  const updateSettings = useWorkspaceStore((s) => s.updateSettings);
  const backendUrl = useAIConfigStore((s) => s.backendUrl);
  const backendSecret = useAIConfigStore((s) => s.backendSecret);
  const setBackendUrl = useAIConfigStore((s) => s.setBackendUrl);
  const setBackendSecret = useAIConfigStore((s) => s.setBackendSecret);
  const clearBackend = useAIConfigStore((s) => s.clear);

  const [urlDraft, setUrlDraft] = useState(backendUrl);
  const [secretDraft, setSecretDraft] = useState(backendSecret);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  const isLive = backendUrl.trim().length > 0;

  function save() {
    setBackendUrl(urlDraft.trim());
    setBackendSecret(secretDraft.trim());
    setTestResult("idle");
  }

  async function testConnection() {
    if (!urlDraft.trim()) return;
    setTesting(true);
    setTestResult("idle");
    try {
      const provider = new BackendAIProvider(urlDraft.trim(), secretDraft.trim());
      const res = await provider.chat("Reply with a short greeting to confirm the connection is working.", {
        personaId: "ceo",
        facts: { companyName: "Mero" },
      });
      setTestResult("success");
      setTestMessage(res.content);
    } catch (err) {
      setTestResult("error");
      setTestMessage(err instanceof Error ? err.message : "Connection failed.");
    } finally {
      setTesting(false);
    }
  }

  return (
    <Card className="max-w-lg space-y-5 p-6">
      <div className="flex items-center gap-2 rounded-xl border border-line bg-paper-dim px-4 py-3">
        <Sparkles className="h-4 w-4 text-moss-500" />
        <div>
          <p className="text-[13px] font-semibold text-ink">{isLive ? "Live AI connected" : "Demo intelligence active"}</p>
          <p className="text-[12px] text-ink-faint">
            {isLive
              ? "Chat responses are generated by your connected AI backend."
              : "This static build simulates AI responses locally — no API key is used or stored in the browser."}
          </p>
        </div>
      </div>

      <div className="space-y-3 border-t border-line pt-5">
        <div>
          <p className="text-[13px] font-semibold text-ink">Connect real AI</p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
            Deploy the AI backend in <code className="rounded bg-paper-dim px-1 py-0.5">server/mero-ai-backend</code> (a
            small Cloudflare Worker that holds your Anthropic API key) and paste its URL below. See the README for
            deploy steps.
          </p>
        </div>
        <Field label="Backend URL">
          <Input
            placeholder="https://mero-ai-backend.your-subdomain.workers.dev"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
          />
        </Field>
        <Field label="Shared secret (optional, recommended)">
          <Input
            type="password"
            placeholder="Matches MERO_SHARED_SECRET on your worker"
            value={secretDraft}
            onChange={(e) => setSecretDraft(e.target.value)}
          />
        </Field>

        {testResult !== "idle" && (
          <div className={clsx("flex items-start gap-2 rounded-lg px-3 py-2.5 text-[12.5px]", testResult === "success" ? "bg-moss-50 text-moss-700" : "bg-[#f8ebe9] text-rose-500")}>
            {testResult === "success" ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
            <span>{testMessage}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={testConnection} disabled={!urlDraft.trim() || testing}>
            {testing ? "Testing…" : "Test connection"}
          </Button>
          <Button size="sm" onClick={save} disabled={!urlDraft.trim() && !backendUrl}>
            Save
          </Button>
          {backendUrl && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                clearBackend();
                setUrlDraft("");
                setSecretDraft("");
                setTestResult("idle");
              }}
            >
              Disconnect
            </Button>
          )}
        </div>
      </div>

      <Field label="Auto-approve risk threshold">
        <select
          value={settings.autoApproveUnderRisk}
          onChange={(e) => updateSettings({ autoApproveUnderRisk: e.target.value as typeof settings.autoApproveUnderRisk })}
          className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-ink"
        >
          <option value="none">None — always ask me</option>
          <option value="low">Low-risk actions only</option>
          <option value="medium">Low & medium-risk actions</option>
        </select>
      </Field>
    </Card>
  );
}

function NotificationsTab() {
  const settings = useWorkspaceStore((s) => s.settings)!;
  const updateSettings = useWorkspaceStore((s) => s.updateSettings);
  const rows: { key: keyof typeof settings; label: string }[] = [
    { key: "notifyOnApprovalNeeded", label: "Notify me when something needs approval" },
    { key: "notifyOnTaskFailed", label: "Notify me when a task fails" },
    { key: "notifyOnDailyBriefing", label: "Send me the daily AI CEO briefing" },
  ];
  return (
    <Card className="max-w-lg divide-y divide-line p-2">
      {rows.map((r) => (
        <label key={r.key} className="flex items-center justify-between gap-4 px-4 py-3">
          <span className="text-[13.5px] text-ink">{r.label}</span>
          <input
            type="checkbox"
            checked={Boolean(settings[r.key])}
            onChange={(e) => updateSettings({ [r.key]: e.target.checked } as never)}
            className="h-4 w-4 rounded border-line accent-[color:var(--color-ink)]"
          />
        </label>
      ))}
    </Card>
  );
}

function AppearanceTab() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  return (
    <Card className="max-w-lg p-6">
      <p className="mb-3 text-[12.5px] font-medium text-ink-faint">Theme</p>
      <div className="flex gap-2">
        {(["light", "dark", "system"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-[12.5px] font-medium capitalize transition-colors",
              theme === t ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink-faint"
            )}
          >
            {t}
          </button>
        ))}
      </div>
      {theme === "dark" && (
        <p className="mt-3 text-[12px] text-ink-faint">
          <Badge>Preview</Badge> <span className="ml-1">Dark mode is applied instantly across the app.</span>
        </p>
      )}
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
