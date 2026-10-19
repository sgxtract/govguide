# Lesson 00 — Project setup

**Built:** Next.js 16 + TS strict + Tailwind v4 + ESLint 9 (flat) + Prettier, pnpm, public GitHub repo with squash-only PRs and a protected main, docs skeleton, ADRs 0001–0002.

**Remember:**

- `pnpm check` before every push. `next build` no longer lints.
- The PR title becomes the squash commit, so write it as a Conventional Commit.
- `noUncheckedIndexedAccess` is on: array access can be `undefined`.
- `postcss.config.mjs` loads Tailwind. If it's missing, the site renders unstyled and Turbopack warns "Unknown at rule: @theme".
