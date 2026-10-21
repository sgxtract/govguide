import "server-only";

import { Mail, Pencil } from "lucide-react";

import { buttonClass } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { feedbackEmail, siteConfig } from "@/config/site";
import { absoluteUrl } from "@/config/site-url";

import {
  emailOutdatedInfoUrl,
  emailSuggestServiceUrl,
  githubOutdatedInfoUrl,
  githubSuggestServiceUrl,
} from "./report-links";

function Actions({ email, github }: { email?: string; github: string }) {
  return (
    <div className="mt-3 flex flex-wrap gap-3">
      {email && (
        <a href={email} className={buttonClass("primary")}>
          <Icon icon={Mail} />
          Email GovGuide
        </a>
      )}
      {/* Without an email inbox, GitHub is the main way to report. */}
      <a href={github} className={buttonClass(email ? "secondary" : "primary")}>
        <Icon icon={Pencil} />
        Report on GitHub
      </a>
    </div>
  );
}

/** "Something changed?" with pre-filled report links for one page. */
export function ReportOutdated({
  subject,
  path,
}: {
  subject: string;
  path: string;
}) {
  const report = { subject, pageUrl: absoluteUrl(path) };
  return (
    <div className="print:hidden">
      <p className="font-bold">Something changed or wrong here?</p>
      <p className="mt-1 text-muted">
        Tell us what you saw. We check every report against an official source
        before changing a guide.
      </p>
      <Actions
        email={
          feedbackEmail
            ? emailOutdatedInfoUrl(feedbackEmail, report)
            : undefined
        }
        github={githubOutdatedInfoUrl(siteConfig.repoUrl, report)}
      />
    </div>
  );
}

/** Pre-filled links to suggest a service that has no guide yet. */
export function SuggestService({ city }: { city?: string }) {
  return (
    <Actions
      email={
        feedbackEmail ? emailSuggestServiceUrl(feedbackEmail, city) : undefined
      }
      github={githubSuggestServiceUrl(siteConfig.repoUrl, city)}
    />
  );
}
