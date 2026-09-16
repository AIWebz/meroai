import type { AIProvider, AIRequestContext, AIResponse } from "./provider";
import { personaFor } from "./personas";

function includesAny(text: string, needles: string[]): boolean {
  const lower = text.toLowerCase();
  return needles.some((n) => lower.includes(n));
}

/**
 * DemoAIProvider produces realistic, persona-appropriate responses using
 * local pattern matching — no network calls, no API keys. It exists so the
 * static build can demonstrate the full product experience honestly: every
 * response it returns is flagged `isDemo: true` and the UI must label it.
 */
export class DemoAIProvider implements AIProvider {
  readonly id = "demo";
  readonly isLive = false;

  async chat(message: string, context: AIRequestContext): Promise<AIResponse> {
    const persona = personaFor(context.personaId);
    const facts = context.facts ?? {};
    const hasConnectedData = facts.hasConnectedData === "true";
    const companyName = facts.companyName ?? "your company";

    // Simulate a brief moment of "thinking" is handled by the caller (UI),
    // this function returns synchronously-derived content.
    let content: string;

    if (includesAny(message, ["slow", "declining", "down", "not working", "why aren't"])) {
      content = hasConnectedData
        ? `I looked at the connected data for ${companyName}. Before I speculate further, I'd want to isolate whether this is a traffic, conversion, or retention issue — I can start pulling that apart if you tell me which area to prioritize.`
        : `I've reviewed the available company information. There isn't enough connected data to determine the cause yet. I recommend connecting your sales, analytics, or CRM data so I can investigate properly instead of guessing.`;
    } else if (includesAny(message, ["what are you working on", "current task", "status", "update"])) {
      content = `Right now I'm focused on ${persona.focusAreas.slice(0, 2).join(" and ")}. I'll flag anything that needs your approval before I act on it.`;
    } else if (includesAny(message, ["focus", "priorit", "what should i do", "what should we do"])) {
      content = hasConnectedData
        ? `Based on what's connected, the highest-leverage thing right now is reviewing the items waiting in your Approval Center — a couple of them are time-sensitive.`
        : `Without connected data I can only reason from what you've told me. I'd start by finishing your company profile in Knowledge and connecting at least one data source — that unlocks real recommendations instead of general ones.`;
    } else if (includesAny(message, ["opportunit", "growth", "improve"])) {
      content = hasConnectedData
        ? `I'll keep scanning for patterns worth acting on and surface anything meaningful in the Opportunity Engine.`
        : `Opportunity detection needs real signal to work from — right now there's no connected data to analyze. Once you connect an integration, I'll start surfacing real opportunities instead of guesses.`;
    } else if (includesAny(message, ["hire", "employee", "workforce", "team"])) {
      content = `I recommend employees based on what ${companyName} actually needs — you can review and hire them from the Workforce page. I won't add anyone automatically.`;
    } else if (includesAny(message, ["website", "landing page", "site"])) {
      content = `I can help shape the website from here, but detailed edits — layout, copy, sections — are best done in the Website Builder, where I can apply changes directly to the page.`;
    } else if (includesAny(message, ["hello", "hi", "hey"])) {
      content = persona.greeting(companyName);
    } else {
      content = `I want to give you a grounded answer rather than a generic one. Could you say a bit more about what you're trying to figure out with ${persona.focusAreas[0]}?`;
    }

    return { content, isDemo: true };
  }
}

export const demoProvider = new DemoAIProvider();
