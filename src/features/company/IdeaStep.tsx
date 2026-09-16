import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button, TextArea } from "../../components/ui";
import { Logo } from "../../components/Logo";
import { SUGGESTED_PROMPTS } from "../../data/companyGenerator";
import { Link } from "react-router-dom";

export function IdeaStep({ onSubmit }: { onSubmit: (idea: string) => void }) {
  const [idea, setIdea] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-paper px-6 py-8">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
        <Link to="/"><Logo /></Link>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-16">
        <div className="animate-fade-up text-center">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-moss-600">Step 1 of 3</p>
          <h1 className="font-display text-[32px] font-semibold leading-tight text-ink md:text-[38px]">
            What company do you want to build?
          </h1>
          <p className="mt-3 text-[15px] text-ink-faint">Describe it in your own words. Mero will structure the rest.</p>
        </div>

        <div className="mt-9 animate-fade-up [animation-delay:100ms]">
          <TextArea
            autoFocus
            rows={5}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder='"I want to build a premium dog travel accessories company for modern pet owners."'
          />
          <div className="mt-4 flex justify-end">
            <Button size="lg" disabled={idea.trim().length < 8} onClick={() => onSubmit(idea.trim())}>
              Build My Company <ArrowRight className="h-4 w-4" />
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
