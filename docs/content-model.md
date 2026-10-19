# Content model

All content lives in `/content` as YAML, validated by `src/lib/content/schemas.ts`.

```
content/
├── categories.yaml                  # list of categories
├── agencies/<slug>.yaml             # shared by every city
└── cities/<city>/
    ├── city.yaml
    ├── offices/<slug>.yaml
    └── services/<slug>.yaml
```

- **The file name is the slug.** The city comes from the folder.
- **Unknown keys are errors**, so a typo can't silently drop data.
- **`[VERIFY]`** is allowed in any field while drafting (including URLs, numbers, dates). A `published` service fails the build if it, its agency, or its offices contain `[VERIFY]`.

## Category (`categories.yaml`)

| Field             | Required | Notes        |
| ----------------- | -------- | ------------ |
| slug              | yes      | Used in URLs |
| name, description | yes      |              |

## City (`cities/<city>/city.yaml`)

| Field                       | Required | Notes                    |
| --------------------------- | -------- | ------------------------ |
| name, province, description | yes      |                          |
| hotlines                    | no       | `{ label, number }` list |

## Agency (`agencies/<slug>.yaml`)

| Field             | Required | Notes                                     |
| ----------------- | -------- | ----------------------------------------- |
| name, description | yes      |                                           |
| acronym           | no       |                                           |
| level             | yes      | national · provincial · city · barangay   |
| website           | no       | URL or `[VERIFY]`                         |
| portals           | no       | `{ label, url }`: official online systems |
| hotline           | no       |                                           |

## Office (`cities/<city>/offices/<slug>.yaml`)

| Field         | Required | Notes                                                  |
| ------------- | -------- | ------------------------------------------------------ |
| agency        | yes      | Must match an agency slug                              |
| name, address | yes      |                                                        |
| mapUrl        | no       |                                                        |
| hours         | no       | `{ days: [mon…sun], opens: "HH:MM", closes: "HH:MM" }` |
| phones, notes | no       | Lists                                                  |
| email         | no       |                                                        |

## Service (`cities/<city>/services/<slug>.yaml`)

| Field            | Required | Notes                                                                                                    |
| ---------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| status           | yes      | `draft` (hidden in production) or `published`                                                            |
| title            | yes      | The task in plain words: "Get a new driver's license"                                                    |
| summary          | yes      | One sentence                                                                                             |
| category, agency | yes      | Must match existing slugs                                                                                |
| offices          | no       | Office slugs in the same city                                                                            |
| whoCanApply      | no       | List                                                                                                     |
| requirements     | yes (≥1) | `{ label, form, copies?, notes?, alternatives? }`. `form`: original · photocopy · original-and-photocopy |
| steps            | yes (≥1) | `{ title, details?, where?, duration? }`. List order is step order                                       |
| fees             | no       | `{ label, amount (PHP number, 0 = free), notes? }`                                                       |
| processingTime   | yes      |                                                                                                          |
| online           | no       | `{ label, url, whatYouCanDo }`                                                                           |
| tips             | no       | List                                                                                                     |
| faqs             | no       | `{ question, answer }`                                                                                   |
| related          | no       | Service slugs in the same city                                                                           |
| sources          | yes (≥1) | `{ title, url, accessed }`                                                                               |
| lastVerified     | yes      | `YYYY-MM-DD`. Re-verify every 6 months                                                                   |
