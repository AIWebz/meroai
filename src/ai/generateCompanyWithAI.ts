import type { AIProvider } from "./provider";
import type { BusinessModel, ProductType } from "../types";

// ---------------------------------------------------------------------------
// Asks the active live AIProvider to design the entire company — name,
// brand, offerings, goals, and website copy — grounded in the founder's own
// free-text description and their tool/shop choice. Not a template: this is
// a single structured-JSON generation used once, right after the idea step.
// Returns null (triggering a deterministic fallback in companyGenerator.ts)
// if the provider errors or doesn't return valid, parseable content. Small
// local models in particular won't always follow the JSON format reliably;
// this is a best-effort real attempt, not a guarantee, and failure is
// handled honestly rather than silently faked.
// ---------------------------------------------------------------------------

const BUSINESS_MODELS: BusinessModel[] = ["ecommerce", "subscription", "marketplace", "saas", "services", "content", "other"];

export interface AICompanyContent {
  name: string;
  tagline: string;
  description: string;
  industry: string;
  targetAudience: string;
  businessModel: BusinessModel | null;
  brandPersonality: string[];
  brandVoice: string;
  brandColors: { name: string; hex: string }[];
  logoConcept: string;
  offerings: { name: string; description: string; pricingConcept: string; positioning: string }[];
  goalLaunch: string;
  goalCustomer: string;
  goalRevenue: string;
  goalGrowth: string;
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

function isHexColorArray(items: unknown): items is { name: string; hex: string }[] {
  return isStringArrayOf(items, ["name", "hex"]) && (items as { hex: string }[]).every((c) => /^#[0-9a-fA-F]{3,6}$/.test(c.hex));
}

function isValidContent(value: unknown): value is AICompanyContent {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === "string" &&
    typeof v.tagline === "string" &&
    typeof v.description === "string" &&
    typeof v.industry === "string" &&
    typeof v.targetAudience === "string" &&
    Array.isArray(v.brandPersonality) &&
    v.brandPersonality.every((p) => typeof p === "string") &&
    typeof v.brandVoice === "string" &&
    isHexColorArray(v.brandColors) &&
    typeof v.logoConcept === "string" &&
    isStringArrayOf(v.offerings, ["name", "description", "pricingConcept", "positioning"]) &&
    typeof v.goalLaunch === "string" &&
    typeof v.goalCustomer === "string" &&
    typeof v.goalRevenue === "string" &&
    typeof v.goalGrowth === "string" &&
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

export async function generateCompanyWithAI(provider: AIProvider, idea: string, productType: ProductType): Promise<AICompanyContent | null> {
  const productTypeGuidance =
    productType === "tool"
      ? `This is a TOOL: a piece of software people use to get something done, not a physical/curated product catalog. "offerings" should be 2 pricing tiers/plans (e.g. a free tier and a paid tier), and "features" should describe what the tool actually does.`
      : `This is a SHOP: it sells products. "offerings" should be 2-3 real products with prices, and "features" should describe why to buy from this shop.`;

  const prompt = [
    `Design a complete company from this founder's description:`,
    `"${idea}"`,
    ``,
    productTypeGuidance,
    ``,
    `Reply with ONLY a single JSON object (no markdown fences, no commentary) with exactly these keys:`,
    `{`,
    `"name": string, "tagline": string, "description": string, "industry": string, "targetAudience": string,`,
    `"businessModel": one of ${JSON.stringify(BUSINESS_MODELS)},`,
    `"brandPersonality": [3 short adjectives], "brandVoice": string, "brandColors": [{"name": string, "hex": "#rrggbb"} x3], "logoConcept": string,`,
    `"offerings": [{"name": string, "description": string, "pricingConcept": string, "positioning": string} x2-3],`,
    `"goalLaunch": string, "goalCustomer": string, "goalRevenue": string, "goalGrowth": string,`,
    `"heroHeadline": string, "heroSubheadline": string, "aboutHeading": string, "aboutText": string,`,
    `"featuresHeading": string, "features": [{"title": string, "description": string} x3],`,
    `"faqHeading": string, "faq": [{"question": string, "answer": string} x3],`,
    `"ctaHeading": string, "ctaSubheading": string`,
    `}`,
    `Keep headlines/names under 8 words and every other value under 30 words. Reflect what the founder actually described — don't invent unrelated products or claim numbers/results the company doesn't have yet. brandColors must be real hex codes forming a cohesive, tasteful palette (one dark, one light/neutral, one accent).`,
  ].join("\n");

  let raw: string;
  try {
    const res = await provider.chat(prompt, {
      personaId: "assistant",
      facts: { companyName: "the new company", responseFormat: "json" },
    });
    raw = res.content;
  } catch {
    return null;
  }

  const parsed = extractJSON(raw);
  if (!isValidContent(parsed)) return null;
  return { ...parsed, businessModel: BUSINESS_MODELS.includes(parsed.businessModel as BusinessModel) ? parsed.businessModel : null };
}
