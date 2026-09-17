# Mero

**Build a company. Let AI design it.**

Mero is an AI that designs an entire company from a plain-language idea:
name, brand, logo, offerings, goals, and a real site — then lets you publish
that site straight to your own GitHub account. You choose up front whether
you're building a **tool** (software people use) or a **shop** (products you
sell), and everything Mero designs reflects that choice.

Mero ships as a **fully static site**. There is no backend, no database, and
no server that has to stay running. Everything — your company, its tasks,
goals, and site — lives in your browser's `localStorage`. Refreshing the
page restores your workspace exactly where you left it.

Real AI is required before you can build a company: the first step of
company creation is turning on a live AI provider, either a model that runs
entirely in your browser (no key at all) or a small backend you deploy
yourself. Once it's on, that same live AI designs your company's brand,
offerings, goals, and site copy, grounded in the idea you actually typed —
not a fill-in-the-blanks template. See [AI configuration](#ai-configuration).

## Features

- **AI Company Designer** — turn on live AI, describe an idea, choose tool
  or shop, and watch Mero design the whole company: name, tagline,
  description, brand personality/voice/colors, a procedurally-rendered logo,
  offerings (products or plans), goals, and site copy — all in one step, all
  editable before you commit to it.
- **Mero, your AI assistant** — a single chat (⌘K anywhere, or the panel on
  Overview) that helps with strategy, brand, and what to do next. Degrades
  to a clearly labeled **Demo** reply if live AI is ever unreachable.
- **Task system** — pending / working / awaiting approval / completed /
  failed / cancelled. A plain to-do list for your company, not a simulated
  workforce.
- **Approval Center** — flag a task as needing your approval before it
  proceeds; approve or reject it here.
- **Activity feed** — a timeline of everything that's happened, clearly
  labeled where it's demo activity.
- **Goals** — create goals with a target and deadline; progress is only ever
  shown when it comes from connected data, never invented.
- **Your site** — a generated multi-page site (hero, about, features,
  pricing, FAQ, contact) with a desktop / tablet / mobile preview, written
  once by your connected AI when the company was created.
- **Stripe payment links** — connect a Stripe
  [Payment Link](https://stripe.com/docs/payment-links) to any offering from
  the Company page; the site's pricing section then renders a real "Buy
  now" button straight to Stripe-hosted checkout, live, with no backend or
  secret key on Mero's side.
- **Publish to GitHub** — push the generated site as real static files to a
  repository in your own GitHub account and turn on GitHub Pages, using a
  personal access token you provide. No backend of ours involved.
- **Opportunity Engine & Analytics** — honest empty states until you connect
  a real data source; nothing is fabricated.
- **Knowledge base** — an editable company memory (description, brand voice,
  offerings, customers, policies, goals, decisions).

## Real AI, honestly

Turning on live AI is **required** before you can build a company — it's
the first step of the creation flow, and there's no way to skip it. Your
company's brand, offerings, goals, and site copy are designed for real by
whichever AI you connect, grounded in the idea you describe and whether
you're building a tool or a shop.

Two ways to go live, both explained in that step: run a small open-weight
model entirely in your browser via WebGPU (no key, ever), or deploy the
small backend in [`server/mero-ai-backend`](server/mero-ai-backend) and
connect its URL. The in-browser model generates genuinely new text
on-device; the backend route chats with the real
[Claude API](https://claude.com/api) — see
[AI configuration](#ai-configuration) below.

Once a company exists, Mero's assistant chat still degrades gracefully to a
labeled **Demo** response if the live provider is ever unreachable or
misconfigured — that fallback exists for ongoing chat. It doesn't apply to
the one-time company-design generation, which instead falls back to a
clearly non-AI deterministic draft (see
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

This is the deployment for **Mero itself** (the app). The companies you
build *with* Mero are published separately — see
[Publishing your company to GitHub](#publishing-your-company-to-github)
below.

## AI configuration

**No AI API key is ever hardcoded in this repository or the built site.**
A private API key embedded in static frontend *source code* isn't secret —
anyone can read it out of the shipped bundle, which is why Mero never ships
with one baked in. Mero's AI layer is abstracted behind a single interface
so it can run in any of these modes without any page or component caring
which one is active:

```
AIProvider  →  AIOrchestrator  →  Mero's assistant chat / company designer
```

- `src/ai/provider.ts` — the `AIProvider` interface every provider implements.
- `src/ai/demoProvider.ts` — a local, no-network provider that produces realistic, clearly "Demo"-labeled responses. Used for ongoing chat if live AI ever becomes unreachable after a company exists.
- `src/ai/localModelProvider.ts` (+ `src/ai/localModel/engine.ts`) — runs a small open-weight model entirely in the browser via WebGPU. No key, ever.
- `src/ai/backendProvider.ts` — calls a secure backend you deploy yourself.
- `src/ai/resolveProvider.ts` — picks between them (in-browser model → backend → demo) and exposes `isAIEnabled()`, which gates the company creation flow.
- `src/ai/orchestrator.ts` — routes chat through whichever provider is active; also builds the local briefing from workspace data (never a model call, so it's never fabricated).
- `src/ai/generateCompanyWithAI.ts` — asks the active live provider to design the new company (brand, offerings, goals, site copy) as structured JSON, grounded in the idea and tool/shop choice; used once, right after the idea step.

### The AI gate: Step 1 of company creation

Going to **Build My Company** now opens on **"Turn on Mero's AI"** before
anything else. You can't describe your company or see a design until one of
the two options below is live — there's no "skip" or demo-only path here,
because the company design this step unlocks is written by that live AI,
not a template. Once a provider is enabled it's remembered (in
`localStorage`, just like the rest of your workspace), so returning users
don't see this step again unless they disable AI in Settings.

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
support and shows a clear message if it isn't available). Response quality
is noticeably below Claude — this is a genuinely small model, not a
scaled-down version of a frontier one; the deterministic fallback (see
below) exists precisely because a small model won't always follow the JSON
format reliably.

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

### How the AI designs your company

Right after the idea + tool/shop step, Mero asks the live provider to
design the entire company as one structured JSON object — name, tagline,
description, industry, target audience, business model, brand personality,
voice, a 3-color palette, offerings (2-3 products for a shop, 2 pricing
tiers for a tool), goals, and site copy (hero, about, three features, three
FAQ items, CTA) — grounded in the exact idea text and the tool/shop choice
(`src/ai/generateCompanyWithAI.ts`). A deterministic draft is generated
instantly as a base; whatever the AI successfully returns is layered on top
of it field-by-field (`applyAIContent` in `src/data/companyGenerator.ts`)
before the review step ever renders — so what you review and edit is what
you get, not silently overwritten afterward. If the AI call fails, times
out, or returns something that doesn't parse — which can happen with the
smaller in-browser model in particular — the deterministic draft is what
you see instead, so company creation never fails or produces a broken/empty
company.

The logo is a real, code-rendered SVG lettermark (`src/utils/logo.ts`,
`src/components/CompanyLogoMark.tsx`) built from the company's initials and
its AI-chosen palette — not a text description, since a text model can't
generate a raster/vector image. The AI's contribution is the name and
colors; code renders the actual mark, both in the app and in the published
site.

### Stripe payment links

From the **Company** page, each offering has a **"+ Connect Stripe payment
link"** action. Create a product and a
[Payment Link](https://stripe.com/docs/payment-links) in your own Stripe
Dashboard, then paste the resulting `https://buy.stripe.com/...` URL in.
Mero validates it's a plausible `stripe.com` HTTPS link and stores it on
that offering (`setOfferingPaymentLink` in
`src/store/useWorkspaceStore.ts`). The site's pricing section then renders
a live "Buy now" link straight to that Stripe-hosted checkout page for any
connected offering, and a plain "Payment not connected" label for any that
aren't — no backend, secret key, or webhook required on Mero's side, since
Stripe hosts and handles the actual checkout. This applies to the live
in-app preview and to what gets published to GitHub.

## Publishing your company to GitHub

The **Site** page renders the generated site and lets you publish it for
real. Paste a GitHub
[personal access token](https://github.com/settings/tokens/new?scopes=repo&description=Mero)
with `repo` scope and pick a repository name; Mero calls the GitHub REST API
directly from your browser (`src/site/publishToGithub.ts`) to create (or
reuse) that repository under your own account, push the site as real static
HTML/CSS files (`src/site/renderStaticSite.ts` — plain markup, no build
step, no framework required to view it), and turn on GitHub Pages for it.

The token is stored only in this browser's `localStorage`
(`src/store/useGithubStore.ts`) and sent only to `api.github.com` — never to
any server of ours, never committed anywhere. There is no OAuth flow and no
backend of ours in this path; it's the same "bring your own credential"
pattern as the Stripe payment links and the AI backend URL. GitHub Pages
can take a minute to go live after the first publish. Re-publishing updates
the same repository's files in place.

## Data & persistence

All workspace data (company, tasks, approvals, goals, knowledge, site,
settings) is stored in the browser via `localStorage`
(`src/store/useWorkspaceStore.ts`, a Zustand store with the `persist`
middleware). Nothing is sent to a server except the two explicit,
user-initiated integrations above (your chosen AI provider, and GitHub when
you publish). The data model (`src/types/index.ts`) is written to be
storage-agnostic, so the same shapes can later be persisted through a real
backend/API instead.

## Project structure

```
mero/
├── src/                     # The static frontend — this is what GitHub Pages deploys
│   ├── ai/                  # AIProvider, DemoAIProvider, LocalModelAIProvider, BackendAIProvider, orchestrator, personas, generateCompanyWithAI
│   ├── components/          # Shared UI primitives (Button, Card, Sidebar, ChatThread, CompanyLogoMark, ...)
│   ├── data/                # Deterministic company/website/task generators
│   ├── features/            # Feature-scoped UI (company creation steps, ai, site publish)
│   ├── pages/                # Route-level pages
│   ├── site/                  # Static site rendering + GitHub publish client
│   ├── store/                # Zustand stores (workspace data, UI state, AI config, GitHub config)
│   ├── types/                 # Shared TypeScript data models
│   ├── utils/                  # Logo generation + small formatting/id helpers
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

- **Real**: task/approval/goal state, the procedural logo, Stripe payment
  link storage and live checkout links, the published GitHub repository and
  Pages site once you publish, all local persistence, all navigation.
- **Company design at creation time** (brand, offerings, goals, site copy):
  genuinely designed by your connected live AI (in-browser model or
  backend), grounded in the idea and tool/shop choice you gave — not
  labeled Demo, since live AI is required before creation can start. If
  that generation call fails, Mero falls back to a deterministic draft
  per-field rather than leaving the company broken.
- **Ongoing AI chat** (Mero's assistant): genuinely real once a provider is
  live; degrades to a labeled **Demo** response if the live provider
  becomes unreachable after the company already exists.
- **Always simulated regardless of AI mode**: the deterministic draft's
  structured fields when AI generation fails or is partially incomplete,
  the local briefing panel (a template summary of your real local data, not
  a model call), and a seeded starter task or two created when a company is
  first built.
- **Honest empty states, never fabricated**: revenue, customers, leads,
  conversion, site visitors, analytics, and opportunity detection all
  require a connected data source and will say so instead of inventing a
  number.
