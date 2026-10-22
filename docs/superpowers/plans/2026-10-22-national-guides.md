# National Guides, City Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write each guide once nationally (`content/services/`), let each city add only its offices and local details, and serve one page per guide at `/services/[slug]` with a city picker.

**Architecture:** The loader reads national service files and per-city files into flat validated lists. A new pure module, `compose.ts`, combines them into page-ready views (`Guide`, `ServiceListing`, `CityHub`) under the visibility rules. `repository.ts` stays the only door for pages; it wraps `compose.ts` with the store and the draft flag. Pages move from `src/app/[city]/…` into a `src/app/(site)/` route group. The guide body becomes one component, rendered once for national guides and once per city for local guides. A small client `CitySwitch` shows the chosen city's block.

**Tech Stack:** Next.js 16.4.2 (App Router, static generation), React, TypeScript strict, Zod 4, YAML, Tailwind v4, Vitest, Playwright, pnpm.

**Spec:** `docs/superpowers/specs/2026-10-22-national-guides-design.md`

## Global Constraints

- Read `node_modules/next/dist/docs/` for any Next.js API you touch (AGENTS.md). Route groups: `01-app/03-api-reference/03-file-conventions/route-groups.md`.
- Every page is static: `generateStaticParams` + `export const dynamicParams = false` on every dynamic segment.
- Pages and components never read files; they call `@/lib/content/repository` only.
- Types come from Zod schemas (`z.infer`). No `any`.
- `[VERIFY]` semantics are unchanged: drafts and `[VERIFY]` show in dev (`SHOW_DRAFTS`), never in production.
- **Publish rule (refines spec "Integrity checks"):**
  - A published **national** guide must have no `[VERIFY]` in itself or its agency. Unverified offices are hidden in production, not rejected, because one city's office must not block a guide for every city.
  - A published **city version of a local guide** must have no `[VERIFY]` in itself, its agency, or its offices.
- Reserved city slugs: `about`, `agencies`, `categories`, `contribute`, `disclaimer`, `opengraph-image`, `privacy`, `search`, `services`, `styleguide`.
- `localStorage` keys: city choice `govguide:city`; checklist prefix stays `govguide:checklist:`. Every storage access is wrapped in try/catch with an in-memory fallback, like `checklist-store.ts`.
- **UI tasks (4–7):** first run `/modern-web-guidance:modern-web-guidance`, and `/anti-slop-design` within the existing counter-window system (ADR 0009, `docs/design-system.md`). Use only existing tokens and components. Body text is at least 16px. Mobile-first at 375px.
- **Commits:** Conventional Commits, each ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Branch: `lesson-12-national-guides`.
- `pnpm typecheck` and `pnpm build` are expected to fail from Task 1 until Task 7 (pages still use the old repository). Each task's own unit tests must pass. From Task 7 on, `pnpm check` must pass.

## Review Focus

1. **Two cities each have an office with the same slug** (e.g. both `lto-district-office`). Anchors on `/agencies/[slug]` and links from office rows must stay unique. Use the id `${city}-${office.slug}`. Pinned by a test in Task 3 (`listOffices` returns both) and by the anchor format in Task 7.
2. **A stored city choice that doesn't have this guide.** This happens when the reader picked Otherville on another guide, and Otherville has no office for this one. Expect the "We haven't added Otherville for this guide yet" message and the picker, never an empty page. Pinned by the `resolveCity` tests in Task 4.
3. **A national guide whose only office in a city still has `[VERIFY]` in production.** That city must drop out of the guide's cities, not show an empty "Where to go". Pinned in Task 3.
4. **A local guide with a published version in one city and a draft in another, in production.** Only the published city appears, and the listing's `cities` is only that city. Pinned in Task 3.
5. **Blocked storage (private mode).** The picker still works for the visit. Pinned by the `city-store` test in Task 4.

---

### Task 1: Content model (schemas, loader, integrity, fixtures)

**Files:**

- Modify: `src/lib/content/schemas.ts`
- Modify: `src/lib/content/loaders/file-loader.ts`
- Modify: `src/lib/content/integrity.ts`
- Modify: `tests/unit/content-loader.test.ts`
- Restructure: `tests/fixtures/content/**` (exact layout below)

**Interfaces:**

