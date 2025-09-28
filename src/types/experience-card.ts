/**
 * Experience card (listing) type — flattened.
 * Previously this was wrapped as { title, slug, metadata: { ... } }.
 * Now the top-level object exposes the metadata fields directly for easier consumption.
 *
 * Mirrors the Tina collection "experiencecard" (tina/config.ts).
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
