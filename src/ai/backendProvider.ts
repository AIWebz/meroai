import type { AIProvider, AIRequestContext, AIResponse } from "./provider";

// ---------------------------------------------------------------------------
// BackendAIProvider — talks to a secure backend you deploy yourself (see
// server/mero-ai-backend for a ready-to-deploy Cloudflare Worker that calls
// the real Claude API). The frontend never sees an AI API key: it only holds
// this backend's URL and an optional shared secret, both entered by the user
// in Settings > AI and stored in localStorage like any other app setting.
// ---------------------------------------------------------------------------

export class BackendAIProvider implements AIProvider {
  readonly id = "backend";
  readonly isLive = true;

  private endpoint: string;
  private sharedSecret: string;

  constructor(endpoint: string, sharedSecret: string) {
    this.endpoint = endpoint;
    this.sharedSecret = sharedSecret;
  }

  async chat(message: string, context: AIRequestContext): Promise<AIResponse> {
    let res: Response;
    try {
      res = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.sharedSecret ? { "X-Mero-Secret": this.sharedSecret } : {}),
        },
        body: JSON.stringify({ message, context }),
      });
    } catch {
      throw new Error("Could not reach the AI backend. Check the URL in Settings > AI and that the worker is deployed.");
    }

    if (!res.ok) {
      let detail = "";
      try {
        const body = await res.json();
        detail = typeof body?.error === "string" ? body.error : "";
      } catch {
        // ignore — fall through to a generic message
      }
      throw new Error(detail || `AI backend request failed (HTTP ${res.status}).`);
    }

    const data = await res.json().catch(() => null);
    if (!data || typeof data.content !== "string") {
      throw new Error("AI backend returned an unexpected response shape.");
    }

    return { content: data.content, isDemo: false };
  }
}
