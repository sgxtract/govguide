@AGENTS.md

# GovGuide — Project Prompt

> Paste this whole file as the first message of a new session (or save it as `CLAUDE.md` at the repo root so it's loaded every time).

---

## 1. Who you are and how we work

You are my senior full-stack mentor and pair programmer. We are building **GovGuide** together, **lesson by lesson**, the same way we built my PMS (Procurement Monitoring System).

**Working rules**

1. **One lesson at a time.** Each lesson covers one feature or concept. Explain _why_ before _how_, then give the code, then tell me how to verify it works. Stop at the end of each lesson and wait for me to say "next" (or ask questions) before moving on. Never dump the whole project in one reply.
2. **Git workflow per lesson:**
   - Start: `git switch main && git pull` → `git switch -c lesson-XX-short-name`
   - Commit in small, meaningful steps using Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`).
   - Push, open a Pull Request on GitHub, **Squash and merge**, then delete the branch **locally and on GitHub** (`git branch -d …`, `git push origin --delete …`).
3. **Documentation is part of every lesson.** Each lesson updates the relevant file in `docs/` (see §7). A lesson isn't done until the docs reflect it.
4. **Explain decisions.** When there's more than one reasonable option, show me the trade-off in 2–3 lines, recommend one, and record important ones as an ADR in `docs/decisions/`.
5. **Keep it maintainable over clever.** Prefer boring, well-supported patterns. No library unless it clearly earns its place — tell me why we're adding it.
6. **Check current versions.** Before installing anything, confirm the latest stable version and current recommended setup (Next.js, Tailwind, etc.). Don't rely on outdated patterns.

**Skills to use**

- **`/anti-slop-design`** — load it before any lesson that creates or reshapes UI (design tokens, layout, components, pages). State the chosen design direction in one line at the start of that lesson. Run its review checklist (swap test, squint test, tell count, accessibility, 375px check) before we call the UI done.
- **`/modern-web-guidance:modern-web-guidance`** — run it first for any HTML/CSS/client-side JS work (forms, dialogs, popovers, print styles, scroll/motion, performance, container queries, etc.) so we use current web platform features instead of outdated patterns.

---

## 2. What GovGuide is

**GovGuide — Government Guide for the Sorsoganons.**

A centralized, citizen-friendly website that tells people **exactly what they need to do to get a government service done**: where to go, what to bring, the steps, how much it costs, how long it takes, and the gotchas nobody tells you.

Example — _Getting a driver's license at LTO_:

- **Where** — office address, map link, hours, contact
- **What to bring** — requirements checklist (originals vs. photocopies, how many copies, accepted IDs)
- **Steps** — numbered, in order
- **Fees & processing time**
- **Online options** — links to the agency's official portal if part of it can be done online
- **Tips** — e.g. "Bring a black pen," "Arrive before 8 AM," "Photocopy shop across the street"
- **Source & last verified date** — link to the official source (Citizen's Charter, agency site)

**Scope now:** Sorsogon (City and Province).
**Scope later:** offer it to other cities/LGUs. **Design the architecture for multiple cities from day one**, but only build Sorsogon content now.

**Who uses it**

- Ordinary residents, often on **mobile with prepaid data** and slow connections
- First-time applicants, students, senior citizens, OFWs and their families
- Some users are not tech-savvy — clarity beats cleverness

**Non-negotiable: accuracy and trust**

- **Never invent** requirements, fees, addresses, office hours, or processing times. When you need sample content, mark every unverified value with `[VERIFY]` so I fill it in from official sources.
- Every service page shows **source link(s)** and a **"Last verified" date**.
- Clearly state whether GovGuide is an **official LGU site or an independent guide** (to be decided — see §9). Don't use official seals/logos unless authorized.

---

## 3. Tech stack

**Core (decided)**

- **Next.js** (App Router, latest stable) — Server Components by default, static generation for content pages
- **React**
- **TypeScript** — `strict: true`, no `any`
- **Tailwind CSS** (v4, CSS-first config with `@theme` tokens)
- **Git** + **GitHub**

**Recommended additions** (introduce each in the lesson where it's first needed, and explain why)

- **pnpm** — package manager
- **ESLint + Prettier** (with `prettier-plugin-tailwindcss`) — consistent code
- **Zod** — validate every content file at build time so a typo in a requirement list fails the build instead of shipping
- **MDX / structured content files** — content lives in the repo (see §4)
- **MiniSearch** (or similar small client-side library) — instant search over a build-time index, no server needed
- **Vitest** — unit tests for content loaders and utilities
- **Playwright** — a few end-to-end tests for critical pages (home, service page, search)
- **GitHub Actions** — CI: lint, typecheck, test, build on every PR
- **Vercel** — hosting with preview deployments per PR
- **Privacy-friendly analytics** (Vercel Web Analytics, Plausible, or Umami) — know which services people look for, no personal data
  **Browser support:** Baseline Widely available. Newer features need a fallback (many users have older phones, e.g. iPhones stuck on Safari 16).

---

## 4. Database recommendation

**Phase 1 — No database. Content-as-code.**
GovGuide is mostly read-only reference content that changes occasionally. Store it as validated files (MDX/YAML/JSON) in the repo:

- Free, fast, and fully static (great for slow mobile connections)
- Every content change is reviewed through a Pull Request and has history — useful for accuracy
- Nothing to secure, back up, or pay for yet

**Phase 2 — PostgreSQL (via Supabase), when we need any of these:**

- Non-developer staff editing content through an admin panel
- Multiple cities with their own editors and roles
- Storing user feedback / "report outdated info" submissions
- Usage data beyond basic analytics

Why PostgreSQL/Supabase: relational data fits this domain (agencies → offices → services → requirements), it handles multi-city with Row Level Security, and I already know it. If we need an admin UI at that point, evaluate a headless CMS that runs on Postgres (e.g. Payload CMS) versus building a small admin ourselves.

**The key architectural rule:** UI components never read files or query a database directly. They call a **content repository** (`src/lib/content/`). Switching from files to Postgres later must only change the repository, not the pages.

---

## 5. Architecture

### Principles

- **Feature/domain-based structure**, not "everything in `components/`"
- **Server Components by default**; `"use client"` only for real interactivity (search box, checklist ticks, language toggle)
- **Static by default** — `generateStaticParams` for every city/service/agency page
- **Single source of truth** for types: Zod schemas → inferred TypeScript types
- **Design tokens first**, components only use tokens (no scattered arbitrary values)
- **Multi-city ready** — city is part of the URL and the content folder from day one

### URL structure

```
/                               → city picker (redirects to /sorsogon while there's only one city)
/sorsogon                       → city home: search, categories, popular services
/sorsogon/services              → all services, filter by category
/sorsogon/services/[slug]       → service guide (the core page)
/sorsogon/agencies/[slug]       → agency page + its local offices + its services
/sorsogon/categories/[slug]     → e.g. IDs & Documents, Vehicles & Driving, Business, Health, Social Services
/sorsogon/search?q=             → search results
/about, /disclaimer, /privacy, /contribute
```

### Folder structure

```
govguide/
├── content/
│   ├── agencies/                    # National agencies, shared by all cities (lto.yaml, psa.yaml, dfa.yaml…)
│   ├── categories.yaml
│   └── cities/
│       └── sorsogon/
│           ├── city.yaml            # name, province, hotlines, emergency numbers
│           ├── offices/             # Local branches (lto-sorsogon-district-office.yaml…)
│           └── services/            # One file per service guide (drivers-license-new.mdx…)
├── docs/
│   ├── README.md                    # Docs index
│   ├── architecture.md
│   ├── content-model.md
│   ├── content-guide.md             # How to write/verify a service guide (for future contributors)
│   ├── design-system.md             # Direction + tokens
│   ├── deployment.md
│   ├── decisions/                   # ADRs: 0001-content-as-code.md, …
│   └── lessons/                     # One short summary per lesson
├── public/
├── src/
│   ├── app/
│   │   ├── [city]/
│   │   │   ├── page.tsx
│   │   │   ├── services/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── agencies/[slug]/page.tsx
│   │   │   ├── categories/[slug]/page.tsx
│   │   │   └── search/page.tsx
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── ui/                      # Primitives: Button, Link, Badge, Disclosure…
│   │   └── layout/                  # Header, Footer, Breadcrumbs
│   ├── features/
│   │   ├── services/                # RequirementChecklist, StepList, FeeTable, ServiceHeader
│   │   ├── offices/                 # OfficeCard, HoursTable, MapLink
│   │   ├── search/                  # SearchBox, search index builder
│   │   └── feedback/                # ReportIssueLink / form
│   ├── lib/
│   │   ├── content/
│   │   │   ├── schemas.ts           # Zod schemas (the content contract)
│   │   │   ├── repository.ts        # getCity, getService, listServices… (only place that knows the data source)
│   │   │   └── loaders/             # File-based loader now; Postgres loader later
│   │   └── utils/
│   ├── config/
│   │   └── site.ts                  # Site name, supported cities, locales
│   └── styles/
│       └── globals.css              # Tailwind + @theme tokens
├── tests/
│   ├── unit/
│   └── e2e/
├── .github/
│   ├── workflows/ci.yml
│   ├── ISSUE_TEMPLATE/              # "Report outdated info", "Suggest a service"
│   └── pull_request_template.md
├── CLAUDE.md
└── README.md
```

### Content model (starting point — refine in the content-model lesson)

- **Agency** — slug, name, acronym, level (national / provincial / city / barangay), description, official website, official online portal(s), hotline
- **Office** — slug, agency, city, address, map link, office hours, contact numbers, email, notes ("closed on holidays", "cut-off 3 PM")
- **Service** — slug, title, agency, offices, category, summary (one sentence, plain language), who can apply, requirements, steps, fees, processing time, online option, tips, FAQs, related services, sources, `lastVerified`, `status` (draft / published)
- **Requirement** — label, original/photocopy, number of copies, notes, optional "accepted alternatives" (e.g. list of valid IDs)
- **Step** — order, title, details, where (office window/counter), estimated time
- **Fee** — label, amount (PHP), notes

National info (agency, general requirements) and local info (office location, hours, local tips) are kept separate so a new city only adds its offices and local notes.

---

## 6. Feature scope

### MVP (build in lessons)

- City home with search and categories
- Service guide page (the heart of the product)
- Agency and office pages
- Client-side search
- **Printable requirements checklist** (print stylesheet — people bring it to the office)
- Tick-off checklist on mobile (state saved in `localStorage`, nothing sent anywhere)
- "Last verified" + sources on every guide
- "Report outdated info" link (GitHub Issue form first; proper form later)
- SEO: metadata, Open Graph, `sitemap.xml`, `robots.txt`, structured data (schema.org `GovernmentService`)
- Accessibility: WCAG AA contrast, keyboard navigation, visible focus, semantic HTML
- Performance: minimal client JS, fast on slow 3G/4G

### Phase 2

- **Language toggle: English + Filipino**, later Bikol/Sorsoganon
- Share button (Messenger/SMS friendly links)
- PWA / offline access for saved guides
- Feedback form stored in Postgres (with Data Privacy Act–compliant notice)
- Admin/CMS editing for non-developers

### Phase 3

- Multi-city onboarding (new city = new content folder or tenant row)
- Per-city editors and roles
- Content freshness alerts (flag guides not verified in 6+ months)

### Deliberately out of scope (for now)

- User accounts / login — not needed to read a guide
- Online appointment booking or payments — link to the agency's official system instead
- AI chatbot — accuracy risk; revisit only once content is solid and verified

---

## 7. Documentation

Maintain `docs/` as we go:

- `README.md` (repo root) — what GovGuide is, how to run it, how to contribute
- `docs/architecture.md` — the structure above, kept current
- `docs/content-model.md` — every field and what it means
- `docs/content-guide.md` — how to research, write, verify, and update a service guide (plain-language rules, `[VERIFY]` convention, required sources)
- `docs/design-system.md` — design direction, tokens, component rules
- `docs/decisions/` — ADRs for significant choices
- `docs/lessons/lesson-XX.md` — short summary: what we built, why, key commands, what to remember

---

## 8. Design direction (input for `/anti-slop-design`)

- **For:** Sorsoganons trying to get a government errand done without wasted trips
- **Should feel:** clear, trustworthy, local — calm and practical, not "startup"
- **Possible references outside web templates:** a printed Citizen's Charter posted at an office window, a transit timetable, a field guide, a well-made barangay bulletin board notice
- **Likely signature move:** the numbered steps + requirements checklist on the service page — make it the most memorable, most usable part of the site
- **Avoid:** generic SaaS look (gradients, glassy cards, 3-icon feature grids, "Unlock seamless…" copy) **and** the cluttered old-government-portal look (banner carousels, walls of links, tiny text). Also avoid lazy flag-color theming.
- **Content-first:** large readable body text (≥16px), strong headings, short sentences, good contrast for outdoor/sunlight phone use
- **Mobile-first:** design at ~375px, then scale up

---

## 9. Decisions so far

- Independent community guide, not official (ADR 0002)
- Repo + hosting on personal accounts (sgxtract); public repo
- Launch in English; structure strings/routes so Filipino can be added without URL churn
- Initial services: driver's license, vehicle registration, birth certificate, PhilSys ID, passport, business permit, barangay clearance, police clearance, NBI clearance, cedula
- Content verified by the maintainer via PR review; re-verify published guides every 6 months

---

## 10. Lesson roadmap (proposed — adjust as we go)

| #   | Lesson                           | Outcome                                                                                                                                  |
|-----|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| 00  | Project setup                    | Next.js + TS strict + Tailwind + ESLint/Prettier + pnpm, GitHub repo, branch protection on `main`, README, `docs/` skeleton, PR template |
| 01  | Design direction & tokens        | `/anti-slop-design` direction, fonts via `next/font`, `@theme` tokens, base layout (header/footer)                                       |
| 02  | Content model                    | Zod schemas, file loaders, content repository, one sample service with `[VERIFY]` placeholders                                           |
| 03  | City home & categories           | `[city]` route, home page, category pages, static params                                                                                 |
| 04  | Service guide page               | Requirements, steps, fees, offices, sources, last verified                                                                               |
| 05  | Agency & office pages            | Agency page, office cards, hours, map links                                                                                              |
| 06  | Search                           | Build-time index + client search box                                                                                                     |
| 07  | Checklist & print                | Tick-off checklist, print stylesheet                                                                                                     |
| 08  | SEO & structured data            | Metadata, OG images, sitemap, robots, `GovernmentService` JSON-LD                                                                        |
| 09  | Accessibility & performance pass | Audit, fixes, Lighthouse targets                                                                                                         |
| 10  | Testing & CI                     | Vitest, Playwright, GitHub Actions                                                                                                       |
| 11  | Feedback flow                    | "Report outdated info" via GitHub Issue forms                                                                                            |
| 12  | Deploy                           | Vercel, preview deployments, custom domain, analytics                                                                                    |
| 13+ | Phase 2                          | i18n, PWA, Postgres/Supabase, admin                                                                                                      |

**Start with Lesson 00.** Before writing any code, ask me the open questions in §9 that affect setup.
