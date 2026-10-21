import { agencyDisplayName } from "@/features/agencies/agency-level";
import { ogSize, renderOgCard } from "@/features/seo/og-card";
import {
  getAgency,
  getCategory,
  getCity,
  getService,
} from "@/lib/content/repository";

export const alt = "Guide summary: the task, the city and the agency";
export const size = ogSize;
export const contentType = "image/png";

// One image per guide, generated at build time (same params as the page).
export { generateStaticParams } from "./page";

export default async function Image({
  params,
}: {
  params: Promise<{ city: string; slug: string }>;
}) {
  const { city: citySlug, slug } = await params;
  const [city, service] = await Promise.all([
    getCity(citySlug),
    getService(citySlug, slug),
  ]);
  if (!city || !service) {
    return renderOgCard({ eyebrow: "Guide", title: "Guide not found" });
  }
  const [agency, category] = await Promise.all([
    getAgency(service.agency),
    getCategory(service.category),
  ]);

  return renderOgCard({
    eyebrow: [city.name, category?.name].filter(Boolean).join(", "),
    title: service.title,
    subtitle: agency ? agencyDisplayName(agency) : undefined,
  });
}
