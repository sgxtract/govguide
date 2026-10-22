"use client";

import { useId, useSyncExternalStore, type ReactNode } from "react";

import { readCity, resolveCity, subscribe, writeCity } from "./city-store";

type Block = { slug: string; name: string; content: ReactNode };

type Props = {
  /** One block per city that has this guide, already rendered on the server. */
  blocks: Block[];
  /** Every city's name, to name a remembered city this guide doesn't have. */
  cityNames: Record<string, string>;
};

const noSubscription = () => () => {};

/**
 * Shows the reader's city. The blocks are rendered on the server, so without
 * JavaScript every city is shown under its own heading; with it, a native
 * select picks one, remembered on this phone for every guide.
 */
export function CitySwitch({ blocks, cityNames }: Props) {
  const stored = useSyncExternalStore(subscribe, readCity, () => null);
  // False on the server and during hydration, so the first paint matches.
  const hydrated = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  const selectId = useId();

  const [only] = blocks;
  const single = blocks.length === 1 ? only : undefined;
  const picking = hydrated && !single;
  const { chosen, missing } = picking
    ? resolveCity(
        stored,
        blocks.map((b) => b.slug),
      )
    : {};

  return (
    <div>
      {single && (
        <p className="text-muted">
          Showing: <strong className="text-ink">{single.name}</strong>
        </p>
      )}

      {picking && (
        <div className="rounded-card bg-surface p-4 print:hidden">
          {missing && (
            <p className="mb-3">
              We haven&apos;t added {cityNames[missing] ?? "your city"} for this
              guide yet.
            </p>
          )}
          <label htmlFor={selectId} className="block font-bold">
            Your city
          </label>
          <select
            id={selectId}
            value={chosen ?? ""}
            onChange={(event) => writeCity(event.target.value)}
            className="mt-1 block min-h-12 w-full rounded-control border-2 border-control bg-surface px-3 text-ink"
          >
            <option value="" disabled>
              Choose your city
            </option>
            {blocks.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
          {!chosen && (
            <p className="mt-2 text-muted">
              Choose your city to see where to go.
            </p>
          )}
        </div>
      )}

      {blocks.map((block) => {
        const headingId = `${selectId}-${block.slug}`;
        return (
          <section
            key={block.slug}
            aria-labelledby={headingId}
            hidden={picking && block.slug !== chosen}
            className="mt-4 first:mt-0"
          >
            {/* Visible while every city is shown (no JavaScript yet), and on
                paper, where the picker isn't printed. */}
            <h2
              id={headingId}
              className={
                single || picking
                  ? "sr-only print:not-sr-only print:mb-3 print:block print:text-xl print:font-extrabold"
                  : "mb-3 text-xl font-extrabold"
              }
            >
              {block.name}
            </h2>
            {block.content}
          </section>
        );
      })}
    </div>
  );
}
