# Architecture

## Content flow

```
content/*.yaml
   → lib/content/loaders/file-loader.ts  (parse YAML, validate with Zod, check references)
   → lib/content/repository.ts           (the only API pages use; hides drafts in production)
   → app/[city]/… pages                  (static, generated at build time)
```

Phase 2 can replace the file loader with a Postgres loader; the repository API stays the same.
See `content-model.md` for fields and `decisions/` for the reasoning.

## Folders

```
src/
├── app/                 # routes only: pages, layouts, metadata files
├── components/
│   ├── layout/          # SiteHeader, PageHeader, SiteFooter, StandalonePage, theme toggle
│   ├── seo/             # JsonLd
│   └── ui/              # Link (prefetch on intent), Icon, Notice, buttonClass, VerifyText…
├── features/
│   ├── agencies/        # display names, level labels
│   ├── categories/      # TopicTiles
│   ├── cities/          # CityList
│   ├── feedback/        # report links (pure) + ReportOutdated / SuggestService
│   ├── offices/         # open-status (pure), OpenStatusLabel, OfficeCard, OfficeRows
│   ├── search/          # engine options, index builder, SearchForm, SearchBox
│   ├── seo/             # metadata, structured data, share card
│   └── services/        # guide parts: AtAGlance, SectionTabs, RequirementChecklist, StepRoute…
├── lib/
│   ├── content/         # schemas, loader, integrity rules, repository, freshness
│   └── utils/format.ts  # ₱, dates, times, days, durations
├── config/              # site name, repo URL, feedback email, site URL
└── styles/globals.css   # tokens, base styles, print
```

## Routes

| URL                                                | Notes                                                                             |
| -------------------------------------------------- | --------------------------------------------------------------------------------- |
| `/`                                                | Redirects to the only city; lists cities once there are several                   |
| `/[city]`                                          | Home: the question + search, most looked up, topics, offices with open-now status |
| `/[city]/services`                                 | All guides, grouped by topic                                                      |
| `/[city]/services/[slug]`                          | The guide. Only visible guides are built; drafts 404 in production                |
| `/[city]/categories/[slug]`                        | Guides in one topic                                                               |
| `/[city]/agencies`                                 | Offices and hours, grouped by agency                                              |
| `/[city]/agencies/[slug]`                          | Agency: local offices (anchored by office slug), official channels, its guides    |
| `/[city]/search`                                   | Search page; `?q=` read in the browser; lists all guides without JS               |
| `/[city]/search-index.json`                        | Static search index, built per city                                               |
| `/about`, `/contribute`, `/disclaimer`, `/privacy` | Site pages                                                                        |
| `/styleguide`                                      | Design tokens and components (not indexed)                                        |

- `app/[city]/layout.tsx` renders the app bar and `<main>`; `dynamicParams = false` makes
  unknown cities 404. Pages outside a city use `StandalonePage`.
- Route props use Next's generated `PageProps<"/route">` / `LayoutProps<"/route">` types;
  `pnpm typecheck` runs `next typegen` first.
- Cache Components are off (`decisions/0005`): every page is static content.

## Client components (the only JavaScript we ship besides React)

| Component              | Why it's client-side                                           |
| ---------------------- | -------------------------------------------------------------- |
| `Link`                 | Prefetch on touch/hover/focus, not on sight (`decisions/0008`) |
| `ColorSchemeToggle`    | Light/dark override                                            |
| `SearchBox`            | Loads MiniSearch + the index on first focus (`decisions/0006`) |
| `SectionTabs`          | Marks the section you're reading                               |
| `RequirementChecklist` | Ticks, count and progress, saved on this phone                 |
| `OpenStatusLabel`      | "Now" only exists in the browser (`decisions/0010`)            |
| `PrintButton`          | `window.print()`                                               |

## Data stored on the visitor's device

- `color-scheme`: the light/dark override.
- `govguide:checklist:<guide path>`: ticked requirement labels.

Nothing is sent to a server. The privacy page says this.

## SEO

- Site address: `config/site-url.ts` (`NEXT_PUBLIC_SITE_URL` → Vercel production URL → localhost).
- Every indexable page uses `pageMetadata()` (title, description, canonical, share text).
- Share cards: `opengraph-image.tsx` at `/`, `/[city]` and each guide, rendered by
  `features/seo/og-card.tsx` at build time.
- `GovernmentService` JSON-LD on published guides; `BreadcrumbList` from `PageHeader`.
- `sitemap.ts` and `robots.ts` read from the repository, like the pages.

## Tests

| Command         | What                                                                                                                                        | Where         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `pnpm test`     | Unit (Vitest): loader, integrity, freshness, formatting, search, open-now, checklist store                                                  | `tests/unit/` |
| `pnpm test:e2e` | End-to-end (Playwright, Pixel 7): journeys, search, open-now with a fixed clock, publishing rules, print, axe on every page in both schemes | `tests/e2e/`  |

- E2E builds the site with `CONTENT_DIR=tests/fixtures/content`: a fictional city (Testville)
  with one published guide, one draft, one empty topic and one holiday. Never real content.
- After `pnpm test:e2e`, `.next` contains the Testville build. Run `pnpm build` before `pnpm start`.
- Locally without Playwright's browser: `PW_CHROME=/usr/bin/google-chrome pnpm test:e2e`.
- CI (`.github/workflows/ci.yml`) runs `pnpm check`, `pnpm build` and the e2e suite on every PR.

## Feedback

- `features/feedback/report-links.ts`: pure URL builders (GitHub issue forms pre-filled by field
  id; mailto with %20 and CRLF). Unit tested.
- `features/feedback/report-actions.tsx`: `ReportOutdated` (guides, agency pages) and
  `SuggestService` (empty states, /contribute).
- `feedbackEmail` and `repoUrl` in `config/site.ts`.
- Issue forms in `.github/ISSUE_TEMPLATE/`; labels `outdated-info` and `new-service` must exist.
