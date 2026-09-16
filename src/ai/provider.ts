// ---------------------------------------------------------------------------
// AIProvider — the single seam between Mero's UI and "an AI that thinks".
//
// Mero is deployed as a static site (GitHub Pages). A private AI API key can
// NEVER be safely embedded in static frontend JavaScript — anyone can read it
// out of the shipped bundle. So this app ships two providers:
//
//   - DemoAIProvider (./demoProvider.ts)    — local, no network, always available.
//   - BackendAIProvider (./backendProvider.ts) — calls a secure backend YOU
//     deploy (see server/mero-ai-backend for a ready-to-deploy Cloudflare
//     Worker). The API key lives only on that backend, never in the browser.
//
// src/ai/resolveProvider.ts picks between them based on whether the user has
// configured a backend URL in Settings > AI. Nothing above this seam —
// AIOrchestrator, employee chat, the AI CEO — needs to know which one is active.
// ---------------------------------------------------------------------------

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIRequestContext {
  /** Which persona is answering: 'ceo' or an employee role key. */
  personaId: string;
  /** Freeform facts the provider may use to ground its answer (company info, etc). */
  facts?: Record<string, string>;
  history?: AIMessage[];
}

export interface AIResponse {
  content: string;
  /** True when this response was produced locally without a real model. */
  isDemo: boolean;
}

export interface AIProvider {
  readonly id: string;
  readonly isLive: boolean;
  /** Generate a conversational reply for a given persona + message. */
  chat(message: string, context: AIRequestContext): Promise<AIResponse>;
}
