import Link from "next/link";

type Crumb = { label: string; href?: string };

/** The last crumb is the current page and should have no href. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm print:hidden">
      <ol className="flex flex-wrap items-baseline gap-x-2 text-muted">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-baseline gap-x-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
