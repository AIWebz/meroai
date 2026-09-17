import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { useUIStore } from "../store/useUIStore";
import { useAIChat } from "../features/ai/useAIChat";
import { DemoTag } from "./ui";

const EXAMPLES = [
  "What should I focus on today?",
  "Help me name a new product",
  "What opportunities do we have?",
  "How do I publish my site?",
];

export function CommandBar() {
  const open = useUIStore((s) => s.commandBarOpen);
  const setOpen = useUIStore((s) => s.setCommandBarOpen);
  const { messages, send, sending } = useAIChat();
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const last = messages[messages.length - 1];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 20);
  }, [open]);

  if (!open) return null;

  function submit() {
    if (!draft.trim()) return;
    send(draft.trim());
    setDraft("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/30 px-4 pt-[12vh] backdrop-blur-[2px]" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-xl animate-scale-in rounded-2xl border border-line bg-surface shadow-[var(--shadow-pop)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Sparkles className="h-4 w-4 shrink-0 text-moss-500" />
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Ask Mero anything…"
            className="flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-faint/70 outline-none"
          />
          <button onClick={() => setOpen(false)} className="rounded-md p-1 text-ink-faint hover:bg-paper-dim" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-4">
          {last ? (
            <div className="space-y-3">
              {messages.slice(-2).map((m) => (
                <div key={m.id} className={m.role === "user" ? "text-[13.5px] font-medium text-ink" : "rounded-xl bg-paper-dim p-3 text-[13.5px] leading-relaxed text-ink-soft"}>
                  {m.content}
                  {m.role === "assistant" && m.isDemo && (
                    <div className="mt-2">
                      <DemoTag />
                    </div>
                  )}
                </div>
              ))}
              {sending && <p className="text-[13px] text-ink-faint">Mero is thinking…</p>}
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="mb-2 text-[11.5px] font-medium uppercase tracking-wide text-ink-faint">Try asking</p>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => send(ex)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-[13.5px] text-ink-soft hover:bg-paper-dim"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
          <button
            onClick={() => {
              setOpen(false);
              navigate("/app");
            }}
            className="text-[12.5px] font-medium text-moss-600 hover:text-moss-700"
          >
            Open full chat
          </button>
          <button
            onClick={submit}
            disabled={!draft.trim()}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-paper disabled:opacity-30"
            aria-label="Send"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
