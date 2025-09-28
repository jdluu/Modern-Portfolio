/**
 * Project card types — flattened.
 *
 * ProjectCard is the top-level listing/document shape returned by loaders
 * (after flattening) and used directly by templates. ProjectCardProps is
 * intentionally preserved as a narrow UI prop shape for the ProjectCard component.
 *
 * Thumbnail is modeled as a flexible union to match Cosmic/Tina payloads:
 * string | { url?: string | null } — consumers should use the project's image
 * resolver (resolveAssetUrl/pickImageString) to obtain a canonical URL.
 */
export interface ProjectCardProps {
  title: string;
  intro: string;
  url: string;
  thumbnail: string;
}

export interface ProjectCard {
  title: string;
  slug: string;
  description?: string | null;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  thumbnail?: string | { url?: string | null } | null;
  content?: string | null;
  programming_languages?: string[] | null;
  domains?: string[] | null;
}
