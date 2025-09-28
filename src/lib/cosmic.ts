import { createBucketClient } from "@cosmicjs/sdk";
import {
  getCachedOrFetch,
  clearCache as clearCacheInternal,
  clearCacheEntry as clearCacheEntryInternal,
} from "./cache";
import type { Project } from "../types/project";
import type { ProjectCard as ProjectCardType } from "../types/project-card";

const cosmic = createBucketClient({
  bucketSlug: import.meta.env.COSMIC_BUCKET_SLUG,
  readKey: import.meta.env.COSMIC_READ_KEY,
});

// Raw Cosmic object shape is dynamic; we flatten `.metadata` into top-level fields
// to provide a consistent, typed shape to callers.
export interface ProjectCard {
  id: string;
  title: string;
  slug: string;
  // Flattened optional fields commonly present in project card metadata
  description?: string | null;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  thumbnail?: string | { url?: string | null } | null;
  content?: string | null;
  programming_languages?: string[] | null;
  domains?: string[] | null;
  // Include any other arbitrary metadata fields
  [x: string]: any;
}

// Lightweight caching is provided by ./cache.ts (getCachedOrFetch, DEFAULT_TTL_MS).
//
// Small helpers to centralize Cosmic SDK calls and error handling.
// - fetchObjects: returns a list of raw objects for a given type and props, or [] on error.
// - fetchObjectBySlug: returns a single raw object by slug or null on error.
async function fetchObjects<T>(
  type: string,
  props = "slug,title,metadata",
): Promise<T[]> {
  try {
    const data = await cosmic.objects.find({ type }).props(props).depth(1);
    return data.objects;
  } catch (error) {
    console.error(`Error fetching objects for type="${type}":`, error);
    return [];
  }
}

async function fetchObjectBySlug<T>(
  type: string,
  slug: string,
  props = "title,metadata",
): Promise<T | null> {
  try {
    const data = await cosmic.objects
      .findOne({ type, slug })
      .props(props)
      .depth(1);
    return data ?? null;
  } catch (error) {
    console.error(
      `Error fetching object by slug="${slug}" type="${type}":`,
      error,
    );
    return null;
  }
}

// Helper: flatten Cosmic object's metadata into top-level fields
function flattenCosmicObject(obj: any) {
  if (!obj) return null;
  const md = obj.metadata ?? {};
  // prefer id/title/slug from root, then spread metadata (metadata fields may include nested objects)
  const flattened = {
    id: obj.id ?? obj._id ?? undefined,
    title: obj.title ?? undefined,
    slug: obj.slug ?? undefined,
    ...md,
  };
  return flattened;
}

// Return All Project Card Objects (flattened)
export async function getAllProjectCards(): Promise<ProjectCard[]> {
  return getCachedOrFetch("projectcards", async () => {
    const raw = await fetchObjects<any>("projectcards", "slug,title,metadata");
    return raw.map(flattenCosmicObject).filter(Boolean) as ProjectCard[];
  });
}

// Return All Project Objects (flattened) — used by project pages and static paths
export async function getAllProjects(): Promise<Project[]> {
  return getCachedOrFetch("projects", async () => {
    const raw = await fetchObjects<any>("projects", "slug,title,metadata");
    return raw.map(flattenCosmicObject).filter(Boolean) as Project[];
  });
}

// Return All Project Slugs
export async function getAllProjectSlugs(): Promise<{ slug: string }[]> {
  return getCachedOrFetch("project-slugs", () =>
    fetchObjects<{ slug: string }>("projects", "slug"),
  );
}

// Get Project by Slug (flattened)
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return getCachedOrFetch(`project-${slug}`, async () => {
    const raw = await fetchObjectBySlug<any>(
      "projects",
      slug,
      "title,metadata",
    );
    return flattenCosmicObject(raw) as Project | null;
  });
}

// Clear cache function (delegates to shared cache)
export function clearCache(): void {
  clearCacheInternal();
}

// Clear specific cache entry (delegates to shared cache)
export function clearCacheEntry(key: string): void {
  clearCacheEntryInternal(key);
}

export { cosmic };
