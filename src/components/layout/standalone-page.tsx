import type { ReactNode } from "react";

import { PageHeader } from "./page-header";
import { SiteHeader } from "./site-header";

/**
 * Frame for pages outside a city (about, privacy, 404…): app bar, teal
 * title band, and a readable text column.
 */
export function StandalonePage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <PageHeader title={title} subtitle={subtitle} />
        <div className="mx-auto max-w-page px-4 pt-6">
          <div className="max-w-prose space-y-4 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-extrabold">
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
