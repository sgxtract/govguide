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
 * What to bring, as a real checklist. Ticking works with plain HTML;
 * ChecklistMemory (client) remembers the ticks on this phone.
 */
export function RequirementList({
  requirements,
}: {
  requirements: Requirement[];
}) {
  return (
    <ul role="list" className="border-t-2 border-ink">
      {requirements.map((req) => (
        <li key={req.label} className="border-b border-rule py-2">
          {/* The label is the tap target: the whole row, at least 44px tall. */}
          <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1">
            <input
              type="checkbox"
              className="peer tick-box mt-1 text-ink"
              data-requirement={req.label}
            />
            {/* Ticked items fade and strike through, like crossing off a list. */}
            <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4 peer-checked:text-muted peer-checked:line-through">
              <span className="font-bold">
                <VerifyText text={req.label} />
              </span>
              <span className="text-sm text-muted">{formLabel(req)}</span>
            </span>
          </label>
          {(req.notes || req.alternatives.length > 0) && (
            // Indented to line up with the label text, past the box.
            <div className="pb-2 pl-9">
              {req.notes && (
                <p className="text-muted">
                  <VerifyText text={req.notes} />
                </p>
              )}
              {req.alternatives.length > 0 && (
                <div className="mt-1">
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
          )}
        </li>
      ))}
    </ul>
  );
}
