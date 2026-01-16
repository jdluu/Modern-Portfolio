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
  startDate?: string | Date;
  endDate?: string | Date;
  summary?: string;
  role?: string;
  technologies?: string[] | string;
  tools?: string[] | string;
  cover?: ImageMetadata | string | null;
  thumbnail?: ImageMetadata | string | null;
  final?: ImageMetadata | string | null;
  programming_languages?: string[];
  domains?: string[];
  background?: string;
  solution?: string;
  process?: string;
  impact?: string;
  reflection?: string;
  links?: {
    live?: string;
    source?: string;
  };
}
