/**
 * Experience card type (flattened).
 * Mirrors the "experiencecard" collection.
 */
import type { ImageMetadata } from "astro";

export interface ExperienceCard {
  title: string;
  slug: string;
  company?: string | null;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  thumbnail?: ImageMetadata | null;
  summary?: string | null;
}
