/**
 * Which requirements are ticked, per guide, on this phone only. Nothing is
 * sent anywhere. Read through useSyncExternalStore so every checklist on the
 * page (and other tabs) stays in sync.
 */

const PREFIX = "govguide:checklist:";
const EVENT = "govguide:checklist";

// Used when storage is blocked (some private modes): ticks still work for
// this visit, they just aren't remembered.
const memory = new Map<string, string>();

export function readRaw(guide: string): string | null {
  const key = PREFIX + guide;
  try {
    return localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

export function parseTicked(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return []; // corrupted: start with nothing ticked
  }
}

export function writeTicked(guide: string, ticked: string[]) {
  const key = PREFIX + guide;
  const raw = JSON.stringify(ticked);
  try {
    if (ticked.length === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, raw);
    memory.delete(key);
  } catch {
    if (ticked.length === 0) memory.delete(key);
    else memory.set(key, raw);
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribe(onChange: () => void): () => void {
  // `storage` fires when another tab changes the ticks.
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
