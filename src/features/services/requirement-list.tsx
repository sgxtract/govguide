import { VerifyText } from "@/components/ui/verify-text";
import type { Requirement } from "@/lib/content/schemas";
import { countLabel } from "@/lib/utils/format";

/** "Original", "2 photocopies", "Original + 1 photocopy". */
function formLabel({ form, copies }: Requirement): string {
  const photocopies = copies
    ? countLabel(copies, "photocopy", "photocopies")
    : "photocopy";
  switch (form) {
    case "original":
      return "Original";
    case "photocopy":
      return copies ? photocopies : "Photocopy";
    case "original-and-photocopy":
      return `Original + ${photocopies}`;
  }
}

/**
 * What to bring, as a ruled checklist. The empty boxes are drawn only for now;
 * Lesson 07 turns them into real tick-boxes saved on the phone.
 */
export function RequirementList({
  requirements,
}: {
  requirements: Requirement[];
}) {
  return (
    <ul role="list" className="border-t-2 border-ink">
      {requirements.map((req) => (
        <li key={req.label} className="flex gap-3 border-b border-rule py-3">
          <span
            aria-hidden="true"
            className="mt-1 size-5 shrink-0 rounded-sm border-2 border-ink"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <p className="font-bold">
                <VerifyText text={req.label} />
              </p>
              <p className="text-sm text-muted">{formLabel(req)}</p>
            </div>
            {req.notes && (
              <p className="mt-1 text-muted">
                <VerifyText text={req.notes} />
              </p>
            )}
            {req.alternatives.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-bold">Any one of:</p>
                <ul role="list" className="mt-1 list-disc pl-5 text-sm">
                  {req.alternatives.map((alt) => (
                    <li key={alt}>
                      <VerifyText text={alt} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
