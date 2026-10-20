# Quality bar

## Budgets (Lighthouse, Mobile, Navigation)

- Performance ≥ 90 · Accessibility 100 · Best Practices 100 · SEO 100 (published pages)
- CLS 0
- First visit to any page ≤ 200 KB transferred (now ~155 KB + 34 KB font)
- Most of the JavaScript is the Next/React runtime (~117 KB). Our own client code
  must stay small: no client-side libraries on page load (search loads on demand).

## Before merging UI changes

1. **Lighthouse**: Chrome DevTools → Lighthouse → Mobile → Navigation, on `pnpm build && pnpm start`
   (never on `pnpm dev`, which isn't optimized).
2. **Keyboard**: Tab through the page. "Skip to content" first, every stop visible, nothing trapped.
3. **Large text**: DevTools console → `document.documentElement.style.fontSize = "200%"`.
   No horizontal scroll at 375 px, no words split mid-word in headings.
4. **Narrow screen**: 320 px wide at normal size. No horizontal scroll.
5. **Both color schemes** via the header toggle.
6. **High contrast**: DevTools → Rendering → "Emulate CSS forced-colors: active".
   Every control still has a visible edge.
7. **Slow network**: DevTools → Network → "Slow 4G". Text appears before the font; nothing jumps.

axe (WCAG 2.2 AA) runs automatically on every page type in both color schemes in `tests/e2e/accessibility.spec.ts`. The manual checks above still matter: automated tools catch only about a third of real problems.