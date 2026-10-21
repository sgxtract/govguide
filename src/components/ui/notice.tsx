import { Info, Pencil, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Icon } from "./icons";

type Kind = "draft" | "warning" | "info";

const ICONS: Record<Kind, LucideIcon> = {
  draft: Pencil,
  warning: TriangleAlert,
  info: Info,
};

/**
 * Yellow-tint callout. Only for the three things people commonly get
 * wrong: an unfinished draft, a guide that may be out of date, and tips.
 */
export function Notice({
  kind,
  title,
  headingLevel = 2,
  children,
}: {
  kind: Kind;
  title: string;
  headingLevel?: 2 | 3;
  children: ReactNode;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div
      className={`print-keep flex gap-3 rounded-card border-l-6 bg-signal-tint p-4 text-ink ${
        kind === "draft" ? "border-ink" : "border-signal"
      }`}
    >
      <Icon icon={ICONS[kind]} className="mt-0.5 shrink-0" />
      <div className="min-w-0">
        <Heading className="text-base font-extrabold">{title}</Heading>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}