- Produces (`schemas.ts`):
  - `guideBodySchema`: strictObject with `whoCanApply`, `requirements`, `steps`, `fees`, `processingTime`, `online`, `tips`, `faqs`, `sources`, `lastVerified`. These are today's field definitions, moved verbatim.
  - `nationalServiceSchema`: `{ scope: "national", status, title, summary, keywords, category, related, agency, ...guideBody }`.
  - `localServiceSchema`: `{ scope: "local", title, summary, keywords, category, related }`.
  - `serviceSchema = z.discriminatedUnion("scope", [nationalServiceSchema, localServiceSchema])`.
  - `cityNationalServiceSchema`: `{ offices?: slug[], tips: text[] (default []) }`.
  - `cityLocalServiceSchema`: `{ status, agency, offices: slug[] (default []), ...guideBody }`.
  - `popularFileSchema = z.array(slug).default([])`.
  - `citySchema` loses `popular`.
  - `reservedCitySlugs` (readonly tuple, values from Global Constraints).
  - Types:
    - `GuideBody`
    - `NationalService` and `LocalService` (each `& { slug }`), and `Service = NationalService | LocalService`
    - `CityNationalService = z.infer<…> & { scope: "national"; city: string; slug: string }`
    - `CityLocalService = z.infer<…> & { scope: "local"; city: string; slug: string }`
    - `CityService = CityNationalService | CityLocalService`
  - `Requirement`, `Step`, `Fee`, `Source`, `Office`, `Agency`, `City`, `Category` and `Holiday` keep their names.
- Produces (`file-loader.ts`): `ContentStore = { categories, holidays, cities, agencies, offices, services: Service[], cityServices: CityService[], popular: string[] }`. `loadFileContent(root)` signature unchanged.

**Fixture layout** (all files start with `# FICTIONAL test content. Never shown on the real site.`):

```
tests/fixtures/content/
  categories.yaml, holidays.yaml                     # unchanged
  popular.yaml                                       # - get-a-test-permit
  agencies/test-permits-agency.yaml                  # unchanged
  agencies/testville-city-hall.yaml                  # level: city
  agencies/otherville-city-hall.yaml                 # level: city
  services/get-a-test-permit.yaml                    # today's guide + scope: national, minus `offices`
  services/draft-guide.yaml                          # today's draft + scope: national
  services/get-a-local-permit.yaml                   # scope: local, title "Get a local permit", keywords [lokal], category permits
  cities/testville/city.yaml                         # minus `popular`
  cities/testville/offices/testville-main-office.yaml          # unchanged
  cities/testville/offices/testville-city-hall-office.yaml     # agency testville-city-hall, Mon–Fri 08:00–17:00
  cities/testville/services/get-a-test-permit.yaml   # tips: ["Photocopy shop across the street."]
  cities/testville/services/get-a-local-permit.yaml  # published; agency testville-city-hall; offices [testville-city-hall-office];
                                                     # requirement "Testville barangay clearance"; one step "Get your local permit";
                                                     # fee "Local permit fee" 75; processingTime "Same day"; one source; lastVerified "2026-10-01"
  cities/otherville/city.yaml                        # name Otherville, province Other Province, hotline "Otherville Rescue" "(000) 222-2222"
  cities/otherville/offices/otherville-office.yaml             # agency test-permits-agency, Mon–Fri 08:00–17:00
  cities/otherville/offices/otherville-city-hall-office.yaml   # agency otherville-city-hall
  cities/otherville/services/get-a-local-permit.yaml # like Testville's but agency otherville-city-hall, office otherville-city-hall-office,
                                                     # requirement "Otherville cedula", fee 120
```

- [ ] **Step 1: Restructure the fixtures exactly as above.**

- [ ] **Step 2: Rewrite `tests/unit/content-loader.test.ts`.** Keep the helpers (`copyOfFixtures`, `edit`, `problemsIn`). Set `GUIDE = "services/get-a-test-permit.yaml"` and `LOCAL = "cities/testville/services/get-a-local-permit.yaml"`. Tests:

```ts
it("loads national guides, city files and popular", async () => {
  const store = await loadFileContent(FIXTURES);
  expect(store.cities.map((c) => c.slug)).toEqual(["otherville", "testville"]);
  expect(store.services.map((s) => `${s.slug}:${s.scope}`).sort()).toEqual([
    "draft-guide:national",
    "get-a-local-permit:local",
    "get-a-test-permit:national",
  ]);
  expect(
    store.cityServices.map((c) => `${c.city}/${c.slug}:${c.scope}`).sort(),
  ).toEqual([
    "otherville/get-a-local-permit:local",
    "testville/get-a-local-permit:local",
    "testville/get-a-test-permit:national",
  ]);
  expect(store.popular).toEqual(["get-a-test-permit"]);
  const guide = store.services.find((s) => s.slug === "get-a-test-permit");
  expect(
    guide?.scope === "national" && guide.fees.map((f) => f.amount),
  ).toEqual([100, 50.5]);
});
```

Keep, updated to the new paths:

- "rejects a misspelled field"
- "rejects an unknown agency"
- "refuses to publish a guide that still has [VERIFY]"
- "allows [VERIFY] in drafts"
- "rejects bad file names" (copy into `services/Bad_Name.yaml`)
- "reports every problem at once"

New tests, each asserting `problems.join("\n")` contains the quoted text:

