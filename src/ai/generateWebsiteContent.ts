import type { AIProvider } from "./provider";
import type { CompanyBlueprint } from "../data/companyGenerator";

// ---------------------------------------------------------------------------
// Asks the active live AIProvider to write the company's website copy,
// grounded in the founder's own free-text description — not a template.
// Returns null (triggering a deterministic fallback in websiteGenerator.ts)
// if the provider errors or doesn't return valid, parseable content. Small
// local models in particular won't always follow the JSON format reliably;
// this is a best-effort real attempt, not a guarantee, and failure is
// handled honestly rather than silently faked.
// ---------------------------------------------------------------------------

export interface AIWebsiteContent {
  heroHeadline: string;
  heroSubheadline: string;
  aboutHeading: string;
  aboutText: string;
  featuresHeading: string;
  features: { title: string; description: string }[];
  faqHeading: string;
  faq: { question: string; answer: string }[];
  ctaHeading: string;
  ctaSubheading: string;
}

function isStringArrayOf(items: unknown, keys: string[]): boolean {
  return (
    Array.isArray(items) &&
    items.length > 0 &&
    items.every((it) => it && typeof it === "object" && keys.every((k) => typeof (it as Record<string, unknown>)[k] === "string"))
  );
}

function isValidContent(value: unknown): value is AIWebsiteContent {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.heroHeadline === "string" &&
    typeof v.heroSubheadline === "string" &&
    typeof v.aboutHeading === "string" &&
    typeof v.aboutText === "string" &&
    typeof v.featuresHeading === "string" &&
    isStringArrayOf(v.features, ["title", "description"]) &&
    typeof v.faqHeading === "string" &&
    isStringArrayOf(v.faq, ["question", "answer"]) &&
    typeof v.ctaHeading === "string" &&
    typeof v.ctaSubheading === "string"
  );
}

function extractJSON(text: string): unknown | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const braceMatch = candidate.match(/\{[\s\S]*\}/);
  if (!braceMatch) return null;
  try {
    return JSON.parse(braceMatch[0]);
  } catch {
    return null;
  }
}

export async function generateWebsiteContentWithAI(
  provider: AIProvider,
  originalIdea: string,
  blueprint: CompanyBlueprint
): Promise<AIWebsiteContent | null> {
  const prompt = [
    `Write website copy for a new company, based on this description from its founder:`,
    `"${originalIdea}"`,
    ``,
    `Company name: ${blueprint.name}`,
    `Industry: ${blueprint.industry}`,
    `Target audience: ${blueprint.targetAudience}`,
    `Brand voice: ${blueprint.brand.voice}`,
    `Offerings: ${blueprint.offerings.map((o) => `${o.name} (${o.pricingConcept}) — ${o.description}`).join("; ")}`,
    ``,
    `Reply with ONLY a single JSON object (no markdown fences, no commentary) with exactly these keys:`,
    `{"heroHeadline": string, "heroSubheadline": string, "aboutHeading": string, "aboutText": string, "featuresHeading": string, "features": [{"title": string, "description": string}], "faqHeading": string, "faq": [{"question": string, "answer": string}], "ctaHeading": string, "ctaSubheading": string}`,
    `Include exactly 3 items in "features" and exactly 3 items in "faq". Keep headlines under 8 words and every other value under 30 words. Write in the brand voice above, and reflect what the founder actually described — don't invent unrelated products or claim numbers/results the company doesn't have yet.`,
  ].join("\n");

  let raw: string;
  try {
    const res = await provider.chat(prompt, {
      personaId: "developer",
      facts: { companyName: blueprint.name, responseFormat: "json" },
    });
    raw = res.content;
  } catch {
    return null;
  }

  const parsed = extractJSON(raw);
  return isValidContent(parsed) ? parsed : null;
}
