/// <reference types="astro/client" />

// Theme toggle utilities — self-contained, small helpers that prioritize clarity
// and defensive behavior (safe for environments without localStorage or the
// experimental View Transitions API).

// Storage and timing constants
const STORAGE_KEY = "darkmode";
const STORAGE_DEBOUNCE_MS = 100;
const TOGGLE_THROTTLE_MS = 300;

// Debounce helper: coalesces rapid calls into a single execution after `wait` ms.
function debounce<T extends (...args: any[]) => void>(fn: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
      timeout = null;
    }, wait);
  };
}

// Throttle helper: ensures the wrapped function runs at most once per `wait` ms.
function throttle<T extends (...args: any[]) => void>(fn: T, wait: number): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      fn(...args);
    }
  };
}

// Debounced write to localStorage — avoids blocking the main thread on rapid toggles.
const debouncedSetStorage = debounce((isDark: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isDark));
  } catch {
    // Ignore storage failures (e.g., running in SSR context or browser privacy modes).
  }
}, STORAGE_DEBOUNCE_MS);

// Runtime guard for the experimental View Transitions API.
// This avoids unsafe casts and keeps intent explicit.
function supportsViewTransition(): boolean {
  return typeof (document as Document & { startViewTransition?: unknown }).startViewTransition === "function";
}

/**
 * toggleTheme
 * - Toggles the document theme between 'light' and 'dark'.
 * - Uses the View Transitions API when available for smoother transitions.
 * - Debounces writes to localStorage to minimize blocking.
 */
export const toggleTheme = (): void => {
  const applyToggle = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    debouncedSetStorage(isDark);
  };

  if (supportsViewTransition()) {
    // startViewTransition is experimental; call it when present for nicer transitions.
    // We avoid a hard TypeScript dependency by checking support above.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).startViewTransition(applyToggle);
    return;
  }

  applyToggle();
};

/**
 * throttledToggleTheme
 * - A thin throttled wrapper to guard against very rapid user interactions.
 */
export const throttledToggleTheme = throttle(toggleTheme, TOGGLE_THROTTLE_MS);