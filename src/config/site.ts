export const siteConfig = {
  name: "GovGuide",
  description:
    "An independent guide to getting government services done in Sorsogon: where to go, what to bring, the steps, fees, and processing time.",
  repoUrl: "https://github.com/sgxtract/govguide",
} as const;

/** Where people suggest a new guide or report outdated info (Lesson 11 adds proper forms). */
export const newIssueUrl = `${siteConfig.repoUrl}/issues/new`;

/** Pre-filled "report outdated info" issue for one page. */
export function reportIssueUrl(subject: string, path: string): string {
  const params = new URLSearchParams({
    title: `Outdated info: ${subject}`,
    body: `Page: ${path}\n\nWhat is wrong or has changed:\n\nOfficial source (link or photo of the posted notice):\n`,
  });
  return `${newIssueUrl}?${params.toString()}`;
}
