import { ogSize, renderOgCard } from "@/features/seo/og-card";
import { getCity, listCities } from "@/lib/content/repository";

// Share image for the city home and every city page without its own
// (categories, offices, search). Guides have their own.
export const alt =
  "GovGuide: where to go, what to bring, the steps and the fees for government services";
export const size = ogSize;
export const contentType = "image/png";

// Image routes don't inherit the [city] layout's params; list cities here
// so one image per city is generated at build time.
export async function generateStaticParams() {
  const cities = await listCities();
  return cities.map((city) => ({ city: city.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const city = await getCity((await params).city);
  return renderOgCard({
    eyebrow: city?.name ?? "Government services guide",
    title: "Get your government errand done in one trip",
    subtitle: "Where to go, what to bring, the steps, the fees",
  });
}
