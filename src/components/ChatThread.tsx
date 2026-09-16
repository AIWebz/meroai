import { useState } from "react";
import { ArrowUp } from "lucide-react";
import clsx from "clsx";
import type { ChatMessage } from "../types";
import { DemoTag } from "./ui";

export function ChatThread({
  messages,
  onSend,
  sending,
  placeholder = "Send a message…",
  emptyState,
}: {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  sending: boolean;
  placeholder?: string;
  emptyState?: React.ReactNode;
}) {
  const [draft, setDraft] = useState("");

  function submit() {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mero-scrollbar flex-1 space-y-4 overflow-y-auto px-1 py-2">
        {messages.length === 0 && emptyState}
        {messages.map((m) => (
          <div key={m.id} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={clsx(
                "max-w-[80%] animate-fade-up rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed",
                m.role === "user" ? "bg-ink text-paper" : "border border-line bg-surface text-ink"
              )}
            >
              {m.content}
              {m.role === "assistant" && m.isDemo && (
                <div className="mt-1.5">
                  <DemoTag />
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl border border-line bg-surface px-4 py-3">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-ink-faint [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-ink-faint [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-ink-faint [animation-delay:240ms]" />
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2 rounded-2xl border border-line bg-surface p-2 pl-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder={placeholder}
          className="max-h-32 flex-1 resize-none bg-transparent py-2 text-[14px] text-ink placeholder:text-ink-faint/70 outline-none"
        />
        <button
          onClick={submit}
          disabled={!draft.trim() || sending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-transform disabled:opacity-30 enabled:hover:scale-105"
          aria-label="Send message"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
