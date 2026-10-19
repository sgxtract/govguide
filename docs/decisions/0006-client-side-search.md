# 0006 — Client-side search with MiniSearch, loaded on demand

- Status: Accepted
- Date: 2026-10-19

## Decision

- At build time, each city gets a static `/[city]/search-index.json` (built from the repository, so drafts and unverified offices are excluded in production).
- The browser searches it with MiniSearch (prefix + fuzzy matching, field boosts, English/Filipino stop words, accent folding).
- The library and index load only on the first focus/keystroke in the search box.
- The search box is a GET form inside `<search>`; without JS it goes to `/[city]/search`, which lists all guides.

## Why

- No server or database to run or pay for; works with any static host.
- Visitors who only browse download nothing extra (important on prepaid data).
- Fuse.js was considered; MiniSearch is smaller and its ranking is more predictable for short titles.

## Revisit when

The index passes ~200 KB, or we need search across cities.
