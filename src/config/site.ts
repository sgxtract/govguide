export const siteConfig = {
  name: "GovGuide",
  description:
    "An independent guide to getting government services done in Sorsogon: where to go, what to bring, the steps, fees, and processing time.",
  // Where "Report on GitHub" links point. Change if the repository moves.
  repoUrl: "https://github.com/sgxtract/govguide",
} as const;

/**
 * Inbox for reports from people without a GitHub account. Set to null to
 * offer GitHub only.
 */
export const feedbackEmail: string | null = "njasystems@gmail.com";
