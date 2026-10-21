# 0010 — "Open now" worked out in the browser, in Philippine time

- Status: Accepted
- Date: 2026-10-22

## Context

People want to know if an office is open before they leave. Pages are static (built ahead of
time), so the server can't know "now".

## Decision

- `features/offices/open-status.ts`: pure functions, no server imports. Given an office's
  hours, the current moment and `content/holidays.yaml`, return open / closes soon (≤ 60 min) /
  closed (with holiday name and next opening) / unknown.
- Always Asia/Manila, via `Intl.DateTimeFormat`, whatever the phone's timezone.
- `OpenStatusLabel` (client) reads the clock with `useSyncExternalStore`, ticking every 30 s.
  The server renders an invisible same-size placeholder, so nothing jumps.
- Hours containing `[VERIFY]` show "Hours not checked yet, call before you go". We never guess.
- Each state has its own marker shape (dot, diamond, ring, dash) plus words.

## Consequences

- Holidays must be added to `content/holidays.yaml` each year, or offices show as open on them.
  The disclaimer page says status can't know about sudden closures.
- Unit tests fix the date; e2e tests use Playwright's clock.
