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
