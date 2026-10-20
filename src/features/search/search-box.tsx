"use client";

import type MiniSearch from "minisearch";
import { Link } from "@/components/ui/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { VerifyText } from "@/components/ui/verify-text";

import { searchOptions, type SearchDoc } from "./engine";
import { SearchForm } from "./search-form";

type Props = {
  city: string;
  /** "home": Enter goes to the search page. "page": the URL keeps ?q= in sync. */
  mode: "home" | "page";
};

type Result = Pick<SearchDoc, "kind" | "title" | "summary" | "agency" | "url">;

export function SearchBox({ city, mode }: Props) {
  const inputId = useId();
  const router = useRouter();
  const initialQuery = useSearchParams().get("q") ?? "";
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(initialQuery);
  const [engine, setEngine] = useState<MiniSearch<SearchDoc> | null>(null);
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  // Download the search library and index only when someone starts searching,
  // so people who just browse never pay for it on prepaid data.
  const load = useCallback(() => {
    if (started.current) return;
    started.current = true;
    void (async () => {
      try {
        const [{ default: MiniSearchClass }, response] = await Promise.all([
          import("minisearch"),
          fetch(`/${city}/search-index.json`),
        ]);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const docs = (await response.json()) as SearchDoc[];
        const index = new MiniSearchClass<SearchDoc>(searchOptions);
        index.addAll(docs);
        setFailed(false);
        setEngine(index);
      } catch {
        started.current = false; // allow a retry on the next keystroke
        setFailed(true);
      }
    })();
  }, [city]);

  // Arriving at /search?q=… starts loading straight away.
  useEffect(() => {
    if (initialQuery) load();
  }, [initialQuery, load]);

  const trimmed = query.trim();
  const results = useMemo<Result[]>(() => {
    if (!engine || !trimmed) return [];
    return engine.search(trimmed).map((r) => ({
      kind: r.kind,
      title: r.title,
      summary: r.summary,
      agency: r.agency,
      url: r.url,
    }));
  }, [engine, trimmed]);

  function onChange(value: string) {
    setQuery(value);
    load();
    if (mode === "page") {
      // Keep the URL shareable without a server round-trip per keystroke.
      const url = value.trim() ? `?q=${encodeURIComponent(value.trim())}` : "?";
      window.history.replaceState(null, "", url);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "home" && trimmed) {
      router.push(`/${city}/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      inputRef.current?.blur(); // results are already shown; hide the keyboard
    }
  }

  // Only meaningful states are announced; "loading" never is.
  let status = "";
  if (trimmed && failed) {
    status = "Search couldn't load. Check your connection and try again.";
  } else if (trimmed && engine) {
    status =
      results.length === 0
        ? `Nothing matches “${trimmed}”.`
        : `${results.length} ${results.length === 1 ? "result" : "results"} for “${trimmed}”`;
  }

  return (
    <div>
      <SearchForm
        city={city}
        inputId={inputId}
        inputRef={inputRef}
        onSubmit={onSubmit}
        inputProps={{
          value: query,
          onChange: (e) => onChange(e.target.value),
          onFocus: load,
        }}
      />

      <p aria-live="polite" className="mt-4 text-sm text-muted empty:hidden">
        {status}
      </p>

      {trimmed && engine && results.length === 0 && (
        <p className="mt-2">
          Try another word, or{" "}
          <Link href={`/${city}`}>browse guides by category</Link>.
        </p>
      )}

      {results.length > 0 && (
        <ul role="list" className="mt-3 border-t-2 border-ink">
          {results.map((r) => (
            <li
              key={r.url}
              className="relative border-b border-rule py-3 hover:bg-surface"
            >
              <p className="text-sm text-muted">
                {r.kind === "guide" ? "Guide" : "Office"}
              </p>
              <Link
                href={r.url}
                className="text-lg font-bold text-ink no-underline after:absolute after:inset-0 hover:underline"
              >
                {r.title}
              </Link>
              <p className="mt-1 text-muted">
                <VerifyText text={r.summary} />
              </p>
              {r.kind === "guide" && (
                <p className="mt-1 text-sm text-muted">{r.agency}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
