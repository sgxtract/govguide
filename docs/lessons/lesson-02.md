# Lesson 02 — Content model

**Built:** Zod schemas, YAML file loader with integrity checks, content repository, freshness helper, sample LTO content (all `[VERIFY]`), `pnpm content:check`.

**Remember:**

- Pages only import from `src/lib/content/repository.ts`.
- `[VERIFY]` is fine in drafts; published guides can't contain it.
- Drafts show in `pnpm dev`, hidden in production (`SHOW_DRAFTS=true` overrides).
- Re-verify published guides every 6 months.