- Local national file with `requirements:` added → `Unrecognized key: "requirements"`.
- `cities/testville/services/nope.yaml` (copy of the tips file) → `Unknown guide "nope": no content/services/nope.yaml`.
- The national-guide city file with `requirements:` added → `Unrecognized key: "requirements"`.
- `LOCAL` with offices `[otherville-office]` → `Office "otherville-office" is not in testville`.
- `LOCAL` with offices `[testville-main-office]` → `Office "testville-main-office" belongs to "test-permits-agency", not "testville-city-hall"`.
- `popular.yaml` with `- nope` → `Unknown popular service "nope"`.
- A city folder `cities/services/` with a valid `city.yaml` → `City folder name "services" is reserved`.
- `LOCAL` published while `testville-city-hall-office.yaml` has `opens: "[VERIFY]"` → `Published, but it (or its agency/offices) still contains [VERIFY]`.
- **Hides, doesn't reject:** `testville-main-office.yaml` with `opens: "[VERIFY]"` while the national guide is published → `problemsIn(root)` equals `[]`.

- [ ] **Step 3: Run the tests and confirm they fail.**

  Run `pnpm vitest run tests/unit/content-loader.test.ts`. Expected: FAIL. Old schema keys and paths are rejected.

- [ ] **Step 4: Implement the schemas, loader and integrity checks.**
  - **Schemas:** as in Interfaces.
  - **Loader order:**
    1. `categories.yaml`, `holidays.yaml` and `popular.yaml` (optional; missing means `[]`).
    2. `agencies/`, then `services/` (slug = file name).
    3. For each city folder:
       - A reserved name is a problem; skip the folder.
       - Load `city.yaml`, then `offices/`.
       - Then `services/`: look up the national service by slug. If it is missing, push the `Unknown guide` problem, unless it is in `broken` as `service:<slug>`. Otherwise parse with `cityNationalServiceSchema` or `cityLocalServiceSchema` by its scope, and tag the result with `scope`, `city` and `slug`.
  - **`broken` keys:** `agency:<slug>`, `service:<slug>`, `office:<city>/<slug>`, `city-service:<city>/<slug>`.
  - **`checkIntegrity`:**
    - **Existing checks, adapted:** duplicate categories and holidays; office → agency; service → category; national service → agency.
    - **Related:** `related` must name national slugs.
    - **Popular:** every slug must exist.
    - **City local version:** its `agency` must exist. Each office must be in that city (`is not in <city>`) and have the version's agency (`belongs to "<a>", not "<b>"`).
    - **City national file:** each listed office must be in the city and have the guide's agency (same messages).
    - **Publish rule:** per Global Constraints, using the existing message text `Published, but it (or its agency/offices) still contains [VERIFY]. Verify the values or set status: draft.`

- [ ] **Step 5: Run the tests and confirm they pass.**

  Run `pnpm vitest run tests/unit/content-loader.test.ts`. Expected: PASS.

- [ ] **Step 6: Commit.**

  `feat: national services with city files in the content model`

---

### Task 2: Migrate the real content and the content script

**Files:**

- Move: `content/cities/sorsogon/services/{drivers-license-new,vehicle-registration-renewal,passport-new,nbi-clearance,police-clearance,psa-birth-certificate,national-id-philsys}.yaml` → `content/services/`
- Create: `content/services/{business-permit-new,cedula,barangay-clearance}.yaml` (`scope: local`)
- Modify: `content/cities/sorsogon/services/{business-permit-new,cedula,barangay-clearance}.yaml`
- Modify: `content/cities/sorsogon/city.yaml`
- Create: `content/popular.yaml`
- Modify: `scripts/check-content.ts`

**Interfaces:**

- Consumes: `ContentStore` from Task 1.

- [ ] **Step 1: Snapshot the current `[VERIFY]` values.** This uses the same rule as `content:todo`: lines containing `[VERIFY]` that aren't comments. Paths and line numbers are dropped, so a pure move compares equal.

```bash
S=/tmp/claude-1000/-home-ggm-Dev-govguide/0c92422f-ef65-4947-b7cd-75d1798c8ba6/scratchpad
verify_values() { grep -rh --include='*.yaml' -F '[VERIFY]' content | sed -E 's/^ +//' | grep -v '^#' | sort; }
verify_values > "$S/verify-before.txt"
```

- [ ] **Step 2: Move the files.**
  - **The 7 national guides:** `git mv` each one, add `scope: national` as the first key after the header comments, and delete its `offices:` block. Each office list equals the agency default (spec, Migration).
  - **The 3 local guides:** create the national file with `scope: local`. Move `title`, `summary`, `keywords`, `category` and `related` into it, unchanged, including any `[VERIFY]`. The city file keeps every other field. Update each file's header comment to say which part lives where.
  - **Popular:** move the `popular` list from `city.yaml` into `content/popular.yaml` with the same order and comment.

- [ ] **Step 3: Update `scripts/check-content.ts`.**
  - **Summary line:** `N cities, N agencies, N offices, N guides (N national, N local), N city files`.
  - **One line per guide:**
    - National: `  <slug>  (<status>[, has [VERIFY]][, due for re-verification])`.
    - Local: `  <slug>  (local)`, followed by `    <city>: <status>[, has [VERIFY]][, due…]` for each city version.
  - `printTodo` is unchanged.

