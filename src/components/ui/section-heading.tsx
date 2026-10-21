import type { ReactNode } from "react";

import { Link } from "./link";

/** A section's h2, with an optional "see all" link on the right. */
export function SectionHeading({
  id,
  children,
  more,
}: {
  id: string;
  children: ReactNode;
  more?: { href: string; label: string };
}) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4">
      <h2 id={id} className="text-xl font-extrabold">
        {children}
      </h2>
      {more && (
        <Link
          href={more.href}
          className="inline-flex min-h-11 items-center font-bold"
        >
          {more.label}
        </Link>
      )}
    </div>
  );
}
