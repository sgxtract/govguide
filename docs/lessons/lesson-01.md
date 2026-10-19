# Lesson 01 — Design direction & tokens

**Built:** design tokens in `src/styles/globals.css` (Tailwind defaults removed), Atkinson Hyperlegible Next via `next/font`, header/footer, skip link, light/dark toggle (ADR 0003).

**Remember:**

- Only token utilities exist: `bg-paper`, `text-ink`, `border-muted`, `rounded-md`…
- Colors adapt automatically. `dark:` is only for non-color things like icons.
- Check new color pairs for contrast before using them.
- Test at 375px wide, in both schemes.
