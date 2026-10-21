import type { Metadata } from "next";

import { StandalonePage } from "@/components/layout/standalone-page";
import { Link } from "@/components/ui/link";
import { pageMetadata } from "@/features/seo/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Disclaimer",
  description:
    "GovGuide is an independent guide, not an official government website. Confirm with the office before you go.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <StandalonePage title="Disclaimer">
      <p className="text-lg">
        GovGuide is an independent guide. It is not an official website of the
        Philippine government, any agency, or any local government unit.
      </p>

      <h2>Information can change</h2>
      <p>
        We check every guide against official sources and show the date it was
        last checked. Agencies can still change requirements, fees, steps and
        office hours at any time. The agency&apos;s own rules and the notices
        posted at its office always come first.
      </p>
      <p>
        <strong>Confirm with the office before you go</strong>, especially for
        fees and cut-off times.
      </p>

      <h2>Office hours and &ldquo;Open now&rdquo;</h2>
      <p>
        Open or closed is worked out from the office&apos;s posted hours, in
        Philippine time. It can&apos;t know about sudden closures, suspended
        work days, or holidays we haven&apos;t listed.
      </p>

      <h2>We don&apos;t handle your application</h2>
      <p>
        GovGuide never asks for your personal details, documents or money. Pay
        fees only to the agency&apos;s cashier or its official payment channels.
      </p>

      <h2>Links to other websites</h2>
      <p>
        Guides link to official agency websites. We don&apos;t control those
        sites and aren&apos;t responsible for their content.
      </p>

      <p>
        Found something wrong? <Link href="/contribute">Tell us</Link>.
      </p>
    </StandalonePage>
  );
}
