import { redirect } from "next/navigation";

import { StandalonePage } from "@/components/layout/standalone-page";
import { CityList } from "@/features/cities/city-list";
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
    <StandalonePage title="Choose your city">
      <CityList cities={cities} />
    </StandalonePage>
  );
}
