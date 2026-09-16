import { useMemo, useState } from "react";
import { orchestrator } from "../../ai/orchestrator";
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
      const res = await orchestrator.chat(personaId, message, {
        facts: { companyName: company.name, hasConnectedData: String(hasConnectedData) },
      });
      // Small delay so the reply feels considered rather than instant.
      await new Promise((r) => setTimeout(r, 380));
      addChatMessage({ threadId, role: "assistant", content: res.content, isDemo: res.isDemo });
    } finally {
      setSending(false);
    }
  }

  return { messages, send, sending };
}
