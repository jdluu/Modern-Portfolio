/**
 * Project card types.
 * Mirrors the props used by src/components/ui/ProjectCard.astro
 *
 * The UI component expects all props to be strings (no null/undefined),
 * so the interface reflects that to avoid TypeScript narrowing issues
 * when passing values directly to the Astro Image component.
 */
export interface ProjectCardProps {
  title: string;
  intro: string;
  url: string;
  thumbnail: string;
}