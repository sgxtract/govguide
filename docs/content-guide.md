# Content guide

How to research, write, verify, and update a service guide.

## The rule

**Never guess.** Every requirement, fee, address, office hour and processing time
must come from an official source: the office's Citizen's Charter, the agency's
website, or the posted notice at the office. If you don't have it, write `[VERIFY]`.

- Steps go all the way to the finish: having the document in hand, including the claim stub, release date, and where to claim.
- If the agency requires an online appointment or form, say so in a step and link its official portal under `online`. GovGuide never books or hosts forms.

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
- Steps go all the way to the finish: having the document in hand, including the claim stub, release date, and where to claim.
- If the agency requires an online appointment or form, say so in a step and link its official portal under `online`. GovGuide never books appointments or hosts forms.
- Use `amount: 0` for free items (shown as "Free"); leave `fees` empty only if the source lists none.
- Add `keywords` for the words people actually type: "lisensya", "birth cert", "NSO". No need to add misspellings; search tolerates small typos.

## Workflow

1. Copy an existing guide, keep `status: draft`.
2. Fill in values from the official source; leave `[VERIFY]` for anything not confirmed.
3. Run `pnpm content:check`.
4. Open a PR with the source links in the description.
5. Once verified and free of `[VERIFY]`, set `status: published` and `lastVerified` to today.
6. Verify the agency and office files too: a guide can't be published while its agency or offices still contain `[VERIFY]`, and they won't get their own pages until they're clean.

## Handling reports
1. New reports arrive as `outdated-info` / `new-service` issues (or emails, once the inbox is set).
2. Check the claim against an official source: the posted notice, Citizen's Charter, or agency site. "Staff told me" needs a written source before changing a guide.
3. If a report contains personal information, edit it out of the issue immediately (or delete the email) before anything else.
4. Fix the guide in a PR that links the issue (`Fixes #12`), update `lastVerified` and the source's `accessed` date.
5. Reserved slugs: a city folder can't be named `contribute`, `about`, `privacy` or `disclaimer` (those are site pages).
