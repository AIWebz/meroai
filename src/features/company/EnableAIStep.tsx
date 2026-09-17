import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Logo } from "../../components/Logo";
import { Button } from "../../components/ui";
import { LocalModelCard } from "../ai/LocalModelCard";
import { BackendCard } from "../ai/BackendCard";
import { useAIStatus } from "../ai/useAIStatus";

export function EnableAIStep({ onContinue }: { onContinue: () => void }) {
  const { isLive, activeMode } = useAIStatus();

  return (
    <div className="flex min-h-screen flex-col bg-paper px-6 py-8">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
        <Link to="/"><Logo /></Link>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-16">
        <div className="animate-fade-up text-center">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-moss-600">Step 1 of 4</p>
          <h1 className="font-display text-[32px] font-semibold leading-tight text-ink md:text-[38px]">
            Turn on Mero's AI
          </h1>
          <p className="mt-3 text-[15px] text-ink-faint">
            Mero's AI designs your company's brand, offerings, and site for real — there's no simulated fallback
            for that part. Enable one AI option below before you continue.
          </p>
        </div>

        <div className="mt-9 animate-fade-up space-y-4 [animation-delay:100ms]">
          {isLive && (
            <div className="flex items-center gap-2 rounded-xl border border-moss-200 bg-moss-50 px-4 py-3">
              <Sparkles className="h-4 w-4 text-moss-600" />
              <p className="text-[13px] text-moss-700">AI is enabled — {activeMode}. You're all set.</p>
            </div>
          )}
          <LocalModelCard />
          <BackendCard />
        </div>

        <div className="mt-8 flex justify-end">
          <Button size="lg" onClick={onContinue} disabled={!isLive}>
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
