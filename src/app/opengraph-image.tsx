import { ogSize, renderOgCard } from "@/features/seo/og-card";

// Share image for pages outside a city (the city picker, 404). Each city and
// each guide has its own: [city]/opengraph-image.tsx, services/[slug]/….
export const alt =
  "GovGuide: where to go, what to bring, the steps and the fees for government services";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return renderOgCard({
    eyebrow: "Government services guide",
    title: "Get your government errand done in one trip",
    subtitle: "Where to go, what to bring, the steps, the fees",
  });
}
