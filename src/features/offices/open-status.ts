import { VERIFY } from "@/lib/content/verify";

/**
 * Is an office open right now? Pure functions with no Zod or server imports,
 * so the browser can run them (pages are static; "now" is only known there).
 * Always uses Philippine time, whatever timezone the phone is set to.
 */

export const WEEK = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Weekday = (typeof WEEK)[number];

export type Hours = { days: readonly Weekday[]; opens: string; closes: string };
export type HolidayDate = { date: string; name: string };

/** Within this many minutes of closing, "Open now" becomes "Closes soon". */
export const CLOSING_SOON_MINUTES = 60;

export type NextOpening = {
  day: Weekday;
  opens: string; // "08:00"
  /** 0 = later today, 1 = tomorrow, 2+ = that many days away. */
  inDays: number;
};

export type OpenStatus =
  | { kind: "unknown" } // hours missing or not verified yet
  | { kind: "open"; closes: string; minutesLeft: number }
  | { kind: "soon"; closes: string; minutesLeft: number }
  | { kind: "closed"; holiday?: string; next?: NextOpening };

const manilaParts = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const WEEKDAY_BY_SHORT: Record<string, Weekday> = {
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
  Sun: "sun",
};

/** The date, weekday and minute of the day in the Philippines. */
export function manilaNow(now: Date): {
  date: string;
  weekday: Weekday;
  minutes: number;
} {
  const parts = Object.fromEntries(
    manilaParts.formatToParts(now).map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: WEEKDAY_BY_SHORT[parts.weekday ?? ""] ?? "mon",
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

const toMinutes = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

function addDays(isoDate: string, days: number): string {
  const [y = 0, m = 1, d = 1] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** True when every opening time is a real "HH:MM" (no [VERIFY] left). */
export function hasKnownHours(hours: readonly Hours[]): boolean {
  return (
    hours.length > 0 &&
    hours.every((h) => h.opens !== VERIFY && h.closes !== VERIFY)
  );
}

export function getOpenStatus(
  hours: readonly Hours[],
  now: Date,
  holidays: readonly HolidayDate[] = [],
): OpenStatus {
  if (!hasKnownHours(hours)) return { kind: "unknown" };

  const today = manilaNow(now);
  const holidayOn = (date: string) =>
    holidays.find((h) => h.date === date)?.name;
  const rangesOn = (day: Weekday) =>
    hours
      .filter((h) => h.days.includes(day))
      .map((h) => ({ opens: h.opens, closes: h.closes }))
      .sort((a, b) => toMinutes(a.opens) - toMinutes(b.opens));

  const todayHoliday = holidayOn(today.date);

  if (!todayHoliday) {
    for (const range of rangesOn(today.weekday)) {
      const opens = toMinutes(range.opens);
      const closes = toMinutes(range.closes);
      if (today.minutes >= opens && today.minutes < closes) {
        const minutesLeft = closes - today.minutes;
        return {
          kind: minutesLeft <= CLOSING_SOON_MINUTES ? "soon" : "open",
          closes: range.closes,
          minutesLeft,
        };
      }
    }
  }

  return { kind: "closed", holiday: todayHoliday, next: nextOpening() };

  function nextOpening(): NextOpening | undefined {
    const startIndex = WEEK.indexOf(today.weekday);
    for (let inDays = 0; inDays <= 7; inDays++) {
      if (holidayOn(addDays(today.date, inDays))) continue;
      const day = WEEK[(startIndex + inDays) % 7] ?? "mon";
      const later = rangesOn(day).find(
        (r) => inDays > 0 || toMinutes(r.opens) > today.minutes,
      );
      if (later) return { day, opens: later.opens, inDays };
    }
    return undefined;
  }
}
