// Type definitions for project pages.
// Mirrors the frontmatter shape used by src/content/projects/*.md
// Exported for reuse across the codebase.

export interface Metadata {
  date?: string | null;
  summary?: string | null;
  role?: string | null;
  technologies?: string[] | null;
  tools?: string[] | null;
  cover?: string | null;
  final?: string | null;
  problem?: string | null;
  solution?: string | null;
  process?: string[] | null;
  impact?: string[] | null;
  reflection?: string[] | null;
  links?: {
    live?: string | null;
    source?: string | null;
  } | null;
}

export interface PageProps {
  title: string;
  metadata?: Metadata | null;
}
