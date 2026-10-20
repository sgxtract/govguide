import { Link } from "@/components/ui/link";

import { SiteHeader } from "@/components/layout/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1">
        <div className="mx-auto max-w-page px-4 py-10">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Page not found
          </h1>
          <p className="mt-3 max-w-prose text-lg">
            This page doesn&apos;t exist, or the guide may have moved.
          </p>
          <p className="mt-4">
            <Link href="/">Go to the list of guides</Link>
          </p>
        </div>
      </main>
    </>
  );
}
