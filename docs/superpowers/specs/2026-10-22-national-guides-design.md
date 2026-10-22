# National guides, city details — design

- Date: 2026-10-22
- Status: Approved in conversation, awaiting spec review
- Lesson: 12 (deploy moves to Lesson 13, Phase 2 starts at 14)
- Replaces: ADR 0004 (YAML content, services stored per city)

## Goal

Write each government service once, nationally, and let every city add only what is
local: its offices (address, hours, phones, email) and local tips. A second city should
need only office files and a `city.yaml`, with no copied requirements.

Some services are run by the city or barangay (business permit, cedula, barangay
clearance). Their requirements and fees differ per city, so for those each city writes
its own version of the guide.

### Success criteria

- A new city is added with `city.yaml` + office files only; national guides show its
  offices automatically.
- The LTO guides verified in PR #19 exist once and serve every city.
- `pnpm content:todo` lists the same `[VERIFY]` values before and after the migration.
- Lint, typecheck, unit, e2e, `content:check` and production build pass.

### Not in scope

- City-specific holidays (fiestas). `holidays.yaml` stays national.
- Provinces as a separate level. A city remains the unit; "Sorsogon" keeps covering city
  and province.
- Per-city sub-pages or client-side loading of city data (approaches B and C below).
- Redirects from `/sorsogon/...` URLs: nothing is deployed yet.

## Decisions

| Question                    | Decision                                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Where does a citizen land?  | One national page per service, `/services/[slug]`, with a city picker.                                     |
| City-run services           | Same URL. National file describes the service; each city writes its requirements, steps, fees and sources. |
| Other pages                 | Home, services, categories, agencies and search become national. Each city keeps one hub page, `/[city]`.  |
| How the picker shows a city | Approach A: every city's block is in the static HTML; a small client picker shows the chosen one.          |

### Approaches considered for the picker

- **A. All cities in the page, picker shows one (chosen).** No extra requests, almost no
  JS, works without JS (every city block visible under its own heading). Page grows a few
  KB per city. Revisit at ~10–20 cities.
- **B. Static per-city sub-pages** (`/services/[slug]/[city]`), picker as links. Scales
  without limit; near-duplicate pages and a page load per pick.
- **C. Fetch a per-city JSON on pick.** Smallest page; nothing without JS and a second,
  client-side office card.

The content model and repository don't depend on this choice. Moving to B later changes
only the guide page's rendering.

## Content model

```
content/
├── agencies/                  # unchanged
├── categories.yaml            # unchanged
├── holidays.yaml              # unchanged
├── popular.yaml               # NEW: list of service slugs for "Most looked up" on /
├── services/                  # NEW: one file per guide, nationwide (file name = slug)
└── cities/<city>/
    ├── city.yaml              # name, province, description, hotlines (popular removed)
    ├── offices/               # unchanged
    └── services/              # what this city adds to a guide (file name = guide slug)
```

### National service file (`content/services/<slug>.yaml`)

A Zod discriminated union on `scope`.

- **Shared fields** (both scopes): `scope`, `title`, `summary`, `keywords`, `category`,
  `related`.
- **`scope: national`**: also `status`, `agency`, `whoCanApply`, `requirements`, `steps`,
  `fees`, `processingTime`, `online`, `tips`, `faqs`, `sources`, `lastVerified`. All have
  the same shapes and rules as today's service schema.
- **`scope: local`**: no further fields. A local file must not contain requirements,
  steps, fees, etc.; `z.strictObject` rejects them.

### City service file (`content/cities/<city>/services/<slug>.yaml`)

The slug must match a national service. Its shape depends on that service's scope.
Because the scope is only known after reading the national file, the loader validates a
city file with the schema chosen by the national file's `scope`.

- **For a national guide** (`cityNationalSchema`, optional file):
  - `offices` (optional list of office slugs in this city): replaces the default office
    list.
  - `tips` (optional): local tips, shown in the city's "Where to go" block.
- **For a local guide** (`cityLocalSchema`, required for the city to have the guide):
  `status`, `agency`, `offices`, `whoCanApply`, `requirements`, `steps`, `fees`,
  `processingTime`, `online`, `tips`, `faqs`, `sources`, `lastVerified`. Same shapes and
  rules as today.

### Offices shown for a city

- If the city file lists `offices`, show those.
- Otherwise, for a national guide, show every office in that city whose `agency` equals
  the guide's `agency`.
- For a local guide, show the city file's `offices`. If the list is empty, show none.

### `popular.yaml`

A list of service slugs, in display order. Unknown slugs fail the build. Guides that
aren't visible are skipped, as now.

