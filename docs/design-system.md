# Design system

## Direction

A printed Citizen's Charter / transit timetable: calm, exact, local.
Warm paper neutrals, near-black ink, one teal accent, ruled lines instead of shadows,
a heavy top rule like a posted notice. Signature move: numbered steps + requirements
checklist on the service page (Lesson 04).

Avoid: SaaS gradients, glassy cards, icon grids, "unlock/seamless" copy, flag-color theming,
and the cluttered old-portal look.

## Typography

- Atkinson Hyperlegible Next (variable 200–800), self-hosted via `next/font`.
- Scale: `text-sm` 1rem · `text-base` 1.125rem (body) · `text-lg` · `text-xl` · `text-2xl` (fluid) · `text-display` (fluid).
- Nothing smaller than 1rem. Text blocks use `max-w-prose` (65ch).
- Fallback: next/font has no metrics for this font yet, so `layout.tsx` sets `adjustFontFallback: false` and an explicit `fallback` stack starting with "Atkinson Fallback", a size-matched local Arial/Roboto defined in globals.css. Re-measure if we change fonts.

## Color tokens

| Token     | Use                                                      |
|-----------|----------------------------------------------------------|
| `paper`   | Page background                                          |
| `surface` | Footer, table stripes, quiet blocks                      |
| `ink`     | Text, heavy rules                                        |
| `muted`   | Secondary text; borders of interactive controls (≥3:1)   |
| `rule`    | Decorative dividers only (too faint for control borders) |
| `accent`  | Links, focus ring, checkbox accent. Use sparingly        |
| `notice`  | Callouts for things people commonly forget               |

All text pairs pass WCAG AA in both schemes. Exception: don't put `muted` text on `notice` (dark mode 4.4:1); use `ink`.

## Light / dark

- Follows the system by default. The header toggle overrides it (two states; switching back to the system's choice removes the override).
- Source of truth: `<meta name="color-scheme">`. CSS reads it with `:has()`; JS only edits the meta.
- Colors adapt via `light-dark()` tokens, so components never need `dark:` for color.
- `dark:` variant = "currently rendered dark" (system or override). Use it for non-color branches only.
- Browsers without `light-dark()` follow the system only; the toggle is hidden there.

## Shape & depth

- Radius: `rounded-sm` (2px), `rounded-md` (4px). Nothing rounder.
- Shadow: `shadow-pop` only for menus, popovers, dialogs.

## Rules

- Only token utilities. Tailwind's default colors, radii, shadows and text sizes are removed on purpose.
- No arbitrary values (`[13px]`) without a comment explaining why.
- Every interactive element: visible `:focus-visible`, 44px minimum tap target.

## Lists

- Lists of things to pick (categories, guides, cities) are ruled rows: a 2px `ink` rule on top, 1px `rule` dividers between rows. No cards.
- The whole row is clickable via a stretched link (`after:absolute after:inset-0` on the link, `relative` on the row). The link text stays short.
- Every styled `<ul>`/`<ol>` outside `<nav>` gets `role="list"` (Safari drops list semantics without bullets).
- Empty lists say why they're empty and offer "Suggest a service".

## The guide page (signature)

- Order follows the errand: at a glance (fees, processing time, last checked) → what to bring → steps → fees → where to go → online → tips → questions → sources.
- Steps: big `ink` numerals in their own column, timetable rows, "Where / Takes" underneath. Numerals are `aria-hidden`; the `<ol>` carries the order.
- What to bring: ruled checklist with empty boxes (real tick-boxes in Lesson 07).
- `notice` callouts: draft banner, "may be outdated" warning, Good to know. Nothing else.
- One column at every width; the reading order never changes.
- Formatting (₱, dates, times, days) only through `src/lib/utils/format.ts`.

## Checklist

- "What to bring" uses real checkboxes with `.tick-box` (appearance:none, 2px ink square, CSS-mask checkmark). Not `accent-color`: it isn't in older Safari.
- The whole row is the `<label>`, ≥44px tall. Ticked rows fade and strike through (`peer-checked:`).
- Ticks are saved per guide in `localStorage` (`govguide:checklist:<path>`), by requirement label. Nothing leaves the phone.

## Print

- Always prints the light palette; hides header, footer, breadcrumbs, buttons, jump links, FAQs, related guides and the report link.
- Adds a print-only line: independent guide + online address.
- `.print-urls` sections print link addresses; `li`, `tr` and `.print-keep` never split across pages.
- Use `print:hidden` for anything that only makes sense on screen.

## Share card

- 1200×630, always light palette (hex copies in `og-card.tsx`; keep in sync with tokens).
- Heavy ink top rule, "GovGuide / city · category", big title, agency, independence line.
- Favicon: a ticked box (`app/icon.svg`), colors flip in dark browser UI.

## Large text (phones set to 200%)
- `<meta name="text-scale">` opts Chrome/Android into the phone's text size. Never set font-size on `html`/`:root` for screen.
- Rows that put a label and a value side by side use `flex-wrap`; text never gets `shrink-0` or `whitespace-nowrap` (except money).
- `text-2xl` and `text-display` are capped with `min(…, vw)` so headings don't split mid-word; headings also have `overflow-wrap: break-word`.
- Filled controls (bg-ink buttons) get `border-transparent` so they keep an edge in Windows High Contrast mode.