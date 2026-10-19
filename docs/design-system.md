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

## Color tokens
| Token | Use |
|---|---|
| `paper` | Page background |
| `surface` | Footer, table stripes, quiet blocks |
| `ink` | Text, heavy rules |
| `muted` | Secondary text; borders of interactive controls (≥3:1) |
| `rule` | Decorative dividers only (too faint for control borders) |
| `accent` | Links, focus ring, checkbox accent. Use sparingly |
| `notice` | Callouts for things people commonly forget |

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