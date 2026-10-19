# 0003 — Light/dark mode with native color-scheme, no library

- Status: Accepted
- Date: 2026-10-19

## Context
Users want to switch light/dark (e.g. bright sunlight). `next-themes` is the common choice,
but it applies a `.dark` class with JavaScript, so styling depends on JS running.

## Decision
- Use the platform: `<meta name="color-scheme">` + CSS `color-scheme` + `light-dark()` tokens.
- A tiny inline script applies a saved choice before first paint. A ~60-line client component toggles it.
- Two-state toggle: override, or back to system.
- Browsers without `light-dark()` follow the system only; the toggle is hidden there.

## Consequences
- No dependency. Works without JS (follows the system). Native UI (scrollbars, form controls) matches automatically.
- When we add a Content Security Policy (Lesson 09/12), the inline script needs a hash or nonce.