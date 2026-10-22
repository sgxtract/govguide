# 0012 — National guides, with city details added per city

- Status: Accepted
- Date: 2026-10-22
- Supersedes: 0004 (YAML content, services stored per city)

## Context

ADR 0004 stored every guide inside its city folder and deferred a "national base + city
overlay" until a second city arrived. Most government services (LTO, PSA, DFA, NBI, PNP) have
the same requirements, steps and fees everywhere; only the office (address, hours, contacts)
changes. Writing those guides per city would copy them into every city and let them drift.

Some services are run by each city or barangay (business permit, cedula, barangay clearance),
and those requirements and fees do differ per city.

## Decision

- **Content:** each guide has one file in `content/services/` with `scope: national` or
  `scope: local`.
  - A national guide holds the whole guide. A city only adds a file to change which offices are
    shown or to add local tips. By default, a city shows its offices of the guide's agency.
  - A local guide's file only says what the service is. Each city writes its own version
    (requirements, steps, fees, sources, status) in its folder.
- **URLs:** one page per guide, `/services/[slug]`. Home, all guides, categories, agencies and
  search are national. Each city keeps one hub page, `/[city]`: hotlines, offices, city-run
  guides.
- **City picker (approach A):** every city's block is rendered into the static page. A small
  client component (`CitySwitch`, native `<select>`) shows the chosen city and remembers it in
  `localStorage`. Without JavaScript, every city is shown under its own heading.
- **Publishing:** a published national guide must have no `[VERIFY]` in itself or its agency.
  An unverified office is hidden in production instead of blocking the guide, so one city's
  unchecked office never holds back a guide for the whole country. A published city version of
  a local guide must have no `[VERIFY]` in itself, its agency or its offices.
- **Code:** the loader reads flat lists; `lib/content/compose.ts` (pure, unit-tested) combines
  them; the repository stays the only door for pages.

## Alternatives considered for the picker

- **B. A static page per city** (`/services/[slug]/[city]`), picker as links. Scales without
  limit, but makes near-duplicate pages and a page load per choice.
- **C. Load a city's details on choice** (one JSON file per city). Smallest page, but nothing
  works without JavaScript and office cards would need a second, client-side version.

## Consequences

- A new city is `city.yaml` + office files, plus its versions of the city-run guides. No
  national requirements are copied.
- **Page weight grows with each city** (approach A): fine for a handful of cities. At around
  10–20 cities, switch the guide page to approach B. The content model and repository don't
  change; only the guide page's rendering does.
- Guide titles no longer contain the city name, so "LTO Sorsogon" style searches rely on city
  names and addresses in the page text. Revisit with approach B if search data shows it matters.
- City folders can't use the names of site pages (`services`, `agencies`, …); the loader
  rejects them, because a static route would silently hide the city.
- `holidays.yaml` stays national; city-specific holidays are a later change.
