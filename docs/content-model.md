# Content model

All content lives in `/content` as YAML, validated by `src/lib/content/schemas.ts`.

```
content/
├── categories.yaml                  # list of categories
├── holidays.yaml                    # public holidays (offices show "Closed today")
├── agencies/<slug>.yaml             # shared by every city
└── cities/<city>/
    ├── city.yaml
    ├── offices/<slug>.yaml
    └── services/<slug>.yaml
```

- **The file name is the slug.** The city comes from the folder.
- **Unknown keys are errors**, so a typo can't silently drop data.
- **`[VERIFY]`** is allowed in any field while drafting (including URLs, numbers, dates). A `published` service fails the build if it, its agency, or its offices contain `[VERIFY]`.
- **Agencies and offices** have no draft status. In production they appear only when they contain no `[VERIFY]`; in dev they always show, with the marks highlighted.

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

| Field                       | Required | Notes                                                                          |
| --------------------------- | -------- | ------------------------------------------------------------------------------ |
| name, province, description | yes      |                                                                                |
| hotlines                    | no       | `{ label, number }` list, shown on the city home                               |
| popular                     | no       | Service slugs for "Most looked up", in order. Drafts are skipped in production |

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

## Service (`cities/<city>/services/<slug>.yaml`)

| Field            | Required | Notes                                                                                                          |
| ---------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| status           | yes      | `draft` (hidden in production) or `published`                                                                  |
| title            | yes      | The task in plain words: "Get a new driver's license"                                                          |
| summary          | yes      | One sentence                                                                                                   |
| category, agency | yes      | Must match existing slugs                                                                                      |
| offices          | no       | Office slugs in the same city                                                                                  |
| whoCanApply      | no       | List                                                                                                           |
| requirements     | yes (≥1) | `{ label, form, copies?, notes?, alternatives? }`. `form`: original · photocopy · original-and-photocopy       |
| steps            | yes (≥1) | `{ title, details?, where?, duration? }`. List order is step order; the last step is drawn as the finish       |
| fees             | no       | `{ label, amount, notes? }`. `amount` in pesos: `585`, `"₱1,234.50"` and similar are read as numbers; 0 = free |
| processingTime   | yes      |                                                                                                                |
| online           | no       | `{ label, url, whatYouCanDo }`                                                                                 |
| tips             | no       | List                                                                                                           |
| faqs             | no       | `{ question, answer }`                                                                                         |
| related          | no       | Service slugs in the same city                                                                                 |
| sources          | yes (≥1) | `{ title, url, accessed }`                                                                                     |
| lastVerified     | yes      | `YYYY-MM-DD`. Re-verify every 6 months                                                                         |
| keywords         | no       | Words people type: everyday names, Filipino/Bikol terms, abbreviations                                         |
