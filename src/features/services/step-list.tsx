import { VerifyText } from "@/components/ui/verify-text";
import type { Step } from "@/lib/content/schemas";

/**
 * The signature element: numbered steps set like a timetable. A heavy numeral
 * column on the left, the step on the right, where and how long underneath.
 */
export function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol role="list" className="border-t-2 border-ink">
      {steps.map((step, index) => (
        <li
          key={`${index}-${step.title}`}
          className="flex gap-4 border-b border-rule py-4"
        >
          {/* The <ol> already announces "1 of 4"; the big numeral is visual. */}
          <span
            aria-hidden="true"
            className="w-10 shrink-0 text-2xl leading-none font-extrabold tabular-nums"
          >
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold">
              <VerifyText text={step.title} />
            </p>
            {step.details && (
              <p className="mt-1">
                <VerifyText text={step.details} />
              </p>
            )}
            {(step.where || step.duration) && (
              <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                {step.where && (
                  <div className="flex gap-1.5">
                    <dt className="text-muted">Where:</dt>
                    <dd className="font-bold">
                      <VerifyText text={step.where} />
                    </dd>
                  </div>
                )}
                {step.duration && (
                  <div className="flex gap-1.5">
                    <dt className="text-muted">Takes:</dt>
                    <dd className="font-bold">
                      <VerifyText text={step.duration} />
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
