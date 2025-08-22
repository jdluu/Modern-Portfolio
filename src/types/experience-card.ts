/**
 * Experience card (listing) types.
 * Mirrors the Tina collection "experiencecard" (tina/config.ts).
 *
 * The listing shape is intentionally small: title and a metadata object
 * with only the fields defined in the Tina schema for experiencecard.metadata.
 */

export interface ExperienceCardMetadata {
  company?: string | null;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  thumbnail?: string | null;
  summary?: string | null;
}

export interface ExperienceCardItem {
  title: string;
  slug: string;
  metadata: ExperienceCardMetadata;
}