import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/site-header";
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
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1">
        <div className="mx-auto max-w-page px-4 py-10">
          <div className="max-w-prose">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Help keep GovGuide accurate
            </h1>
            <p className="mt-3 text-lg">
              Requirements, fees and office hours change. If you went to an
              office and something was different from the guide, you can save
              the next person a wasted trip.
            </p>

            <section aria-labelledby="outdated-heading" className="mt-10">
              <h2 id="outdated-heading" className="text-xl font-bold">
                Report outdated info
              </h2>
              <p className="mt-2">
                Open the guide or office page and use{" "}
                <strong>Something changed or wrong here?</strong> at the bottom.
                The report then already says which page it&apos;s about.
              </p>
              <p className="mt-2">Tell us:</p>
              <ul role="list" className="mt-1 list-disc space-y-1 pl-5">
                <li>
                  What is different (a new fee, a moved office, an extra
                  requirement).
                </li>
                <li>
                  How you know: a posted notice at the office, the agency&apos;s
                  website, or what the staff told you. A photo of a{" "}
                  <strong>posted notice</strong> helps a lot.
                </li>
              </ul>
            </section>

            <section aria-labelledby="suggest-heading" className="mt-10">
              <h2 id="suggest-heading" className="text-xl font-bold">
                Suggest a service
              </h2>
              <p className="mt-2">
                Which errand was hard to figure out? Tell us the service and the
                city or town.
              </p>
              <SuggestService />
            </section>

            <section
              aria-labelledby="privacy-heading"
              className="mt-10 rounded-md border-l-6 border-ink bg-notice px-4 py-4"
            >
              <h2 id="privacy-heading" className="text-lg font-bold">
                Don&apos;t send personal information
              </h2>
              <p className="mt-2">
                Never include ID numbers, photos of your own documents, or your
                address. We don&apos;t need them to fix a guide. Reports on
                GitHub are public; anyone can read them.
              </p>
            </section>

            <section aria-labelledby="next-heading" className="mt-10">
              <h2 id="next-heading" className="text-xl font-bold">
                What happens next
              </h2>
              <p className="mt-2">
                We check each report against an official source (the
                office&apos;s Citizen&apos;s Charter, the agency&apos;s website,
                or the posted notice). When it&apos;s confirmed, we update the
                guide and its &ldquo;Last checked&rdquo; date. Reports without a
                source may take longer, because we have to confirm them first.
              </p>
              {!feedbackEmail && (
                <p className="mt-2 text-muted">
                  Right now, reports go through GitHub, which needs a free
                  account.
                </p>
              )}
            </section>

            <section aria-labelledby="dev-heading" className="mt-10">
              <h2 id="dev-heading" className="text-xl font-bold">
                For developers and editors
              </h2>
              <p className="mt-2">
                GovGuide is open source. Guides are plain files, and every
                change is reviewed.{" "}
                <a href={siteConfig.repoUrl}>See the project on GitHub</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
