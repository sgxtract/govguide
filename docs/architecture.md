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
| URL                         | File                                    | Notes                                                           |
|-----------------------------|-----------------------------------------|-----------------------------------------------------------------|
| `/`                         | `app/page.tsx`                          | Redirects to the only city; lists cities once there are several |
| `/[city]`                   | `app/[city]/page.tsx`                   | City home: categories + all guides                              |
| `/[city]/categories/[slug]` | `app/[city]/categories/[slug]/page.tsx` | Guides in one category                                          |

- `app/[city]/layout.tsx` renders the header (with city name) and `<main>`, and generates one static copy per city (`dynamicParams = false`: unknown cities 404).
- The root layout holds only the skip link and footer. Pages outside a city render `<SiteHeader />` without a city.
- Route props use Next's generated `PageProps<"/route">` / `LayoutProps<"/route">` types; `pnpm typecheck` runs `next typegen` first.