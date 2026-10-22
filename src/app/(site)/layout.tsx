import { SiteHeader } from "@/components/layout/site-header";

/** Every guide, list and city page: the teal app bar, then the page. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
    </>
  );
}
