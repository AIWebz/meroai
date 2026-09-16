import type { AIProvider, AIRequestContext, AIResponse } from "./provider";
import { buildSystemPrompt } from "./systemPrompt";

// ---------------------------------------------------------------------------
// DirectBrowserAIProvider — calls the real Claude API straight from the
// browser using a key the user pastes into Settings > AI. No backend, no
// deploy step.
//
// The key is stored only in this browser's localStorage (see
// useAIConfigStore) and is sent only to Anthropic's API — never to any
// server of ours. This is the standard "bring your own key" pattern used by
// many local-first AI tools; it trades the stronger isolation of a server
// -side backend (server/mero-ai-backend) for zero setup. Anyone with access
// to this browser (or its dev tools) could read the key back out, so this
// mode isn't appropriate for a shared/public computer, and doesn't fit a
// publicly-shared deployment — each visitor would need their own key. For
// that case, use the backend provider instead.
// ---------------------------------------------------------------------------

const MODEL = "claude-opus-5";
const MAX_HISTORY_MESSAGES = 8;

export class DirectBrowserAIProvider implements AIProvider {
  readonly id = "direct-browser";
  readonly isLive = true;

  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(message: string, context: AIRequestContext): Promise<AIResponse> {
    // Lazily loaded so the SDK (and its dependency weight) is only fetched
    // by browsers that actually use this provider, not on every page load.
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: this.apiKey, dangerouslyAllowBrowser: true });
    const facts = context.facts ?? {};
    const history = (context.history ?? [])
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-MAX_HISTORY_MESSAGES)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: buildSystemPrompt(facts),
        messages: [...history, { role: "user" as const, content: message }],
      });

      const textBlock = response.content.find((block) => block.type === "text");
      const content = textBlock && "text" in textBlock ? textBlock.text.trim() : "";
      if (!content) {
        throw new Error("The model did not return a text response.");
      }
      return { content, isDemo: false };
    } catch (err) {
      if (err instanceof Anthropic.APIError) {
        throw new Error(`Claude API error: ${err.message}`);
      }
      throw err instanceof Error ? err : new Error("Unexpected error calling Claude directly.");
    }
  }
}