- [ ] **Step 4: Verify the content loads and nothing was lost.**

```bash
pnpm content:check   # Expected: "✔ Content is valid" and 10 guides (7 national, 3 local)
verify_values > "$S/verify-after.txt"
diff "$S/verify-before.txt" "$S/verify-after.txt" && echo SAME   # Expected: SAME
```

- [ ] **Step 5: Commit.**

  `content: move guides to content/services, Sorsogon keeps local details`

---

### Task 3: Compose views and the repository

**Files:**

- Create: `src/lib/content/compose.ts`
- Modify: `src/lib/content/repository.ts`
- Test: `tests/unit/compose.test.ts`

**Interfaces:**

- Consumes: `ContentStore`, `hasPlaceholders`, and the schema types.
- Produces (`compose.ts`, pure, with no `server-only` and no React):

```ts
export type Visibility = { showDrafts: boolean };
export type CityGuide = {
  city: City;
  offices: Office[]; // visible only
  tips: string[]; // national guides: visible city file's tips; local: []
  local?: CityLocalService; // local guides only
};
export type Guide = { service: Service; agency?: Agency; cities: CityGuide[] }; // agency: national only
export type ServiceListing = {
  slug: string;
  title: string;
  summary: string;
  keywords: string[];
  category: string;
  scope: "national" | "local";
  agencies: string[]; // national: [agency]; local: visible versions' agencies, deduped, sorted
  cities: string[]; // city slugs that have the guide, sorted
  lastVerified?: string; // national: its date; local: latest visible version date; never "[VERIFY]"
};
export type CityHub = {
  city: City;
  offices: Office[];
  localGuides: ServiceListing[];
};

export function composeGuide(
  store: ContentStore,
  slug: string,
  v: Visibility,
): Guide | undefined;
export function composeListings(
  store: ContentStore,
  v: Visibility,
  filter?: { category?: string; agency?: string; city?: string },
): ServiceListing[]; // sorted by title
export function composePopular(
  store: ContentStore,
  v: Visibility,
): ServiceListing[];
export function composeOffices(
  store: ContentStore,
  v: Visibility,
  filter?: { city?: string; agency?: string },
): Office[];
export function composeAgencies(store: ContentStore, v: Visibility): Agency[]; // with a visible office or guide, sorted by name
export function composeCityHub(
  store: ContentStore,
  city: string,
  v: Visibility,
): CityHub | undefined; // localGuides = listings with scope local and this city
```

Rules, from the spec's "Visibility rules" and "Offices shown for a city":

- **National guide, visible:** `showDrafts` or `status === "published"`.
- **Its offices in a city:** if a _visible_ city file lists `offices`, use those; otherwise use the city's offices with `agency === service.agency`. Then keep only visible offices (no `[VERIFY]` unless `showDrafts`).
- **Tips:** from the city file only if it's visible.
- **When a city is included:** when it has at least one office or one tip.
- **Local guide:** visible when it has at least one visible city version (`showDrafts` or `published`). Each version contributes a `CityGuide` with `local`, and its visible listed offices.
- **Agency:** visible when there's no `[VERIFY]` (or `showDrafts`). `Guide.agency` is `undefined` if it's hidden. The page then 404s, as today.
- **Order:** `cities` sorted by `city.name`.

- Produces (`repository.ts`), all `async` and all using `compose.ts`:
  - `getGuide(slug)`, `listServices(filter?)`, `listPopularServices()`, `listOffices(filter?)`, `listVisibleAgencies()`, `getCityHub(city)`
  - Kept: `listCities`, `getCity`, `getAgency`, `listAgencies`, `listCategories`, `getCategory`, `listHolidays`
  - Removed: `getService`, `getOffice`, `listCityAgencies`
  - Re-export the `Guide`, `CityGuide`, `ServiceListing` and `CityHub` types.

- [ ] **Step 1: Write `tests/unit/compose.test.ts`.**
  - Load fixtures once with `loadFileContent`.
  - Edit a `structuredClone` of the store for each case, using `const DEV = { showDrafts: true }, PROD = { showDrafts: false }`.

