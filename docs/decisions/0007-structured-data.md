# 0007 — Structured data: breadcrumbs and GovernmentService only

- Status: Accepted
- Date: 2026-10-20

## Decision
- `BreadcrumbList` on every page with breadcrumbs (emitted by the Breadcrumbs component).
- `GovernmentService` on published guides, with the agency as `provider` (GovGuide never claims to provide the service).
- `WebSite` on the city home.
- No `FAQPage` (Google limits FAQ results to authoritative government/health sites since 2023) and no `HowTo` (retired).

## Rules
- Drafts: `noindex`, no service markup. Sitemap lists public pages only. Vercel previews are blocked in robots.txt.
- JSON-LD is escaped (`<` → `\u003c`) and typed with `schema-dts`.