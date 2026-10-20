"use client";

import { useEffect, useRef, type ReactNode } from "react";

const PREFIX = "govguide:checklist:";

type Props = {
  /** One key per guide, e.g. "/sorsogon/services/drivers-license-new". */
  guide: string;
  children: ReactNode;
};

function boxes(root: HTMLElement | null) {
  return Array.from(
    root?.querySelectorAll<HTMLInputElement>("input[data-requirement]") ?? [],
  );
}

function read(guide: string): string[] {
  try {
    const raw = localStorage.getItem(PREFIX + guide);
    const value: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return []; // storage blocked or corrupted: start with nothing ticked
  }
}

function write(guide: string, ticked: string[]) {
  try {
    if (ticked.length === 0) localStorage.removeItem(PREFIX + guide);
    else localStorage.setItem(PREFIX + guide, JSON.stringify(ticked));
  } catch {
    // Storage blocked: ticks still work for this visit, just aren't saved.
  }
}

/**
 * Remembers which requirements are ticked, on this phone only. Nothing is
 * sent anywhere. Ticks are stored by requirement label, so if a guide's
 * requirements change, old ticks for removed items simply stop matching.
 */
export function ChecklistMemory({ guide, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Restore saved ticks. This touches the DOM checkboxes directly; no React
  // state is involved, so there's nothing to re-render.
  useEffect(() => {
    const saved = new Set(read(guide));
    for (const box of boxes(ref.current)) {
      box.checked = saved.has(box.dataset.requirement ?? "");
    }
  }, [guide]);

  function save() {
    const ticked = boxes(ref.current)
      .filter((box) => box.checked)
      .map((box) => box.dataset.requirement ?? "");
    write(guide, ticked);
  }

  function clear() {
    for (const box of boxes(ref.current)) box.checked = false;
    write(guide, []);
  }

  return (
    // Change events from the checkboxes bubble up to here.
    <div ref={ref} onChange={save}>
      {children}
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 text-sm text-muted print:hidden">
        <p>Your ticks are saved on this phone only.</p>
        <button
          type="button"
          onClick={clear}
          className="underline underline-offset-2 hover:text-ink"
        >
          Clear ticks
        </button>
      </div>
    </div>
  );
}
