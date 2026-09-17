import { useMemo, useState } from "react";
import { AIOrchestrator } from "../../ai/orchestrator";
import { resolveAIProvider } from "../../ai/resolveProvider";
import { demoProvider } from "../../ai/demoProvider";
import { ASSISTANT_PERSONA } from "../../ai/personas";
import type { AIResponse } from "../../ai/provider";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

const THREAD_ID = "assistant";

/** A single AI assistant chat, shared across every surface (the ⌘K command bar and the Overview panel show the same thread). */
export function useAIChat() {
  const [sending, setSending] = useState(false);
  const company = useWorkspaceStore((s) => s.company);
  const addChatMessage = useWorkspaceStore((s) => s.addChatMessage);
  const chatMessages = useWorkspaceStore((s) => s.chatMessages);
  const messages = useMemo(() => chatMessages.filter((m) => m.threadId === THREAD_ID), [chatMessages]);

  async function send(message: string) {
    if (!message.trim() || !company) return;
    addChatMessage({ threadId: THREAD_ID, role: "user", content: message, isDemo: false });
    setSending(true);
    try {
      const facts: Record<string, string> = {
        companyName: company.name,
        companyDescription: company.description,
        industry: company.industry,
        targetAudience: company.targetAudience,
        brandVoice: company.brand.voice,
        personaName: ASSISTANT_PERSONA.name,
        personaTitle: ASSISTANT_PERSONA.title,
        personaTone: ASSISTANT_PERSONA.tone,
        personaFocusAreas: ASSISTANT_PERSONA.focusAreas.join(", "),
        // No connected data source exists yet — providers should treat this
        // as false and avoid inventing specific business metrics.
        hasConnectedData: "false",
      };
      // Short recent history so a live backend has conversational context.
      const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));

      let res: AIResponse;
      try {
        const orchestrator = new AIOrchestrator(resolveAIProvider());
        res = await orchestrator.chat(ASSISTANT_PERSONA.id, message, { facts, history });
      } catch (err) {
        // Live backend misconfigured/unreachable — degrade to demo rather than break the chat.
        const fallback = await demoProvider.chat(message, { personaId: ASSISTANT_PERSONA.id, facts, history });
        const reason = err instanceof Error ? err.message : "Live AI is unreachable right now.";
        res = { content: `${fallback.content}\n\n(${reason} Showing a demo response instead.)`, isDemo: true };
      }

      // Small delay so the reply feels considered rather than instant.
      await new Promise((r) => setTimeout(r, 380));
      addChatMessage({ threadId: THREAD_ID, role: "assistant", content: res.content, isDemo: res.isDemo });
    } finally {
      setSending(false);
    }
  }

  return { messages, send, sending };
}
