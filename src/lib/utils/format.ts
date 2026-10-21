/**
 * Display formatting in one place, so every page shows money, dates and
 * times the same way. English (Philippines) for now; i18n swaps the locale.
 */
const LOCALE = "en-PH";

/** "1 guide", "3 guides". */
export function countLabel(
  count: number,
  singular: string,
  plural = `${singular}s`,
) {
  return `${count} ${count === 1 ? singular : plural}`;
}

const peso = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "PHP",
});

/** 585 → "₱585.00", 0 → "Free". */
export function formatPeso(amount: number): string {
  return amount === 0 ? "Free" : peso.format(amount);
}

const longDate = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "long",
  timeZone: "UTC",
});

/** "2026-10-19" → "October 19, 2026". */
export function formatDate(isoDate: string): string {
  return longDate.format(new Date(`${isoDate}T00:00:00Z`));
}

const clock = new Intl.DateTimeFormat(LOCALE, {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

/** "08:00" → "8:00 AM", "17:30" → "5:30 PM". */
export function formatTime(hhmm: string): string {
  return clock.format(new Date(`1970-01-01T${hhmm}:00Z`));
}

const WEEK = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
type Weekday = (typeof WEEK)[number];

const DAY_NAMES: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/** [mon…fri] → "Monday to Friday"; [mon, wed] → "Monday, Wednesday". */
export function formatDays(days: readonly Weekday[]): string {
  const sorted = WEEK.filter((d) => days.includes(d));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return "";

  const consecutive =
    WEEK.indexOf(last) - WEEK.indexOf(first) === sorted.length - 1;
  if (consecutive && sorted.length >= 3) {
    return `${DAY_NAMES[first]} to ${DAY_NAMES[last]}`;
  }
  return sorted.map((d) => DAY_NAMES[d]).join(", ");
}

/** "mon" → "Monday". */
export function dayName(day: Weekday): string {
  return DAY_NAMES[day];
}

/** 40 → "40 minutes", 60 → "1 hour", 75 → "1 hour 15 minutes". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hours = h > 0 ? countLabel(h, "hour") : "";
  const mins = m > 0 ? countLabel(m, "minute") : "";
  return [hours, mins].filter(Boolean).join(" ") || "0 minutes";
}
