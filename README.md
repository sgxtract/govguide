# GovGuide

**Government Guide for the Sorsoganons.** Exactly what you need to get a government service
done: where to go, what to bring, the steps, the fees, how long it takes, and whether the
office is open right now.

An independent community guide, not an official government website.

## Run it

Needs Node 22+ and pnpm.

```bash
pnpm install
pnpm dev          # http://localhost:3000, drafts visible with [VERIFY] highlighted
```

| Command              | What it does                                                     |
| -------------------- | ---------------------------------------------------------------- |
| `pnpm content:todo`  | Lists every `[VERIFY]` value still to fill in, by file and line  |
| `pnpm content:check` | Validates all content and shows each guide's status              |
| `pnpm check`         | Lint, types, formatting, content and unit tests                  |
| `pnpm test:e2e`      | End-to-end tests on a production build of fictional test content |
| `pnpm build`         | Production build (drafts hidden)                                 |

Design reference: open `/styleguide` while `pnpm dev` is running.

## Filling in the guides

All 10 starting guides are drafts with `[VERIFY]` placeholders. Nothing is invented: every
requirement, fee, address, office hour and time must come from an official source. Follow
[docs/content-guide.md](docs/content-guide.md). In short: `pnpm content:todo`, replace each
`[VERIFY]` from the source, set `status: published`, run `pnpm content:check`.

## Contributing

- Spotted outdated info? Use **Something changed or wrong here?** at the bottom of any guide,
  or open an issue with the "Report outdated info" form.
- Code and content changes go through pull requests. Content changes must cite an official
  source.

More in [docs/](docs/README.md).
