import { describe, expect, it } from "vitest";

import {
  countLabel,
  formatDate,
  formatDays,
  formatPeso,
  formatTime,
} from "@/lib/utils/format";

describe("formatPeso", () => {
  it("formats pesos with centavos", () => {
    expect(formatPeso(585)).toBe("₱585.00");
    expect(formatPeso(1234.5)).toBe("₱1,234.50");
  });

  it("calls zero Free", () => {
    expect(formatPeso(0)).toBe("Free");
  });
});

describe("formatDate", () => {
  it("formats an ISO date without shifting the day", () => {
    expect(formatDate("2026-10-19")).toBe("October 19, 2026");
    expect(formatDate("2026-01-01")).toBe("January 1, 2026");
  });
});

describe("formatTime", () => {
  it("turns 24-hour times into 12-hour times", () => {
    expect(formatTime("08:00")).toBe("8:00 AM");
    expect(formatTime("17:30")).toBe("5:30 PM");
    expect(formatTime("12:00")).toBe("12:00 PM");
  });
});

describe("formatDays", () => {
  it("shortens a run of three or more days", () => {
    expect(formatDays(["mon", "tue", "wed", "thu", "fri"])).toBe(
      "Monday to Friday",
    );
  });

  it("lists separate days, in week order", () => {
    expect(formatDays(["wed", "mon"])).toBe("Monday, Wednesday");
    expect(formatDays(["sat", "sun"])).toBe("Saturday, Sunday");
  });

  it("returns an empty string for no days", () => {
    expect(formatDays([])).toBe("");
  });
});

describe("countLabel", () => {
  it("picks singular or plural", () => {
    expect(countLabel(1, "guide")).toBe("1 guide");
    expect(countLabel(3, "guide")).toBe("3 guides");
    expect(countLabel(2, "photocopy", "photocopies")).toBe("2 photocopies");
  });
});

describe("formatDuration", () => {
  it("says hours and minutes in words", async () => {
    const { formatDuration } = await import("@/lib/utils/format");
    expect(formatDuration(40)).toBe("40 minutes");
    expect(formatDuration(60)).toBe("1 hour");
    expect(formatDuration(75)).toBe("1 hour 15 minutes");
    expect(formatDuration(1)).toBe("1 minute");
  });
});
