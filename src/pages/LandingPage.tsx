import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui";

const FLOW_STEPS = ["Your Idea", "Mero Builds It", "AI Workforce", "Company Operates", "AI Improves It"];

const HOW_IT_WORKS = [
  { n: "01", title: "Describe your idea", body: "Tell Mero what you want to build — in your own words, no structure required." },
  { n: "02", title: "Mero builds your company", body: "Mero generates the company structure, brand, website, goals, and operating plan." },
  { n: "03", title: "Build your AI workforce", body: "Mero recommends specialized AI employees suited to what you're building." },
  { n: "04", title: "Let them operate", body: "AI employees perform tasks, analyze information, and manage workflows." },
  { n: "05", title: "Stay in control", body: "Mero reports what happened and asks for approval when it matters." },
];

const WORKFORCE_PREVIEW = [
  { name: "AI CEO", role: "Coordinates the company" },
  { name: "AI Marketing", role: "Creates campaigns and content" },
  { name: "AI Sales", role: "Handles pipeline and outreach" },
  { name: "AI Developer", role: "Maintains your website" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-8 text-[14px] font-medium text-ink-soft md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-ink">How it works</a>
            <a href="#workforce" className="transition-colors hover:text-ink">AI workforce</a>
            <a href="#faq" className="transition-colors hover:text-ink">FAQ</a>
          </nav>
          <Link to="/create">
            <Button size="sm">Build My Company</Button>
          </Link>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pt-28">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[12.5px] font-medium text-ink-soft">
              <Sparkles className="h-3.5 w-3.5 text-moss-500" />
              An AI operating system for a company you haven't built yet
            </div>
            <h1 className="animate-fade-up font-display text-[42px] font-semibold leading-[1.08] tracking-tight text-ink [animation-delay:80ms] md:text-[68px]">
              Build a company.
              <br />
              Let AI run it.
            </h1>
            <p className="mx-auto mt-6 max-w-xl animate-fade-up text-[16.5px] leading-relaxed text-ink-faint [animation-delay:160ms] md:text-[18px]">
              Mero turns your idea into a business and gives it an AI workforce to build, operate, and improve it.
            </p>
            <div className="mt-9 flex animate-fade-up flex-col items-center justify-center gap-3 [animation-delay:240ms] sm:flex-row">
              <Link to="/create">
                <Button size="lg">
                  Build My Company <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="secondary">See How It Works</Button>
              </a>
            </div>
          </div>

          <div className="mx-auto mt-20 max-w-3xl animate-fade-up [animation-delay:340ms]">
            <FlowVisual />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="border-t border-line/70 bg-paper-dim/60 px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-14 text-center">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-moss-600">How it works</p>
              <h2 className="font-display text-[32px] font-semibold text-ink md:text-[38px]">From idea to operating company</h2>
            </div>
            <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-5">
              {HOW_IT_WORKS.map((step) => (
                <div key={step.n} className="flex flex-col gap-3 bg-surface p-6">
                  <span className="font-display text-[13px] font-semibold text-moss-500">{step.n}</span>
                  <h3 className="font-display text-[15.5px] font-semibold leading-snug text-ink">{step.title}</h3>
                  <p className="text-[13px] leading-relaxed text-ink-faint">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WORKFORCE PREVIEW */}
        <section id="workforce" className="px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="grid items-center gap-14 md:grid-cols-2">
              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-moss-600">AI Workforce</p>
                <h2 className="font-display text-[30px] font-semibold leading-tight text-ink md:text-[34px]">
                  A team that actually works while you sleep
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-ink-faint">
                  Mero recommends specialized AI employees based on what you're building — sales, marketing,
                  support, research, analytics, development, and operations. You decide who gets hired.
                </p>
                <Link to="/create" className="mt-6 inline-block">
                  <Button variant="secondary">
                    Meet your workforce <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {WORKFORCE_PREVIEW.map((w, i) => (
                  <div
                    key={w.name}
                    className="animate-fade-up rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-card)]"
                    style={{ animationDelay: `${i * 90}ms` }}
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink font-display text-[13px] font-semibold text-paper">
                      {w.name[3]}
                    </div>
                    <p className="text-[13.5px] font-semibold text-ink">{w.name}</p>
                    <p className="mt-0.5 text-[12px] leading-snug text-ink-faint">{w.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ / TRUST */}
        <section id="faq" className="border-t border-line/70 bg-paper-dim/60 px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-moss-600">Good to know</p>
              <h2 className="font-display text-[30px] font-semibold text-ink">Honest about what this is</h2>
            </div>
            <div className="space-y-4">
              <FaqItem
                q="Is this connected to a real AI model right now?"
                a="This build ships with a fully designed demo intelligence layer — realistic, clearly labeled simulated responses. The architecture is built so a secure AI backend can be connected later without a frontend rewrite."
              />
              <FaqItem
                q="Where is my data stored?"
                a="Everything you create lives in your browser's local storage. Nothing is sent to a server. Refreshing the page restores your workspace."
              />
              <FaqItem
                q="Will Mero fabricate business results?"
                a="No. Metrics that require connected data (revenue, visitors, conversion) show an honest empty state until you connect a real integration."
              />
            </div>
          </div>
        </section>

        <section className="px-6 py-24 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-display text-[32px] font-semibold text-ink md:text-[38px]">Ready to build your company?</h2>
            <p className="mt-4 text-[15.5px] text-ink-faint">Describe the idea. Mero handles the rest of the first draft.</p>
            <Link to="/create" className="mt-8 inline-block">
              <Button size="lg">
                Build My Company <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line/70 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo size={22} />
          <p className="text-[13px] text-ink-faint">Build a company. Let AI run it.</p>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-[14.5px] font-semibold text-ink">{q}</p>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-faint">{a}</p>
    </div>
  );
}

function FlowVisual() {
  return (
    <div className="rounded-3xl border border-line bg-surface p-8 shadow-[var(--shadow-pop)] md:p-10">
      <div className="flex flex-col items-center gap-0">
        {FLOW_STEPS.map((step, i) => (
          <div key={step} className="flex w-full flex-col items-center">
            <div
              className="animate-fade-up w-full max-w-xs rounded-2xl border border-line bg-paper px-5 py-3.5 text-center"
              style={{ animationDelay: `${i * 140}ms` }}
            >
              <span className="text-[13.5px] font-semibold tracking-tight text-ink">{step}</span>
            </div>
            {i < FLOW_STEPS.length - 1 && (
              <svg width="2" height="28" className="my-0.5" aria-hidden="true">
                <line x1="1" y1="0" x2="1" y2="28" stroke="var(--color-moss-400)" strokeWidth="2" strokeDasharray="4 4" className="animate-flow" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
