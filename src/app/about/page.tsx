import type { Metadata } from "next";

import { StandalonePage } from "@/components/layout/standalone-page";
import { Link } from "@/components/ui/link";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/features/seo/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "About GovGuide",
  description:
    "GovGuide is an independent, open-source guide to getting government services done in Sorsogon.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <StandalonePage
      title="About GovGuide"
      subtitle="Government errands, done in one trip"
    >
      <p className="text-lg">
        GovGuide tells you exactly what you need to get a government service
        done in Sorsogon: where to go, what to bring, the steps, how much it
        costs, and how long it takes.
      </p>

      <h2>An independent guide</h2>
      <p>
        GovGuide is a community project. It is <strong>not</strong> an official
        website of any government agency or local government unit, and it
        doesn&apos;t use official seals or logos. We can&apos;t process
        applications, take payments or book appointments. For those, each guide
        links to the agency&apos;s own official website.
      </p>

      <h2>How guides are made</h2>
      <ul role="list" className="list-disc space-y-1 pl-5">
        <li>
          Every fact comes from an official source, such as the agency&apos;s
          Citizen&apos;s Charter or website, and the guide links to it.
        </li>
        <li>
          Every guide shows the date it was last checked, and is checked again
          at least every six months.
        </li>
        <li>Nothing is published until every value has been confirmed.</li>
      </ul>

      <h2>Spotted something wrong?</h2>
      <p>
        Offices change their requirements and fees.{" "}
        <Link href="/contribute">Tell us what changed</Link> and we&apos;ll
        check it.
      </p>

      <h2>Open source</h2>
      <p>
        The code and every guide are public.{" "}
        <a href={siteConfig.repoUrl}>See the project on GitHub</a>.
      </p>
    </StandalonePage>
  );
}
