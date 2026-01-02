/**
 * Type definitions for project pages.
 * Mirrors the frontmatter shape used by src/content/projects/*.md
 */

/**
 * Project
 * - Flattened top-level shape for project pages.
 * - Fields are optional to remain resilient to CMS variations.
 */
export interface Project {
  id?: string;
  slug?: string;
  title?: string;
  description?: string | null;
  date?: string | null;
  summary?: string | null;

  home?: {
    image?: { imgix_url?: string; url?: string } | null;
    imagealt?: string | null;
  } | null;

  logistics?: {
    date?: string | null;
    techtitle?: string | null;
    technologies?: string | null;
    tools?: string | null;
  } | null;

  work?: {
    role?: string | null;
    responsibilities?: { duties?: string | null }[] | null;
    achievements?: { points?: string | null }[] | null;
  } | null;

  background?: { description?: string | null } | string | null;
  solution?:
    | { title?: string | null; description?: string | null }
    | string
    | null;

  process?: {
    title?: string | null;
    plan?: { steps?: string | null }[] | null;
  } | null;

  prototype?: {
    image?: { imgix_url?: string; url?: string } | null;
    imagealt?: string | null;
  } | null;

  final?: {
    description?: string | null;
    image?: { imgix_url?: string; url?: string } | null;
    imagealt?: string | null;
  } | null;

  reflection?:
    | {
        points?: { point?: string | null }[] | null;
      }
    | string[]
    | null;

  source?: {
    link?: string | null;
    title?: string | null;
  } | null;

  // Fallback for any additional fields returned from the CMS
  [x: string]: any;
}