```ts
it("national guide gets each city's offices for its agency", () => {
  const g = composeGuide(store, "get-a-test-permit", PROD)!;
  expect(
    g.cities.map((c) => [c.city.slug, c.offices.map((o) => o.slug)]),
  ).toEqual([
    ["otherville", ["otherville-office"]],
    ["testville", ["testville-main-office"]],
  ]);
  expect(g.cities.find((c) => c.city.slug === "testville")?.tips).toEqual([
    "Photocopy shop across the street.",
  ]);
});
it("a city file's offices replace the default", () => {
  /* set testville file offices: [] … then city has tips only */
});
it("a city drops out when its only office has [VERIFY] in production", () => {
  const s = structuredClone(store);
  s.offices.find((o) => o.slug === "otherville-office")!.address = "[VERIFY]";
  expect(
    composeGuide(s, "get-a-test-permit", PROD)!.cities.map((c) => c.city.slug),
  ).toEqual(["testville"]);
  expect(composeGuide(s, "get-a-test-permit", DEV)!.cities).toHaveLength(2);
});
it("local guide shows only published city versions in production", () => {
  const s = structuredClone(store);
  const other = s.cityServices.find(
    (c) => c.city === "otherville" && c.slug === "get-a-local-permit",
  )!;
  if (other.scope === "local") other.status = "draft";
  expect(
    composeGuide(s, "get-a-local-permit", PROD)!.cities.map((c) => c.city.slug),
  ).toEqual(["testville"]);
  expect(
    composeListings(s, PROD).find((l) => l.slug === "get-a-local-permit")
      ?.cities,
  ).toEqual(["testville"]);
});
it("a local guide with no published version is hidden", () => {
  /* both drafts → composeGuide undefined, not in listings */
});
it("drafts are hidden in production", () => {
  expect(composeGuide(store, "draft-guide", PROD)).toBeUndefined();
});
it("listings carry agencies and cities", () => {
  const local = composeListings(store, PROD).find(
    (l) => l.slug === "get-a-local-permit",
  )!;
  expect(local.agencies).toEqual([
    "otherville-city-hall",
    "testville-city-hall",
  ]);
  expect(
    composeListings(store, PROD, { agency: "testville-city-hall" }).map(
      (l) => l.slug,
    ),
  ).toEqual(["get-a-local-permit"]);
});
it("offices with the same slug in two cities are both listed", () => {
  /* rename otherville-office slug to testville-main-office → composeOffices({agency}) has 2 */
});
it("city hub lists its local guides", () => {
  expect(
    composeCityHub(store, "otherville", PROD)?.localGuides.map((l) => l.slug),
  ).toEqual(["get-a-local-permit"]);
});
it("popular keeps file order and skips hidden guides", () => {
  /* popular = ["draft-guide","get-a-test-permit"] → ["get-a-test-permit"] */
});
```

- [ ] **Step 2: Run the tests and confirm they fail.**

  Run `pnpm vitest run tests/unit/compose.test.ts`. Expected: FAIL, with `Cannot find module '@/lib/content/compose'`.

- [ ] **Step 3: Implement `compose.ts`, then rewrite `repository.ts`** as a thin wrapper: `getStore()` plus `{ showDrafts: SHOW_DRAFTS }`.

- [ ] **Step 4: Run the tests and confirm they pass.**

  Run `pnpm vitest run tests/unit`. Expected: compose and loader tests PASS.

- [ ] **Step 5: Commit.**

  `feat: compose national guides with city details in the repository`

---

### Task 4: Guide building blocks (body, city switch, picker store)

Run `/modern-web-guidance` (select, `hidden`, storage) and `/anti-slop-design` first.

**Files:**

- Create: `src/features/services/guide-sections.tsx`
- Create: `src/features/cities/city-store.ts`
- Create: `src/features/cities/city-switch.tsx`
- Modify: `src/features/services/at-a-glance.tsx`
- Test: `tests/unit/city-store.test.ts`

**Interfaces:**

- Consumes: `GuideBody`, `Office`, `Holiday` and `CityGuide` from Task 3.
- Produces:
  - **`AtAGlance`:**
    - Signature: `AtAGlance({ body, overlap = true }: { body: Pick<GuideBody, "fees" | "processingTime" | "lastVerified">; overlap?: boolean })`.
    - `overlap` controls the current `-mt-8`.
  - **`GuideSections`** (server component):

```ts
GuideSections(props: {
  body: GuideBody;
  idPrefix: string;            // "" for national; "<city>-" inside a local city block
  checklistKey: string;        // "/services/<slug>" national; "/services/<slug>#<city>" local
  where?: ReactNode;           // rendered as the "Where to go" section after Fees
  report: ReactNode;           // <ReportOutdated …/> under Sources
})
```

- `GuideSections` renders, in today's order: SectionTabs, Who can apply, What to bring (checklist + print), Your route, Fees, Where to go, Online, tips Notice, Common questions, Sources + report.
- All of this is moved from `src/app/[city]/services/[slug]/page.tsx`, including the `GuideSection` helper. Every section `id`, heading `id` and tab target gets `idPrefix`.
- **`city-store.ts`:**
  - `readCity(): string | null`, `writeCity(slug: string): void`, `subscribe(onChange): () => void`.
  - Key `govguide:city`, event `govguide:city`. Uses the same memory fallback as `checklist-store.ts`.
  - `resolveCity(stored: string | null, available: string[]): { chosen?: string; missing?: string }`:
    - One available city → `{ chosen: thatCity }`.
    - `stored` is in `available` → `{ chosen: stored }`.
    - `stored` is set but not available → `{ missing: stored }`.
    - Otherwise → `{}`.
