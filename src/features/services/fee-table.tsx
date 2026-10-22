import { VerifyText } from "@/components/ui/verify-text";
import type { Fee } from "@/lib/content/schemas";
import { formatPeso } from "@/lib/utils/format";

import { feeSummary } from "./fee-summary";

export function FeeTable({ fees }: { fees: Fee[] }) {
  const summary = feeSummary(fees);

  return (
    <div className="overflow-hidden rounded-card bg-surface">
      <table className="w-full">
        <caption className="sr-only">Fees</caption>
        <thead>
          <tr className="border-b border-line text-left text-sm text-muted">
            <th scope="col" className="px-4 py-2.5 font-bold">
              What
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-bold">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {fees.map((fee, i) => (
            // Labels repeat when only the condition differs ("Registration fee").
            <tr
              key={`${fee.label}-${fee.when ?? ""}-${i}`}
              className="border-b border-line last:border-0"
            >
              <th
                scope="row"
                className="px-4 py-3 text-left align-top font-normal"
              >
                <VerifyText text={fee.label} />
                {fee.when && (
                  <span className="mt-1 block text-sm font-bold">
                    <VerifyText text={fee.when} />
                  </span>
                )}
                {fee.notes && (
                  <span className="mt-1 block text-sm text-muted">
                    <VerifyText text={fee.notes} />
                  </span>
                )}
              </th>
              <td className="px-4 py-3 text-right align-top font-bold whitespace-nowrap tabular-nums">
                {typeof fee.amount === "number" ? (
                  formatPeso(fee.amount)
                ) : (
                  <VerifyText text={fee.amount} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
        {/* No total when every fee depends on the case: it would add up
            options that never all apply. */}
        {fees.length > 1 &&
          (summary.kind === "total" || summary.kind === "verify") && (
            <tfoot>
              <tr className="border-t-2 border-ink">
                <th scope="row" className="px-4 py-3 text-left font-extrabold">
                  {summary.kind === "total" && summary.from
                    ? "Always paid"
                    : "Total"}
                </th>
                <td className="px-4 py-3 text-right font-extrabold tabular-nums">
                  {summary.kind === "total" ? (
                    formatPeso(summary.amount)
                  ) : (
                    <VerifyText text="[VERIFY]" />
                  )}
                </td>
              </tr>
            </tfoot>
          )}
      </table>
    </div>
  );
}
