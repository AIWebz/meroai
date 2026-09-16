import type { Website, WebsiteComponent, WebsitePage } from "../../types";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTH: Record<PreviewDevice, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export function WebsitePreview({ website, page, device }: { website: Website; page: WebsitePage; device: PreviewDevice }) {
  return (
    <div className="flex justify-center overflow-x-auto bg-paper-dim p-4">
      <div
        className="min-h-[500px] overflow-hidden rounded-xl border border-line bg-white shadow-sm transition-all duration-300"
        style={{ width: DEVICE_WIDTH[device], maxWidth: "100%" }}
      >
        <div className="flex items-center gap-4 border-b border-line/60 px-5 py-3">
          <span className="text-[13px] font-semibold" style={{ color: website.theme.primaryColor }}>
            {page.title === "Home" ? "Brand" : page.title}
          </span>
          <nav className="flex gap-3 text-[11.5px] text-ink-faint">
            {website.navigation.map((n) => (
              <span key={n.pageSlug}>{n.label}</span>
            ))}
          </nav>
        </div>
        <div>
          {page.components.map((c) => (
            <PreviewComponent key={c.id} component={c} accent={website.theme.primaryColor} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewComponent({ component, accent }: { component: WebsiteComponent; accent: string }) {
  switch (component.type) {
    case "hero":
      return (
        <div className="px-6 py-12 text-center">
          <h2 className="font-serif text-[24px] font-semibold leading-tight text-ink">{component.heading}</h2>
          {component.subheading && <p className="mx-auto mt-2 max-w-sm text-[13px] text-ink-faint">{component.subheading}</p>}
          {component.buttonLabel && (
            <span className="mt-5 inline-block rounded-full px-4 py-2 text-[12px] font-medium text-white" style={{ background: accent }}>
              {component.buttonLabel}
            </span>
          )}
        </div>
      );
    case "text":
      return (
        <div className="px-6 py-8">
          {component.heading && <h3 className="text-[16px] font-semibold text-ink">{component.heading}</h3>}
          {component.body && <p className="mt-2 text-[12.5px] leading-relaxed text-ink-faint">{component.body}</p>}
        </div>
      );
    case "features":
      return (
        <div className="px-6 py-8">
          {component.heading && <h3 className="mb-4 text-center text-[16px] font-semibold text-ink">{component.heading}</h3>}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {component.items?.map((it, i) => (
              <div key={i} className="rounded-lg border border-line/70 p-3">
                <p className="text-[12.5px] font-semibold text-ink">{it.title}</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-faint">{it.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "faq":
      return (
        <div className="px-6 py-8">
          {component.heading && <h3 className="mb-4 text-[16px] font-semibold text-ink">{component.heading}</h3>}
          <div className="space-y-2.5">
            {component.items?.map((it, i) => (
              <div key={i}>
                <p className="text-[12.5px] font-semibold text-ink">{it.title}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-faint">{it.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "testimonials":
      return (
        <div className="px-6 py-8">
          {component.heading && <h3 className="mb-3 text-center text-[16px] font-semibold text-ink">{component.heading}</h3>}
          {component.items?.map((it, i) => (
            <p key={i} className="text-center text-[12.5px] italic leading-relaxed text-ink-faint">"{it.description}"</p>
          ))}
        </div>
      );
    case "cta":
      return (
        <div className="px-6 py-10 text-center" style={{ background: "color-mix(in srgb, " + accent + " 8%, white)" }}>
          {component.heading && <h3 className="text-[17px] font-semibold text-ink">{component.heading}</h3>}
          {component.subheading && <p className="mt-1.5 text-[12.5px] text-ink-faint">{component.subheading}</p>}
          {component.buttonLabel && (
            <span className="mt-4 inline-block rounded-full px-4 py-2 text-[12px] font-medium text-white" style={{ background: accent }}>
              {component.buttonLabel}
            </span>
          )}
        </div>
      );
    case "contact":
      return (
        <div className="px-6 py-8 text-center">
          {component.heading && <h3 className="text-[16px] font-semibold text-ink">{component.heading}</h3>}
          {component.subheading && <p className="mt-1.5 text-[12.5px] text-ink-faint">{component.subheading}</p>}
          <div className="mx-auto mt-4 max-w-xs space-y-2">
            <div className="h-8 rounded-md border border-line/70" />
            <div className="h-16 rounded-md border border-line/70" />
            <span className="mt-1 inline-block rounded-full px-4 py-2 text-[12px] font-medium text-white" style={{ background: accent }}>Send</span>
          </div>
        </div>
      );
    default:
      return null;
  }
}
