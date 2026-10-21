# 0011 — Respect pnpm's minimum release age

- Status: Accepted
- Date: 2026-10-22

## Context

pnpm refuses lockfile entries published within its `minimumReleaseAge` window, a guard
against compromised releases. `lucide-react@1.61.0` was one day old when v2 was set up.

## Decision

Keep the policy. Pin to a release that has been out a while (`lucide-react ~1.56.0`), and
regenerate the lockfile (`pnpm clean --lockfile && pnpm install`) when that's needed.
Upgrade dependencies in their own PR, after the window has passed.

## Also

- TypeScript stays on 5.9 and ESLint on 9: TypeScript 7 and ESLint 10 are new, and Next's
  type generation and `eslint-config-next` are proven on these lines.
- Icons: `lucide-react` (tree-shaken, server-rendered, no client JS). It replaced hand-copied
  SVG paths, which were easy to get inconsistent.
