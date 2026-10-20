import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/config/site-url";

/**
 * /robots.txt. Vercel preview deployments (one per pull request) are blocked
 * so search engines never index unfinished work.
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === "preview") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
