import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Logo } from "../../components/Logo";

const STEPS = ["Setting up your workspace", "Preparing your site files", "Creating starter tasks and goals", "Finishing up"];

export function CreationAnimationStep({ onComplete }: { onComplete: () => void }) {
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    if (doneCount >= STEPS.length) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDoneCount((c) => c + 1), 380);
    return () => clearTimeout(t);
  }, [doneCount, onComplete]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6">
      <div className="mb-10 animate-fade-in"><Logo size={32} /></div>
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center font-display text-[19px] font-semibold text-ink">Creating your company…</p>
        <ul className="space-y-3">
          {STEPS.map((step, i) => {
            const complete = i < doneCount;
            const active = i === doneCount;
            return (
              <li key={step} className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                <span
                  className={
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 " +
                    (complete ? "border-moss-500 bg-moss-500 text-paper" : active ? "border-ink-faint" : "border-line")
                  }
                >
                  {complete && <Check className="h-3 w-3" strokeWidth={3} />}
                  {active && !complete && <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-ink-faint" />}
                </span>
                <span className={"text-[14px] transition-colors duration-300 " + (complete || active ? "text-ink" : "text-ink-faint/60")}>{step}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
