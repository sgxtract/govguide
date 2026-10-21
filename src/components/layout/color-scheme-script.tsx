"use client";

// Applies a saved light/dark choice before first paint, so it never flashes.
// Keep it tiny; ColorSchemeToggle handles everything else.
const script = `try{var s=localStorage.getItem("color-scheme");if(s==="light"||s==="dark")document.querySelector('meta[name="color-scheme"]').content=s}catch(e){}`;

/**
 * A client component on purpose: it renders on the server (real JavaScript
 * in the HTML, runs before paint) and again in the browser. If the browser
 * ever has to create <head> itself (e.g. after a server error in dev), React
 * wouldn't run the script anyway, so there it's an inert data block, which
 * also avoids React's "Encountered a script tag" warning. ColorSchemeToggle
 * re-applies the saved choice in that case.
 */
export function ColorSchemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? undefined : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
