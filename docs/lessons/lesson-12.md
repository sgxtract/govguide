# Lesson 12 — National guides, city details

## What we built

- **Guides are written once, nationally.** `content/services/<slug>.yaml` holds the whole guide
  for services that are the same everywhere (LTO, PSA, DFA, NBI, PNP): `scope: national`.
- **Cities add only what's local.** By default a city's offices of the guide's agency show up
  in "Where to go". A city file in `content/cities/<city>/services/` can list other offices
  or add local tips.
- **City-run services are written per city.** Business permit, cedula and barangay clearance
  are `scope: local`: the national file says what the service is, and each city writes its own
  requirements, steps, fees and sources, with its own `draft`/`published` status.
- **National pages.** `/`, `/services`, `/services/[slug]`, `/categories/[slug]`, `/agencies`,
  `/agencies/[slug]`, `/search`. Each city keeps a hub page, `/sorsogon`.
- **City picker.** On a guide, a native `<select>` ("Your city") shows the chosen city's
  offices, or its version of a city-run guide, and remembers it on the phone. Without
  JavaScript every city is listed under its own heading.

## Why

- The same LTO requirements copied into every city folder would drift apart. One national file
  means one place to verify and re-verify.
- Some services really do differ per city, so the model has two scopes instead of pretending
  everything is national.
- One URL per guide (not one per city) avoids near-duplicate pages. Every city's block is in the
  static page, so the picker needs no extra download. At around 10–20 cities, switch to one
  page per city (ADR 0012, approach B); the content model doesn't change.
- An office that still has `[VERIFY]` no longer blocks publishing a national guide. It's hidden
  on the live site instead, because one city's unchecked office shouldn't hold back a guide for
  everyone.

## Key files

| File                                       | Role                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `src/lib/content/schemas.ts`               | `scope` union, city file schemas, reserved city names                   |
| `src/lib/content/loaders/file-loader.ts`   | Reads `services/`, then each city's files with the right schema         |
| `src/lib/content/integrity.ts`             | Office-in-city, office-of-agency, popular, publish rules                |
| `src/lib/content/compose.ts`               | Combines a guide with each city's part; visibility rules (pure, tested) |
| `src/features/cities/city-switch.tsx`      | The city picker                                                         |
| `src/features/services/guide-sections.tsx` | The guide body, rendered once (national) or per city (city-run)         |
| `src/app/(site)/`                          | Every content page, in a route group with the app bar layout            |

## Key commands

```bash
pnpm content:check   # lists national guides, and each city's version of city-run ones
pnpm content:todo    # every [VERIFY] left, by file and line
pnpm test            # unit: loader, compose, city store…
pnpm test:e2e        # e2e with two fictional cities (Testville, Otherville)
```

## What to remember

- New guide? First ask: same in every city (national) or run by each city (local)?
- New city? `city.yaml` + office files; national guides pick them up automatically.
- A city folder can't be named after a site page (`services`, `agencies`, `search`, …).
- Image routes inside the `(site)` route group get a hashed name
  (`opengraph-image-1m5q4s`); always link to them through the page's metadata, never by path.
