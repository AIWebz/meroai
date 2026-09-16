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

## Features

- **AI Company Generator** — describe an idea, review an editable blueprint
  (name, brand, offerings, goals, recommended workforce), and watch Mero
  "build" the company.
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
  model (hero, features, FAQ, testimonials, CTA, contact...), a desktop /
  tablet / mobile preview, and an AI command box ("Create an FAQ section",
  "Change the hero headline", "Make the homepage more premium") that edits
  the site directly.
- **Opportunity Engine & Analytics** — honest empty states until you connect
  a real data source; nothing is fabricated.
- **Knowledge base** — an editable company memory (description, brand voice,
  products, customers, policies, goals, decisions).
- **Integrations** — Gmail, Shopify, Stripe, Google Analytics, and more,
  each clearly marked `Connect` or `Coming soon`. Nothing is ever shown as
  connected unless you connected it.

## Demo mode, honestly

This build's "AI" is a fully designed **demo intelligence layer**: local,
rule-based logic that produces realistic, persona-appropriate responses with
zero network calls and zero API keys. Every simulated response is visually
labeled **Demo** in the UI. Metrics that require real data (revenue,
customers, conversion, traffic) show *"Connect your data to see live
metrics"* rather than an invented number.

The codebase is intentionally structured so a real AI backend can be
connected later without a frontend rewrite — see [AI configuration](#ai-configuration) below.

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

**No AI API key is used or stored anywhere in this repository or the built
site.** A private API key embedded in static frontend JavaScript is not
secret — anyone can read it out of the shipped bundle — so this build
deliberately ships with a local `DemoAIProvider` instead
(`src/ai/demoProvider.ts`) that produces realistic responses without any
network call.

The AI layer is abstracted behind a single interface so a real backend can
be added later without touching any page or component:

```
AIProvider  →  AIOrchestrator  →  AI CEO / AI Employees  →  Tasks
```

- `src/ai/provider.ts` — the `AIProvider` interface every provider implements.
- `src/ai/demoProvider.ts` — the local, no-network demo implementation used today.
- `src/ai/orchestrator.ts` — routes chat and generates the AI CEO briefing; the only thing the UI talks to.

To connect a real model, implement `AIProvider` against a **secure backend
you control** (a small server or edge function that holds the API key and
proxies requests — never the browser), then pass that provider into
`AIOrchestrator` in place of `demoProvider`. Nothing else in the app needs
to change.

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
├── src/
│   ├── ai/                # AIProvider, DemoAIProvider, orchestrator, personas
│   ├── components/         # Shared UI primitives (Button, Card, Sidebar, ChatThread, ...)
│   ├── data/               # Deterministic company/website/workforce generators + catalogs
│   ├── features/           # Feature-scoped UI (company, workforce, tasks, goals, website, ai)
│   ├── pages/               # Route-level pages
│   ├── store/               # Zustand stores (workspace data + UI state)
│   ├── types/               # Shared TypeScript data models
│   ├── utils/                # Small formatting/id helpers
│   ├── App.tsx               # Route table
│   └── main.tsx              # Entry point (HashRouter)
├── public/                  # Static assets (favicon, ...)
├── .github/workflows/deploy.yml   # GitHub Pages deployment workflow
├── index.html
└── vite.config.ts
```

## What's real vs. simulated

- **Real**: task/approval/goal state, workforce hiring, website editing,
  knowledge base, all local persistence, all navigation.
- **Simulated (clearly labeled "Demo")**: AI chat responses, the company
  blueprint generator, the AI CEO briefing content, and seeded example
  activity/tasks/opportunities created when a company is first built.
- **Honest empty states, never fabricated**: revenue, customers, leads,
  conversion, website visitors, analytics, and opportunity detection all
  require a connected integration and will say so instead of inventing a
  number.
