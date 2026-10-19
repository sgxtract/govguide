import { VERIFY } from "./schemas";

/** Re-verify a published guide this often. See docs/content-guide.md. */
export const REVERIFY_AFTER_MONTHS = 6;

/**
 * True when a guide was last verified more than REVERIFY_AFTER_MONTHS ago
 * (or was never verified). `today` is a parameter so tests can fix the date.
 */
export function isDueForReverification(
  lastVerified: string,
  today: Date = new Date(),
): boolean {
  if (lastVerified === VERIFY) return true;
  const due = new Date(`${lastVerified}T00:00:00Z`);
  due.setUTCMonth(due.getUTCMonth() + REVERIFY_AFTER_MONTHS);
  return today >= due;
}
