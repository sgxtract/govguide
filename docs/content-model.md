# Content model

All content lives in `/content` as YAML, validated by `src/lib/content/schemas.ts`.

```
content/
├── categories.yaml                  # list of categories
├── holidays.yaml                    # public holidays (offices show "Closed today")
├── popular.yaml                     # "Most looked up" on the home page
├── agencies/<slug>.yaml             # shared by every city
├── services/<slug>.yaml             # one per guide, nationwide
└── cities/<city>/
    ├── city.yaml
    ├── offices/<slug>.yaml
    └── services/<slug>.yaml         # what this city adds to a guide (same slug)
```

- **The file name is the slug.** The city comes from the folder. A city folder can't use a
  reserved name (`about`, `agencies`, `categories`, `contribute`, `disclaimer`,
  `opengraph-image`, `privacy`, `search`, `services`, `styleguide`).
- **Unknown keys are errors**, so a typo can't silently drop data.
- **`[VERIFY]`** is allowed in any field while drafting (including URLs, numbers, dates).
- **Agencies, offices and a city's file for a national guide** have no draft status. In
  production they appear only when they contain no `[VERIFY]`; in dev they always show, with
  the marks highlighted.

## National and city-run guides

Every guide has a file in `content/services/` with a `scope`:

- **`scope: national`**: the same everywhere (LTO, PSA, DFA, NBI, PNP). The whole guide is in
  this one file. It shows, in each city, that city's offices of the guide's agency. A city file
  is optional: it can list other `offices` instead, and add local `tips`.
- **`scope: local`**: run by each city or barangay (business permit, cedula, barangay
  clearance), so requirements and fees differ. This file only says what the service is. Each
  city writes its own version in `cities/<city>/services/<slug>.yaml`, with its own `status`.

**Publishing rules** (the build fails otherwise):

- A `published` national guide must have no `[VERIFY]` in itself or its agency. An office that
  still has `[VERIFY]` doesn't block it: in production that office is hidden, and a city with
  nothing left to show drops out of the guide.
- A `published` city version of a local guide must have no `[VERIFY]` in itself, its agency, or
  the offices it lists.
- A local guide appears once at least one city's version is published.

## Category (`categories.yaml`)

| Field             | Required | Notes                                                                 |
| ----------------- | -------- | --------------------------------------------------------------------- |
| slug              | yes      | Used in URLs                                                          |
| name, description | yes      |                                                                       |
| icon              | yes      | documents · vehicles · business · health · social · benefits (Lucide) |

## Holidays (`holidays.yaml`)

A list of `{ date: "YYYY-MM-DD", name }`. Optional file; an empty list is `[]`. Copy the dates
from the official proclamation each year, plus local Sorsogon holidays.

## City (`cities/<city>/city.yaml`)

| Field                       | Required | Notes                                              |
| --------------------------- | -------- | -------------------------------------------------- |
| name, province, description | yes      |                                                    |
| hotlines                    | no       | `{ label, number }` list, shown on the city's page |

## Popular (`popular.yaml`)

A list of guide slugs for "Most looked up" on the home page, in order. Optional; without it the
home page shows the first few guides. Unknown slugs fail the build; drafts are skipped in
production.

## Agency (`agencies/<slug>.yaml`)

| Field             | Required | Notes                                                                                 |
| ----------------- | -------- | ------------------------------------------------------------------------------------- |
| name, description | yes      |                                                                                       |
| acronym           | no       |                                                                                       |
| level             | yes      | national · provincial · city · barangay                                               |
| website           | no       | URL or `[VERIFY]`                                                                     |
| portals           | no       | `{ label, url }`: official online systems                                             |
| hotline           | no       |                                                                                       |
| keywords          | no       | Old or local names, e.g. "NSO" for PSA. Also searched for every guide of this agency. |

## Office (`cities/<city>/offices/<slug>.yaml`)

| Field         | Required | Notes                                                                                                                     |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| agency        | yes      | Must match an agency slug                                                                                                 |
| name, address | yes      |                                                                                                                           |
| mapUrl        | no       |                                                                                                                           |
| hours         | no       | `{ days: [mon…sun], opens: "HH:MM", closes: "HH:MM" }`. A lunch break is two entries for the same days. Drives "Open now" |
| phones, notes | no       | Lists                                                                                                                     |
| email         | no       |                                                                                                                           |

## Guide (`services/<slug>.yaml`)

Fields for both scopes:

| Field    | Required | Notes                                                                  |
| -------- | -------- | ---------------------------------------------------------------------- |
| scope    | yes      | `national` or `local`                                                  |
| title    | yes      | The task in plain words: "Get a new driver's license"                  |
| summary  | yes      | One sentence. For a local guide, true in every city                    |
| category | yes      | Must match a category slug                                             |
| keywords | no       | Words people type: everyday names, Filipino/Bikol terms, abbreviations |
| related  | no       | Guide slugs                                                            |

A **national** guide also has `status`, `agency` and the guide body below. A **local** guide has
nothing else; anything more is an error.

## City file for a national guide (`cities/<city>/services/<slug>.yaml`)

Optional. Leave it out when the city's offices of the guide's agency are the right ones.

| Field   | Required | Notes                                                                       |
| ------- | -------- | --------------------------------------------------------------------------- |
| offices | no       | Office slugs in this city, of the guide's agency. Replaces the default list |
| tips    | no       | Local tips: "Photocopy shop across the street", "Cut-off is 3 PM"           |

## City version of a local guide (`cities/<city>/services/<slug>.yaml`)

| Field   | Required | Notes                                         |
| ------- | -------- | --------------------------------------------- |
| status  | yes      | `draft` (hidden in production) or `published` |
| agency  | yes      | The city's own agency, e.g. `sorsogon-city`   |
| offices | no       | Office slugs in this city, of that agency     |
| …       |          | The guide body below                          |

## Guide body

Used by a national guide and by each city version of a local guide.

| Field          | Required | Notes                                                                                                          |
| -------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| whoCanApply    | no       | List                                                                                                           |
| requirements   | yes (≥1) | `{ label, form, copies?, notes?, alternatives? }`. `form`: original · photocopy · original-and-photocopy       |
| steps          | yes (≥1) | `{ title, details?, where?, duration? }`. List order is step order; the last step is drawn as the finish       |
| fees           | no       | `{ label, amount, notes? }`. `amount` in pesos: `585`, `"₱1,234.50"` and similar are read as numbers; 0 = free |
| processingTime | yes      |                                                                                                                |
| online         | no       | `{ label, url, whatYouCanDo }`                                                                                 |
| tips           | no       | List                                                                                                           |
| faqs           | no       | `{ question, answer }`                                                                                         |
| sources        | yes (≥1) | `{ title, url, accessed }`                                                                                     |
| lastVerified   | yes      | `YYYY-MM-DD`. Re-verify every 6 months                                                                         |
