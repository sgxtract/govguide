# Lesson 13 — Deploy

## What we built

- **Hosting on Vercel**, connected to GitHub: every PR gets a preview URL, merging to `main`
  deploys production. Setup steps and settings are in `docs/deployment.md`.
- **Visitor counts** with Vercel Web Analytics (`features/analytics/`), production only, with
  query strings removed before anything is sent (ADR 0013). `/privacy` says what's collected.
- A **quiet launch**: production is live on Vercel's own URL, not announced yet. A custom domain
  comes later (one environment variable, `NEXT_PUBLIC_SITE_URL`).

## Why

- The site is static, so hosting is just serving built pages. Vercel makes the PR workflow the
  release process: preview to check on a phone, merge to ship.
- We want to know which guides people need, without collecting personal data. Search words can
  hold names or ID numbers, so they never leave the phone.
- Analytics renders only when `VERCEL_ENV` is `production`. Elsewhere its script would 404 or
  load a debug script from Vercel, and count our own testing.

## Gotchas we found by reading the current docs

- Vercel picks the pnpm version from the lockfile format (9.0 means pnpm 9 or 10), not from
  `packageManager`. `ENABLE_EXPERIMENTAL_COREPACK=1` makes it use ours (pnpm 12).
- `engines.node` in `package.json` overrides the Node version in Vercel's settings. `>=22` gives
  Node 24, the same as `.nvmrc`.
- `beforeSend` is a function, so it can't be passed from the root layout (a Server Component):
  it lives in a small client component.

## Key commands

```sh
pnpm check && pnpm build    # what Vercel's build has to survive
gh pr checks <number>       # CI and the Vercel check before merging
```

## What to remember

- Never set `SHOW_DRAFTS` on Production.
- Any change to what analytics collects updates `/privacy` in the same PR.
- Before announcing: fill `content/holidays.yaml` and publish more guides.
