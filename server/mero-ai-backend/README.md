# Mero AI backend

A small Cloudflare Worker that proxies Mero's AI chat requests to the real
[Claude API](https://claude.com/api). This is the only place an Anthropic API
key should ever live — it's stored as a Worker secret, never committed to
this repo and never sent to the browser.

Mero's frontend (`../../src`) stays a fully static site. This worker is an
optional, separately-deployed piece: without it, Mero runs entirely in Demo
mode. With it, chat with the AI CEO and AI employees calls a real model.

## Why a Worker (and not just calling Claude from the browser)?

A private API key embedded in static frontend JavaScript isn't private — it
ships in the bundle anyone can read. This worker runs server-side (on
Cloudflare's edge), holds the key, and only ever returns generated text to
the browser. It also never has to "stay running" the way a traditional
server does — Cloudflare invokes it per request.

## Deploying

You'll need a [Cloudflare account](https://dash.cloudflare.com/sign-up) (the
free tier is enough for this) and an
[Anthropic API key](https://console.anthropic.com/).

```bash
cd server/mero-ai-backend
npm install

# Log in to Cloudflare (opens a browser window)
npx wrangler login

# Store your Anthropic API key as a secret — never put this in wrangler.toml
npx wrangler secret put ANTHROPIC_API_KEY

# Pick a shared secret (any random string) and store it too. This is a
# lightweight check so random people who find your worker's URL can't rack up
# API usage on your key — the Mero frontend will send it back on every
# request. It is NOT a strong security boundary (see note below).
npx wrangler secret put MERO_SHARED_SECRET

npm run deploy
```

`wrangler deploy` prints your worker's URL, something like:

```
https://mero-ai-backend.<your-subdomain>.workers.dev
```

## Connecting it to Mero

1. Open your deployed (or locally running) Mero app.
2. Go to **Settings → AI**.
3. Paste the worker URL into **Backend URL** and the value you chose for
   `MERO_SHARED_SECRET` into **Shared secret**.
4. Click **Test connection**, then **Save**.

The AI CEO and every AI employee will now answer using the real Claude API.
Clear the Backend URL any time to fall back to Demo mode.

## Local development

```bash
npm run dev
```

This runs the worker locally with `wrangler dev`. Put your local secrets in
a `.dev.vars` file (gitignored) in this directory:

```
ANTHROPIC_API_KEY=sk-ant-...
MERO_SHARED_SECRET=some-local-dev-secret
```

Then point Mero's Settings → AI backend URL at the printed `http://localhost:8787` address while developing.

## Request/response contract

```
POST /
{
  "message": "Sales are slow. What should we do?",
  "context": {
    "personaId": "ceo",
    "facts": { "companyName": "...", "personaTitle": "...", ... },
    "history": [{ "role": "user" | "assistant", "content": "..." }]
  }
}

200 OK
{ "content": "..." }

4xx/5xx
{ "error": "..." }
```

Any backend implementing this same contract works with Mero — this worker is
a reference implementation, not the only option. A small function on Vercel,
AWS Lambda, or a container you run yourself would work identically as long
as it returns this shape and keeps the API key server-side.

## Security notes (read this before exposing this publicly)

- The shared-secret header (`X-Mero-Secret`) deters casual abuse of your
  worker URL, but it's sent from the browser and stored in `localStorage`,
  so a determined attacker who inspects network requests can extract it.
  It is **not** equivalent to keeping the Anthropic key itself secret — the
  key never leaves this worker, which is the property that actually matters.
- For real production traffic, add
  [Cloudflare rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)
  on this route to cap requests per IP.
- The worker caps message length (4000 characters) and trims conversation
  history (last 8 messages) sent to the model to bound cost per request, but
  does not itself enforce a spending cap — set a
  [usage limit](https://console.anthropic.com/settings/limits) on your
  Anthropic account if you're concerned about runaway cost.
