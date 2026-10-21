"use client";

import { useEffect, useRef, useState } from "react";

type Section = { id: string; label: string };

/**
 * Jump links to each part of a guide, stuck to the top while you scroll.
 * Plain anchor links that work without JavaScript; the script only marks
 * the section you're reading and keeps its tab in view.
 */
export function SectionTabs({ sections }: { sections: Section[] }) {
  const [current, setCurrent] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0 || !("IntersectionObserver" in window)) return;

    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(entry.target.id, entry.isIntersecting);
        }
        // The first section (in page order) that's on screen wins.
        const first = targets.find((t) => visible.get(t.id));
        if (first) setCurrent(first.id);
      },
      // A band near the top of the screen, under the sticky tabs.
      { rootMargin: "-80px 0px -55% 0px" },
    );
    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [sections]);

  // Keep the current tab visible in the sideways-scrolling row.
  useEffect(() => {
    const list = listRef.current;
    const tab = list?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!list || !tab) return;
    const left = tab.offsetLeft - 16;
    const right = tab.offsetLeft + tab.offsetWidth - list.clientWidth + 16;
    if (list.scrollLeft > left) list.scrollTo({ left });
    else if (list.scrollLeft < right) list.scrollTo({ left: right });
  }, [current]);

  return (
    <nav
      aria-label="On this page"
      className="sticky top-0 z-10 -mx-4 bg-bg print:hidden"
    >
      {/* Scrolls sideways when the tabs don't fit; the scrollbar is hidden
          because the cut-off tab already shows there's more. */}
      <ul
        ref={listRef}
        className="flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-4 py-2.5"
      >
        {sections.map((s) => (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              aria-current={current === s.id ? "true" : undefined}
              className="inline-flex min-h-11 items-center rounded-pill bg-surface px-4 text-sm font-bold whitespace-nowrap text-ink no-underline aria-[current=true]:bg-ink aria-[current=true]:text-bg"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
