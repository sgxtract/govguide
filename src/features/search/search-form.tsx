import type { ComponentProps, Ref } from "react";

type Props = {
  city: string;
  inputId: string;
  inputRef?: Ref<HTMLInputElement>;
  inputProps?: ComponentProps<"input">;
  onSubmit?: ComponentProps<"form">["onSubmit"];
};

/**
 * The search form itself. Plain HTML that works with JavaScript off: it's a
 * GET form to /[city]/search. SearchBox adds instant results on top.
 */
export function SearchForm({
  city,
  inputId,
  inputRef,
  inputProps,
  onSubmit,
}: Props) {
  const hintId = `${inputId}-hint`;
  return (
    <search>
      <form action={`/${city}/search`} method="get" onSubmit={onSubmit}>
        <label htmlFor={inputId} className="block text-xl font-bold">
          What do you need to do?
        </label>
        <p id={hintId} className="mt-1 text-sm text-muted">
          For example: birth certificate, driver&apos;s license, barangay
          clearance
        </p>
        <div className="mt-3 flex gap-2">
          <input
            ref={inputRef}
            id={inputId}
            name="q"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-describedby={hintId}
            className="min-w-0 flex-1 rounded-md border-2 border-ink bg-paper px-3 py-2 text-lg text-ink"
            {...inputProps}
          />
          <button
            type="submit"
            // The transparent border shows up in Windows High Contrast mode,
            // where background colors are removed.
            className="shrink-0 rounded-md border-2 border-transparent bg-ink px-4 py-2 font-bold text-paper"
          >
            Search
          </button>
        </div>
      </form>
    </search>
  );
}
