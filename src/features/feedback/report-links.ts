/**
 * Links that open a report already filled in: a GitHub issue form, or an
 * email in the visitor's mail app. Pure functions (no server-only imports),
 * so they can be unit tested; callers pass the full page URL.
 */

type Report = {
  /** What the report is about, e.g. "Get a new driver's license". */
  subject: string;
  /** Full URL of the page, e.g. "https://…/sorsogon/services/…". */
  pageUrl: string;
};

/** Encodes for URLs with %20 for spaces. (URLSearchParams uses "+", which
 *  many phone mail apps show literally.) */
function query(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
}

/** Line breaks in email bodies must be CRLF (RFC 6068). */
const lines = (...parts: string[]) => parts.join("\r\n");

// ── GitHub issue forms (.github/ISSUE_TEMPLATE/*.yml) ─────────────────────
// Field ids in the query string pre-fill the matching form fields.

export function githubOutdatedInfoUrl(repoUrl: string, report: Report) {
  return `${repoUrl}/issues/new?${query({
    template: "outdated-info.yml",
    title: `Outdated info: ${report.subject}`,
    page: report.pageUrl,
  })}`;
}

export function githubSuggestServiceUrl(repoUrl: string, city?: string) {
  return `${repoUrl}/issues/new?${query({
    template: "suggest-service.yml",
    ...(city && { city }),
  })}`;
}

// ── Email (for people without a GitHub account) ──────────────────────────

export function emailOutdatedInfoUrl(email: string, report: Report) {
  return `mailto:${email}?${query({
    subject: `Outdated info: ${report.subject}`,
    body: lines(
      `Page: ${report.pageUrl}`,
      "",
      "What is wrong or has changed?",
      "",
      "",
      "How do you know? (posted notice at the office, official website, office staff, your own visit)",
      "",
      "",
      "Please don't send ID numbers or photos of your personal documents.",
    ),
  })}`;
}

export function emailSuggestServiceUrl(email: string, city?: string) {
  return `mailto:${email}?${query({
    subject: "Suggest a service",
    body: lines(
      "Which government service should GovGuide explain?",
      "",
      "",
      `Which city or town? ${city ?? ""}`,
      "",
      "What was hard or confusing about it?",
      "",
      "",
      "Please don't send ID numbers or photos of your personal documents.",
    ),
  })}`;
}
