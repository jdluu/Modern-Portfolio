import type { ImageMetadata } from "astro";

/**
 * Project card types — flattened.
 *
 * ProjectCard is the top-level shape used by templates.
 *
 * Thumbnail is a flexible union to match CMS payloads:
 * string | { url?: string | null }
 */
export interface ProjectCard {
  title: string;
  slug: string;
  description?: string | null;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  thumbnail?: ImageMetadata | null;
  content?: string | null;
  programming_languages?: string[] | null;
  domains?: string[] | null;
}
