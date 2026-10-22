"use client";

import { useId, useMemo, useSyncExternalStore } from "react";

import { VerifyText } from "@/components/ui/verify-text";
import type { Requirement } from "@/lib/content/schemas";
import { countLabel } from "@/lib/utils/format";

import {
  parseTicked,
  readRaw,
  subscribe,
  writeTicked,
} from "./checklist-store";

/** "Original", "2 photocopies", "Original + 1 photocopy". */
export function formLabel({ form, copies }: Requirement): string {
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

type Props = {
  /** One list of ticks per guide, e.g. "/services/drivers-license-new" (plus "#<city>" for a city-run guide). */
  guide: string;
  requirements: Requirement[];
  /** Id of the section heading, which labels the list. */
  labelledBy: string;
};

/**
 * "What to bring" as a real checklist with a running count. Ticks are kept
 * by requirement label, so if a guide's list changes, old ticks for removed
 * items simply stop matching.
 */
export function RequirementChecklist({
  guide,
  requirements,
  labelledBy,
}: Props) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(guide),
    () => null, // the server (and first paint) shows nothing ticked
  );
  const ticked = useMemo(() => new Set(parseTicked(raw)), [raw]);
  const countId = useId();

  const total = requirements.length;
  const done = requirements.filter((r) => ticked.has(r.label)).length;

  function toggle(label: string, checked: boolean) {
    const next = new Set(ticked);
    if (checked) next.add(label);
    else next.delete(label);
    // Keep only labels that are still on this guide.
    writeTicked(
      guide,
      requirements.map((r) => r.label).filter((l) => next.has(l)),
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 print:hidden">
        <p id={countId} aria-live="polite" className="font-extrabold text-link">
          {done === total && total > 0
            ? `All ${total} ready`
            : `${done} of ${total} ready`}
        </p>
        {done > 0 && (
          <button
            type="button"
            onClick={() => writeTicked(guide, [])}
            className="inline-flex min-h-11 items-center text-sm text-muted underline underline-offset-2 hover:text-ink"
          >
            Clear ticks
          </button>
        )}
      </div>
      <div
        aria-hidden="true"
        className="mt-1 mb-3 h-2.5 overflow-hidden rounded-pill bg-line print:hidden"
      >
        <div
          className="h-full rounded-pill bg-route transition-[width] duration-300 ease-out"
          style={{ width: `${total ? (done / total) * 100 : 0}%` }}
        />
      </div>

      <ul
        role="list"
        aria-labelledby={labelledBy}
        aria-describedby={countId}
        className="rounded-card bg-surface"
      >
        {requirements.map((req) => {
          const isTicked = ticked.has(req.label);
          return (
            <li key={req.label} className="border-b border-line last:border-0">
              {/* The label is the tap target: the whole row. */}
              <label className="flex min-h-16 items-start gap-3 px-4 py-3.5">
                <input
                  type="checkbox"
                  className="tick-box"
                  checked={isTicked}
                  onChange={(e) => toggle(req.label, e.target.checked)}
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={`block leading-snug font-bold ${
                      isTicked ? "text-muted line-through" : ""
                    }`}
                  >
                    <VerifyText text={req.label} />
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">
                    {formLabel(req)}
                  </span>
                  {req.notes && (
                    <span className="mt-1 block text-sm">
                      <VerifyText text={req.notes} />
                    </span>
                  )}
                  {req.alternatives.length > 0 && (
                    <span className="mt-2 block text-sm">
                      <span className="font-bold">Any one of:</span>
                      <span className="mt-1 block">
                        {req.alternatives.map((alt) => (
                          <span key={alt} className="block pl-3">
                            <span aria-hidden="true">· </span>
                            <VerifyText text={alt} />
                          </span>
                        ))}
                      </span>
                    </span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-sm text-muted print:hidden">
        Your ticks are saved on this phone only.
      </p>
    </div>
  );
}
