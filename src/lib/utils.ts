/**
 * Utility functions for sanitizing UI strings and handling date parsing.
 * Provides consistent formatting across different content types.
 */

/**
 * Sanitizes values for UI display by trimming strings or joining arrays.
 *
 * @param v - The value to sanitize (unknown type).
 * @returns A trimmed string, combined array string, or an empty string on failure.
 */
export function sanitizeStringForUI(v: unknown): string {
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
 * Parses a date input into a Date object with fallback logic for common formats.
 *
 * @param input - The input to parse (string, number, or Date).
 * @returns A valid Date object or null if parsing fails.
 */
export function parseSafeDate(input: unknown): Date | null {
  if (input === null || input === undefined) return null;
  if (input instanceof Date && !isNaN(input.getTime())) return input;
  if (typeof input === "number") {
    const d = new Date(input);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  if (typeof input === "string") {
    const parsed = Date.parse(input);
    if (Number.isFinite(parsed)) return new Date(parsed);
    // Fallback: try replacing common date separators for broader compatibility
    const alt = new Date(input.replace(/-/g, "/"));
    return Number.isFinite(alt.getTime()) ? alt : null;
  }
  return null;
}

/**
 * Parses a date input into a numeric timestamp.
 *
 * @param input - The input to parse.
 * @returns The timestamp in milliseconds or NaN if invalid.
 */
export function parseDateToTs(input: unknown): number {
  const d = parseSafeDate(input);
  return d ? d.getTime() : NaN;
}

/**
 * Checks if a date represents a sentinel "end" date (e.g., year 9999 for "Present").
 *
 * @param input - The date input to check.
 * @returns True if the year is greater than or equal to 9999.
 */
export function isSentinelEnd(input: unknown): boolean {
  const d = parseSafeDate(input);
  if (!d) return false;
  return d.getFullYear() >= 9999;
}

/**
 * Formats a Date object into a human-readable "Month YYYY" string.
 *
 * @param d - The Date object to format.
 * @returns A formatted string or empty string if input is invalid.
 */
export function formatMonthYear(d: Date): string {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}
