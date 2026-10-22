import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { SearchBox } from "@/features/search/search-box";
import { SearchForm } from "@/features/search/search-form";
import { getAgencyNames } from "@/features/services/agency-names";
import { GuideRows } from "@/features/services/guide-rows";
import { listServices } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Search guides",
  robots: { index: false }, // result pages don't belong in search engines
};

export default async function SearchPage() {
  const [services, agencyNames] = await Promise.all([
    listServices(),
    getAgencyNames(),
  ]);

  return (
    <>
      <PageHeader
        title="Search"
        subtitle="Guides and offices"
        back={{ href: "/", label: "Home" }}
      />

      <div className="mx-auto max-w-page px-4 pt-6">
        <div className="max-w-3xl">
          {/* The page stays static: ?q= is read in the browser. The fallback is
              the same form as plain HTML, for the moment before JS loads. */}
          <Suspense fallback={<SearchForm inputId="q" variant="page" />}>
            <SearchBox mode="page" />
          </Suspense>

          {/* Without JavaScript there's no instant search, so list every guide. */}
          <noscript>
            <h2 className="mt-8 mb-3 text-xl font-extrabold">All guides</h2>
            <GuideRows services={services} agencyNames={agencyNames} />
          </noscript>
        </div>
      </div>
    </>
  );
}
