import { parse } from "yaml";
import { z } from "zod";
import { describe, expect, it } from "vitest";

import { feeSchema } from "@/lib/content/schemas";

/** Parses one fee written the way an editor would type it in YAML. */
function amountOf(yamlValue: string) {
  const result = feeSchema.safeParse(
    parse(`label: License fee\namount: ${yamlValue}`),
  );
  return result.success
    ? { ok: true as const, amount: result.data.amount }
    : { ok: false as const, message: z.prettifyError(result.error) };
}

describe("fee amounts", () => {
  it.each([
    ["585", 585],
    ['"585"', 585], // typed inside the quotes that held [VERIFY]
    ["585.00", 585],
    ["67.63", 67.63],
    ['"₱585.00"', 585],
    ["₱585.00", 585],
    ['"PHP 1,234.50"', 1234.5],
    ["P67.63", 67.63],
    ["1,234.50", 1234.5],
    ["0", 0],
  ])("accepts %s as %d pesos", (input, expected) => {
    expect(amountOf(input)).toEqual({ ok: true, amount: expected });
  });

  it("keeps [VERIFY] as a placeholder", () => {
    expect(amountOf('"[VERIFY]"')).toEqual({ ok: true, amount: "[VERIFY]" });
  });

  it.each(['"585 [VERIFY]"', '"about 500"', "-5", '"585.999"'])(
    "rejects %s with a message that says what to write",
    (input) => {
      const result = amountOf(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain("write the amount in pesos");
      }
    },
  );
});
