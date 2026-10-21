import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";
import { getCity, listCities } from "@/lib/content/repository";

// Build one static copy of every page per city in /content/cities.
export async function generateStaticParams() {
  const cities = await listCities();
  return cities.map((city) => ({ city: city.slug }));
}

// Any city not in /content is a 404, never rendered on demand.
export const dynamicParams = false;

export default async function CityLayout({
  children,
  params,
}: LayoutProps<"/[city]">) {
  const city = await getCity((await params).city);
  if (!city) notFound();

  return (
    <>
      <SiteHeader city={city} />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
    </>
  );
}
