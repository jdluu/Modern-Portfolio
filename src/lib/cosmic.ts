import { createBucketClient } from "@cosmicjs/sdk";
import { getCachedOrFetch, DEFAULT_TTL_MS, clearCache as clearCacheInternal, clearCacheEntry as clearCacheEntryInternal } from "./cache";
import type { Metadata } from "../types/project";
 
const cosmic = createBucketClient({
	bucketSlug: import.meta.env.COSMIC_BUCKET_SLUG,
	readKey: import.meta.env.COSMIC_READ_KEY,
});

export interface ProjectCard {
	id: string;
	title: string;
	slug: string;
	metadata: Partial<Metadata> & {
		description?: string;
		thumbnail?: { url?: string };
		content?: string;
		programming_languages?: string[];
		domains?: string[];
	};
}

// Lightweight caching is provided by ./cache.ts (getCachedOrFetch, DEFAULT_TTL_MS).
//
// Small helpers to centralize Cosmic SDK calls and error handling.
// - fetchObjects: returns a list of objects for a given type and props, or [] on error.
// - fetchObjectBySlug: returns a single object by slug or null on error.
async function fetchObjects<T>(type: string, props = "slug,title,metadata"): Promise<T[]> {
	try {
		const data = await cosmic.objects.find({ type }).props(props).depth(1);
		return data.objects;
	} catch (error) {
		console.error(`Error fetching objects for type="${type}":`, error);
		return [];
	}
}

async function fetchObjectBySlug<T>(type: string, slug: string, props = "title,metadata"): Promise<T | null> {
	try {
		const data = await cosmic.objects.findOne({ type, slug }).props(props).depth(1);
		return data ?? null;
	} catch (error) {
		console.error(`Error fetching object by slug="${slug}" type="${type}":`, error);
		return null;
	}
}

// Return All Project Card Objects
export async function getAllProjectCards(): Promise<ProjectCard[]> {
	return getCachedOrFetch("projectcards", () => fetchObjects<ProjectCard>("projectcards", "slug,title,metadata"));
}

// Return All Project Objects
export async function getAllProjects(): Promise<ProjectCard[]> {
	return getCachedOrFetch("projects", () => fetchObjects<ProjectCard>("projects", "slug,title,metadata"));
}

// Return All Project Slugs
export async function getAllProjectSlugs(): Promise<{ slug: string }[]> {
	return getCachedOrFetch("project-slugs", () => fetchObjects<{ slug: string }>("projects", "slug"));
}

// Get Project by Slug
export async function getProjectBySlug(
	slug: string
): Promise<ProjectCard | null> {
	return getCachedOrFetch(`project-${slug}`, () => fetchObjectBySlug<ProjectCard>("projects", slug, "title,metadata"));
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
