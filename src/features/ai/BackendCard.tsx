import { useState } from "react";
import clsx from "clsx";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button, Card, Field, Input } from "../../components/ui";
import { useAIConfigStore } from "../../store/useAIConfigStore";
import { BackendAIProvider } from "../../ai/backendProvider";

export function BackendCard() {
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
    <Card className="space-y-3 p-6">
      <div>
        <p className="text-[13px] font-semibold text-ink">Or connect a secure backend</p>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
          Deploy the AI backend in <code className="rounded bg-paper-dim px-1 py-0.5">server/mero-ai-backend</code> (a
          small Cloudflare Worker that holds your Anthropic API key server-side) and paste its URL below. Better fit
          for a deployment other people will use. See the README for deploy steps.
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
    </Card>
  );
}