- **`CitySwitch`** (`"use client"`):
  - Signature: `CitySwitch({ blocks }: { blocks: { slug: string; name: string; content: ReactNode }[] })`.
  - **One block:** the line "Showing: <name>", then the content. No select.
  - **Several blocks:** a native `<select>` labelled "Your city", whose first option is "Choose your city". It reads its value via `useSyncExternalStore(subscribe, readCity, () => null)`.
  - **Server snapshot (and no JS):** every block visible, each under an `<h2>` with its city name.
  - **After hydration:** if `chosen`, only that block is visible (others get `hidden`). If none is chosen, a short prompt "Choose your city to see where to go" shows and every block is hidden. If `missing`, the text "We haven't added <missing name if known, else 'your city'> for this guide yet." shows above the select.
  - Changing the select calls `writeCity`.

- [ ] **Step 1: Write `tests/unit/city-store.test.ts`.**

```ts
it("one city is always chosen", () =>
  expect(resolveCity("x", ["a"])).toEqual({ chosen: "a" }));
it("uses the stored city when available", () =>
  expect(resolveCity("b", ["a", "b"])).toEqual({ chosen: "b" }));
it("reports a stored city this guide doesn't have", () =>
  expect(resolveCity("c", ["a", "b"])).toEqual({ missing: "c" }));
it("nothing chosen yet", () =>
  expect(resolveCity(null, ["a", "b"])).toEqual({}));
it("still remembers the choice when storage throws", () => {
  vi.stubGlobal("localStorage", {
    getItem: () => {
      throw new Error();
    },
    setItem: () => {
      throw new Error();
    },
    removeItem: () => {},
  });
  vi.stubGlobal("window", { dispatchEvent: () => true });
  writeCity("b");
  expect(readCity()).toBe("b");
});
```

- [ ] **Step 2: Run the tests and confirm they fail.**

  Run `pnpm vitest run tests/unit/city-store.test.ts`. Expected: FAIL, module not found.

- [ ] **Step 3: Implement `city-store.ts`, `CitySwitch`, `GuideSections` and the `AtAGlance` prop change.**

- [ ] **Step 4: Run the tests and confirm they pass.**

  Run `pnpm vitest run tests/unit`. Expected: PASS.

- [ ] **Step 5: Commit.**

  `feat: guide body and city switch for national and local guides`

---

### Task 5: Guide page at `/services/[slug]`

**Files:**

- Create: `src/app/(site)/layout.tsx`: `SiteHeader` + `<main id="main" tabIndex={-1} className="flex-1 focus:outline-none">`, copied from `[city]/layout.tsx`, without the city.
- Create: `src/app/(site)/services/[slug]/page.tsx`
- Create: `src/app/(site)/services/[slug]/opengraph-image.tsx`
- Modify: `src/features/seo/structured-data.ts`
- Modify: `src/components/layout/site-header.tsx`: drop the `city` prop. The logo links to `/`, and Search always links to `/search`.
- Delete: `src/app/[city]/services/[slug]/`

**Interfaces:**

- Consumes: `getGuide`, `getCategory` and `listHolidays` (Task 3); `GuideSections`, `CitySwitch` and `AtAGlance` (Task 4).
- Produces: `serviceJsonLd(input: { title: string; summary: string; body: GuideBody; agency: Agency; category: Category; area?: City; channels: { office: Office; city: City }[]; path: string })`.
  - `area` undefined → `areaServed: { "@type": "Country", name: "Philippines" }`.
  - Otherwise use today's `City` shape.
  - `addressRegion` comes from each channel's `city.province`.

- [ ] **Step 1: Build the page.**
  - **Static params:** `generateStaticParams` returns `listServices()` slugs, with `dynamicParams = false`.
  - **Metadata:**
    - Title is `service.title`, path is `/services/<slug>`.
    - Drafts get `robots: { index: false }`.
    - A national guide is a draft when its `status` is draft. A local guide is a draft when no city version is published (dev only).
  - **Breadcrumbs:** Home › Category › Guide, with back to `/categories/<category>`.
  - **National guide:**
    - `AtAGlance body={service}`, the draft and stale notices, the summary, then `GuideSections`.
    - `where` is a `CitySwitch` whose block per `CityGuide` holds `OfficeCard`s (`holidays`), a "Good to know in <city>" `Notice` for `tips`, and `<ReportOutdated subject={`${title} (${city.name})`} path={path} />`.
    - JSON-LD: one `serviceJsonLd` with no `area`, and channels from all cities. Not emitted for drafts.
  - **Local guide:**
    - Summary, then a `CitySwitch` whose block per `CityGuide` holds `AtAGlance body={local} overlap={false}`, that version's draft or stale notice, and `GuideSections`:
      - `idPrefix="<city>-"`
      - `checklistKey="/services/<slug>#<city>"`
      - `where` = that city's `OfficeCard`s
      - `report` with the city in the subject
    - JSON-LD: one per published city version, with `area` = that city.
  - **No cities:** a `Notice` "Not available in any city yet" with `SuggestService`.
  - **OG image:** eyebrow = category name; same `og-card` as today.

