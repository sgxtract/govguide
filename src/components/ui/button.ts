/**
 * Button looks, for <button> and for links that act like buttons.
 * 48px tall, verb first. One primary per screen.
 */
type Variant = "primary" | "secondary" | "signal";

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-control border-2 px-4 font-bold no-underline transition-colors active:scale-98 print:hidden";

const variants: Record<Variant, string> = {
  // The transparent border shows up in Windows High Contrast mode, where
  // background colors are removed.
  primary: "border-transparent bg-brand text-on-brand hover:bg-brand-strong",
  secondary: "border-control bg-surface text-ink hover:border-ink",
  signal: "border-transparent bg-signal text-on-signal",
};

export function buttonClass(variant: Variant = "secondary"): string {
  return `${base} ${variants[variant]}`;
}
