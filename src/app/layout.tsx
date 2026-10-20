import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { siteConfig } from "@/config/site";
import { siteUrl } from "@/config/site-url";

import "@/styles/globals.css";

const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-atkinson",
  display: "swap",
  // Next has no metrics for this font yet. We supply our own size-matched
  // fallback ("Atkinson Fallback" in globals.css) and the rest of the stack.
  adjustFontFallback: false,
  fallback: ["Atkinson Fallback", "ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  // Turns relative URLs (canonical, share images) into absolute ones.
  metadataBase: siteUrl,
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: { type: "website", siteName: siteConfig.name, locale: "en_PH" },
  twitter: { card: "summary_large_image" },
};

// Runs before first paint so a saved light/dark choice never flashes.
// Keep it tiny; the toggle component handles everything else.
const colorSchemeScript = `try{var s=localStorage.getItem("color-scheme");if(s==="light"||s==="dark")document.querySelector('meta[name="color-scheme"]').content=s}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={atkinson.variable}>
      <head>
        <meta
          name="color-scheme"
          content="light dark"
          suppressHydrationWarning
        />
        <script dangerouslySetInnerHTML={{ __html: colorSchemeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only rounded-md bg-ink px-4 py-2 text-paper focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
        >
          Skip to content
        </a>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
