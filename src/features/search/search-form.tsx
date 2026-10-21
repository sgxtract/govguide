import { Search } from "lucide-react";
import type { ComponentProps, Ref } from "react";

import { Icon } from "@/components/ui/icons";

type Props = {
  city: string;
  inputId: string;
  /** "hero": white field on the teal home header. "page": on the page background. */
  variant: "hero" | "page";
  /** Id of an element that labels the field (the home question). Otherwise a visible label is shown. */
  labelledBy?: string;
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
  variant,
  labelledBy,
  inputRef,
  inputProps,
  onSubmit,
}: Props) {
  const hintId = `${inputId}-hint`;
  const hero = variant === "hero";
  return (
    <search>
      <form action={`/${city}/search`} method="get" onSubmit={onSubmit}>
        {!labelledBy && (
          <label htmlFor={inputId} className="block text-xl font-extrabold">
            What do you need to get done?
          </label>
        )}
        <div
          className={`mt-3 flex overflow-hidden rounded-control bg-surface has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-signal ${
            hero ? "" : "border-2 border-control"
          }`}
        >
          <input
            ref={inputRef}
            id={inputId}
            name="q"
            type="search"
            placeholder="Try “birth certificate”"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-labelledby={labelledBy}
            aria-describedby={hintId}
            className="min-h-14 min-w-0 flex-1 bg-transparent px-4 text-lg text-ink placeholder:text-muted focus-visible:shadow-none focus-visible:outline-none"
            {...inputProps}
          />
          <button
            type="submit"
            aria-label="Search"
            // The transparent border shows up in Windows High Contrast mode.
            className="grid w-15 shrink-0 place-items-center border-2 border-transparent bg-signal text-on-signal focus-visible:shadow-none focus-visible:-outline-offset-6 focus-visible:outline-ink"
          >
            <Icon icon={Search} size={24} />
          </button>
        </div>
        <p
          id={hintId}
          className={`mt-2 text-sm ${hero ? "text-on-brand" : "text-muted"}`}
        >
          For example: birth certificate, driver&apos;s license, cedula
        </p>
      </form>
    </search>
  );
}
