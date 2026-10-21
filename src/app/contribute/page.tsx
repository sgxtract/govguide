import type { Metadata } from "next";

import { StandalonePage } from "@/components/layout/standalone-page";
import { Notice } from "@/components/ui/notice";
import { feedbackEmail, siteConfig } from "@/config/site";
import { SuggestService } from "@/features/feedback/report-actions";
import { pageMetadata } from "@/features/seo/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Help keep GovGuide accurate",
  description:
    "Report outdated requirements, fees or office hours, or suggest a government service for GovGuide to explain.",
  path: "/contribute",
});

export default function ContributePage() {
  return (
    <StandalonePage
      title="Help keep GovGuide accurate"
      subtitle="Save the next person a wasted trip"
    >
      <p className="text-lg">
        Requirements, fees and office hours change. If you went to an office and
        something was different from the guide, tell us.
      </p>

      <h2>Report outdated info</h2>
      <p>
        Open the guide or office page and use{" "}
        <strong>Something changed or wrong here?</strong> at the bottom. The
        report then already says which page it&apos;s about. Tell us:
      </p>
      <ul role="list" className="list-disc space-y-1 pl-5">
        <li>
          What is different: a new fee, a moved office, an extra requirement.
        </li>
        <li>
          How you know: a posted notice at the office, the agency&apos;s
          website, or what the staff told you. A photo of a{" "}
          <strong>posted notice</strong> helps a lot.
        </li>
      </ul>

      <h2>Suggest a service</h2>
      <p>
        Which errand was hard to figure out? Tell us the service and the city or
        town.
      </p>
      <SuggestService />

      <div className="pt-6">
        <Notice kind="warning" title="Don't send personal information">
          <p>
            Never include ID numbers, photos of your own documents, or your
            address. We don&apos;t need them to fix a guide. Reports on GitHub
            are public; anyone can read them.
          </p>
        </Notice>
      </div>

      <h2>What happens next</h2>
      <p>
        We check each report against an official source: the office&apos;s
        Citizen&apos;s Charter, the agency&apos;s website, or the posted notice.
        When it&apos;s confirmed, we update the guide and its
        &ldquo;Checked&rdquo; date. Reports without a source may take longer,
        because we have to confirm them first.
      </p>
      {!feedbackEmail && (
        <p className="text-muted">
          Right now, reports go through GitHub, which needs a free account.
        </p>
      )}

      <h2>For developers and editors</h2>
      <p>
        GovGuide is open source. Guides are plain files, and every change is
        reviewed. <a href={siteConfig.repoUrl}>See the project on GitHub</a>.
      </p>
    </StandalonePage>
  );
}
