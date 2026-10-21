# Content guide

How to research, write, verify, and update a service guide.

## The rule

**Never guess.** Every requirement, fee, address, office hour and processing time
must come from an official source: the office's Citizen's Charter, the agency's
website, or the posted notice at the office. If you don't have it, write `[VERIFY]`.

## Filling in the [VERIFY] values (start here)

All 10 starting guides are drafts. Drafts show in `pnpm dev` with every `[VERIFY]`
highlighted in yellow, and are hidden on the live site.

1. Run **`pnpm content:todo`**. It lists every `[VERIFY]` left, by file and line.
2. Open one guide, e.g. `content/cities/sorsogon/services/nbi-clearance.yaml`, and its
   official source side by side.
3. Replace each `[VERIFY]` with the real value. Remove the `[VERIFY] ` prefix from text that
   turned out right; rewrite text that didn't.
   - A `[VERIFY]` in a requirement's **label** means check the whole item: the label, whether
     it's `original` / `photocopy` / `original-and-photocopy`, and `copies`.
   - Amounts are in pesos. Any of these work: `585`, `"585"`, `₱585.00`, `"PHP 1,234.50"`.
     Free = `amount: 0`. Also remove `[VERIFY]` from the fee's `label` once it's checked.
     Don't mix a number and `[VERIFY]` (`"585 [VERIFY]"`): it's either checked or not.
   - Times are 24-hour in quotes: `opens: "08:00"`, `closes: "17:00"`.
   - Dates are `"YYYY-MM-DD"`.
   - The **last step** is drawn as the finish flag. Make it what you leave with
     ("Get your NBI clearance"), including when and where it's released.
4. Do the same for the guide's **agency** (`content/agencies/…`) and **offices**
   (`content/cities/sorsogon/offices/…`). A guide can't be published while they still have
   `[VERIFY]`, and they don't get their own pages until they're clean.
5. Set `sources` (title, URL, the date you opened it) and `lastVerified` to today.
6. Set `status: published`.
7. Run `pnpm content:check`. If anything is still `[VERIFY]` in a published guide, it tells you
   which file; the build refuses to ship it.
8. Add public holidays for the year to `content/holidays.yaml`, so offices show "Closed today".

Some values don't belong in a guide at all: if a field doesn't apply (no online option, no
FAQs), delete the whole block instead of leaving `[VERIFY]`.

## Who verifies

- Anyone can propose a change by Pull Request (or report outdated info as an Issue).
- The maintainer (@sgxtract) checks every change against the cited source before merging.
- A guide is `published` only when it has zero `[VERIFY]` values and at least one source.

## How often

- Re-verify every published guide **every 6 months**, or right away when someone reports a change.
- When you re-verify, update `lastVerified` and each source's `accessed` date, even if nothing changed.
- `pnpm content:check` lists guides that are due. After 6 months the guide shows "This guide may be out of date".

## Writing style

- Title = the task, in plain words: "Get a new driver's license", not "Driver's License Application Process".
- One idea per sentence. Short sentences.
- Say exactly what to bring: original or photocopy, and how many copies.
- Steps start with a verb: "Pay at the Cashier", "Submit your form at Window 3". Put the window
  or counter in `where` and the time it takes in `duration`.
- Steps go all the way to the finish: having the document in hand, including the claim stub,
  release date, and where to claim.
- If the agency requires an online appointment or form, say so in a step (`where: Online, before you go`)
  and link its official portal under `online`. GovGuide never books appointments or hosts forms.
- Tips are things people learn the hard way: cut-off times, where to photocopy, what to wear.
- No jargon or acronyms without the full name the first time.
- Add `keywords` for the words people actually type: "lisensya", "birth cert", "NSO". No need
  to add misspellings; search tolerates small typos.
- Leave `fees` empty only if the source lists none.

## Adding a new guide

1. Copy an existing guide in `content/cities/sorsogon/services/`, keep `status: draft`.
2. The file name is the URL: `get-a-cedula.yaml` → `/sorsogon/services/get-a-cedula`.
3. Fill in what you can from the source; `[VERIFY]` the rest.
4. Optionally list it in `popular` in `city.yaml` to show it under "Most looked up".
5. Run `pnpm content:check`, then open a PR with the source links in the description.

## Handling reports

1. New reports arrive as `outdated-info` / `new-service` issues, or by email.
2. Check the claim against an official source: the posted notice, Citizen's Charter, or agency
   site. "Staff told me" needs a written source before changing a guide.
3. If a report contains personal information, edit it out of the issue immediately (or delete
   the email) before anything else.
4. Fix the guide in a PR that links the issue (`Fixes #12`), update `lastVerified` and the
   source's `accessed` date.

Reserved slugs: a city folder can't be named `contribute`, `about`, `privacy`, `disclaimer` or
`styleguide` (those are site pages).
