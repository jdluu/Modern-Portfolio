/**
 * Misc helpers used across the site for safe frontmatter handling and asset resolution.
 */

type ImageLike = {
  src?: string;
  url?: string;
  path?: string;
  filename?: string;
} & Record<string, unknown>;

function isImageLike(value: unknown): value is ImageLike {
  return (
    typeof value === "object" &&
    value !== null &&
    ("src" in (value as object) ||
      "url" in (value as object) ||
      "path" in (value as object) ||
      "filename" in (value as object))
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

/**
 * Resolves an asset URL from a string or image-like object.
 * Kept for backwards compatibility.
 * @param v - The value to resolve (string or object).
 */
export function resolveAssetUrl(v: any): string | null {
  return getImagePathOrNull(v);
}

/**
 * Extracts an image path from a field.
 * Kept for backwards compatibility.
 * @param field - The field to extract from.
 */
export function pickImageString(field: any): string | null {
  return getImagePathOrNull(field);
}

/**
 * Sanitizes values for UI display.
 * @param v - The value to sanitize.
 * @returns A trimmed string, combined array string, or empty string on failure.
 */
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
 * Parses a date input into a Date object.
 * @param input - The input to parse (string, number, or Date).
 * @returns A valid Date object or null if parsing fails.
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
 * Parses a date input into a timestamp.
 * @param input - The input to parse.
 * @returns The timestamp in milliseconds or NaN.
 */
export function parseDateToTs(input: any): number {
  const d = parseSafeDate(input);
  return d ? d.getTime() : NaN;
}

/**
 * Checks if a date represents a sentinel end date (e.g., "Present").
 * @param input - The date input to check.
 * @returns True if the year is >= 9999.
 */
export function isSentinelEnd(input: any): boolean {
  const d = parseSafeDate(input);
  if (!d) return false;
  return d.getFullYear() >= 9999;
}

/**
 * Formats a Date object into a "Month YYYY" string.
 * @param d - The Date object to format.
 */
export function formatMonthYear(d: Date): string {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

/**
 * Determines which image sizes to generate based on the filename pattern.
 * @param filename - The image filename.
 * @returns An array of widths to generate.
 */
export function getImageSizesByType(filename: string): number[] {
  const basename = filename.toLowerCase();
  
  if (basename.includes("thumbnail_")) {
    // Thumbnails: 400w, 800w
    return [400, 800];
  } else if (basename.includes("cover_")) {
    // Cover images: 800w, 1200w, 1600w
    return [800, 1200, 1600];
  } else if (basename.includes("final_")) {
    // Final images: 800w, 1200w
    return [800, 1200];
  }
  
  return [];
}

/**
 * Generates responsive image paths and sizes from a base path.
 * @param basePath - The base path of the image.
 * @param sizes - Optional explicit sizes to generate.
 * @returns An object containing the base path and a map of sizes to paths, or null if invalid.
 */
export function getResponsiveImagePaths(
  basePath: string | null,
  sizes: number[] | null = null
): { base: string; sizes: Record<string, string> } | null {
  if (!basePath) return null;
  
  // If sizes not provided, detect from filename
  const imageSizes = sizes ?? getImageSizesByType(basePath);
  if (imageSizes.length === 0) return { base: basePath, sizes: {} };
  
  // Extract extension and base name
  const extMatch = basePath.match(/\.(png|jpg|jpeg|webp|gif)$/i);
  const ext = extMatch?.[0] || '';
  const baseWithoutExt = basePath.replace(ext, '');
  
  const sizeMap: Record<string, string> = {};
  imageSizes.forEach(size => {
    sizeMap[`${size}w`] = `${baseWithoutExt}-${size}w${ext}`;
  });
  
  return {
    base: basePath,
    sizes: sizeMap
  };
}

/**
 * Generates a srcset string for responsive images.
 * @param basePath - The base path of the image.
 * @param sizes - Optional explicit sizes.
 * @returns A srcset string or empty string.
 */
export function generateSrcSet(basePath: string | null, sizes: number[] | null = null): string {
  if (!basePath) return '';
  
  // Skip GIF files - they typically don't have responsive variants
  if (basePath.toLowerCase().endsWith('.gif')) return '';
  
  const paths = getResponsiveImagePaths(basePath, sizes);
  if (!paths || Object.keys(paths.sizes).length === 0) return '';
  
  return Object.entries(paths.sizes)
    .map(([size, path]) => `${path} ${size}`)
    .join(', ');
}
