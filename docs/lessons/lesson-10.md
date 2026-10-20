# Lesson 10 — Testing & CI

**Built:** Vitest unit tests (25), Playwright e2e tests (29) against a production build with fictional fixture content, axe on every page in both schemes, GitHub Actions CI with two required checks.

**Found:** a published guide with an unknown agency crashed the build instead of reporting the problem (fixed in `hasPlaceholders`).

**Remember:**

- New content rule → add a loader test that breaks a copy of the fixtures.
- New page type → add it to `PAGES` in `accessibility.spec.ts`.
- Test by what people see (labels, roles, text), never by CSS class.
