/**
 * Type definitions for project pages.
 * Mirrors the frontmatter shape used by src/content/projects/*.md
 */

import type { ImageMetadata } from "astro";

/**
 * Project
 * - Flattened top-level shape for project pages.
 * - Fields are optional to remain resilient to CMS variations.
 */
export interface Project {
  title: string;
  slug?: string;
  description?: string;
  date?: string | Date;
  summary?: string;
  role?: string;
  technologies?: string[] | string; // Handle both array (schema) and string (legacy/UI sanitization)
  tools?: string[] | string;
  cover?: ImageMetadata | string | null;
  final?: ImageMetadata | string | null;
  background?: string;
  solution?: string;
  process?: string;
  impact?: string;
  reflection?: string;
  links?: {
    live?: string;
    source?: string;
  };
  // Allow for loose typing from the content collection if needed, but stricter above is better
  [x: string]: any;
}
