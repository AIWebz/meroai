// ---------------------------------------------------------------------------
// AIProvider — the single seam between Mero's UI and "an AI that thinks".
//
// Mero is deployed as a static site (GitHub Pages). A private AI API key
// can NEVER be safely embedded in static frontend JavaScript — anyone can
// read it out of the shipped bundle. So this app ships with a DemoAIProvider
// that produces realistic, clearly-labeled simulated responses using local
// logic only (no network calls, no secrets).
//
// To connect a real model later, implement this interface against a secure
// backend you control (e.g. a small server or edge function that holds the
// API key and proxies requests). Nothing above this seam — orchestrator,
// employees, chat UI — needs to change; swap the provider passed to
// `createOrchestrator` in src/ai/orchestrator.ts.
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

/**
 * Placeholder for a future live provider. Intentionally unimplemented in the
 * static build — wire this up to your own backend endpoint when one exists,
 * e.g.:
 *
 *   export class BackendAIProvider implements AIProvider {
 *     readonly id = "backend";
 *     readonly isLive = true;
 *     constructor(private endpoint: string) {}
 *     async chat(message, context) {
 *       const res = await fetch(this.endpoint, {
 *         method: "POST",
 *         headers: { "Content-Type": "application/json" },
 *         body: JSON.stringify({ message, context }),
 *       });
 *       if (!res.ok) throw new Error("AI backend request failed");
 *       return await res.json();
 *     }
 *   }
 *
 * The backend — not this repo — should hold any API key.
 */
export const LIVE_PROVIDER_NOTE =
  "Live AI requires a secure backend. This static build ships with demo intelligence only.";
