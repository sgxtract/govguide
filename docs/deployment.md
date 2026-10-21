# Deployment

GovGuide is fully static: every page is built ahead of time from `content/`. Any host that runs
`next build && next start`, or a static Next host, works. Vercel is the plan.

## Vercel (recommended)

1. On vercel.com, **Add New → Project**, import the GitHub repository. Next.js and pnpm are
   detected; keep the defaults (`pnpm build`).
2. **Environment variables**
   - `NEXT_PUBLIC_SITE_URL`: the public address once there is a custom domain
     (e.g. `https://govguide.example`). Without it, Vercel's production URL is used.
   - `SHOW_DRAFTS=true` on the **Preview** environment only, if you want to review draft guides
     on pull-request previews. Never on Production.
3. Every pull request gets a preview deployment. `robots.ts` blocks search engines on previews.
4. Merging to `main` deploys production.

## Before the first public launch

- At least one guide `published` (production hides drafts; until then the home page shows
  "Guides are coming").
- `content/holidays.yaml` filled in for the year.
- `config/site.ts`: `repoUrl` and `feedbackEmail` point to the right places.
- GitHub labels `outdated-info` and `new-service` exist (issue forms use them).
- Run the checks in `quality.md` on the production build.

## Analytics (later)

Privacy-friendly only (Vercel Web Analytics, Plausible or Umami): no cookies, no personal data.
Update `/privacy` in the same PR.
