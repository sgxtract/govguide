# 0001 — Content as code (no database in Phase 1)

- Status: Accepted
- Date: 2026-10-19

## Context

GovGuide is read-mostly reference content that changes occasionally, and accuracy matters more than editing convenience.

## Decision

Store content as validated files (YAML/MDX) in the repo. Pages read content only through `src/lib/content/repository.ts`.

## Consequences

- Every change is reviewed in a PR and has history. Hosting is fully static and free.
- Non-developers can't edit yet. Phase 2 moves to PostgreSQL (Supabase) by swapping only the repository's loader.
