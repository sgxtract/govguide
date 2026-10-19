import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";
import { listCities } from "@/lib/content/repository";

/**
 * City picker. While Sorsogon is the only city, skip straight to it.
 * When a second city folder is added, this page lists them instead.
 */
export default async function RootPage() {
  const cities = await listCities();
  const [only] = cities;
  if (cities.length === 1 && only) redirect(`/${only.slug}`);

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1">
        <div className="mx-auto max-w-page px-4 py-10">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Choose your city
          </h1>
          <ul role="list" className="mt-6 max-w-prose border-t-2 border-ink">
            {cities.map((city) => (
              <li
                key={city.slug}
                className="relative border-b border-rule py-3 hover:bg-surface"
              >
                <Link
                  href={`/${city.slug}`}
                  className="text-lg font-bold text-ink no-underline after:absolute after:inset-0 hover:underline"
                >
                  {city.name}
                </Link>
                <p className="mt-1 text-sm text-muted">{city.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
