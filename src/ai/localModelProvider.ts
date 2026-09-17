import type { AIProvider, AIRequestContext, AIResponse } from "./provider";
import { buildSystemPrompt } from "./systemPrompt";
import { getOrCreateEngine } from "./localModel/engine";

// ---------------------------------------------------------------------------
// LocalModelAIProvider — runs a small open-weight language model entirely
// inside the browser via WebGPU (see ./localModel/engine.ts). No API key,
// no backend, no network call once the model is loaded. Genuinely generated
// text, not scripted — quality is well below Claude given the model's size,
// which is the honest tradeoff for zero cost and zero external dependency.
// ---------------------------------------------------------------------------

const MAX_HISTORY_MESSAGES = 8;
const CHAT_MAX_TOKENS = 300;
const JSON_MAX_TOKENS = 900;

export class LocalModelAIProvider implements AIProvider {
  readonly id = "local-model";
  readonly isLive = true;

  async chat(message: string, context: AIRequestContext): Promise<AIResponse> {
    const engine = await getOrCreateEngine();
    const facts = context.facts ?? {};
    const history = (context.history ?? [])
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-MAX_HISTORY_MESSAGES)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const completion = await engine.chat.completions.create({
      messages: [
        { role: "system", content: buildSystemPrompt(facts) },
        ...history,
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: facts.responseFormat === "json" ? JSON_MAX_TOKENS : CHAT_MAX_TOKENS,
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!content) {
      throw new Error("The local model didn't return a response.");
    }
    return { content, isDemo: false };
  }
}
