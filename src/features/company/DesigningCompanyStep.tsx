import { useEffect, useRef, useState } from "react";
import { Logo } from "../../components/Logo";
import { generateBlueprint, applyAIContent, type CompanyBlueprint } from "../../data/companyGenerator";
import { generateCompanyWithAI } from "../../ai/generateCompanyWithAI";
import { resolveAIProvider } from "../../ai/resolveProvider";
import type { ProductType } from "../../types";

const MIN_DISPLAY_MS = 900;

/**
 * The AI does the actual designing here — name, brand, offerings, goals,
 * and site copy — grounded in the idea and tool/shop choice from the
 * previous step. A deterministic draft is ready instantly as a fallback;
 * whatever the live AI successfully returns is layered on top of it before
 * the review step ever renders, so what the user reviews next is what they
 * get (not silently overwritten by AI after they've edited it).
 */
export function DesigningCompanyStep({
  idea,
  productType,
  onReady,
}: {
  idea: string;
  productType: ProductType;
  onReady: (blueprint: CompanyBlueprint) => void;
}) {
  const [label, setLabel] = useState("Understanding your idea…");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const draft = generateBlueprint(idea, productType);
    const minDisplay = new Promise<void>((resolve) => setTimeout(resolve, MIN_DISPLAY_MS));
    const labelTimer1 = setTimeout(() => setLabel("Designing your brand and offerings…"), 700);
    const labelTimer2 = setTimeout(() => setLabel("Writing your site…"), 1800);

    Promise.all([generateCompanyWithAI(resolveAIProvider(), idea, productType).catch(() => null), minDisplay]).then(([aiContent]) => {
      clearTimeout(labelTimer1);
      clearTimeout(labelTimer2);
      onReady(applyAIContent(draft, aiContent));
    });

    return () => {
      clearTimeout(labelTimer1);
      clearTimeout(labelTimer2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6">
      <div className="mb-6 animate-fade-in"><Logo size={32} /></div>
      <p className="mb-2 text-center text-[12px] font-semibold uppercase tracking-wider text-moss-600">Step 3 of 4</p>
      <p className="mb-2 text-center font-display text-[19px] font-semibold text-ink">Mero is designing your company…</p>
      <p className="text-center text-[13.5px] text-ink-faint">{label}</p>
      <div className="mt-6 flex gap-1.5">
        <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-ink-faint [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-ink-faint [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-ink-faint [animation-delay:300ms]" />
      </div>
    </div>
  );
}
