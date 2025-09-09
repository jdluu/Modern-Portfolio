// Misc helpers used across the site for safe frontmatter handling and asset resolution.
// Designed to be small, defensive, and self-documenting.

type ImageLike = { src?: string; url?: string; path?: string; filename?: string } & Record<string, unknown>;

function isImageLike(value: unknown): value is ImageLike {
  return typeof value === "object" && value !== null && (
    "src" in (value as object) ||
    "url" in (value as object) ||
    "path" in (value as object) ||
    "filename" in (value as object)
  );
}

// Extract a canonical image/path string from either a string or a Tina-like image object.
function getImagePathOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (isImageLike(value)) {
    const v = value as ImageLike;
    return String(v.src ?? v.url ?? v.path ?? v.filename ?? null);
  }
  return null;
}

// Backwards-compatible exports kept with original names.
export function resolveAssetUrl(v: any): string | null {
  return getImagePathOrNull(v);
}

export function pickImageString(field: any): string | null {
  return getImagePathOrNull(field);
}

// Sanitize values for UI consumption: strings, arrays -> comma list, others -> trimmed string
export function sanitizeStringForUI(v: any): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).join(", ");
  try {
    return String(v).trim();
  } catch {
    return "";
  }
}

/**
 * parseSafeDate
 * - Accepts string, number, or Date and returns a Date object or null on failure.
 */
export function parseSafeDate(input: any): Date | null {
  if (input === null || input === undefined) return null;
  if (input instanceof Date && !isNaN(input.getTime())) return input;
  if (typeof input === "number") {
    const d = new Date(input);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  if (typeof input === "string") {
    const parsed = Date.parse(input);
    if (Number.isFinite(parsed)) return new Date(parsed);
    // Fallback: try replacing common date separators
    const alt = new Date(input.replace(/-/g, "/"));
    return Number.isFinite(alt.getTime()) ? alt : null;
  }
  return null;
}

/**
 * parseDateToTs
 * - Returns numeric timestamp (ms) or NaN
 */
export function parseDateToTs(input: any): number {
  const d = parseSafeDate(input);
  return d ? d.getTime() : NaN;
}

/**
 * isSentinelEnd
 * - Some frontmatter uses 9999-12-31 to indicate "Present". This helper
 *   returns true when the year is >= 9999.
 */
export function isSentinelEnd(input: any): boolean {
  const d = parseSafeDate(input);
  if (!d) return false;
  return d.getFullYear() >= 9999;
}

/**
 * formatMonthYear
 * - Human-friendly "Month YYYY" display (en-US)
 */
export function formatMonthYear(d: Date): string {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}