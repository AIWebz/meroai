import { useMemo, useState } from "react";
import { AIOrchestrator } from "../../ai/orchestrator";
import { resolveAIProvider } from "../../ai/resolveProvider";
import { demoProvider } from "../../ai/demoProvider";
import { personaFor } from "../../ai/personas";
import type { AIResponse } from "../../ai/provider";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

export function useAIChat(personaId: string, threadId: string) {
  const [sending, setSending] = useState(false);
  const company = useWorkspaceStore((s) => s.company);
  const integrations = useWorkspaceStore((s) => s.integrations);
  const addChatMessage = useWorkspaceStore((s) => s.addChatMessage);
  const chatMessages = useWorkspaceStore((s) => s.chatMessages);
  const messages = useMemo(() => chatMessages.filter((m) => m.threadId === threadId), [chatMessages, threadId]);

  async function send(message: string) {
    if (!message.trim() || !company) return;
    addChatMessage({ threadId, role: "user", content: message, isDemo: false });
    setSending(true);
    try {
      const hasConnectedData = integrations.some((i) => i.status === "connected");
      const persona = personaFor(personaId);
      const facts: Record<string, string> = {
        companyName: company.name,
        companyDescription: company.description,
        industry: company.industry,
        targetAudience: company.targetAudience,
        brandVoice: company.brand.voice,
        personaName: persona.name,
        personaTitle: persona.title,
        personaTone: persona.tone,
        personaFocusAreas: persona.focusAreas.join(", "),
        hasConnectedData: String(hasConnectedData),
      };
      // Short recent history so a live backend has conversational context.
      const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));

      let res: AIResponse;
      try {
        const orchestrator = new AIOrchestrator(resolveAIProvider());
        res = await orchestrator.chat(personaId, message, { facts, history });
      } catch (err) {
        // Live backend misconfigured/unreachable — degrade to demo rather than break the chat.
        const fallback = await demoProvider.chat(message, { personaId, facts, history });
        const reason = err instanceof Error ? err.message : "Live AI is unreachable right now.";
        res = { content: `${fallback.content}\n\n(${reason} Showing a demo response instead.)`, isDemo: true };
      }

      // Small delay so the reply feels considered rather than instant.
      await new Promise((r) => setTimeout(r, 380));
      addChatMessage({ threadId, role: "assistant", content: res.content, isDemo: res.isDemo });
    } finally {
      setSending(false);
    }
  }

  return { messages, send, sending };
}
