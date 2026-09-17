import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Wrench, ShoppingBag, GitBranch } from "lucide-react";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui";

const FLOW_STEPS = ["Your Idea", "Mero Designs It", "Brand, Offerings & Site", "You Review", "Publish to GitHub"];

const HOW_IT_WORKS = [
  { n: "01", title: "Describe your idea", body: "Tell Mero what you want to build — in your own words, no structure required." },
  { n: "02", title: "Choose tool or shop", body: "A tool is software people use; a shop sells products. Mero shapes everything around that." },
  { n: "03", title: "Mero designs the company", body: "Name, brand, logo, offerings, goals, and site copy — generated live by your connected AI." },
  { n: "04", title: "Review and edit", body: "Everything Mero generates is editable before you commit to it." },
  { n: "05", title: "Publish to GitHub", body: "Push the real, working site to your own GitHub account and turn on GitHub Pages." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-8 text-[14px] font-medium text-ink-soft md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-ink">How it works</a>
            <a href="#publish" className="transition-colors hover:text-ink">Publishing</a>
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
              An AI that designs your whole company, not just a website
            </div>
            <h1 className="animate-fade-up font-display text-[42px] font-semibold leading-[1.08] tracking-tight text-ink [animation-delay:80ms] md:text-[68px]">
              Build a company.
              <br />
              Let AI design it.
            </h1>
            <p className="mx-auto mt-6 max-w-xl animate-fade-up text-[16.5px] leading-relaxed text-ink-faint [animation-delay:160ms] md:text-[18px]">
              Describe your idea. Mero's AI designs the brand, logo, offerings, goals, and a real site — then you
              publish it straight to your own GitHub account.
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
              <h2 className="font-display text-[32px] font-semibold text-ink md:text-[38px]">From idea to a published site</h2>
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

        {/* TOOL OR SHOP */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="grid items-center gap-14 md:grid-cols-2">
              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-moss-600">Tool or shop</p>
                <h2 className="font-display text-[30px] font-semibold leading-tight text-ink md:text-[34px]">
                  You pick what you're building
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-ink-faint">
                  A tool is software people use — Mero designs plans and features around it. A shop sells products —
                  Mero designs real products with pricing, ready to connect to Stripe. Either way, the generated
                  site reflects the choice.
                </p>
                <Link to="/create" className="mt-6 inline-block">
                  <Button variant="secondary">
                    Start building <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="animate-fade-up rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
                  <Wrench className="mb-3 h-6 w-6 text-ink-soft" />
                  <p className="text-[14px] font-semibold text-ink">Tool</p>
                  <p className="mt-1 text-[12.5px] leading-snug text-ink-faint">Plans, features, and a "Get started" flow.</p>
                </div>
                <div className="animate-fade-up rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)] [animation-delay:90ms]">
                  <ShoppingBag className="mb-3 h-6 w-6 text-ink-soft" />
                  <p className="text-[14px] font-semibold text-ink">Shop</p>
                  <p className="mt-1 text-[12.5px] leading-snug text-ink-faint">Real products with prices and Stripe checkout.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PUBLISHING */}
        <section id="publish" className="border-t border-line/70 bg-paper-dim/60 px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <GitBranch className="mx-auto mb-4 h-7 w-7 text-ink-soft" />
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-moss-600">Publishing</p>
            <h2 className="font-display text-[30px] font-semibold text-ink">Yours, on your own GitHub</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-faint">
              The generated site is real static HTML — no lock-in. Connect a GitHub personal access token and Mero
              pushes it to a repository in your own account and turns on GitHub Pages, live at
              your-name.github.io.
            </p>
          </div>
        </section>

        {/* FAQ / TRUST */}
        <section id="faq" className="px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-moss-600">Good to know</p>
              <h2 className="font-display text-[30px] font-semibold text-ink">Honest about what this is</h2>
            </div>
            <div className="space-y-4">
              <FaqItem
                q="Do I need to bring my own AI?"
                a="Yes — enabling a live AI (a model that runs in your browser, or a small backend you deploy) is the first step. It's what actually designs your company, so there's no demo-only path into creating one."
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
            <p className="mt-4 text-[15.5px] text-ink-faint">Describe the idea. Mero designs the rest.</p>
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
          <p className="text-[13px] text-ink-faint">Build a company. Let AI design it.</p>
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