### Integrity checks (build fails)

All existing checks keep working: unknown category or agency, unknown office, unknown
related service, duplicate slugs. New checks:

- A city service file with no matching national service.
- A city file that uses fields not allowed for that service's scope (via the schema).
- An office listed in a city file that doesn't exist **in that city**, or whose agency
  isn't the guide's agency. For local guides, the agency is the city file's `agency`.
- `popular.yaml` slug not found.
- A city folder with a reserved name (see Pages and routes).
- `related` must name national service slugs (it's no longer per-city).

## Visibility rules

| Item                               | Shown in production when                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| National guide (`scope: national`) | `status: published`                                                                                          |
| Local guide                        | At least one city version has `status: published`                                                            |
| City version of a local guide      | its `status: published`                                                                                      |
| City file for a national guide     | no `[VERIFY]` left (same rule as offices); otherwise its tips are hidden, but the default offices still show |
| Office, agency                     | no `[VERIFY]` left (unchanged)                                                                               |

In `pnpm dev`, or with `SHOW_DRAFTS=true`, everything shows with `[VERIFY]` highlighted.
This is unchanged.

A city "has" a guide (and appears in its picker) when:

- **National guide:** the city has at least one visible office for it, or a visible city
  file with tips.
- **Local guide:** the city has a visible city version.

## Repository API (`src/lib/content/repository.ts`)

The loader reads files into flat, validated lists: `services`, `cityServices` (each tagged
with `city` and `slug`), `offices`, `agencies`, `cities`, `categories`, `holidays` and
`popular`. All the combining happens in the repository, so a Postgres repository later
only replaces this layer.

```ts
type Guide = {
  service: Service;          // national file (either scope)
  cities: CityGuide[];       // cities that have this guide, sorted by name
};

type CityGuide = {
  city: City;
  offices: Office[];         // visible offices, per "Offices shown for a city"
  tips: string[];            // local tips (city file)
  local?: LocalGuideDetails; // local guides only: the city version's fields
};

getGuide(slug): Promise<Guide | undefined>
listServices(filter?: { category?: string; agency?: string }): Promise<Service[]>
listPopularServices(): Promise<Service[]>
listCities(): Promise<City[]>
getCity(slug): Promise<City | undefined>
getCityHub(city): Promise<{ city: City; offices: Office[]; localGuides: Service[] } | undefined>
getAgency(slug) / listAgencies()
listOffices(filter?: { city?: string; agency?: string }): Promise<Office[]>
getCategory(slug) / listCategories() / listHolidays()
```

- `listServices({ agency })` matches national guides by `agency`. Local guides match when
  any visible city version's `agency` matches.
- Types are inferred from the schemas, as now. The `Service` type is the discriminated
  union, so TypeScript stops page code from reading requirements off a local guide.

## Pages and routes

| Route                                                             | Content                                                                                                  |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `/`                                                               | National home: search, categories, popular (from `popular.yaml`), list of cities. No longer redirects.   |
| `/services`                                                       | All visible guides, category filter.                                                                     |
| `/services/[slug]`                                                | Guide page with city picker (below).                                                                     |
| `/categories/[slug]`                                              | Guides in the category.                                                                                  |
| `/agencies`                                                       | All visible agencies.                                                                                    |
| `/agencies/[slug]`                                                | Agency, its guides, its offices grouped by city.                                                         |
| `/search`, `/search-index.json`                                   | One national index.                                                                                      |
| `/[city]`                                                         | City hub: hotlines, all visible offices in the city, the city's local guides (links to `/services/...`). |
| `/about`, `/disclaimer`, `/privacy`, `/contribute`, `/styleguide` | Unchanged.                                                                                               |

All pages are statically generated with `dynamicParams = false`, as now. Reserved city
slugs are today only documented (`contribute`, `about`, `privacy`, `disclaimer`,
`styleguide`). They gain `services`, `categories`, `agencies` and `search`, and the loader
now rejects a city folder with a reserved name. Otherwise a static route would silently
shadow that city.

Removed: `/[city]/services`, `/[city]/services/[slug]`, `/[city]/categories/[slug]`,
`/[city]/agencies`, `/[city]/agencies/[slug]`, `/[city]/search` and
`/[city]/search-index.json`.

### Guide page (`/services/[slug]`)

- **National guide:** header, requirements checklist, steps, fees, online, FAQs, sources
  and last verified come from the national file. A **"Where to go"** section holds one block
  per city: office cards (with open-now status) and local tips.
- **Local guide:** header from the national file. The picker sits above "What to bring".
  Each city block holds that city version's requirements, steps, fees, processing time,
  online, tips, FAQs, offices, sources and last verified.
- **No city has it yet** (possible in dev only, because production hides such guides): a
  notice with the "Suggest a service" link.

### City picker (client component)

- A native `<select>` labelled "Your city". The choice is stored under one `localStorage`
  key shared by all guides, with every read and write in try/catch. Each city block is a
  server-rendered element with `data-city`. The picker sets `hidden` on blocks that don't
  match.
- **Exactly one city has the guide:** no dropdown. It reads "Showing: Sorsogon" and that
  block is shown.
- **Several cities, none chosen:** "Choose your city". Blocks stay hidden behind a short
  prompt. A stored city that doesn't have this guide counts as none chosen, and the page
  says "We haven't added [city] for this guide yet".
- **Without JS:** the picker isn't rendered and every block is visible under a heading
  with its city name.
- Built with current platform features per `/modern-web-guidance`. Styled within the
  counter-window design system (ADR 0009) per `/anti-slop-design`.

### Knock-on changes

- **Checklist state** is keyed by `slug` for national guides and by `slug + city` for local
  guides. Old keys are ignored; this is fine because nothing is launched.
- **Structured data:** `GovernmentService.areaServed` is the Philippines for national
  guides. Local guides emit one `GovernmentService` per city version, with that city.
- **Sitemap** lists the new routes. **Open Graph images** move to `/services/[slug]` and
  `/[city]`.
- **Breadcrumbs:** Home › Category › Guide. The city hub is Home › City.
- **Report-outdated links** include the city chosen in the picker when there is one.

## Migration

| Guide                                                                                                                                        | National file                                                            | Sorsogon file                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| drivers-license-new, vehicle-registration-renewal, passport-new, nbi-clearance, police-clearance, psa-birth-certificate, national-id-philsys | Moved to `content/services/`, `scope: national`; `offices` field removed | None needed: each guide's current office list equals the agency default (checked 2026-10-22). None has local tips. |
| business-permit-new, cedula, barangay-clearance                                                                                              | New file: `scope: local`, title, summary, keywords, category, related    | Today's file minus the national fields                                                                             |

- `city.yaml` `popular` moves to `content/popular.yaml` unchanged.
- No `[VERIFY]` value is added, removed or edited. Compare `pnpm content:todo` output
  before and after; it should list the same values, at new paths.

## Testing

- **Unit tests (Vitest)**
  - Loader: a valid national + city pair loads.
  - Loader errors: local file with requirements; city file with unknown slug; national-guide
    city file with requirements; office from another city; office of the wrong agency;
    unknown popular slug.
  - Repository: default offices by agency; the city `offices` override; a local guide is
    hidden until a city version is published; production hides drafts and `[VERIFY]` city
    files; `listServices({ agency })` for local guides.
  - Search index: local guides include their city names.
- **Fixtures:** `tests/fixtures/content` restructured: one national guide, one local
  guide, two cities (`testville`, plus a second), so the picker is exercised with more than
  one city.
- **End-to-end tests (Playwright)**
  - Home → guide; the picker choice survives a reload.
  - With JS disabled, both city blocks are visible.
  - Search finds a local guide.
  - Existing journey, search, publishing, open-status, feedback and accessibility specs
    updated to the new URLs.
- **Before done:** `pnpm content:check`, lint, typecheck, unit, e2e, production build, and a
  375px check plus the `/anti-slop-design` review checklist on the guide page, the city hub
  and the home page.

## Documentation

- `docs/decisions/0012-national-guides-city-overlays.md`. Mark ADR 0004 "Superseded by 0012".
- `docs/architecture.md`: URLs and folder structure.
- `docs/content-model.md`: national and city files, scopes, the office default, visibility.
- `docs/content-guide.md`: adding a guide (national or local), adding a city, the updated
  `[VERIFY]` steps.
- `CLAUDE.md`: §0 status, §5 URL and folder structure, §10 roadmap (Lesson 12 is this
  work; deploy is 13).
- `docs/lessons/lesson-12.md`.

## Risks

- **Page weight grows with cities (approach A).** Fine for a handful of cities. Recorded
  in the ADR with the threshold (~10–20 cities) for switching to B.
- **Default offices may be wrong for some guides** (e.g. PhilSys registration outside PSA
  offices). The city file `offices` override covers it. Today no guide needs it.
- **One national page per service loses "LTO Sorsogon" search matches in titles.** City
  names and office addresses are still in the page text. Revisit with approach B if search
  data shows it matters.
