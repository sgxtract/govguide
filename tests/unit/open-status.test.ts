import { describe, expect, it } from "vitest";

import {
  getOpenStatus,
  hasKnownHours,
  manilaNow,
  type Hours,
} from "@/features/offices/open-status";

const weekdays: Hours[] = [
  {
    days: ["mon", "tue", "wed", "thu", "fri"],
    opens: "08:00",
    closes: "17:00",
  },
];

/** A moment given in Philippine time (UTC+8, no daylight saving). */
const manila = (iso: string) => new Date(`${iso}+08:00`);

// 2026-10-21 is a Wednesday.
describe("manilaNow", () => {
  it("uses Philippine time whatever the phone's timezone", () => {
    // 23:30 UTC on Tuesday is already 07:30 Wednesday in Manila.
    expect(manilaNow(new Date("2026-10-20T23:30:00Z"))).toEqual({
      date: "2026-10-21",
      weekday: "wed",
      minutes: 7 * 60 + 30,
    });
  });
});

describe("getOpenStatus", () => {
  it("is open during office hours", () => {
    expect(getOpenStatus(weekdays, manila("2026-10-21T10:00:00"))).toEqual({
      kind: "open",
      closes: "17:00",
      minutesLeft: 420,
    });
  });

  it("says 'closes soon' in the last hour", () => {
    expect(
      getOpenStatus(weekdays, manila("2026-10-21T16:20:00")),
    ).toMatchObject({ kind: "soon", minutesLeft: 40 });
  });

  it("is closed at closing time, and opens tomorrow", () => {
    expect(getOpenStatus(weekdays, manila("2026-10-21T17:00:00"))).toEqual({
      kind: "closed",
      holiday: undefined,
      next: { day: "thu", opens: "08:00", inDays: 1 },
    });
  });

  it("before opening, opens later today", () => {
    expect(
      getOpenStatus(weekdays, manila("2026-10-21T06:00:00")),
    ).toMatchObject({ kind: "closed", next: { day: "wed", inDays: 0 } });
  });

  it("on Saturday, opens Monday", () => {
    expect(
      getOpenStatus(weekdays, manila("2026-10-24T10:00:00")),
    ).toMatchObject({
      kind: "closed",
      next: { day: "mon", opens: "08:00", inDays: 2 },
    });
  });

  it("handles a lunch break as two ranges", () => {
    const split: Hours[] = [
      { days: ["mon"], opens: "08:00", closes: "12:00" },
      { days: ["mon"], opens: "13:00", closes: "17:00" },
    ];
    // Monday 2026-10-19, 12:30: closed, opens again at 1 PM today.
    expect(getOpenStatus(split, manila("2026-10-19T12:30:00"))).toMatchObject({
      kind: "closed",
      next: { day: "mon", opens: "13:00", inDays: 0 },
    });
  });

  it("is closed on a public holiday, and skips holidays for the next opening", () => {
    const holidays = [
      { date: "2026-10-21", name: "Test Day" },
      { date: "2026-10-22", name: "Test Day 2" },
    ];
    expect(
      getOpenStatus(weekdays, manila("2026-10-21T10:00:00"), holidays),
    ).toEqual({
      kind: "closed",
      holiday: "Test Day",
      next: { day: "fri", opens: "08:00", inDays: 2 },
    });
  });

  it("doesn't guess when hours aren't verified", () => {
    const unverified: Hours[] = [
      { days: ["mon"], opens: "[VERIFY]", closes: "17:00" },
    ];
    expect(hasKnownHours(unverified)).toBe(false);
    expect(hasKnownHours([])).toBe(false);
    expect(getOpenStatus(unverified, new Date())).toEqual({ kind: "unknown" });
  });
});
