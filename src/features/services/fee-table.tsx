import { VerifyText } from "@/components/ui/verify-text";
import type { Fee } from "@/lib/content/schemas";
import { formatPeso } from "@/lib/utils/format";

/** Sum of the fees, or undefined while any amount is still [VERIFY]. */
export function totalFee(fees: Fee[]): number | undefined {
  const amounts = fees.map((f) => f.amount);
  return amounts.every((a): a is number => typeof a === "number")
    ? amounts.reduce((sum, a) => sum + a, 0)
    : undefined;
}

export function FeeTable({ fees }: { fees: Fee[] }) {
  const total = totalFee(fees);

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
          {fees.map((fee) => (
            <tr key={fee.label} className="border-b border-line last:border-0">
              <th
                scope="row"
                className="px-4 py-3 text-left align-top font-normal"
              >
                <VerifyText text={fee.label} />
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
        {fees.length > 1 && (
          <tfoot>
            <tr className="border-t-2 border-ink">
              <th scope="row" className="px-4 py-3 text-left font-extrabold">
                Total
              </th>
              <td className="px-4 py-3 text-right font-extrabold tabular-nums">
                {total !== undefined ? (
                  formatPeso(total)
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
