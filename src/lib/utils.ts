/**
 * General-purpose utilities for content & UI handling.
 * Replaces content-utils.ts and exposes small helpers used across components and libs.
 */

export type MaybeString = string | undefined | null;

// Safe parse ISO-ish strings to Date; returns undefined for invalid values.
// Accepts null explicitly to align with metadata shapes that can include null.
export function parseSafeDate(value?: string | null): Date | undefined {
  if (!value || typeof value !== "string") return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

// Parse a date string to a numeric timestamp (ms) or NaN.
// This complements parseSafeDate when numeric comparison is needed.
export function parseDateToTs(str?: string | null): number {
  if (!str || typeof str !== "string") return NaN;
  const t = Date.parse(str);
  return Number.isNaN(t) ? NaN : t;
}

// Detect the sentinel "Present" year (9999 or greater) inside a string.
// Returns true when the provided string contains a year >= 9999.
export function isSentinelEnd(str?: string | null): boolean {
  if (!str || typeof str !== "string") return false;
  const yearMatch = str.match(/(\d{4,})/);
  if (!yearMatch) return false;
  const year = Number(yearMatch[1]);
  return !Number.isNaN(year) && year >= 9999;
}

// Resolve an asset URL:
// - Return absolute URLs untouched
// - Resolve relative paths against import.meta.env.BASE_URL (or "/")
// Use a safe cast for import.meta to avoid TS errors in environments where `env` is not declared.
export function resolveAssetUrl(raw?: unknown): string | null {
  const v = typeof raw === "string" ? raw.trim() : "";
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const base = ((import.meta as any).env?.BASE_URL as string) || "/";
  const clean = v.replace(/^\/+/, "");
  return base.endsWith("/") ? base + clean : base + "/" + clean;
}

/**
 * Pick a usable string candidate from Tina's image field which may be:
 * - a simple string (path or absolute URL)
 * - an object with `imgix_url` or `url`
 * Returns null when no usable value is found.
 */
export function pickImageString(img?: unknown): string | null {
  if (!img) return null;
  if (typeof img === "string") return img;
  if (typeof img === "object" && img !== null) {
    const a: any = img;
    return a.imgix_url ?? a.url ?? null;
  }
  return null;
}

/**
 * Strip YAML frontmatter from a raw string and return the body.
 * Returns empty string for falsy input.
 */
export function stripFrontmatter(raw?: unknown): string {
  const s = typeof raw === "string" ? raw : "";
  if (!s) return "";
  const m = s.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return m ? s.slice(m[0].length) : s;
}

/**
 * Sanitize small metadata strings used for UI display.
 * - Strips YAML frontmatter if present
 * - Trims and collapses excessive whitespace
 * - Returns empty string when input is falsy
 */
export function sanitizeStringForUI(value?: unknown): string {
  const raw = stripFrontmatter(value);
  return raw.replace(/\s+/g, " ").trim();
}

// Format a Date as "Mon yyyy" using Intl when available; light fallback otherwise.
export function formatMonthYear(d: Date): string {
  try {
    return new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" }).format(d);
  } catch {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  }
}