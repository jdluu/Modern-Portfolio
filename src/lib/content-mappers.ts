import type { CollectionEntry } from "astro:content";
import type { ExperienceCard } from "@app-types/experience-card";
import type { ProjectCard } from "@app-types/project-card";

/**
 * Maps a collection entry from the 'experiences' collection to the ExperienceCard UI interface.
 * Flattens nested content properties for easier consumption by card components.
 *
 * @param entry - The raw collection entry from Astro's content layer.
 * @returns A flattened ExperienceCard object suitable for UI rendering.
 */
export function mapExperienceToCard(
  entry: CollectionEntry<"experiences">,
): ExperienceCard {
  const d = entry.data;
  return {
    title: d.title,
    slug: entry.id,
    company: d.company?.name ?? null,
    date: (d.date as string) ?? d.logistics?.duration ?? null,
    startDate:
      (d.startDate as string) ?? (d.logistics?.startDate as string) ?? null,
    endDate: (d.endDate as string) ?? (d.logistics?.endDate as string) ?? null,
    thumbnail: d.thumbnail ?? d.company?.image ?? null,
    summary: d.summary ?? null,
  };
}

/**
 * Maps a collection entry from the 'projects' collection to the ProjectCard UI interface.
 * Standardizes field names and handles fallback values for descriptions and thumbnails.
 *
 * @param entry - The raw collection entry from Astro's content layer.
 * @returns A standardized ProjectCard object for consistent grid display.
 */
export function mapProjectToCard(
  entry: CollectionEntry<"projects">,
): ProjectCard {
  const d = entry.data;
  return {
    title: d.title,
    slug: entry.id,
    description: d.description ?? d.summary ?? null,
    date: (d.date as string) ?? null,
    startDate: (d.startDate as string) ?? null,
    endDate: (d.endDate as string) ?? null,
    thumbnail: d.thumbnail ?? d.cover ?? null,
    programming_languages: d.programming_languages ?? null,
    domains: d.domains ?? null,
  };
}
