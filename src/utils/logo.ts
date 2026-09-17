// ---------------------------------------------------------------------------
// Procedural lettermark logo. Text models can't generate a raster/vector
// image, so instead of faking a "logo concept" as plain text, Mero derives a
// real on-brand SVG mark from the company name and its AI-chosen palette —
// code renders the actual visual, the AI's contribution is the name/colors.
// ---------------------------------------------------------------------------

export interface LogoSpec {
  initials: string;
  background: string;
  foreground: string;
}

const STOPWORDS = new Set(["the", "a", "an", "and", "of", "co", "co."]);

export function initialsFor(name: string): string {
  const words = name
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
    .filter((w) => w.length > 0 && !STOPWORDS.has(w.toLowerCase()));
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Picks the AI/deterministic brand palette's most saturated-looking color as the mark background, with a readable foreground. */
export function logoSpecFor(name: string, colors: { name: string; hex: string }[]): LogoSpec {
  const background =
    colors.find((c) => !/paper|cream|sand|white|line/i.test(c.name))?.hex ?? colors[0]?.hex ?? "#14140f";
  const foreground = relativeLuminance(background) > 0.4 ? "#14140f" : "#faf8f4";
  return { initials: initialsFor(name), background, foreground };
}

/** Standalone SVG markup string version, for embedding in exported static HTML (no React available there). */
export function logoSvgMarkup(name: string, colors: { name: string; hex: string }[], size = 40, radius = 12): string {
  const { initials, background, foreground } = logoSpecFor(name, colors);
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" role="img" aria-label="${escapeXml(name)} logo" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="40" height="40" rx="${radius}" fill="${background}" /><text x="20" y="21" text-anchor="middle" dominant-baseline="central" fill="${foreground}" font-family="Georgia, 'Times New Roman', serif" font-weight="600" font-size="16">${escapeXml(initials)}</text></svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
