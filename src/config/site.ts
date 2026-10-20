export const siteConfig = {
  name: "GovGuide",
  description:
    "An independent guide to getting government services done in Sorsogon: where to go, what to bring, the steps, fees, and processing time.",
  repoUrl: "https://github.com/sgxtract/govguide",
} as const;

/**
 * Inbox for reports from people without a GitHub account. Set this once the
 * dedicated GovGuide address exists; until then only GitHub is offered.
 */
export const feedbackEmail: string | null = null;
