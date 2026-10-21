# Design system

The live reference is **`/styleguide`**: every token and component, rendered from the real
code. This page explains the rules behind it. Decision record: `decisions/0009`.

## Direction

**The counter window, with a route to follow.** A government errand in Sorsogon, set like
the signage at the counter. Bay teal frames each screen, "now serving" yellow marks the stops
on your route, and the reading text is large and plain. Calm and practical: not a startup, not
an old government portal.

Signature: **Your route** on the guide page. Spend boldness there; keep everything else quiet.

Avoid: gradients, glassy cards, decorative illustrations, carousels, flag-colour theming,
official seals, tracked-out all-caps labels, motion nobody asked for.

## Colour tokens (`src/styles/globals.css`)

| Token                    | Use                                                                       |
| ------------------------ | ------------------------------------------------------------------------- |
| `brand`                  | App bar, title band, primary buttons. White text on it: 5.9:1             |
| `brand-strong`           | Hover/pressed for brand                                                   |
| `brand-tint`             | Icon wells, row hover (at 40%)                                            |
| `signal`                 | Route stops, the search button, focus halo. Never for text or large fills |
| `signal-tint`            | Notices (draft, out of date, good to know). Nothing else                  |
| `bg`                     | Page background                                                           |
| `surface`                | Lists, cards, tables                                                      |
| `ink`                    | Text, heavy rules                                                         |
| `muted`                  | Secondary text (≥ 6.4:1)                                                  |
| `line`                   | Dividers only, too faint for control borders                              |
| `control`                | Borders of inputs and checkboxes (≥ 3:1)                                  |
| `link`                   | Text links                                                                |
| `route`                  | Route line, ticks, progress bar; `on-route` for the tick mark             |
| `open`, `soon`, `closed` | Office status text                                                        |

- Every token is a light/dark pair; components never need `dark:` for colour.
- Tailwind's default colours, radii, shadows and text sizes are removed: only tokens exist.
- The `.verify-mark` yellow is fixed in both schemes so editors always spot `[VERIFY]`.

## Light / dark

Follows the system by default; the moon/sun button in the app bar overrides it. Source of truth
is `<meta name="color-scheme">`, read by CSS with `:has()`. Browsers without `light-dark()`
follow the system only and hide the toggle. See `decisions/0003`.

## Type

- **Atkinson Hyperlegible Next** (variable) for all reading text. Size-matched fallback in CSS.
- **Archivo Narrow 700** via the `sign` utility: page titles, the home question, step numerals.
  One static weight to keep it small on prepaid data.
- Scale: `text-sm` 16px · `text-base` 18px (body) · `text-lg` 20 · `text-xl` 24 (section
  headings) · `text-2xl` 32–40 (titles) · `text-display` 40–56 (home question). Nothing smaller.
- Text blocks use `max-w-prose`. Headings balance; paragraphs `text-wrap: pretty`.

## Shape & depth

- Radius by hierarchy: `rounded-control` (10px) for inputs and buttons, `rounded-card` (14px)
  for containers, `rounded-pill` for tabs and chips, circles for route stops.
- No drop shadows on content. Raised tiles use `shadow-lip` (a 2px edge). `shadow-pop` only for
  things that float.

## Layout

- Mobile first at 375px; content column `max-w-3xl` inside `max-w-page` (72rem).
- Every page: teal `SiteHeader` app bar, then a teal `PageHeader` band (back link, title,
  subtitle), then content on `bg`.
- Block grids always declare `grid-cols-1` (a shrinkable column), so long values can't push the
  page wider than the phone.

## Components

| Component                             | Where             | Notes                                                                                          |
| ------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| `GuideRows`, `OfficeRows`, `CityList` | lists             | Whole row is the tap target (`tap-area` + `stretched`). Title short; agency or status under it |
| `TopicTiles`                          | city home         | Two across on phones; empty topics say "Coming soon"                                           |
| `AtAGlance`                           | guide             | Fees, takes, checked. Overlaps the title band                                                  |
| `SectionTabs`                         | guide             | Sticky jump links; marks the section you're reading                                            |
| `RequirementChecklist`                | guide             | Real checkboxes, "X of N ready", saved on this phone                                           |
| `StepRoute`                           | guide             | The signature. Last step = finish flag. Plain numbered list on paper                           |
| `OfficeCard`, `OpenStatusLabel`       | guide, agency     | Four states, each with its own marker shape and words                                          |
| `Notice`                              | guide, contribute | Draft · may be out of date · good to know. Only these                                          |
| `buttonClass()`                       | anywhere          | 48px tall, verb first, one primary per screen                                                  |

## Rules

- Only token utilities. No arbitrary values (`[13px]`) without a comment explaining why.
- Every interactive element: visible focus (yellow halo, ink inner edge), at least 44px tall.
- Icons (Lucide, 2px stroke, 22px) sit beside a visible word and are `aria-hidden`.
- Status and errors always use words, never colour alone.
- Every styled `<ul>`/`<ol>` outside `<nav>` gets `role="list"`.
- Formatting (₱, dates, times, days) only through `src/lib/utils/format.ts`.

## Print

Always the light palette on white. Hides the app bar, footer, tabs, buttons, FAQs, related
guides and report links. Adds a line saying what the sheet is and its web address. The route
becomes a numbered list; source and online links print their addresses.

## Large text and high contrast

- `<meta name="text-scale">` lets Android's text size apply. Never set font-size on `html`.
- Label/value rows wrap; headings break long words rather than overflow.
- Filled controls keep a transparent border so they have an edge in Windows High Contrast mode.
