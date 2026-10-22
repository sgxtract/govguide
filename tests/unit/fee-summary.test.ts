import { describe, expect, it } from "vitest";

import { feeSummary } from "@/features/services/fee-summary";
import { feeSchema, type Fee } from "@/lib/content/schemas";

const fee = (amount: Fee["amount"], when?: string): Fee => ({
  label: "Fee",
  amount,
  ...(when && { when }),
});

describe("feeSummary", () => {
  it("says nothing is listed when there are no fees", () => {
    expect(feeSummary([])).toEqual({ kind: "none" });
  });

  it("adds up fees that always apply", () => {
    expect(feeSummary([fee(130), fee(30)])).toEqual({
      kind: "total",
      amount: 160,
      from: false,
    });
  });

  it("leaves fees that only apply sometimes out of the total", () => {
    expect(feeSummary([fee(950), fee(250, "Expedited processing")])).toEqual({
      kind: "total",
      amount: 950,
      from: true,
    });
  });

  it("says the fee varies when no fee always applies", () => {
    expect(
      feeSummary([fee(240, "Motorcycle"), fee(1600, "Private car")]),
    ).toEqual({ kind: "varies" });
  });

  it("can't total an always-paid fee that isn't verified", () => {
    expect(feeSummary([fee(30), fee("[VERIFY]")])).toEqual({
      kind: "verify",
    });
  });

  it("still totals when only a conditional fee is unverified", () => {
    expect(feeSummary([fee(30), fee("[VERIFY]", "Late filing")])).toEqual({
      kind: "total",
      amount: 30,
      from: true,
    });
  });
});

describe("fee schema", () => {
  it("accepts when a fee applies", () => {
    const result = feeSchema.safeParse({
      label: "Inspection",
      amount: 50,
      when: "Only if the LTO inspects your vehicle",
    });
    expect(result.success && result.data.when).toBe(
      "Only if the LTO inspects your vehicle",
    );
  });
});
