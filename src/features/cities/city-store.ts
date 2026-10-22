/**
 * The city chosen in the city picker, on this phone only, shared by every
 * guide. Nothing is sent anywhere. Read through useSyncExternalStore so every
 * picker (and other tabs) stays in sync.
 */

const KEY = "govguide:city";
const EVENT = "govguide:city";

// Used when storage is blocked (some private modes): the choice still works
// for this visit, it just isn't remembered.
let memory: string | null = null;

export function readCity(): string | null {
  try {
    return localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

export function writeCity(slug: string) {
  memory = slug;
  try {
    localStorage.setItem(KEY, slug);
  } catch {
    // Remembered in memory only.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribe(onChange: () => void): () => void {
  // `storage` fires when another tab changes the city.
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Which city's block to show. A guide in only one city always shows it. A
 * stored city this guide doesn't have is reported, so the page can say so.
 */
export function resolveCity(
  stored: string | null,
  available: string[],
): { chosen?: string; missing?: string } {
  const [only] = available;
  if (available.length === 1 && only) return { chosen: only };
  if (stored && available.includes(stored)) return { chosen: stored };
  if (stored) return { missing: stored };
  return {};
}