- [ ] **Step 2: Check the guide pages in dev.**

  Run `pnpm dev`, then open `/services/drivers-license-new` and `/services/business-permit-new` at 375px. Expected:
  - The LTO office shows, with "Showing: Sorsogon".
  - The business permit shows Sorsogon's own requirements.
  - Checklist ticks persist after a reload.
  - Print preview shows the requirements.

- [ ] **Step 3: Commit.**

  `feat: national guide page with city picker`

---

### Task 6: National browse pages, search and sitemap

**Files:**

- Create from today's `[city]` versions, dropping the city:
  - `src/app/(site)/page.tsx` (replaces `src/app/page.tsx`, which is deleted)
  - `src/app/(site)/services/page.tsx`
  - `src/app/(site)/categories/[slug]/page.tsx`
  - `src/app/(site)/search/page.tsx`
  - `src/app/(site)/search-index.json/route.ts`
- Modify:
  - `src/features/search/build-index.ts`
  - `src/features/search/search-box.tsx`
  - `src/features/search/search-form.tsx`
  - `src/features/categories/topic-tiles.tsx`
  - `src/features/services/guide-rows.tsx`
  - `src/app/sitemap.ts`
- Delete:
  - `src/app/[city]/services/page.tsx`
  - `src/app/[city]/categories/`
  - `src/app/[city]/search/`
  - `src/app/[city]/search-index.json/`
- Test: `tests/unit/search.test.ts` (fixture URLs only)

**Interfaces:**

- Consumes: `listServices`, `listPopularServices`, `listCities`, `listVisibleAgencies` and `ServiceListing` (Task 3).
- Produces:
  - **`buildSearchDocs(): Promise<SearchDoc[]>`** (no parameter):
    - Guide URLs are `/services/<slug>`.
    - `agency` is the display names of `listing.agencies`, joined with ", ".
    - Local guides add their city names to `keywords`.
    - Office docs come from `listVisibleAgencies()` with the URL `/agencies/<slug>`.
  - **`SearchBox` and `SearchForm`:** the `city` prop is removed. They fetch `/search-index.json` and submit to `/search`.
  - **`TopicTiles`:** the `city` prop is removed. Links go to `/categories/<slug>`.
  - **`GuideRows`:** takes `services: ServiceListing[]` and links to `/services/<slug>`. The agency line is `agencies.map(name).join(", ")`.
  - **Home (`/`):**
    - Hero: "What do you need to get done?", with the subtitle "Where to go, what to bring, the steps and the fees for government services in the Philippines."
    - Popular, then topics.
    - Aside: a "Cities" section with `CityList` (rows link to `/<city>`).
    - The redirect is removed.
  - **Sitemap:** `/`, `/services`, `/agencies`, the categories, `/agencies/<slug>`, `/services/<slug>` (`lastModified` = `listing.lastVerified`), `/<city>`, and the standalone pages.

- [ ] **Step 1: Update the search test fixture URLs** to `/services/...`.

  Run `pnpm vitest run tests/unit/search.test.ts`. Expected: PASS. Only data changes, so this guards the engine.

- [ ] **Step 2: Implement the pages and component changes.**

- [ ] **Step 3: Check the pages in dev.**

  Run `pnpm dev`. Expected:
  - `/` shows popular guides and the city list.
  - Searching "lisensya" finds the license guide, and `/search?q=lisensya` lists it.
  - `/categories/vehicles-and-driving` lists both LTO guides.
  - `/sitemap.xml` has no `/sorsogon/services/` URLs.

- [ ] **Step 4: Commit.**

  `feat: national home, guide lists, categories and search`

---

### Task 7: Agencies, city hub, and removing `[city]`

**Files:**

- Create:
  - `src/app/(site)/agencies/page.tsx`
  - `src/app/(site)/agencies/[slug]/page.tsx`
  - `src/app/(site)/[city]/page.tsx`
  - `src/app/(site)/[city]/opengraph-image.tsx`
- Modify:
  - `src/features/offices/office-rows.tsx`: links go to `/agencies/<agency>#<city>-<slug>`.
  - `src/features/offices/office-card.tsx`: `id` is `${office.city}-${office.slug}`.
- Delete: everything left in `src/app/[city]/` (layout, page, agencies, OG).

**Interfaces:**

