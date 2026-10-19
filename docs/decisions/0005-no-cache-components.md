# 0005 — Cache Components off

- Status: Accepted
- Date: 2026-10-19

## Context
create-next-app enabled `cacheComponents` and `partialPrefetching`. With them on, any page
reading content files fails prerendering unless the read is wrapped in `"use cache"`, and
with `"use cache"` YAML edits stop appearing in `pnpm dev`.

## Decision
Turn both off. Every GovGuide page is static content; nothing is per-request.
The repository keeps using React `cache()`.

## Revisit when
A page needs per-request data (e.g. Phase 2 feedback or admin).