import { VerifyText } from "@/components/ui/verify-text";
import type { Fee } from "@/lib/content/schemas";
import { formatPeso } from "@/lib/utils/format";

export function FeeTable({ fees }: { fees: Fee[] }) {
  const amounts = fees.map((f) => f.amount);
  const allKnown = amounts.every((a): a is number => typeof a === "number");
  const total = allKnown ? amounts.reduce((sum, a) => sum + a, 0) : undefined;

  return (
    <table className="w-full border-t-2 border-ink">
      <caption className="sr-only">Fees</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">Item</th>
          <th scope="col">Amount</th>
        </tr>
      </thead>
      <tbody>
        {fees.map((fee) => (
          <tr key={fee.label} className="border-b border-rule">
            <th
              scope="row"
              className="py-3 pr-4 text-left align-top font-normal"
            >
              <VerifyText text={fee.label} />
              {fee.notes && (
                <span className="mt-1 block text-sm text-muted">
                  <VerifyText text={fee.notes} />
                </span>
              )}
            </th>
            <td className="py-3 text-right align-top font-bold whitespace-nowrap tabular-nums">
              {typeof fee.amount === "number" ? (
                formatPeso(fee.amount)
              ) : (
                <VerifyText text={fee.amount} />
              )}
            </td>
          </tr>
        ))}
      </tbody>
      {total !== undefined && fees.length > 1 && (
        <tfoot>
          <tr className="border-b-2 border-ink">
            <th scope="row" className="py-3 pr-4 text-left">
              Total
            </th>
            <td className="py-3 text-right font-extrabold tabular-nums">
              {formatPeso(total)}
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}
