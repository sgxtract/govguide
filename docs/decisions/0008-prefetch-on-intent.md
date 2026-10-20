# 0008 — Prefetch links on intent, not on sight

- Status: Accepted
- Date: 2026-10-20

## Context

Next prefetches every link in the viewport. On the city home that was ~18 KB at page load,
growing with every guide listed, all spent on pages most visitors never open. Many visitors use prepaid data.

## Decision

One `Link` component (`src/components/ui/link.tsx`) with `prefetch={false}`, calling
`router.prefetch` on touchstart, pointerenter and focus, unless Data Saver is on.
ESLint forbids importing `next/link` anywhere else.

## Consequences

- 0 bytes prefetched on load; the tapped page is usually ready by the time the tap completes.
- A first tap on a very slow connection waits slightly longer than with full prefetch.
