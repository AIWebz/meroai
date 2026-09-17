import type { BrandIdentity, BusinessModel, CompanyGoalSummary, Offering, ProductType } from "../types";
import type { AICompanyContent } from "../ai/generateCompanyWithAI";

// ---------------------------------------------------------------------------
// Company blueprint generator
//
// This is a deliberately simple, deterministic, rule-based text generator —
// NOT a call to a language model. It runs first, instantly, as a robust
// fallback base; the live AI (see ai/generateCompanyWithAI.ts) then overrides
// whichever fields it successfully generates on top of it. If AI generation
// fails entirely, this deterministic draft is what the user reviews — so the
// flow never breaks, even though live AI is required to get here.
// ---------------------------------------------------------------------------

export interface SiteCopy {
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

export interface CompanyBlueprint {
  name: string;
  tagline: string;
  description: string;
  industry: string;
  businessModel: BusinessModel;
  productType: ProductType;
  targetAudience: string;
  brand: BrandIdentity;
  offerings: Offering[];
  goalSummary: CompanyGoalSummary;
  /** Present once AI (or the deterministic fallback) has produced website copy. */
  siteCopy: SiteCopy;
}

interface IndustryProfile {
  keywords: string[];
  industry: string;
  businessModel: BusinessModel;
  audience: string;
  personality: string[];
  voice: string;
  palette: { name: string; hex: string }[];
}

const PROFILES: IndustryProfile[] = [
  {
    keywords: ["dog", "pet", "cat", "animal", "puppy"],
    industry: "Pet Products & Lifestyle",
    businessModel: "ecommerce",
    audience: "Modern, design-conscious pet owners who treat their pets as family",
    personality: ["Warm", "Premium", "Playful"],
    voice: "Friendly but polished — never cutesy, always considered.",
    palette: [
      { name: "Moss", hex: "#4f7d3f" },
      { name: "Sand", hex: "#e4d9bf" },
      { name: "Ink", hex: "#14140f" },
    ],
  },
  {
    keywords: ["saas", "software", "app", "platform", "tool", "dashboard", "api"],
    industry: "B2B Software",
    businessModel: "saas",
    audience: "Teams and operators looking to save time on a specific workflow",
    personality: ["Confident", "Clear", "Efficient"],
    voice: "Direct and jargon-free — explains value in plain language.",
    palette: [
      { name: "Ink", hex: "#14140f" },
      { name: "Moss", hex: "#3c6330" },
      { name: "Paper", hex: "#faf8f4" },
    ],
  },
  {
    keywords: ["coffee", "food", "restaurant", "bakery", "snack", "drink", "beverage"],
    industry: "Food & Beverage",
    businessModel: "ecommerce",
    audience: "Everyday consumers who care about quality and origin",
    personality: ["Craft", "Honest", "Inviting"],
    voice: "Sensory and grounded — talks about taste, origin, and care.",
    palette: [
      { name: "Clay", hex: "#a85c3c" },
      { name: "Cream", hex: "#f2efe8" },
      { name: "Ink", hex: "#14140f" },
    ],
  },
  {
    keywords: ["fashion", "clothing", "apparel", "wear", "accessories", "jewelry"],
    industry: "Fashion & Apparel",
    businessModel: "ecommerce",
    audience: "Style-conscious shoppers seeking distinctive, well-made pieces",
    personality: ["Refined", "Bold", "Timeless"],
    voice: "Editorial and confident, with restraint.",
    palette: [
      { name: "Ink", hex: "#14140f" },
      { name: "Amber", hex: "#c08a2c" },
      { name: "Paper", hex: "#faf8f4" },
    ],
  },
  {
    keywords: ["consult", "agency", "service", "studio", "firm"],
    industry: "Professional Services",
    businessModel: "services",
    audience: "Businesses that need specialized expertise without hiring in-house",
    personality: ["Trustworthy", "Sharp", "Reliable"],
    voice: "Confident and outcome-oriented.",
    palette: [
      { name: "Ink", hex: "#14140f" },
      { name: "Moss", hex: "#2f4e27" },
      { name: "Line", hex: "#e4e0d4" },
    ],
  },
  {
    keywords: ["course", "learn", "education", "coach", "community", "newsletter", "content", "media"],
    industry: "Content & Education",
    businessModel: "subscription",
    audience: "People actively trying to build a skill or stay informed",
    personality: ["Encouraging", "Sharp", "Accessible"],
    voice: "Clear, encouraging, and a little opinionated.",
    palette: [
      { name: "Amber", hex: "#c08a2c" },
      { name: "Ink", hex: "#14140f" },
      { name: "Paper", hex: "#faf8f4" },
    ],
  },
  {
    keywords: ["marketplace", "connect", "platform for", "booking", "rentals"],
    industry: "Marketplace",
    businessModel: "marketplace",
    audience: "Two sides of a market who currently struggle to find each other",
    personality: ["Trustworthy", "Efficient", "Neutral"],
    voice: "Balanced and clear — builds trust between both sides.",
    palette: [
      { name: "Moss", hex: "#4f7d3f" },
      { name: "Ink", hex: "#14140f" },
      { name: "Paper", hex: "#faf8f4" },
    ],
  },
];

const FALLBACK_PROFILE: IndustryProfile = {
  keywords: [],
  industry: "General Business",
  businessModel: "other",
  audience: "Early customers who match the problem this company solves",
  personality: ["Clear", "Confident", "Considered"],
  voice: "Plain-spoken and specific — earns trust by being useful.",
  palette: [
    { name: "Ink", hex: "#14140f" },
    { name: "Moss", hex: "#4f7d3f" },
    { name: "Paper", hex: "#faf8f4" },
  ],
};

function detectProfile(idea: string): IndustryProfile {
  const lower = idea.toLowerCase();
  let best: IndustryProfile | null = null;
  let bestScore = 0;
  for (const profile of PROFILES) {
    const score = profile.keywords.filter((k) => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = profile;
    }
  }
  return best ?? FALLBACK_PROFILE;
}

function extractSubject(idea: string): string {
  // Pull a short noun-ish phrase out of the idea to seed a name, e.g.
  // "a premium dog travel accessories company" -> "dog travel accessories"
  const cleaned = idea
    .replace(/^i want to build( a| an)?/i, "")
    .replace(/^build( a| an)?/i, "")
    .replace(/\bcompany\b/gi, "")
    .replace(/\bstartup\b/gi, "")
    .replace(/[.!?]+$/, "")
    .trim();
  const STOP_BOUNDARY = new Set(["for", "to", "with", "that", "who", "which", "and", "targeting", "aimed"]);
  const words = cleaned.split(/\s+/).filter(Boolean);
  const subjectWords: string[] = [];
  for (const w of words.slice(0, 6)) {
    if (subjectWords.length > 0 && STOP_BOUNDARY.has(w.toLowerCase())) break;
    subjectWords.push(w);
  }
  return subjectWords.join(" ") || "your idea";
}

const NAME_PREFIXES = ["Lumen", "Arbor", "Northfield", "Quietly", "Harbor", "Fernway", "Solace", "Kindred", "Everline", "Mosswood"];
const NAME_SUFFIXES = ["Co", "Studio", "House", "Collective", "Labs", "Supply Co."];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function generateName(idea: string, subject: string): string {
  const h = hashString(idea);
  const words = subject.split(" ").filter((w) => w.length > 2);
  const keyWord = words[0] ? words[0][0].toUpperCase() + words[0].slice(1) : NAME_PREFIXES[h % NAME_PREFIXES.length];
  const prefix = NAME_PREFIXES[h % NAME_PREFIXES.length];
  const suffix = NAME_SUFFIXES[Math.floor(h / 7) % NAME_SUFFIXES.length];
  const useKeyWord = h % 2 === 0 && keyWord.length <= 12;
  return useKeyWord ? `${keyWord} ${suffix}` : `${prefix} ${suffix}`;
}

export function generateBlueprint(idea: string, productType: ProductType): CompanyBlueprint {
  const trimmedIdea = idea.trim();
  const profile = detectProfile(trimmedIdea);
  const subject = extractSubject(trimmedIdea);
  const name = generateName(trimmedIdea, subject);

  const tagline = `${capitalize(subject)}, built for people who care about the details.`;

  const businessModel: BusinessModel = productType === "tool" ? "saas" : profile.businessModel === "saas" ? "ecommerce" : profile.businessModel;

  const description = `${name} is a ${businessModel === "saas" ? "software" : businessModel} company built around: "${trimmedIdea}". It serves ${profile.audience.toLowerCase()}.`;

  const offerings: Offering[] = buildOfferings(productType, subject);

  const goalSummary: CompanyGoalSummary = {
    launch: `Launch your ${productType} and first offering within 30 days.`,
    customer: "Reach your first 10 customers.",
    revenue: "Reach $1,000 in monthly revenue.",
    growth: "Establish a repeatable channel for new customers.",
  };

  const siteCopy = fallbackSiteCopy(name, tagline, description, offerings, goalSummary, productType);

  return {
    name,
    tagline,
    description,
    industry: profile.industry,
    businessModel,
    productType,
    targetAudience: profile.audience,
    brand: {
      personality: profile.personality,
      voice: profile.voice,
      colors: profile.palette,
      logoConcept: `A simple wordmark for "${name}" set in a confident serif, paired with a minimal mark inspired by ${subject.split(" ")[0] || "the idea"}.`,
    },
    offerings,
    goalSummary,
    siteCopy,
  };
}

function buildOfferings(productType: ProductType, subject: string): Offering[] {
  const base = capitalize(subject.split(" ").slice(-2).join(" ")) || "Core Offering";
  if (productType === "tool") {
    return [
      { id: "off_1", name: "Free", description: `Try the core of ${base} at no cost.`, pricingConcept: "$0", positioning: "For individuals getting started." },
      { id: "off_2", name: "Pro", description: `Full access to ${base} with no limits.`, pricingConcept: "$19/month", positioning: "For people and teams who rely on it daily." },
    ];
  }
  return [
    { id: "off_1", name: base, description: `The flagship product built around ${base.toLowerCase()}.`, pricingConcept: "$45", positioning: "An accessible entry point that reflects the brand's quality." },
    { id: "off_2", name: `${base} — Premium`, description: `An elevated version of ${base.toLowerCase()} for the highest-intent customers.`, pricingConcept: "$95", positioning: "For customers who want the best available option." },
  ];
}

function fallbackSiteCopy(
  name: string,
  tagline: string,
  description: string,
  offerings: Offering[],
  goalSummary: CompanyGoalSummary,
  productType: ProductType
): SiteCopy {
  return {
    heroHeadline: name,
    heroSubheadline: tagline,
    aboutHeading: "About",
    aboutText: description,
    featuresHeading: productType === "tool" ? "Why " + name : "Why shop " + name,
    features: offerings.map((o) => ({ title: o.name, description: o.description })),
    faqHeading: "Frequently asked questions",
    faq: [{ question: `What does ${name} offer?`, answer: offerings[0]?.description ?? "Our core offering." }],
    ctaHeading: "Ready to get started?",
    ctaSubheading: goalSummary.customer,
  };
}

/** Overlays whatever fields the live AI successfully generated onto the deterministic draft. Missing/invalid AI fields keep the deterministic value — never a blank. */
export function applyAIContent(blueprint: CompanyBlueprint, ai: AICompanyContent | null): CompanyBlueprint {
  if (!ai) return blueprint;
  return {
    ...blueprint,
    name: ai.name || blueprint.name,
    tagline: ai.tagline || blueprint.tagline,
    description: ai.description || blueprint.description,
    industry: ai.industry || blueprint.industry,
    targetAudience: ai.targetAudience || blueprint.targetAudience,
    businessModel: ai.businessModel ?? blueprint.businessModel,
    brand: {
      personality: ai.brandPersonality?.length ? ai.brandPersonality : blueprint.brand.personality,
      voice: ai.brandVoice || blueprint.brand.voice,
      colors: ai.brandColors?.length ? ai.brandColors : blueprint.brand.colors,
      logoConcept: ai.logoConcept || blueprint.brand.logoConcept,
    },
    offerings: ai.offerings?.length
      ? ai.offerings.map((o, i) => ({ id: blueprint.offerings[i]?.id ?? `off_${i + 1}`, ...o }))
      : blueprint.offerings,
    goalSummary: {
      launch: ai.goalLaunch || blueprint.goalSummary.launch,
      customer: ai.goalCustomer || blueprint.goalSummary.customer,
      revenue: ai.goalRevenue || blueprint.goalSummary.revenue,
      growth: ai.goalGrowth || blueprint.goalSummary.growth,
    },
    siteCopy: {
      heroHeadline: ai.heroHeadline || blueprint.siteCopy.heroHeadline,
      heroSubheadline: ai.heroSubheadline || blueprint.siteCopy.heroSubheadline,
      aboutHeading: ai.aboutHeading || blueprint.siteCopy.aboutHeading,
      aboutText: ai.aboutText || blueprint.siteCopy.aboutText,
      featuresHeading: ai.featuresHeading || blueprint.siteCopy.featuresHeading,
      features: ai.features?.length ? ai.features : blueprint.siteCopy.features,
      faqHeading: ai.faqHeading || blueprint.siteCopy.faqHeading,
      faq: ai.faq?.length ? ai.faq : blueprint.siteCopy.faq,
      ctaHeading: ai.ctaHeading || blueprint.siteCopy.ctaHeading,
      ctaSubheading: ai.ctaSubheading || blueprint.siteCopy.ctaSubheading,
    },
  };
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const SUGGESTED_PROMPTS = [
  "I want to build a premium dog travel accessories shop for modern pet owners.",
  "A subscription coffee shop that sources direct-trade beans from small farms.",
  "A SaaS tool that helps freelance designers send better client proposals.",
  "A tool that helps small teams track project time and generate invoices.",
  "An online course platform that teaches trades skills to career switchers.",
];
