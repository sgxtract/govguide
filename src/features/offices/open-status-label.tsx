"use client";

import { useSyncExternalStore } from "react";

import { dayName, formatDuration, formatTime } from "@/lib/utils/format";

import {
  getOpenStatus,
  hasKnownHours,
  type HolidayDate,
  type Hours,
  type NextOpening,
  type OpenStatus,
} from "./open-status";

// The current minute. Pages are built ahead of time, so "now" only exists in
// the browser: the server renders a same-size placeholder.
function subscribe(onTick: () => void) {
  const timer = window.setInterval(onTick, 30_000);
  return () => window.clearInterval(timer);
}
const currentMinute = () => Math.floor(Date.now() / 60_000);

type Props = {
  hours: Hours[];
  holidays: HolidayDate[];
  /** "full": status and a second line. "compact": one line, for lists. */
  variant?: "full" | "compact";
};

/** "Open now", "Closes soon", "Closed now" or "Hours not checked yet". */
export function OpenStatusLabel({ hours, holidays, variant = "full" }: Props) {
  const minute = useSyncExternalStore(subscribe, currentMinute, () => null);

  if (!hasKnownHours(hours)) {
    return (
      <StatusLine
        variant={variant}
        tone="unknown"
        status="Hours not checked yet"
        detail="Call before you go"
      />
    );
  }

  if (minute === null) {
    // Same shape as the real label, invisible, so nothing jumps.
    return (
      <span className="invisible" aria-hidden="true">
        <StatusLine
          variant={variant}
          tone="open"
          status="Open now"
          detail="—"
        />
      </span>
    );
  }

  return (
    <StatusLine
      variant={variant}
      {...describe(getOpenStatus(hours, new Date(minute * 60_000), holidays))}
    />
  );
}

function opensText(next: NextOpening | undefined): string {
  if (!next) return "Check the office hours";
  const when =
    next.inDays === 0
      ? "today"
      : next.inDays === 1
        ? "tomorrow"
        : dayName(next.day);
  return `Opens ${when} at ${formatTime(next.opens)}`;
}

function describe(status: OpenStatus): {
  tone: Tone;
  status: string;
  detail: string;
} {
  switch (status.kind) {
    case "unknown":
      return {
        tone: "unknown",
        status: "Hours not checked yet",
        detail: "Call before you go",
      };
    case "open":
      return {
        tone: "open",
        status: "Open now",
        detail: `Closes ${formatTime(status.closes)}`,
      };
    case "soon":
      return {
        tone: "soon",
        status: "Closes soon",
        detail: `At ${formatTime(status.closes)}, in ${formatDuration(status.minutesLeft)}`,
      };
    case "closed":
      return status.holiday
        ? {
            tone: "closed",
            status: "Closed today",
            detail: `${status.holiday}. ${opensText(status.next)}`,
          }
        : {
            tone: "closed",
            status: "Closed now",
            detail: opensText(status.next),
          };
  }
}

export type Tone = "open" | "soon" | "closed" | "unknown";

// Each state has its own marker shape as well as colour, so it reads
// without colour (colour-blind readers, print, high contrast mode).
const TONES: Record<Tone, { text: string; marker: string }> = {
  open: { text: "text-open", marker: "size-3 rounded-full bg-current" },
  soon: { text: "text-soon", marker: "size-2.5 rotate-45 bg-current" },
  closed: {
    text: "text-closed",
    marker: "size-3 rounded-full border-3 border-current",
  },
  unknown: {
    text: "text-muted",
    marker: "h-0.5 w-3 rounded-pill bg-current",
  },
};

/** The label itself, without the clock. Also used by /styleguide. */
export function StatusLine({
  variant,
  tone,
  status,
  detail,
}: {
  variant: "full" | "compact";
  tone: Tone;
  status: string;
  detail: string;
}) {
  const { text, marker } = TONES[tone];
  const head = (
    <span className={`inline-flex items-center gap-2 font-extrabold ${text}`}>
      <span aria-hidden="true" className={`shrink-0 ${marker}`} />
      {status}
    </span>
  );

  if (variant === "compact") {
    return (
      <span className="text-sm">
        {head}
        <span className="text-muted">, {lowerFirst(detail)}</span>
      </span>
    );
  }
  return (
    <span className="block">
      {head}
      <span className="block text-sm text-muted">{detail}</span>
    </span>
  );
}

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
