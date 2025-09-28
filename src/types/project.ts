// Type definitions for project pages.
// Mirrors the interfaces defined in src/pages/projects/[slug].astro
// Exported for reuse across the codebase.

export interface Metadata {
  description?: string | null;
  home?: {
    image?: {
      url?: string | null;
      imgix_url?: string | null;
    } | null;
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
  } | null;
  background?: {
    description?: string | null;
  } | null;
  problem?: {
    description?: string | null;
  } | null;
  solution?: {
    title?: string | null;
    description?: string | null;
  } | null;
  process?: {
    title?: string | null;
    plan?: { steps?: string | null }[] | null;
  } | null;
  prototype?: {
    image?: {
      url?: string | null;
      imgix_url?: string | null;
    } | null;
    imagealt?: string | null;
  } | null;
  final?: {
    description?: string | null;
    image?: {
      url?: string | null;
      imgix_url?: string | null;
    } | null;
    imagealt?: string | null;
  } | null;
  reflection?: {
    points?: { point?: string | null }[] | null;
  } | null;
  source?: {
    title?: string | null;
    link?: string | null;
  } | null;
}

export interface PageProps {
  title: string;
  metadata?: Metadata | null;
}
