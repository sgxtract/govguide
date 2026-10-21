import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

/** Share-preview size used by Facebook, Messenger, X and others. */
export const ogSize = { width: 1200, height: 630 };

// The image renderer can't read CSS variables, so the light palette is
// repeated here. Keep in sync with globals.css.
const COLORS = {
  brand: "#1d6e75",
  signal: "#f5c842",
  bg: "#ecf0ef",
  ink: "#15201f",
  muted: "#4a5857",
};

// Atkinson Hyperlegible Next from @fontsource (.woff: the image renderer
// can't read .woff2). Read once, at build time.
const fontDir = path.join(
  process.cwd(),
  "node_modules/@fontsource/atkinson-hyperlegible-next/files",
);
const fonts = Promise.all(
  ([400, 800] as const).map(async (weight) => ({
    name: "Atkinson",
    weight,
    style: "normal" as const,
    data: await readFile(
      path.join(
        fontDir,
        `atkinson-hyperlegible-next-latin-${weight}-normal.woff`,
      ),
    ),
  })),
);

type Props = {
  /** Small line in the teal band, e.g. "Sorsogon, Vehicles & Driving". */
  eyebrow: string;
  title: string;
  /** Line under the title, e.g. the agency name. */
  subtitle?: string;
};

/**
 * The share card, in the app's look: teal band, big title on the page
 * colour, a yellow route stop, and the independence line. Always light.
 */
export async function renderOgCard({ eyebrow, title, subtitle }: Props) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.bg,
        color: COLORS.ink,
        fontFamily: "Atkinson",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          backgroundColor: COLORS.brand,
          color: "#ffffff",
          padding: "36px 72px",
          fontSize: 34,
        }}
      >
        <span style={{ fontWeight: 800 }}>{siteConfig.name}</span>
        <span>{eyebrow}</span>
      </div>

      <div
        style={{
          display: "flex",
          flexGrow: 1,
          alignItems: "center",
          gap: 40,
          padding: "0 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 64,
            height: 64,
            flexShrink: 0,
            borderRadius: 999,
            backgroundColor: COLORS.signal,
            border: `8px solid ${COLORS.brand}`,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: title.length > 40 ? 68 : 84,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ marginTop: 20, fontSize: 34, color: COLORS.muted }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          padding: "0 72px 40px",
          fontSize: 28,
          color: COLORS.muted,
        }}
      >
        Independent guide, not an official government website
      </div>
    </div>,
    { ...ogSize, fonts: await fonts },
  );
}
