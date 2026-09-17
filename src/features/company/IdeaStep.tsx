import { useState } from "react";
import { ArrowRight, Wrench, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import { Button, TextArea } from "../../components/ui";
import { Logo } from "../../components/Logo";
import { SUGGESTED_PROMPTS } from "../../data/companyGenerator";
import type { ProductType } from "../../types";
import { Link } from "react-router-dom";

export function IdeaStep({ onSubmit }: { onSubmit: (idea: string, productType: ProductType) => void }) {
  const [idea, setIdea] = useState("");
  const [productType, setProductType] = useState<ProductType>("shop");

  return (
    <div className="flex min-h-screen flex-col bg-paper px-6 py-8">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
        <Link to="/"><Logo /></Link>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-16">
        <div className="animate-fade-up text-center">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-moss-600">Step 2 of 4</p>
          <h1 className="font-display text-[32px] font-semibold leading-tight text-ink md:text-[38px]">
            What company do you want to build?
          </h1>
          <p className="mt-3 text-[15px] text-ink-faint">Describe it in your own words. Mero will design the rest.</p>
        </div>

        <div className="mt-8 animate-fade-up [animation-delay:60ms]">
          <p className="mb-2.5 text-center text-[12.5px] font-medium text-ink-faint">Are you building a tool or a shop?</p>
          <div className="mx-auto flex max-w-sm gap-3">
            <ProductTypeOption icon={Wrench} label="Tool" description="Software people use" active={productType === "tool"} onClick={() => setProductType("tool")} />
            <ProductTypeOption icon={ShoppingBag} label="Shop" description="Products you sell" active={productType === "shop"} onClick={() => setProductType("shop")} />
          </div>
        </div>

        <div className="mt-8 animate-fade-up [animation-delay:100ms]">
          <TextArea
            autoFocus
            rows={5}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder='"I want to build a premium dog travel accessories shop for modern pet owners."'
          />
          <div className="mt-4 flex justify-end">
            <Button size="lg" disabled={idea.trim().length < 8} onClick={() => onSubmit(idea.trim(), productType)}>
              Design My Company <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-10 animate-fade-up [animation-delay:180ms]">
          <p className="mb-3 text-[12.5px] font-medium text-ink-faint">Or try one of these</p>
          <div className="flex flex-col gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setIdea(prompt)}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-left text-[13.5px] text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductTypeOption({
  icon: Icon,
  label,
  description,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex flex-1 flex-col items-center gap-1.5 rounded-2xl border px-5 py-4 text-center transition-colors",
        active ? "border-ink bg-paper-dim" : "border-line hover:border-ink-faint"
      )}
    >
      <Icon className={clsx("h-5 w-5", active ? "text-ink" : "text-ink-faint")} />
      <span className="text-[14px] font-semibold text-ink">{label}</span>
      <span className="text-[12px] text-ink-faint">{description}</span>
    </button>
  );
}
