import { agencyDisplayName } from "@/features/agencies/agency-level";
import { ogSize, renderOgCard } from "@/features/seo/og-card";
import { getCategory, getGuide } from "@/lib/content/repository";

export const alt = "Guide summary: the task, the topic and the agency";
export const size = ogSize;
export const contentType = "image/png";

// One image per guide, generated at build time (same params as the page).
export { generateStaticParams } from "./page";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const guide = await getGuide((await params).slug);
  if (!guide) {
    return renderOgCard({ eyebrow: "Guide", title: "Guide not found" });
  }
  const category = await getCategory(guide.service.category);

  return renderOgCard({
    eyebrow: category?.name ?? "Guide",
    title: guide.service.title,
    subtitle: guide.agency
      ? agencyDisplayName(guide.agency)
      : "Run by your city or municipality",
  });
}