- Consumes: `listVisibleAgencies`, `getAgency`, `listOffices`, `listServices`, `getCityHub`, `listCities` and `listHolidays` (Task 3).
- Produces:
  - **`/agencies`:** every visible agency.
  - **`/agencies/[slug]`:**
    - Static params come from `listVisibleAgencies()`.
    - Shows the agency description and channels (unchanged).
    - Then one "Offices in <city>" section per city with offices (`OfficeCard`s).
    - Then "Guides" via `listServices({ agency })`, and `ReportOutdated` as today.
  - **`/[city]`:**
    - Static params come from `listCities()`, with `dynamicParams = false`.
    - Title is the city name and the subtitle is the province.
    - Sections: Hotlines (today's markup); Offices (`OfficeRows`, all of them, with the open-now note); "Run by the city" (`GuideRows` of `localGuides`, hidden when empty); and a link to "All guides" at `/services`.

- [ ] **Step 1: Implement the pages, then delete `src/app/[city]/`.**

- [ ] **Step 2: Run the whole check.**

  Run `pnpm check && pnpm build`. Expected: lint, typecheck, format, content check and unit tests all pass. The build lists `/services/[slug]`, `/agencies/[slug]` and `/[city]`, and no `/[city]/services`.

- [ ] **Step 3: Commit.**

  `feat: national agency pages and city hub; remove per-city routes`

---

### Task 8: End-to-end tests

**Files:**

- Modify:
  - `tests/e2e/journey.spec.ts`
  - `tests/e2e/search.spec.ts`
  - `tests/e2e/publishing.spec.ts`
  - `tests/e2e/open-status.spec.ts`
  - `tests/e2e/feedback.spec.ts`
  - `tests/e2e/accessibility.spec.ts`
- Create: `tests/e2e/city-picker.spec.ts`

**Interfaces:**

- Consumes: the routes from Tasks 5–7 and the fixtures from Task 1.

- [ ] **Step 1: Update the existing specs to the new URLs.**
  - **Journey:** `/` no longer redirects. It shows "Most looked up" and the cities Otherville and Testville.
  - **Open status:** the office is on `/agencies/test-permits-agency`.
  - **Search:** start from `/`; the search URL is `/search?q=permit`.
  - **Feedback:** the `page` param ends in `/services/get-a-test-permit`.
  - **Publishing:** `/services/draft-guide` returns 404, and the sitemap contains `/services/get-a-test-permit`.
  - **Accessibility:** the path list becomes `/`, `/testville`, `/categories/permits`, `/categories/other`, `/services`, `/services/get-a-test-permit`, `/services/get-a-local-permit`, `/agencies`, `/agencies/test-permits-agency` and `/search?q=permit`.

- [ ] **Step 2: Write `tests/e2e/city-picker.spec.ts`.**

```ts
test("picker remembers the city across guides and reloads", async ({
  page,
}) => {
  await page.goto("/services/get-a-test-permit");
  await page.getByLabel("Your city").selectOption({ label: "Otherville" });
  await expect(page.getByText("Otherville Office")).toBeVisible();
  await expect(page.getByText("Testville Main Office")).toBeHidden();
  await page.goto("/services/get-a-local-permit");
  await expect(page.getByText("Otherville cedula")).toBeVisible();
  await expect(page.getByText("Testville barangay clearance")).toBeHidden();
  await page.reload();
  await expect(page.getByLabel("Your city")).toHaveValue("otherville");
});
test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("every city's block is shown", async ({ page }) => {
    await page.goto("/services/get-a-local-permit");
    await expect(
      page.getByRole("heading", { name: "Testville" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Otherville" }),
    ).toBeVisible();
  });
});
test("search finds a local guide by city name", async ({ page }) => {
  await page.goto("/search?q=otherville");
  await expect(
    page.getByRole("link", { name: "Get a local permit" }),
  ).toBeVisible();
});
```

- [ ] **Step 3: Run the end-to-end tests.**

  Run `pnpm test:e2e`. Expected: all specs PASS.

- [ ] **Step 4: Commit.**

  `test: e2e for national guides and the city picker`

---

### Task 9: Docs, design review, PR

**Files:**

- Create: `docs/decisions/0012-national-guides-city-overlays.md`
  - Status Accepted, 2026-10-22, supersedes 0004.
  - Records approaches A, B and C, the ~10–20 city threshold for moving to B, and the publish rule from Global Constraints.
- Modify: `docs/decisions/0004-yaml-content-per-city.md` → `Status: Superseded by 0012`.
- Modify:
  - `docs/architecture.md`: routes and folders.
  - `docs/content-model.md`: national and city files, scopes, the office default, visibility.
  - `docs/content-guide.md`:
    - Paths in "Filling in the [VERIFY] values".
    - New "Adding a guide (national or local)" and "Adding a city" sections.
    - The reserved slugs list (from Global Constraints).
    - Where local tips go.
  - `CLAUDE.md`:
    - §0 status.
    - §5 URL structure and folder tree.
    - §10 roadmap: 12 = National guides, city details; 13 = Deploy; 14+ = Phase 2.
  - `docs/README.md` if it lists ADRs.
- Create: `docs/lessons/lesson-12.md`, following the existing lesson format: what we built, why, key commands, what to remember.

- [ ] **Step 1: Write the docs.**

- [ ] **Step 2: Run the design review.**
  - Run the `/anti-slop-design` review checklist (swap test, squint test, tell count, accessibility, 375px) on `/`, `/services/drivers-license-new`, `/services/business-permit-new` and `/sorsogon`.
  - Fix any findings.
  - Re-run `pnpm check`.

- [ ] **Step 3: Commit, push, and open the PR.**

  Commit with `docs: lesson 12, national guides with city details`. Push, then open the PR with `gh pr create` and the summary plus test results. Don't merge: the maintainer reviews it.
