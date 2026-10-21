import type { Metadata, Viewport } from "next";
import { Archivo_Narrow, Atkinson_Hyperlegible_Next } from "next/font/google";

import { ColorSchemeScript } from "@/components/layout/color-scheme-script";
import { SiteFooter } from "@/components/layout/site-footer";
import { siteConfig } from "@/config/site";
import { siteUrl } from "@/config/site-url";

import "@/styles/globals.css";

// Reading text: designed for low vision and easy-to-confuse letters.
const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-atkinson",
  display: "swap",
  // Next has no metrics for this font yet. We supply our own size-matched
  // fallback ("Atkinson Fallback" in globals.css) and the rest of the stack.
  adjustFontFallback: false,
  fallback: ["Atkinson Fallback", "ui-sans-serif", "system-ui", "sans-serif"],
});

// Counter-sign headings: Archivo's narrow cut, one static bold weight.
// (Full Archivo with its width axis looked the same but was ~90 KB; this is
// a fraction of that, which matters on prepaid data.)
const archivo = Archivo_Narrow({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-archivo",
  display: "swap",
  fallback: ["Arial Narrow", "ui-sans-serif", "sans-serif"],
});

export const metadata: Metadata = {
  // Turns relative URLs (canonical, share images) into absolute ones.
  metadataBase: siteUrl,
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: { type: "website", siteName: siteConfig.name, locale: "en_PH" },
  twitter: { card: "summary_large_image" },
};

// The phone's browser bar takes the header teal, like an installed app.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1d6e75" },
    { media: "(prefers-color-scheme: dark)", color: "#155a60" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${atkinson.variable} ${archivo.variable}`}>
      <head>
        {/* Follow the phone's text-size setting (Chrome on Android). */}
        <meta name="text-scale" content="scale" />
        <meta
          name="color-scheme"
          content="light dark"
          suppressHydrationWarning
        />
        <ColorSchemeScript />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only rounded-control bg-signal px-4 py-3 font-bold text-on-signal focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
        >
          Skip to content
        </a>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
