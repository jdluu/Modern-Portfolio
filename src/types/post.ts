// Type definitions for blog posts.
// Mirrors the interfaces defined in src/pages/posts/[slug].astro
// Exported for reuse across the codebase.

export interface Link {
  label: string;
  url: string;
}

export interface PostProps {
  title: string;
  date: string | null;
  content: string;
  links: Link[];
  hero: string | null;
}