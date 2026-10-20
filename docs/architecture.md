# Architecture

## Content flow

```
content/*.yaml
   → loaders/file-loader.ts   (parse YAML, validate with Zod, check references)
   → repository.ts            (the only API pages use; hides drafts in production)
   → app/[city]/… pages       (static, generated at build time)
```

Phase 2 replaces the file loader with a Postgres loader; the repository API stays the same.

See `content-model.md` for fields and `decisions/` for the reasoning.

## Routes

| URL                         | File                                    | Notes                                                                          |
|-----------------------------|-----------------------------------------|--------------------------------------------------------------------------------|
| `/`                         | `app/page.tsx`                          | Redirects to the only city; lists cities once there are several                |
| `/[city]`                   | `app/[city]/page.tsx`                   | City home: categories + all guides                                             |
| `/[city]/categories/[slug]` | `app/[city]/categories/[slug]/page.tsx` | Guides in one category                                                         |
| `/[city]/services/[slug]`   | `app/[city]/services/[slug]/page.tsx`   | The guide. Only visible guides are built; drafts 404 in production             |
| `/[city]/agencies`          | `app/[city]/agencies/page.tsx`          | Offices index: agencies active in the city, with addresses                     |
| `/[city]/agencies/[slug]`   | `app/[city]/agencies/[slug]/page.tsx`   | Agency: official channels, local offices (anchored by office slug), its guides |
| `/[city]/search`            | `app/[city]/search/page.tsx`            | Search page; `?q=` read in the browser; lists all guides without JS            |
| `/[city]/search-index.json` | `app/[city]/search-index.json/route.ts` | Static search index, built per city at build time                              |

- `app/[city]/layout.tsx` renders the header (with city name) and `<main>`, and generates one static copy per city (`dynamicParams = false`: unknown cities 404).
- The root layout holds only the skip link and footer. Pages outside a city render `<SiteHeader />` without a city.
- Route props use Next's generated `PageProps<"/route">` / `LayoutProps<"/route">` types; `pnpm typecheck` runs `next typegen` first.

## Data stored on the visitor's device

- `color-scheme`: the light/dark override (Lesson 01).
- `govguide:checklist:<guide path>`: ticked requirement labels (Lesson 07).

Nothing is sent to a server. The privacy page (Lesson 12) will say this.

## SEO

- Site address: `src/config/site-url.ts` (`NEXT_PUBLIC_SITE_URL` → Vercel production URL → localhost). Server-only.
- Every indexable page uses `pageMetadata()` (title, description, canonical, share text).
- Share cards: `opengraph-image.tsx` at `/`, `/[city]` and `/[city]/services/[slug]`, all rendered by `features/seo/og-card.tsx` at build time.
- `sitemap.ts` and `robots.ts` read from the repository, like the pages.

## Tests

| Command         | What                                                                                                    | Where         |
|-----------------|---------------------------------------------------------------------------------------------------------|---------------|
| `pnpm test`     | Unit tests (Vitest): loader, integrity rules, freshness, formatting, search                             | `tests/unit/` |
| `pnpm test:e2e` | End-to-end (Playwright, Pixel 7): journeys, search, publishing rules, axe on every page in both schemes | `tests/e2e/`  |

- E2E tests build the site with `CONTENT_DIR=tests/fixtures/content`: a fictional city (Testville) with one published guide, one draft, one empty category. Never real content.
- After `pnpm test:e2e`, `.next` contains the Testville build. Run `pnpm build` before `pnpm start`.
- CI (`.github/workflows/ci.yml`) runs `pnpm check` + `pnpm build` and the e2e suite on every PR. Both are required to merge.

## Feedback
- `features/feedback/report-links.ts`: pure URL builders (GitHub issue forms pre-filled by field id; mailto with %20 and CRLF). Unit tested.
- `features/feedback/report-actions.tsx`: `ReportOutdated` (guides, agency pages) and `SuggestService` (empty states, /contribute).
- `feedbackEmail` in `config/site.ts`: when set, "Email GovGuide" appears as the primary action everywhere.
- Issue forms in `.github/ISSUE_TEMPLATE/`; labels `outdated-info` and `new-service` must exist in the repo.
