# Deployment

GovGuide is fully static: every page is built ahead of time from `content/`. It's hosted on
Vercel, on the maintainer's personal account (sgxtract).

## How a change reaches the site

- Every pull request gets a **preview deployment**; its URL is posted on the PR.
  `robots.ts` blocks search engines on previews.
- Merging to `main` deploys **production**.
- CI (GitHub Actions) still runs on every PR. Merge only when CI and the Vercel check are green.

## First-time setup (done once)

1. On vercel.com, **Add New → Project**, import `sgxtract/govguide`. Next.js is detected; keep
   the default build command (`pnpm build`) and output.
2. Before the first deploy, open **Environment Variables** and add:

   | Name                           | Value  | Environments                     | Why                                                                                                                                                        |
   | ------------------------------ | ------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `ENABLE_EXPERIMENTAL_COREPACK` | `1`    | Production, Preview, Development | Use the pnpm version in `package.json` (`packageManager`). Without it, Vercel picks pnpm 9 or 10 from the lockfile format, which isn't the version we use. |
   | `SHOW_DRAFTS`                  | `true` | **Preview only**                 | Review draft guides on PR previews. Never on Production.                                                                                                   |

3. Node.js: nothing to set. `engines.node` (`>=22`) in `package.json` overrides the project
   setting and gives the latest 24.x, the same as `.nvmrc`.
4. Deploy. Check the build log says the right pnpm version.
5. **Analytics → Enable** for the project, then redeploy (the analytics routes are added at
   build time).

## After a deploy

- Open the production URL on a phone: home, a published guide, search, `/privacy`.
- Analytics: on any page, DevTools → Network shows a request ending in `/view`. The address it
  sends has no `?q=` (see ADR 0013).
- Run the Lighthouse and manual checks in `quality.md` on the production URL.

## Custom domain (later)

1. Vercel → **Settings → Domains**: add it and follow the DNS instructions.
2. Set `NEXT_PUBLIC_SITE_URL` (Production) to `https://<domain>` and redeploy. Canonical links,
   the sitemap and share images then use it. Until then, Vercel's production URL is used.

## Before telling people about it

- At least one guide `published` (production hides drafts).
- `content/holidays.yaml` filled in for the year, so offices don't show "Open now" on holidays.
- `config/site.ts`: `repoUrl` and `feedbackEmail` point to the right places.
- GitHub labels `outdated-info` and `new-service` exist (issue forms use them).

## Analytics

Vercel Web Analytics (ADR 0013): no cookies, no personal data, query strings removed. Any change
to what's collected updates `/privacy` in the same PR.
