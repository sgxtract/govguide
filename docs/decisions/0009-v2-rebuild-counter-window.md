# 0009 — v2 rebuild: the "counter window" design

- Status: Accepted
- Date: 2026-10-22

## Context

v1 (lessons 00–11) worked well but read like a printed notice: plain text, ruled lists,
one column. People found it hard to treat as an app. The maintainer asked for a rebuild that
looks and feels like a usable application, keeping the accuracy rules.

Three directions were mocked up: A "Counter window" (teal + "now serving" yellow, queue-ticket
steps), B "Long brown envelope" (ballpoint blue, kraft checklist), C "Route map" (colour-coded
transit lines). The maintainer chose **A, with C's route for the steps**, and asked for a
slightly lighter header teal.

## Decision

- Teal app bar and title band (`brand` #1D6E75, white text 5.9:1), page background `bg`,
  white `surface` cards for lists, a 2px "lip" instead of drop shadows.
- "Now serving" yellow (`signal`) is reserved for route stops, the search button and focus.
- Steps are drawn as **Your route**: a teal line joining yellow numbered stops; the last step is
  a flag, "what you leave with".
- Archivo Narrow 700 for titles and step numerals (counter signage), Atkinson Hyperlegible Next
  for everything else. Nothing under 16px; body 18px.
- Section tabs stick to the top of the guide; checklist shows "X of N ready" with a progress bar.
- Built in one pass (not lesson by lesson) at the maintainer's request. The content model,
  repository, search, SEO, feedback and tests were carried over from v1 and adapted.

## Consequences

- `/styleguide` renders every token and component from the real code; it's the reference.
- The v1 rules (one column on guides, print sheet, token-only utilities, 44px targets) still hold.
