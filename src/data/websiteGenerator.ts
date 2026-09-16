import type { Website, WebsitePage } from "../types";
import type { CompanyBlueprint } from "./companyGenerator";
import { id, now } from "../utils/id";

export function generateWebsite(companyId: string, blueprint: CompanyBlueprint): Website {
  const homePage: WebsitePage = {
    id: id("page"),
    slug: "home",
    title: "Home",
    components: [
      {
        id: id("cmp"),
        type: "hero",
        heading: blueprint.name,
        subheading: blueprint.tagline,
        buttonLabel: "Shop Now",
      },
      {
        id: id("cmp"),
        type: "text",
        heading: "About",
        body: blueprint.description,
      },
      {
        id: id("cmp"),
        type: "features",
        heading: "Why " + blueprint.name,
        items: blueprint.offerings.map((o) => ({ title: o.name, description: o.description })),
      },
      {
        id: id("cmp"),
        type: "cta",
        heading: "Ready to get started?",
        subheading: blueprint.goalSummary.customer,
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
        body: `${blueprint.description} Our target audience: ${blueprint.targetAudience}.`,
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
