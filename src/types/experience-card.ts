/**
 * Experience card type (flattened).
 * Mirrors the "experiencecard" collection.
 */
export interface ExperienceCard {
  title: string;
  slug: string;
  company?: string | null;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  thumbnail?: string | null;
  summary?: string | null;
}
