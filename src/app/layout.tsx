import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/config/site";

import "@/styles/globals.css";

const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-atkinson",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
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
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
