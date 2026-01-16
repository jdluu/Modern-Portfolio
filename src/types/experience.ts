import type { ImageMetadata } from "astro";

/**
 * Full Experience document shape used on detail pages.
 * Mirrors the schema for the `experience` collection.
 */
export interface Experience {
  title: string;
  draft?: boolean;
  company?: {
    name?: string;
    image?: ImageMetadata | null;
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
  // Flattened fields
  startDate?: string;
  endDate?: string;
  thumbnail?: ImageMetadata | null;
  summary?: string;
}
