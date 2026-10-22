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
2. Open one guide and its official source side by side. National guides (LTO, PSA, NBI…) are
   in `content/services/`, e.g. `content/services/nbi-clearance.yaml`. City-run guides
   (business permit, cedula, barangay clearance) are each city's own version, e.g.
   `content/cities/sorsogon/services/cedula.yaml`.
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
   (`content/cities/sorsogon/offices/…`).
   - A national guide can't be published while its agency has `[VERIFY]`. An office with
     `[VERIFY]` doesn't block it, but stays hidden on the live site until it's clean, so the
     guide won't show that city's office yet.
   - A city's version of a city-run guide can't be published while its agency or the offices it
     lists have `[VERIFY]`.
5. Set `sources` (title, URL, the date you opened it) and `lastVerified` to today.
6. Set `status: published`. For a city-run guide, that's in the city's version.
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

First decide: is it the **same in every city** (national: LTO, PSA, DFA, NBI, PNP…) or **run
by each city** (local: business permit, cedula, barangay clearance)?

**National guide**

1. Copy a guide in `content/services/`, keep `scope: national` and `status: draft`.
2. The file name is the URL: `get-a-cedula.yaml` → `/services/get-a-cedula`.
3. Fill in what you can from the source; `[VERIFY]` the rest.
4. Each city's offices of that `agency` show up automatically. Only add
   `content/cities/<city>/services/<slug>.yaml` to list other offices (`offices:`) or to add
   local tips (`tips:`), e.g. "Photocopy shop across the street".

**City-run guide**

1. Create `content/services/<slug>.yaml` with `scope: local`, `title`, `summary` (true in every
   city), `category` and `keywords`. Nothing else.
2. Create the city's version in `content/cities/<city>/services/<slug>.yaml`: `status: draft`,
   the city's `agency`, its `offices`, and the requirements, steps, fees and sources from that
   city's Citizen's Charter.

Then, for either kind:

- Optionally list it in `content/popular.yaml` to show it under "Most looked up".
- Run `pnpm content:check`, then open a PR with the source links in the description.

## Adding a city

1. Create `content/cities/<city>/city.yaml` (name, province, description, hotlines). The folder
   name is the URL: `/<city>`. It can't be a reserved name (see the end of this page).
2. Add its offices in `content/cities/<city>/offices/`. National guides show them right away.
3. For each city-run guide, write the city's version in `content/cities/<city>/services/`.

`content/holidays.yaml` is shared by every city, so only national holidays go there for now.

## Handling reports

1. New reports arrive as `outdated-info` / `new-service` issues, or by email.
2. Check the claim against an official source: the posted notice, Citizen's Charter, or agency
   site. "Staff told me" needs a written source before changing a guide.
3. If a report contains personal information, edit it out of the issue immediately (or delete
   the email) before anything else.
4. Fix the guide in a PR that links the issue (`Fixes #12`), update `lastVerified` and the
   source's `accessed` date.

Reserved names: a city folder can't be named `about`, `agencies`, `categories`, `contribute`,
`disclaimer`, `opengraph-image`, `privacy`, `search`, `services` or `styleguide` (those are site
pages). `pnpm content:check` rejects them.
