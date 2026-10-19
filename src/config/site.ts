export const siteConfig = {
  name: "GovGuide",
  description:
    "An independent guide to getting government services done in Sorsogon: where to go, what to bring, the steps, fees, and processing time.",
  repoUrl: "https://github.com/sgxtract/govguide",
} as const;

/** Where people suggest a new guide or report outdated info (Lesson 11 adds proper forms). */
export const newIssueUrl = `${siteConfig.repoUrl}/issues/new`;
