# Architecture

## Content flow

```
content/*.yaml
   → lib/content/loaders/file-loader.ts  (parse YAML, validate with Zod, check references)
   → lib/content/compose.ts              (national guide + each city's part; visibility rules)
   → lib/content/repository.ts           (the only API pages use; hides drafts in production)
   → app/(site)/… pages                  (static, generated at build time)
```

Guides are written once, nationally, in `content/services/`. Each city adds only what is local
(offices, tips) or, for a city-run service, its own version of the guide (`decisions/0012`).
`compose.ts` is pure, so the combining rules are unit-tested without Next.js.

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
│   ├── cities/          # CityList, CitySwitch (city picker) and its store
│   ├── feedback/        # report links (pure) + ReportOutdated / SuggestService
│   ├── offices/         # open-status (pure), OpenStatusLabel, OfficeCard, OfficeRows
│   ├── search/          # engine options, index builder, SearchForm, SearchBox
│   ├── seo/             # metadata, structured data, share card
│   └── services/        # GuideSections (the guide body) and its parts: AtAGlance, StepRoute…
├── lib/
│   ├── content/         # schemas, loader, integrity rules, compose, repository, freshness
│   └── utils/format.ts  # ₱, dates, times, days, durations
├── config/              # site name, repo URL, feedback email, site URL
└── styles/globals.css   # tokens, base styles, print
```

## Routes

| URL                                                | Notes                                                                                        |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `/`                                                | Home: the question + search, most looked up, topics, the list of cities                      |
| `/services`                                        | All guides, grouped by topic                                                                 |
| `/services/[slug]`                                 | The guide, with the city picker. Only visible guides are built; drafts 404 in production     |
| `/categories/[slug]`                               | Guides in one topic                                                                          |
| `/agencies`                                        | Offices and hours, grouped by agency                                                         |
| `/agencies/[slug]`                                 | Agency: offices grouped by city (anchored `#<city>-<office>`), official channels, its guides |
| `/search`                                          | Search page; `?q=` read in the browser; lists all guides without JS                          |
| `/search-index.json`                               | Static search index, nationwide                                                              |
| `/[city]`                                          | City hub: hotlines, every office with open-now status, the guides the city runs              |
| `/about`, `/contribute`, `/disclaimer`, `/privacy` | Site pages                                                                                   |
| `/styleguide`                                      | Design tokens and components (not indexed)                                                   |

- Every page except the site pages lives in the `app/(site)/` route group, whose layout renders
  the app bar and `<main>`. Site pages use `StandalonePage`.
- Static routes win over `/[city]`, so a city folder can't use a reserved name (`about`,
  `agencies`, `categories`, `contribute`, `disclaimer`, `opengraph-image`, `privacy`, `search`,
  `services`, `styleguide`); the loader rejects it. `dynamicParams = false` makes unknown cities 404.
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
| `CitySwitch`           | Shows the reader's city; every city is shown without JS        |
| `OpenStatusLabel`      | "Now" only exists in the browser (`decisions/0010`)            |
| `PrintButton`          | `window.print()`                                               |

## Data stored on the visitor's device

- `color-scheme`: the light/dark override.
- `govguide:checklist:<guide path>`: ticked requirement labels (`#<city>` added for a city-run guide).
- `govguide:city`: the city chosen in the city picker, shared by every guide.

Nothing is sent to a server. The privacy page says this.

## SEO

- Site address: `config/site-url.ts` (`NEXT_PUBLIC_SITE_URL` → Vercel production URL → localhost).
- Every indexable page uses `pageMetadata()` (title, description, canonical, share text).
- Share cards: `opengraph-image.tsx` at `/`, `/[city]` and each guide, rendered by
  `features/seo/og-card.tsx` at build time. Inside the `(site)` group Next.js gives them a hashed
  name (`opengraph-image-1m5q4s`); pages link the right one automatically.
- `GovernmentService` JSON-LD on published guides: `areaServed` is the Philippines for a national
  guide, and the city for each published version of a city-run guide. `BreadcrumbList` from
  `PageHeader`.
- `sitemap.ts` and `robots.ts` read from the repository, like the pages.

## Tests

| Command         | What                                                                                                                                        | Where         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `pnpm test`     | Unit (Vitest): loader, integrity, compose, freshness, formatting, search, open-now, stores                                                  | `tests/unit/` |
| `pnpm test:e2e` | End-to-end (Playwright, Pixel 7): journeys, search, open-now with a fixed clock, publishing rules, print, axe on every page in both schemes | `tests/e2e/`  |

- E2E builds the site with `CONTENT_DIR=tests/fixtures/content`: two fictional cities
  (Testville, Otherville), a national guide with an office in each, a city-run guide with a
  version for each, one draft, one empty topic and one holiday. Never real content.
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
