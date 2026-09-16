import Anthropic from "@anthropic-ai/sdk";

// ---------------------------------------------------------------------------
// Mero AI backend — a small Cloudflare Worker that proxies chat requests from
// the static Mero frontend to the real Claude API.
//
// This is the ONLY place an Anthropic API key should ever live. It is set as
// a Worker secret (`wrangler secret put ANTHROPIC_API_KEY`), never committed,
// and never sent to the browser. See ../README.md for deploy instructions.
// ---------------------------------------------------------------------------

export interface Env {
  ANTHROPIC_API_KEY: string;
  MERO_SHARED_SECRET?: string;
  MERO_MODEL?: string;
}

interface IncomingHistoryMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequestBody {
  message?: string;
  context?: {
    personaId?: string;
    facts?: Record<string, string>;
    history?: IncomingHistoryMessage[];
  };
}

const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_MESSAGES = 8;
const DEFAULT_MODEL = "claude-opus-5";

function corsHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Mero-Secret",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonResponse(data: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

function buildSystemPrompt(facts: Record<string, string>): string {
  const companyName = facts.companyName || "the company";
  const personaName = facts.personaName || "Mero";
  const personaTitle = facts.personaTitle || "AI CEO";
  const personaTone = facts.personaTone || "clear, honest, and helpful";
  const personaFocusAreas = facts.personaFocusAreas || "coordinating the company";
  const hasConnectedData = facts.hasConnectedData === "true";

  const lines = [
    `You are ${personaName}, the ${personaTitle} at ${companyName}, a company built on the Mero platform ("build a company, let AI run it").`,
    `Your tone is ${personaTone}. Your focus areas: ${personaFocusAreas}.`,
    facts.companyDescription && `Company description: ${facts.companyDescription}`,
    facts.industry && `Industry: ${facts.industry}`,
    facts.targetAudience && `Target audience: ${facts.targetAudience}`,
    facts.brandVoice && `Brand voice: ${facts.brandVoice}`,
    `Connected data sources: ${hasConnectedData ? "yes, real data is connected" : "none yet — never invent a specific revenue, customer, or traffic number"}.`,
    "",
    "Stay in character as this persona. Reply in 2-5 sentences unless the user clearly wants more detail.",
    "If asked about a metric that requires connected data you don't have, say so honestly instead of making up a number.",
    "If asked to take a consequential action (spend money, publish content, send email or a campaign, change pricing), explain that it would go through Mero's Approval Center rather than claiming you already did it.",
  ].filter((line): line is string => Boolean(line));

  return lines.join("\n");
}

async function handleChat(request: Request, env: Env, origin: string | null): Promise<Response> {
  if (!env.ANTHROPIC_API_KEY) {
    return jsonResponse(
      { error: "This worker is not configured: missing ANTHROPIC_API_KEY. Run `wrangler secret put ANTHROPIC_API_KEY`." },
      500,
      origin
    );
  }

  if (env.MERO_SHARED_SECRET) {
    const provided = request.headers.get("X-Mero-Secret");
    if (provided !== env.MERO_SHARED_SECRET) {
      return jsonResponse({ error: "Unauthorized." }, 401, origin);
    }
  }

  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400, origin);
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return jsonResponse({ error: "Missing 'message'." }, 400, origin);
  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters).` }, 400, origin);
  }

  const facts = body.context?.facts ?? {};
  const history = Array.isArray(body.context?.history) ? body.context!.history!.slice(-MAX_HISTORY_MESSAGES) : [];

  const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  try {
    // Note: max_tokens is kept modest since chat replies are short (2-5
    // sentences per the system prompt) — this bounds latency and cost per
    // message. Effort tuning (output_config.effort) is available on the beta
    // Messages API if you want to trade quality for lower cost; omitted here
    // to keep this reference backend on the stable, non-beta endpoint.
    const response = await anthropic.messages.create({
      model: env.MERO_MODEL || DEFAULT_MODEL,
      max_tokens: 1024,
      system: buildSystemPrompt(facts),
      messages: [
        ...history
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: message },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const content = textBlock && "text" in textBlock ? textBlock.text.trim() : "";
    if (!content) {
      return jsonResponse({ error: "The model did not return a text response." }, 502, origin);
    }

    return jsonResponse({ content }, 200, origin);
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      return jsonResponse({ error: `Claude API error: ${err.message}` }, err.status ?? 502, origin);
    }
    return jsonResponse({ error: "Unexpected error calling the AI backend." }, 500, origin);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed. POST a chat message to this endpoint." }, 405, origin);
    }

    return handleChat(request, env, origin);
  },
};
