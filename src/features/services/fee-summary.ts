import type { Fee } from "@/lib/content/schemas";

/**
 * What to say about a guide's fees in one line. Fees with a `when` only
 * apply in some cases (a vehicle type, expedited processing), so they're
 * never added to the total: the total is what everyone pays.
 */
export type FeeSummary =
  | { kind: "none" } // no fees listed
  | { kind: "verify" } // an always-paid fee is still [VERIFY]
  | { kind: "varies" } // every fee depends on the case
  | { kind: "total"; amount: number; from: boolean }; // from: more may apply

export function feeSummary(fees: Fee[]): FeeSummary {
  if (fees.length === 0) return { kind: "none" };
  const always = fees.filter((f) => !f.when);
  if (always.length === 0) return { kind: "varies" };

  let amount = 0;
  for (const fee of always) {
    if (typeof fee.amount !== "number") return { kind: "verify" };
    amount += fee.amount;
  }
  return { kind: "total", amount, from: always.length < fees.length };
}
