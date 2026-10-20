import "server-only";

/**
 * The site's public address, used for canonical URLs, share previews,
 * the sitemap and structured data.
 *
 * 1. NEXT_PUBLIC_SITE_URL once we have a domain (Lesson 12),
 * 2. else Vercel's production address (set automatically on Vercel),
 * 3. else localhost for local builds.
 */
function resolveSiteUrl(): URL {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  return new URL("http://localhost:3000");
}

export const siteUrl = resolveSiteUrl();

/** "/sorsogon" → "https://example.com/sorsogon". */
export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}
