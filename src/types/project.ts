// Type definitions for project pages.
// Mirrors the frontmatter shape used by src/content/projects/*.md
// Exported for reuse across the codebase.

/**
 * Project
 * - Flattened top-level shape for project pages (previously 'metadata').
 * - Includes nested sub-objects where the templates expect them (home, logistics, work, process, prototype, final, reflection, source).
 * - Fields are optional to remain resilient to CMS/frontmatter variations.
 */
export interface Project {
  id?: string;
  slug?: string;
  title?: string;
  description?: string | null;
  date?: string | null;
  summary?: string | null;

  // Home/hero section
  home?: {
    image?: { imgix_url?: string; url?: string } | null;
    imagealt?: string | null;
  } | null;

  // Logistics / timeline / tech summary
  logistics?: {
    date?: string | null;
    techtitle?: string | null;
    technologies?: string | null;
    tools?: string | null;
  } | null;

  // Work / responsibilities
  work?: {
    role?: string | null;
    responsibilities?: { duties?: string | null }[] | null;
    achievements?: { points?: string | null }[] | null;
  } | null;

  // Background / problem / solution
  background?: { description?: string | null } | null;
  problem?: { description?: string | null } | string | null;
  solution?:
    | { title?: string | null; description?: string | null }
    | string
    | null;

  // Process (may include title and a plan array)
  process?: {
    title?: string | null;
    plan?: { steps?: string | null }[] | null;
  } | null;

  // Prototype / images used in process
  prototype?: {
    image?: { imgix_url?: string; url?: string } | null;
    imagealt?: string | null;
  } | null;

  // Final product
  final?: {
    description?: string | null;
    image?: { imgix_url?: string; url?: string } | null;
    imagealt?: string | null;
  } | null;

  // Reflection / points
  reflection?:
    | {
        points?: { point?: string | null }[] | null;
      }
    | string[]
    | null;

  // Source / external links used by the page
  source?: {
    link?: string | null;
    title?: string | null;
  } | null;

  // Fallback for any additional fields returned from the CMS
  [x: string]: any;
}

// Backwards-compatible alias used by pages components
export type PageProps = Project;
