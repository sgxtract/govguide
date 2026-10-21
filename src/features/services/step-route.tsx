import { Clock, Flag, MapPin } from "lucide-react";

import { Icon } from "@/components/ui/icons";
import { VerifyText } from "@/components/ui/verify-text";
import type { Step } from "@/lib/content/schemas";

/**
 * The signature element: steps drawn as a route. A teal line joins yellow
 * "now serving" stops, numbered like a queue ticket. The last step is the
 * finish (a flag): what you leave with. On paper it's a plain numbered list.
 */
export function StepRoute({ steps }: { steps: Step[] }) {
  return (
    <ol role="list" className="pt-1">
      {steps.map((step, index) => {
        const isFinish = steps.length > 1 && index === steps.length - 1;
        return (
          <li
            key={`${index}-${step.title}`}
            className="route-step flex gap-4 pb-6 last:pb-0"
          >
            {/* The <ol> already announces "1 of 5"; the stop is visual. */}
            <span
              aria-hidden="true"
              className={`route-stop relative z-1 grid size-10 shrink-0 place-items-center border-4 border-route ${
                isFinish
                  ? "rounded-control bg-route text-on-route"
                  : "rounded-full bg-signal sign text-xl leading-none text-on-signal"
              }`}
            >
              {isFinish ? <Icon icon={Flag} size={20} /> : index + 1}
            </span>
            <div className="min-w-0 flex-1 pt-1.5">
              <p className="text-lg leading-snug font-bold">
                <VerifyText text={step.title} />
              </p>
              {step.details && (
                <p className="mt-1">
                  <VerifyText text={step.details} />
                </p>
              )}
              {(step.where || step.duration) && (
                <dl className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                  {step.where && (
                    <div className="flex items-center gap-1.5">
                      <Icon icon={MapPin} size={18} className="text-muted" />
                      <dt className="text-muted">Where:</dt>
                      <dd className="font-bold">
                        <VerifyText text={step.where} />
                      </dd>
                    </div>
                  )}
                  {step.duration && (
                    <div className="flex items-center gap-1.5">
                      <Icon icon={Clock} size={18} className="text-muted" />
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
        );
      })}
    </ol>
  );
}
