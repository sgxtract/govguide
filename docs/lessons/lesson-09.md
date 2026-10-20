# Lesson 09 — Accessibility & performance pass

**Found and fixed:** viewport prefetching (→ prefetch on intent, ADR 0008); header and label/value rows overflowing at 200% text; headings splitting mid-word; Chrome/Android ignoring the phone's text size (→ text-scale meta); Search button invisible in high-contrast mode.

**Measured, kept as is:** variable font (34 KB, smaller than 3 static weights); linked stylesheet (inlining showed no gain); framework JS (~117 KB, accepted with a budget).

**Remember:** use `@/components/ui/link`, not `next/link`. Run the checklist in `docs/quality.md` before merging UI changes.