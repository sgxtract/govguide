# 0004 — YAML content, services stored per city

- Status: Accepted
- Date: 2026-10-19

## Decision
- Content is YAML validated by Zod (no MDX for now).
- File name = slug; list position = step order.
- Agencies are shared (`content/agencies/`). Offices and services live under each city.

## Why
- Guides are structured data (requirements, steps, fees), not prose. YAML diffs cleanly in PRs and is approachable for non-developers.
- National "base service + city overlay" would avoid duplication across cities, but can't be validated with one city. Pages only use the repository, so we can restructure files when a second city arrives without touching pages.

## Consequences
- A second city may duplicate national requirements until we extract shared bases (revisit in Phase 3).
- If a guide needs long-form prose, add an optional markdown `body` field rather than switching to MDX.