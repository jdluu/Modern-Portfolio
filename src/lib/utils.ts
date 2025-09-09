// Misc helpers used across the site for safe frontmatter handling and asset resolution.
//
// These are intentionally simple, defensive helpers that tolerate values coming
// from different loaders (Tina-generated objects, raw frontmatter strings, Date
// objects, etc.). They are written to be safe for build-time usage.
export function resolveAssetUrl(v: any): string | null {
  if (!v && v !== 0) return null;
  if (typeof v === "string") return v;
  // Tina-compatible image object: { src: "/path", filename: "...", ... }
  if (typeof v === "object" && v !== null) {
    return String(v.src ?? v.url ?? v.path ?? v.filename ?? null);
  }
  return null;
}

export function pickImageString(field: any): string | null {
  // Accept string or Tina-like image object
  if (!field && field !== 0) return null;
  if (typeof field === "string") return field;
  if (typeof field === "object" && field !== null) {
    return String(field.src ?? field.url ?? field.path ?? field.filename ?? null);
  }
  return null;
}

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
  if (!input && input !== 0) return null;
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