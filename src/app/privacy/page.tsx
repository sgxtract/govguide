import type { Metadata } from "next";

import { StandalonePage } from "@/components/layout/standalone-page";
import { pageMetadata } from "@/features/seo/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description:
    "GovGuide has no accounts and collects no personal information. Your checklist stays on your phone.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <StandalonePage
      title="Privacy"
      subtitle="Short version: we don't collect your data"
    >
      <p className="text-lg">
        You don&apos;t need an account to use GovGuide, and we don&apos;t ask
        for your name, number or any personal details.
      </p>

      <h2>What stays on your phone</h2>
      <ul role="list" className="list-disc space-y-1 pl-5">
        <li>The items you tick on a &ldquo;What to bring&rdquo; checklist.</li>
        <li>Whether you chose the light or dark look.</li>
        <li>The city you picked, so guides show its offices next time.</li>
      </ul>
      <p>
        These are saved in your browser&apos;s own storage. They are never sent
        to us or anyone else. Clearing your browser data removes them.
      </p>

      <h2>Reports and suggestions</h2>
      <p>
        If you report outdated info on GitHub, your report is public. If you
        email us, we use your message only to check and fix the guide. Please
        don&apos;t include ID numbers or photos of your documents.
      </p>

      <h2>Technical logs</h2>
      <p>
        Like any website, our hosting provider may keep standard technical logs,
        such as IP addresses, to keep the site running and secure. We don&apos;t
        use them to identify visitors.
      </p>

      <h2>Visitor counts</h2>
      <p>
        GovGuide doesn&apos;t use cookies or advertising. To learn which guides
        people need, we count visits with Vercel Web Analytics. For each page
        you open, it records the page (without what you typed in search), the
        site that sent you, your country or region, and your type of device and
        browser.
      </p>
      <p>
        It doesn&apos;t store your name or IP address, and it can&apos;t follow
        you to other websites. Visits on the same day are grouped by a temporary
        code that is deleted after 24 hours. We only see totals, like &ldquo;300
        visits to the passport guide this week&rdquo;.
      </p>

      <h2>Your rights</h2>
      <p>
        We follow the Data Privacy Act of 2012 (Republic Act No. 10173). To ask
        about any data you sent us, use the contact on the &ldquo;Help keep this
        accurate&rdquo; page.
      </p>
    </StandalonePage>
  );
}
