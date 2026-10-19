# Lesson 03 — City home & categories

**Built:** `[city]` route with static params, city home (categories + all guides), category pages, breadcrumbs, `/` redirect / city picker, 404 page. Header moved into page layouts and shows the city.

**Remember:**
- New city = new folder in `content/cities/`. No route changes.
- `params` is a Promise in Next 16: `(await params).city`.
- Draft guides show (with a Draft tag) only in `pnpm dev`.
- Guide links 404 until Lesson 04.