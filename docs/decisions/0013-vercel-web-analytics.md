# 0013 — Vercel Web Analytics, without query strings

- Status: Accepted
- Date: 2026-10-22

## Context

We want to know which guides people need, to decide what to verify and publish next. Visitors
are often on prepaid data, and the site promises no personal data (`/privacy`, Data Privacy Act).
The search page keeps what people type in the address (`/search?q=…`), and someone could type a
name or an ID number there.

## Decision

Use Vercel Web Analytics (`@vercel/analytics`): it's built into the host, uses no cookies, and
stores only page, referrer, country/region, device, OS and browser. Visitors are grouped by a
hash that's discarded after 24 hours. The script is loaded after the page, so it doesn't delay
the first paint.

Its `beforeSend` removes the query string and #hash from every URL before sending, so search
words are never collected.

## Trade-offs

- We don't learn what people search for, including searches with no results. Page views of each
  guide answer "what do people need" well enough for now. If we want search terms later, it
  should be a deliberate change (for example, counting only searches that match a guide's
  keyword), with `/privacy` updated in the same PR.
- Plausible was the alternative: also cookie-free, but paid. Umami is free but self-hosted,
  which means a server and a database to look after.
- Ties the visit counts to Vercel. Leaving Vercel means losing the history, not breaking the
  site: remove one component.
