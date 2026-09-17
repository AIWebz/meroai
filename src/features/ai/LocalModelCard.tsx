import { useEffect, useState } from "react";
import clsx from "clsx";
import { AlertTriangle, CheckCircle2, Cpu, XCircle } from "lucide-react";
import { Badge, Button, Card } from "../../components/ui";
import { useAIConfigStore } from "../../store/useAIConfigStore";
import { useLocalModelStore } from "../../store/useLocalModelStore";
import { LocalModelAIProvider } from "../../ai/localModelProvider";
import { LOCAL_MODEL_APPROX_SIZE, LOCAL_MODEL_LABEL, getOrCreateEngine, isWebGPUSupported, resetEngine } from "../../ai/localModel/engine";

export function LocalModelCard() {
  const localModelEnabled = useAIConfigStore((s) => s.localModelEnabled);
  const setLocalModelEnabled = useAIConfigStore((s) => s.setLocalModelEnabled);
  const status = useLocalModelStore((s) => s.status);
  const progress = useLocalModelStore((s) => s.progress);
  const progressText = useLocalModelStore((s) => s.progressText);
  const loadError = useLocalModelStore((s) => s.error);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  const webGPUSupported = isWebGPUSupported();

  // Previously enabled in an earlier session — the flag persisted, but the
  // engine itself is per-tab, so re-initialize it (fast: the model weights
  // are already cached by the browser, this just re-attaches to them).
  useEffect(() => {
    if (!localModelEnabled || status !== "idle" || !webGPUSupported) return;
    const store = useLocalModelStore.getState();
    store.setLoading(0, "Reloading local model…");
    getOrCreateEngine((report) => store.setLoading(report.progress, report.text))
      .then(() => store.setReady())
      .catch((err) => store.setError(err instanceof Error ? err.message : "Failed to reload the local model."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleEnable() {
    const store = useLocalModelStore.getState();
    store.setLoading(0, "Starting…");
    try {
      await getOrCreateEngine((report) => store.setLoading(report.progress, report.text));
      store.setReady();
      setLocalModelEnabled(true);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : "Failed to load the local model.");
    }
  }

  function handleDisable() {
    setLocalModelEnabled(false);
    resetEngine();
    useLocalModelStore.getState().reset();
    setTestResult("idle");
  }

  async function testConnection() {
    setTesting(true);
    setTestResult("idle");
    try {
      const provider = new LocalModelAIProvider();
      const res = await provider.chat("Reply with a short greeting to confirm you're working.", {
        personaId: "assistant",
        facts: { companyName: "Mero" },
      });
      setTestResult("success");
      setTestMessage(res.content);
    } catch (err) {
      setTestResult("error");
      setTestMessage(err instanceof Error ? err.message : "Local model test failed.");
    } finally {
      setTesting(false);
    }
  }

  return (
    <Card className="space-y-3 p-6">
      <div>
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <Cpu className="h-3.5 w-3.5" /> Run AI in this browser (no key, ever)
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
          Downloads and runs {LOCAL_MODEL_LABEL} ({LOCAL_MODEL_APPROX_SIZE}) directly in this browser via WebGPU.
          Genuinely generated text — no scripted templates — with no API key, no backend, and no network call once
          it's loaded. Quality is noticeably below Claude given the model's small size; that's the honest tradeoff
          for zero cost and zero setup beyond the one-time download.
        </p>
      </div>

      {!webGPUSupported && (
        <div className="flex items-start gap-2 rounded-lg bg-[#f8ebe9] px-3 py-2.5 text-[12px] text-rose-500">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>This browser doesn't support WebGPU, which this mode requires. Try a recent Chrome or Edge on desktop.</span>
        </div>
      )}

      {webGPUSupported && status === "loading" && (
        <div className="space-y-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-dim">
            <div className="h-full rounded-full bg-moss-500 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <p className="text-[12px] text-ink-faint">{progressText || "Loading…"}</p>
        </div>
      )}

      {loadError && status === "error" && (
        <div className="flex items-start gap-2 rounded-lg bg-[#f8ebe9] px-3 py-2.5 text-[12px] text-rose-500">
          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {testResult !== "idle" && (
        <div className={clsx("flex items-start gap-2 rounded-lg px-3 py-2.5 text-[12.5px]", testResult === "success" ? "bg-moss-50 text-moss-700" : "bg-[#f8ebe9] text-rose-500")}>
          {testResult === "success" ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
          <span>{testMessage}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!localModelEnabled ? (
          <Button size="sm" onClick={handleEnable} disabled={!webGPUSupported || status === "loading"}>
            {status === "loading" ? "Downloading…" : "Download & enable"}
          </Button>
        ) : (
          <>
            <Badge tone="moss">
              <CheckCircle2 className="h-3 w-3" /> Local AI active
            </Badge>
            <Button size="sm" variant="secondary" onClick={testConnection} disabled={testing}>
              {testing ? "Testing…" : "Test"}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDisable}>
              Disable
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
