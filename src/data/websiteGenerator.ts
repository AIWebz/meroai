import type { Website, WebsitePage } from "../types";
import type { CompanyBlueprint } from "./companyGenerator";
import { id, now } from "../utils/id";

/**
 * Builds the generated site from a company blueprint whose `siteCopy` is
 * already filled in — by live AI when it succeeds, or by the deterministic
 * fallback in companyGenerator.ts when it doesn't (see applyAIContent).
 * Either way this function itself has no fallback logic of its own to keep;
 * it just renders whatever copy the blueprint carries.
 */
export function generateWebsite(companyId: string, blueprint: CompanyBlueprint): Website {
  const { siteCopy } = blueprint;
  const offeringsLabel = blueprint.productType === "tool" ? "Plans" : "Pricing";

  const homePage: WebsitePage = {
    id: id("page"),
    slug: "home",
    title: "Home",
    components: [
      {
        id: id("cmp"),
        type: "hero",
        heading: siteCopy.heroHeadline,
        subheading: siteCopy.heroSubheadline,
        buttonLabel: blueprint.productType === "tool" ? "Get Started" : "Shop Now",
      },
      {
        id: id("cmp"),
        type: "text",
        heading: siteCopy.aboutHeading,
        body: siteCopy.aboutText,
      },
      {
        id: id("cmp"),
        type: "features",
        heading: siteCopy.featuresHeading,
        items: siteCopy.features,
      },
      {
        id: id("cmp"),
        type: "pricing",
        heading: offeringsLabel,
        // Rendered live from company.offerings (including any connected
        // Stripe payment link) — see features/website/WebsitePreview.tsx.
        // This snapshot is only used before that live data is available.
        items: blueprint.offerings.map((o) => ({ title: o.name, description: o.description, meta: o.pricingConcept })),
      },
      {
        id: id("cmp"),
        type: "faq",
        heading: siteCopy.faqHeading,
        items: siteCopy.faq.map((f) => ({ title: f.question, description: f.answer })),
      },
      {
        id: id("cmp"),
        type: "cta",
        heading: siteCopy.ctaHeading,
        subheading: siteCopy.ctaSubheading,
        buttonLabel: "Get Started",
      },
    ],
  };

  const aboutPage: WebsitePage = {
    id: id("page"),
    slug: "about",
    title: "About",
    components: [
      {
        id: id("cmp"),
        type: "text",
        heading: `About ${blueprint.name}`,
        body: `${siteCopy.aboutText} Our target audience: ${blueprint.targetAudience}.`,
      },
    ],
  };

  const contactPage: WebsitePage = {
    id: id("page"),
    slug: "contact",
    title: "Contact",
    components: [
      {
        id: id("cmp"),
        type: "contact",
        heading: "Get in touch",
        subheading: "We'd love to hear from you.",
      },
    ],
  };

  return {
    companyId,
    pages: [homePage, aboutPage, contactPage],
    navigation: [
      { label: "Home", pageSlug: "home" },
      { label: "About", pageSlug: "about" },
      { label: "Contact", pageSlug: "contact" },
    ],
    theme: { primaryColor: blueprint.brand.colors[0]?.hex ?? "#4f7d3f", style: "premium" },
    isPublished: false,
    lastEditedAt: now(),
  };
}
