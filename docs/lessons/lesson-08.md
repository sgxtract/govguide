# Lesson 08 — SEO & structured data

**Built:** canonical URLs and share metadata on every page, per-guide share cards (next/og, Atkinson font), BreadcrumbList / GovernmentService / WebSite JSON-LD, sitemap.xml, robots.txt (previews blocked), favicon, `.env.example`.

**Remember:**

- New indexable page → `generateMetadata` returns `pageMetadata({ title, description, path })`.
- New page with breadcrumbs → pass `path` (structured data comes free).
- Share cards are generated at build time; check one at `/…/opengraph-image`.
- Test real previews after deploying (Lesson 12) with Facebook's Sharing Debugger.
