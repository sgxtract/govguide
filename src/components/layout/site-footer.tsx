import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-rule bg-surface print:hidden">
      <div className="mx-auto max-w-page space-y-2 px-4 py-8">
        <p className="max-w-prose font-bold">
          {siteConfig.name} is an independent guide, not an official government
          website.
        </p>
        <p className="max-w-prose text-sm text-muted">
          Requirements and fees can change. Every guide links to its official
          source and shows when it was last checked. Confirm with the office
          before you go.
        </p>
      </div>
    </footer>
  );
}
