# Content guide

How to research, write, verify, and update a service guide.

## The rule
**Never guess.** Every requirement, fee, address, office hour and processing time
must come from an official source: the office's Citizen's Charter, the agency's
website, or the posted notice at the office. If you don't have it, write `[VERIFY]`.

## Who verifies
- Anyone can propose a change by Pull Request (or report outdated info as an Issue).
- The maintainer (@sgxtract) checks every change against the cited source before merging.
- A guide is `published` only when it has zero `[VERIFY]` values and at least one source.

## How often
- Re-verify every published guide **every 6 months**, or right away when someone reports a change.
- When you re-verify, update `lastVerified` and each source's `accessed` date, even if nothing changed.
- `pnpm content:check` lists guides that are due.

## Writing style
- Title = the task, in plain words: "Get a new driver's license", not "Driver's License Application Process".
- One idea per sentence. Short sentences.
- Say exactly what to bring: original or photocopy, and how many copies.
- Steps start with a verb: "Pay at the Cashier", "Submit your form at Window 3".
- Tips are things people learn the hard way: cut-off times, where to photocopy, what to wear.
- No jargon or acronyms without the full name the first time.

## Workflow
1. Copy an existing guide, keep `status: draft`.
2. Fill in values from the official source; leave `[VERIFY]` for anything not confirmed.
3. Run `pnpm content:check`.
4. Open a PR with the source links in the description.
5. Once verified and free of `[VERIFY]`, set `status: published` and `lastVerified` to today.