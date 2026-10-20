import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

type Input = {
  title: string;
  description: string;
  /** Path of this page, e.g. "/sorsogon/services/drivers-license-new". */
  path: string;
};

/**
 * Metadata every indexable page needs: title, description, canonical URL,
 * and share-preview text. The share image comes from the nearest
 * opengraph-image file, so it's not set here.
 */
export function pageMetadata({ title, description, path }: Input): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    // A page's openGraph replaces the layout's whole object, so the shared
    // fields are repeated here.
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      siteName: siteConfig.name,
      locale: "en_PH",
    },
  };
}
