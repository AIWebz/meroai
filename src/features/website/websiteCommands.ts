import type { Company, Website, WebsiteComponent, WebsitePage } from "../../types";
import { id } from "../../utils/id";

// ---------------------------------------------------------------------------
// A small rule-based "AI website editor". It's the client-side stand-in for
// what a live AI backend would do with the command box: interpret an
// instruction and edit the website state directly. No network calls.
// ---------------------------------------------------------------------------

export interface WebsiteCommandResult {
  website: Website;
  message: string;
  isDemo: boolean;
}

function updatePage(website: Website, pageId: string, fn: (page: WebsitePage) => WebsitePage): Website {
  return { ...website, lastEditedAt: new Date().toISOString(), pages: website.pages.map((p) => (p.id === pageId ? fn(p) : p)) };
}

export function applyWebsiteCommand(command: string, website: Website, activePageId: string, company: Company): WebsiteCommandResult {
  const lower = command.toLowerCase();
  const page = website.pages.find((p) => p.id === activePageId) ?? website.pages[0];

  if (/premium|elevat|upscale|polish/.test(lower)) {
    const updated: Website = { ...website, lastEditedAt: new Date().toISOString(), theme: { ...website.theme, style: "premium" } };
    const withHero = updatePage(updated, page.id, (p) => ({
      ...p,
      components: p.components.map((c) =>
        c.type === "hero" ? { ...c, subheading: `${company.tagline} Crafted for people who notice the details.` } : c
      ),
    }));
    return { website: withHero, message: "I set the site's style to premium and sharpened the hero subheading.", isDemo: true };
  }

  if (/faq/.test(lower)) {
    const faqComponent: WebsiteComponent = {
      id: id("cmp"),
      type: "faq",
      heading: "Frequently asked questions",
      items: [
        { title: "What makes " + company.name + " different?", description: company.brand.voice },
        { title: "Who is this for?", description: company.targetAudience },
        { title: "What do you offer?", description: company.offerings[0]?.description ?? "Our core offering." },
        { title: "How do I get started?", description: "Reach out through the contact page and we'll follow up." },
      ],
    };
    const updated = updatePage(website, page.id, (p) => ({ ...p, components: [...p.components, faqComponent] }));
    return { website: updated, message: `I added an FAQ section to the ${page.title} page.`, isDemo: true };
  }

  if (/service|offering|what we do|explain/.test(lower)) {
    const servicesComponent: WebsiteComponent = {
      id: id("cmp"),
      type: "features",
      heading: "What we offer",
      items: company.offerings.map((o) => ({ title: o.name, description: o.description })),
    };
    const updated = updatePage(website, page.id, (p) => ({ ...p, components: [...p.components, servicesComponent] }));
    return { website: updated, message: `I added a section explaining your offerings to the ${page.title} page.`, isDemo: true };
  }

  if (/headline|hero/.test(lower)) {
    const toMatch = command.match(/to [""]?(.+?)[""]?$/i);
    const newHeadline = toMatch ? toMatch[1] : `${company.name}: ${company.tagline}`;
    const updated = updatePage(website, page.id, (p) => ({
      ...p,
      components: p.components.map((c) => (c.type === "hero" ? { ...c, heading: newHeadline } : c)),
    }));
    return { website: updated, message: `I updated the hero headline on the ${page.title} page.`, isDemo: true };
  }

  if (/testimonial/.test(lower)) {
    const testimonialComponent: WebsiteComponent = {
      id: id("cmp"),
      type: "testimonials",
      heading: "What customers say",
      items: [{ title: "Early customer", description: "A space reserved for a real customer quote once you have one — Mero won't invent one for you." }],
    };
    const updated = updatePage(website, page.id, (p) => ({ ...p, components: [...p.components, testimonialComponent] }));
    return { website: updated, message: "I added a testimonials section — add a real quote whenever you have one.", isDemo: true };
  }

  return {
    website,
    message:
      "I can add sections (FAQ, services, testimonials), change the hero headline, or make the site feel more premium. Try being specific, e.g. \"Create an FAQ section.\"",
    isDemo: true,
  };
}
