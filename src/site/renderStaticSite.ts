import type { Company, Website, WebsiteComponent, WebsitePage } from "../types";
import { logoSvgMarkup } from "../utils/logo";

// ---------------------------------------------------------------------------
// Renders the generated site as real, standalone static HTML files — plain
// semantic markup with inline CSS, no build step, no framework — so what
// gets pushed to GitHub Pages is an honest, working site rather than a
// screenshot of the in-app preview. Pricing/offerings render live from
// `company.offerings` (including any connected Stripe payment link), same
// as the in-app preview.
// ---------------------------------------------------------------------------

export interface StaticFile {
  path: string;
  content: string;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function css(accent: string): string {
  return `
:root { --accent: ${accent}; }
* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #14140f; background: #faf8f4; line-height: 1.5; }
header { display: flex; align-items: center; gap: 20px; padding: 20px 32px; border-bottom: 1px solid #e4e0d4; background: #fff; }
header .brand { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 15px; }
nav { display: flex; gap: 20px; margin-left: auto; }
nav a { color: #58554a; text-decoration: none; font-size: 14px; font-weight: 500; }
nav a:hover { color: #14140f; }
main { max-width: 880px; margin: 0 auto; padding: 0 24px; }
section { padding: 64px 0; border-bottom: 1px solid #efece2; }
section:last-child { border-bottom: none; }
h1 { font-size: 40px; font-weight: 700; letter-spacing: -0.01em; margin: 0 0 12px; }
h2 { font-size: 26px; font-weight: 700; margin: 0 0 16px; }
p { color: #58554a; margin: 0 0 8px; }
.hero { text-align: center; }
.hero p { max-width: 520px; margin: 0 auto 24px; font-size: 17px; }
.btn { display: inline-block; padding: 12px 24px; border-radius: 999px; background: var(--accent); color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; }
.btn.disabled { background: transparent; border: 1px solid #e4e0d4; color: #9a968a; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 20px; }
.card { border: 1px solid #e4e0d4; border-radius: 16px; padding: 20px; background: #fff; }
.card h3 { font-size: 15px; margin: 0 0 6px; }
.card p { font-size: 13.5px; margin: 0; }
.price { color: var(--accent); font-weight: 700; font-size: 16px; margin: 6px 0; }
.center { text-align: center; }
footer { padding: 32px 24px; text-align: center; color: #9a968a; font-size: 13px; }
.cta { text-align: center; background: color-mix(in srgb, var(--accent) 8%, #fff); }
form { max-width: 400px; margin: 20px auto 0; display: flex; flex-direction: column; gap: 10px; }
input, textarea { border: 1px solid #e4e0d4; border-radius: 10px; padding: 10px 14px; font: inherit; }
`.trim();
}

function nav(website: Website, activeSlug: string): string {
  return website.navigation
    .map((n) => `<a href="${n.pageSlug === "home" ? "index.html" : n.pageSlug + ".html"}"${n.pageSlug === activeSlug ? ' style="color:#14140f"' : ""}>${escapeHtml(n.label)}</a>`)
    .join("");
}

function renderComponent(c: WebsiteComponent, company: Company): string {
  switch (c.type) {
    case "hero":
      return `<section class="hero"><h1>${escapeHtml(c.heading ?? "")}</h1>${c.subheading ? `<p>${escapeHtml(c.subheading)}</p>` : ""}${c.buttonLabel ? `<a class="btn" href="#offerings">${escapeHtml(c.buttonLabel)}</a>` : ""}</section>`;
    case "text":
      return `<section>${c.heading ? `<h2>${escapeHtml(c.heading)}</h2>` : ""}${c.body ? `<p>${escapeHtml(c.body)}</p>` : ""}</section>`;
    case "features":
      return `<section>${c.heading ? `<h2 class="center">${escapeHtml(c.heading)}</h2>` : ""}<div class="grid">${(c.items ?? [])
        .map((it) => `<div class="card"><h3>${escapeHtml(it.title)}</h3><p>${escapeHtml(it.description)}</p></div>`)
        .join("")}</div></section>`;
    case "pricing": {
      const items = company.offerings.map((o) => ({ title: o.name, description: o.description, meta: o.pricingConcept, url: o.stripePaymentLinkUrl }));
      return `<section id="offerings">${c.heading ? `<h2 class="center">${escapeHtml(c.heading)}</h2>` : ""}<div class="grid">${items
        .map(
          (it) =>
            `<div class="card center"><h3>${escapeHtml(it.title)}</h3>${it.meta ? `<p class="price">${escapeHtml(it.meta)}</p>` : ""}<p>${escapeHtml(it.description)}</p>${
              it.url
                ? `<a class="btn" style="margin-top:12px" href="${escapeHtml(it.url)}" target="_blank" rel="noreferrer">Buy now</a>`
                : `<span class="btn disabled" style="margin-top:12px">Payment not connected</span>`
            }</div>`
        )
        .join("")}</div></section>`;
    }
    case "faq":
      return `<section>${c.heading ? `<h2>${escapeHtml(c.heading)}</h2>` : ""}${(c.items ?? [])
        .map((it) => `<div style="margin-top:14px"><h3 style="font-size:14.5px;margin:0 0 4px">${escapeHtml(it.title)}</h3><p>${escapeHtml(it.description)}</p></div>`)
        .join("")}</section>`;
    case "cta":
      return `<section class="cta center">${c.heading ? `<h2>${escapeHtml(c.heading)}</h2>` : ""}${c.subheading ? `<p>${escapeHtml(c.subheading)}</p>` : ""}${c.buttonLabel ? `<a class="btn" href="#offerings">${escapeHtml(c.buttonLabel)}</a>` : ""}</section>`;
    case "contact":
      return `<section class="center">${c.heading ? `<h2>${escapeHtml(c.heading)}</h2>` : ""}${c.subheading ? `<p>${escapeHtml(c.subheading)}</p>` : ""}<form onsubmit="return false"><input placeholder="Your email" type="email" /><textarea placeholder="Message" rows="4"></textarea><button class="btn" type="submit">Send</button></form></section>`;
    case "testimonials":
      return `<section>${c.heading ? `<h2 class="center">${escapeHtml(c.heading)}</h2>` : ""}${(c.items ?? [])
        .map((it) => `<p class="center" style="font-style:italic">"${escapeHtml(it.description)}"</p>`)
        .join("")}</section>`;
    default:
      return "";
  }
}

function renderPage(page: WebsitePage, website: Website, company: Company): string {
  const accent = website.theme.primaryColor;
  const logo = logoSvgMarkup(company.name, company.brand.colors, 28, 8);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(company.name)} — ${escapeHtml(page.title)}</title>
<meta name="description" content="${escapeHtml(company.tagline)}" />
<style>${css(accent)}</style>
</head>
<body>
<header>
<span class="brand">${logo} ${escapeHtml(company.name)}</span>
<nav>${nav(website, page.slug)}</nav>
</header>
<main>
${page.components.map((c) => renderComponent(c, company)).join("\n")}
</main>
<footer>Built with Mero · ${escapeHtml(company.name)}</footer>
</body>
</html>
`;
}

export function renderStaticSite(company: Company, website: Website): StaticFile[] {
  const files: StaticFile[] = website.pages.map((page) => ({
    path: page.slug === "home" ? "index.html" : `${page.slug}.html`,
    content: renderPage(page, website, company),
  }));
  files.push({ path: ".nojekyll", content: "" });
  files.push({
    path: "README.md",
    content: `# ${company.name}\n\n${company.tagline}\n\nPublished from [Mero](https://github.com/AIWebz/meroai) — this repo is a static site, safe to edit directly.\n`,
  });
  return files;
}
