"use client";

import { useEffect } from "react";

type Scheme = "light" | "dark";

const STORAGE_KEY = "color-scheme";

function getMeta() {
  return document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
}

function systemScheme(): Scheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** What the user is looking at right now: the override if set, else the system. */
function renderedScheme(): Scheme {
  const content = getMeta()?.content;
  return content === "light" || content === "dark" ? content : systemScheme();
}

function readStored(): Scheme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

/** null = follow the system. */
function applyOverride(scheme: Scheme | null) {
  const meta = getMeta();
  if (meta) meta.content = scheme ?? "light dark";
}

export function ColorSchemeToggle() {
  // Keep tabs in sync when the setting changes in another tab.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) applyOverride(readStored());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function toggle() {
    const target: Scheme = renderedScheme() === "dark" ? "light" : "dark";
    // Switching back to what the system wants = "undo my override".
    const override = target === systemScheme() ? null : target;

    try {
      if (override) localStorage.setItem(STORAGE_KEY, override);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage blocked: still switch for this page view.
    }
    applyOverride(override);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      // Hidden in browsers without light-dark(): there the colors can only follow the system.
      className="hidden size-11 items-center justify-center rounded-control text-on-brand hover:bg-brand-strong supports-[color:light-dark(white,black)]:inline-flex"
    >
      {/* Shows the current scheme; the label says what pressing it does. */}
      <span className="dark:hidden">
        <SunIcon />
        <span className="sr-only">Switch to dark theme</span>
      </span>
      <span className="hidden dark:inline">
        <MoonIcon />
        <span className="sr-only">Switch to light theme</span>
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  );
}
