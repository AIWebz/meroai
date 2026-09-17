# Mero

**Build a company. Let AI run it.**

Mero is an AI operating system for a company you haven't built yet. Describe an
idea in plain language and Mero generates a company blueprint — brand,
offerings, goals, and a website — then assembles a recommended AI workforce to
help operate it: an AI CEO that coordinates, employees for sales, marketing,
support, research, analytics, development, and operations, a task and
approval system, an opportunity engine, and a website builder with an AI
command box.

Mero ships as a **fully static site**. There is no backend, no database, and
no server that has to stay running. Everything — your company, its AI
workforce, tasks, approvals, goals, and website — lives in your browser's
`localStorage`. Refreshing the page restores your workspace exactly where you
left it.

Real AI is required before you can build a company: the first step of
company creation is turning on a live AI provider, either a model that runs
entirely in your browser (no key at all) or a small backend you deploy
yourself. Once it's on, that same live AI writes your company's website copy
— hero, about, features, FAQ, and CTA — grounded in the idea you actually
typed, not a fill-in-the-blanks template. See
[AI configuration](#ai-configuration).

## Features

- **AI Company Generator** — turn on live AI, describe an idea, review an
  editable blueprint (name, brand, offerings, goals, recommended workforce),
  and watch Mero "build" the company, with your connected AI writing the
  website copy live as part of that build.
- **AI CEO** — a coordinating chat interface with a daily-briefing view
  (what happened, what was completed, problems, opportunities, approvals
  needed, recommended next actions).
- **AI Workforce** — eight possible roles (CEO, Sales, Marketing, Support,
  Research, Analyst, Developer, Operations), each with its own chat, goal,
  permissions, and activity. Mero recommends who to hire; nothing is hired
  automatically.
- **Task system** — pending / working / awaiting approval / completed /
  failed / cancelled, assignable to any hired employee.
- **Approval Center** — actions with real consequence (publishing the
  website, spending budget, bulk email, pricing changes) wait for your
  explicit approval or rejection.
- **Activity feed** — a timeline of everything Mero and your AI workforce
  have done, clearly labeled as demo activity.
- **Goals** — create goals with a target and deadline; progress is only ever
  shown when it comes from connected data, never invented.
- **Website Builder** — a generated multi-page website with a component
  model (hero, features, pricing, FAQ, testimonials, CTA, contact...), a
  desktop / tablet / mobile preview, and an AI command box ("Create an FAQ
  section", "Change the hero headline", "Make the homepage more premium")
  that edits the site directly.
- **Stripe payment links** — connect a Stripe
  [Payment Link](https://stripe.com/docs/payment-links) to any offering from
  the Company page; the website's pricing section then renders a real "Buy
  now" button straight to Stripe-hosted checkout, live, with no backend or
  secret key on Mero's side.
- **Opportunity Engine & Analytics** — honest empty states until you connect
  a real data source; nothing is fabricated.
- **Knowledge base** — an editable company memory (description, brand voice,
  products, customers, policies, goals, decisions).

## Demo mode and real AI, honestly

Turning on live AI is **required** before you can build a company — it's
the first step of the creation flow, and there's no way to skip it. This
isn't optional the way it once was: your company's brand and website copy
are written for real by whichever AI you connect, grounded in the idea you
actually describe, so Mero needs a live provider before it can start.

Two ways to go live, both explained in that step: run a small open-weight
model entirely in your browser via WebGPU (no key, ever), or deploy the
small backend in [`server/mero-ai-backend`](server/mero-ai-backend) and
connect its URL. The in-browser model generates genuinely new text
on-device; the backend route chats with the real
[Claude API](https://claude.com/api) — see
[AI configuration](#ai-configuration) below.

Once a company exists, everywhere else in the app (AI CEO chat, employee
chats, the website AI editor) still degrades gracefully to a labeled
**Demo** response if the live provider is ever unreachable or misconfigured
— that fallback still exists for ongoing chat, it just doesn't apply to the
one-time website-copy generation during creation, which instead falls back
to a clearly non-AI deterministic template (see
[What's real vs. simulated](#whats-real-vs-simulated)).

Metrics that require real business data (revenue, customers, conversion,
traffic) always show *"Connect your data to see live metrics"* rather than
an invented number — that's independent of AI mode, and stays true either
way.

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev) — dev server and static production build
- [React Router](https://reactrouter.com) (`HashRouter`) — client-side routing that works on GitHub Pages without any server rewrite rules
- [Zustand](https://github.com/pmndrs/zustand) — client state, persisted to `localStorage`
- [Tailwind CSS v4](https://tailwindcss.com) — design system
- [lucide-react](https://lucide.dev) — icons

No Node.js server, no database, no Vercel-specific features, and no
server-side rendering are used anywhere in the deployed app.

## Local development

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). Node.js /
npm are only needed for **local development and the build step** — the
deployed site itself needs neither.

## Building for production

```bash
npm run build
```

This produces a fully static `dist/` folder (HTML, CSS, JS, and assets) that
can be uploaded anywhere that serves static files — GitHub Pages, any static
host, or opened directly. Preview the production build locally with:

```bash
npm run preview
```

## Deploying to GitHub Pages

This repo includes `.github/workflows/deploy.yml`, a GitHub Actions workflow
that installs dependencies, runs `npm run build`, and publishes the `dist/`
folder to GitHub Pages automatically on every push to `main`.

To enable it on your own copy of this repository:

1. Push this repository to GitHub (if you haven't already).
2. Open the repository's **Settings** tab.
3. Go to **Pages** in the sidebar.
4. Under **Build and deployment → Source**, select **GitHub Actions**.
5. Push to (or merge into) `main` — the **Deploy Mero to GitHub Pages**
   workflow will run automatically.
6. Once the workflow finishes, your site is live at the URL shown on the
   Pages settings screen (typically `https://<your-username>.github.io/<repo>/`).

You can also trigger a deploy manually from the **Actions** tab using the
workflow's "Run workflow" button (`workflow_dispatch`).

No repo-name configuration is required: the app builds with a relative
(`base: './'`) asset path and uses a hash-based router (`/#/app`, `/#/create`,
...), so it works correctly whether it's served from a custom domain, the
repository root, or a `/<repo-name>/` subpath — including direct links to
inner pages, which is normally the part that breaks on GitHub Pages with a
plain `BrowserRouter`.

## AI configuration

**No AI API key is ever hardcoded in this repository or the built site.**
A private API key embedded in static frontend *source code* isn't secret —
anyone can read it out of the shipped bundle, which is why Mero never ships
with one baked in. Mero's AI layer is abstracted behind a single interface
so it can run in any of these modes without any page or component caring
which one is active:

```
AIProvider  →  AIOrchestrator  →  AI CEO / AI Employees  →  Tasks
```

- `src/ai/provider.ts` — the `AIProvider` interface every provider implements.
- `src/ai/demoProvider.ts` — a local, no-network provider that produces realistic, clearly "Demo"-labeled responses. Used for ongoing chat if live AI ever becomes unreachable after a company exists.
- `src/ai/localModelProvider.ts` (+ `src/ai/localModel/engine.ts`) — runs a small open-weight model entirely in the browser via WebGPU. No key, ever.
- `src/ai/backendProvider.ts` — calls a secure backend you deploy yourself.
- `src/ai/resolveProvider.ts` — picks between them (in-browser model → backend → demo) and exposes `isAIEnabled()`, which gates the company creation flow.
- `src/ai/orchestrator.ts` — routes chat through whichever provider is active; also builds the AI CEO briefing from local data (never a model call, so it's never fabricated).
- `src/ai/generateWebsiteContent.ts` — asks the active live provider to write the new company's website copy as structured JSON, grounded in what you typed; used once, during creation.

### The AI gate: Step 1 of company creation

Going to **Build My Company** now opens on **"Turn on Mero's AI"** before
anything else. You can't describe your company or see a blueprint until one
of the two options below is live — there's no "skip" or demo-only path here,
because the website copy this step unlocks is written by that live AI, not
a template. Once a provider is enabled it's remembered (in `localStorage`,
just like the rest of your workspace), so returning users don't see this
step again unless they disable AI in Settings.

### Option 1: Run a real model in the browser (no key, ever)

Go to **Settings → AI** → **"Run AI in this browser"** → **Download &
enable**. Mero downloads a small open-weight model
([Llama 3.2 1B Instruct](https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct),
quantized to about 900MB) directly from its public model host and runs it
entirely on-device via [WebGPU](https://www.w3.org/TR/webgpu/), using
[WebLLM](https://github.com/mlc-ai/web-llm). No API key, no backend, and no
network call at all once it's loaded — genuinely generated text, not
scripted templates.

Honest tradeoffs: the download happens once and is cached by the browser
afterward, but it is a real ~900MB the first time. Inference is slower than
a hosted API and needs a fairly modern browser/GPU (Mero detects WebGPU
support and shows a clear message, with an automatic fallback to Demo mode,
if it isn't available). Response quality is noticeably below Claude — this
is a genuinely small model, not a scaled-down version of a frontier one.

### Option 2: Deploy a secure backend (better for a shared deployment)

This repo includes a ready-to-deploy secure backend at
[`server/mero-ai-backend`](server/mero-ai-backend) — a small Cloudflare
Worker that holds your Anthropic API key server-side and calls the real
Claude API on the frontend's behalf. The key never enters the browser at
all in this mode; the frontend only ever holds the worker's URL and an
optional shared secret, both entered in the app itself.

```bash
cd server/mero-ai-backend
npm install
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put MERO_SHARED_SECRET
npm run deploy
```

Then in Mero, go to **Settings → AI**, paste in the printed worker URL and
your shared secret under "Or connect a secure backend," click **Test
connection**, and **Save** — full setup and security notes are in
[`server/mero-ai-backend/README.md`](server/mero-ai-backend/README.md).

This backend is deployed separately from the static site — the GitHub Pages
deployment itself never changes. Any backend that implements the same small
JSON contract works — the bundled Worker is a reference implementation, not
the only option.

### How the AI writes your website

During creation, once a live provider is on, Mero asks it for the site's
hero headline/subheadline, about section, three features, three FAQ items,
and CTA copy as structured JSON — grounded in the exact idea text you typed
plus the blueprint's industry, audience, and brand voice
(`src/ai/generateWebsiteContent.ts`). If the provider errors, times out, or
returns something that doesn't parse into valid content — which can happen
with the smaller in-browser model in particular — Mero falls back per-field
to the same deterministic template it always used
(`src/data/websiteGenerator.ts`), so company creation never fails or
produces a broken/empty site. When AI content is used, the activity feed
records it plainly ("AI wrote the initial website copy"); when the fallback
is used, it isn't claimed as AI-written anywhere.

### Stripe payment links

From the **Company** page, each offering has a **"+ Connect Stripe payment
link"** action. Create a product and a
[Payment Link](https://stripe.com/docs/payment-links) in your own Stripe
Dashboard, then paste the resulting `https://buy.stripe.com/...` URL in.
Mero validates it's a plausible `stripe.com` HTTPS link and stores it on
that offering (`setOfferingPaymentLink` in
`src/store/useWorkspaceStore.ts`). The website's pricing section then
renders a live "Buy now" link straight to that Stripe-hosted checkout page
for any connected offering, and a plain "Payment not connected" label for
any that aren't — no backend, secret key, or webhook required on Mero's
side, since Stripe hosts and handles the actual checkout.

## Data & persistence

All workspace data (company, workforce, tasks, approvals, goals, knowledge,
website, settings) is stored in the browser via `localStorage`
(`src/store/useWorkspaceStore.ts`, a Zustand store with the `persist`
middleware). Nothing is sent to a server. The data model
(`src/types/index.ts`) is written to be storage-agnostic, so the same shapes
can later be persisted through a real backend/API instead.

## Project structure

```
mero/
├── src/                     # The static frontend — this is what GitHub Pages deploys
│   ├── ai/                  # AIProvider, DemoAIProvider, LocalModelAIProvider, BackendAIProvider, orchestrator, personas, generateWebsiteContent
│   ├── components/          # Shared UI primitives (Button, Card, Sidebar, ChatThread, ...)
│   ├── data/                # Deterministic company/website/workforce generators + catalogs
│   ├── features/            # Feature-scoped UI (company, workforce, tasks, goals, website, ai, EnableAIStep, OfferingPaymentLink)
│   ├── pages/                # Route-level pages
│   ├── store/                # Zustand stores (workspace data, UI state, AI backend config)
│   ├── types/                 # Shared TypeScript data models
│   ├── utils/                  # Small formatting/id helpers
│   ├── App.tsx                  # Route table
│   └── main.tsx                  # Entry point (HashRouter)
├── public/                  # Static assets (favicon, ...)
├── server/
│   └── mero-ai-backend/     # Optional Cloudflare Worker — deployed separately, holds your Anthropic API key
├── .github/workflows/deploy.yml   # GitHub Pages deployment workflow (builds only src/, not server/)
├── index.html
└── vite.config.ts
```

## What's real vs. simulated

- **Real**: task/approval/goal state, workforce hiring, website editing,
  knowledge base, Stripe payment link storage and live checkout links, all
  local persistence, all navigation.
- **Website copy at creation time**: genuinely written by your connected
  live AI (in-browser model or backend), grounded in the idea you typed —
  not labeled Demo, since live AI is required before creation can start. If
  that generation call fails, Mero falls back to a deterministic template
  per-field rather than leaving the site broken; the activity feed only
  credits the AI when its content was actually used.
- **Ongoing AI chat responses** (AI CEO, employees, website AI editor):
  genuinely real once a provider is live; degrades to a labeled **Demo**
  response if the live provider becomes unreachable after the company
  already exists.
- **Always simulated regardless of AI mode**: the company blueprint's
  structured fields (name, brand palette, goals) from the generator, the AI
  CEO briefing content (a template summary of your real local data, not a
  model call), the website AI editor's rule-based command parsing, and
  seeded example activity/tasks/opportunities created when a company is
  first built.
- **Honest empty states, never fabricated**: revenue, customers, leads,
  conversion, website visitors, analytics, and opportunity detection all
  require a connected data source and will say so instead of inventing a
  number.
