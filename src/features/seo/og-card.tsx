import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

/** Share-preview size used by Facebook, Messenger, X and others. */
export const ogSize = { width: 1200, height: 630 };

// The image renderer can't read CSS variables or oklch(), so the light
// palette is repeated here as hex. Keep in sync with globals.css.
const COLORS = {
  paper: "#f9f6f1",
  ink: "#201914",
  muted: "#5c534d",
  rule: "#cfcac2",
};

// Atkinson Hyperlegible Next from the @fontsource package (.woff: the image
// renderer can't read .woff2). Read once, at build time.
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
  /** Small line above the title, e.g. "Sorsogon · Vehicles & Driving". */
  eyebrow: string;
  title: string;
  /** Line under the title, e.g. the agency name. */
  subtitle?: string;
};

/**
 * The share card: the site's printed-notice look. Heavy ink rule on top,
 * big title, and the independence line at the bottom, always in light colors.
 */
export async function renderOgCard({ eyebrow, title, subtitle }: Props) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.paper,
        color: COLORS.ink,
        fontFamily: "Atkinson",
        borderTop: `24px solid ${COLORS.ink}`,
        padding: "56px 72px",
      }}
    >
      <div style={{ display: "flex", fontSize: 32, color: COLORS.muted }}>
        <span style={{ fontWeight: 800, color: COLORS.ink }}>
          {siteConfig.name}
        </span>
        <span style={{ margin: "0 16px" }}>/</span>
        <span>{eyebrow}</span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: title.length > 40 ? 72 : 88,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ marginTop: 24, fontSize: 36, color: COLORS.muted }}>
            {subtitle}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          borderTop: `3px solid ${COLORS.ink}`,
          paddingTop: 20,
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
