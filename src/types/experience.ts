
/**
 * Full Experience document shape used on detail pages.
 * Mirrors the Tina schema for the `experience` collection but keeps fields optional
 * to remain resilient to schema changes.
 */
export interface Experience {
  title: string;
  draft?: boolean;
  company?: {
    name?: string;
    image?: string | { url?: string; imgix_url?: string } | null;
    imagealt?: string | null;
  } | null;
  logistics?: {
    role?: string;
    duration?: string;
    startDate?: string;
    endDate?: string;
  } | null;
  technologies?: {
    tools?: string;
    skills?: string;
  } | null;
  work?: {
    responsibilities?: { duties?: string }[];
    achievements?: { points?: string }[];
  } | null;
  showcase?: {
    link?: string | null;
    description?: string | null;
  } | null;
  card?: {
    date?: string;
    thumbnail?: string;
    summary?: string;
  } | null;
}