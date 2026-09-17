import type { Website, WebsitePage } from "../types";
import type { CompanyBlueprint } from "./companyGenerator";
import type { AIWebsiteContent } from "../ai/generateWebsiteContent";
import { id, now } from "../utils/id";

/**
 * Builds the initial generated website. When `aiContent` is provided (a
 * successful live-AI generation grounded in the founder's own description),
 * its copy is used throughout; otherwise a deterministic template built
 * from the blueprint's structured fields is used instead — this keeps the
 * site fully functional even if AI generation fails or returns something
 * unusable, without ever silently passing off template copy as AI-written.
 */
export function generateWebsite(companyId: string, blueprint: CompanyBlueprint, aiContent?: AIWebsiteContent | null): Website {
  const homePage: WebsitePage = {
    id: id("page"),
    slug: "home",
    title: "Home",
    components: [
      {
        id: id("cmp"),
        type: "hero",
        heading: aiContent?.heroHeadline || blueprint.name,
        subheading: aiContent?.heroSubheadline || blueprint.tagline,
        buttonLabel: "Shop Now",
      },
      {
        id: id("cmp"),
        type: "text",
        heading: aiContent?.aboutHeading || "About",
        body: aiContent?.aboutText || blueprint.description,
      },
      {
        id: id("cmp"),
        type: "features",
        heading: aiContent?.featuresHeading || "Why " + blueprint.name,
        items: aiContent?.features?.length
          ? aiContent.features
          : blueprint.offerings.map((o) => ({ title: o.name, description: o.description })),
      },
      {
        id: id("cmp"),
        type: "pricing",
        heading: "Pricing",
        // Rendered live from company.offerings (including any connected
        // Stripe payment link) — see features/website/WebsitePreview.tsx.
        // This snapshot is only used before that live data is available.
        items: blueprint.offerings.map((o) => ({ title: o.name, description: o.description, meta: o.pricingConcept })),
      },
      {
        id: id("cmp"),
        type: "faq",
        heading: aiContent?.faqHeading || "Frequently asked questions",
        items: aiContent?.faq?.length
          ? aiContent.faq.map((f) => ({ title: f.question, description: f.answer }))
          : [{ title: `What does ${blueprint.name} offer?`, description: blueprint.offerings[0]?.description ?? "Our core offering." }],
      },
      {
        id: id("cmp"),
        type: "cta",
        heading: aiContent?.ctaHeading || "Ready to get started?",
        subheading: aiContent?.ctaSubheading || blueprint.goalSummary.customer,
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
        body: `${aiContent?.aboutText || blueprint.description} Our target audience: ${blueprint.targetAudience}.`,
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
