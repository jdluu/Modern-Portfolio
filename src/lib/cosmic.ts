import { createBucketClient } from "@cosmicjs/sdk";

const cosmic = createBucketClient({
	bucketSlug: import.meta.env.COSMIC_BUCKET_SLUG,
	readKey: import.meta.env.COSMIC_READ_KEY,
});

export interface ProjectCard {
	id: string;
	title: string;
	slug: string;
	metadata: {
		description: string;
		thumbnail: {
			url: string;
		};
		content?: string;
		programming_languages?: string[];
		domains?: string[];
	};
}

export interface ExperienceCard {
	id: string;
	title: string;
	slug: string;
	metadata: {
		description: string;
		thumbnail: {
			url: string;
		};
		content?: string;
		date: string;
	};
}

export interface BlogPost {
	id: string;
	title: string;
	slug: string;
	content: string;
	metadata: {
		description?: string;
		thumbnail?: {
			url: string;
		};
	};
}

// Cache for memoization
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

// Helper function to get cached data or fetch new data
async function getCachedOrFetch<T>(
	key: string,
	fetcher: () => Promise<T>
): Promise<T> {
	const cached = cache.get(key);
	const now = Date.now();

	if (cached && now - cached.timestamp < CACHE_TTL) {
		return cached.data as T;
	}

	try {
		const data = await fetcher();
		cache.set(key, { data, timestamp: now });
		return data;
	} catch (error) {
		// If there's an error and we have stale cache, return it
		if (cached) {
			return cached.data as T;
		}
		throw error;
	}
}

// Return All Project Card Objects
export async function getAllProjectCards(): Promise<ProjectCard[]> {
	return getCachedOrFetch("projectcards", async () => {
		try {
			const data = await cosmic.objects
				.find({
					type: "projectcards",
				})
				.props("slug,title,metadata")
				.depth(1);

			return data.objects;
		} catch (error) {
			console.error("Error fetching project cards:", error);
			return [];
		}
	});
}

// Return All Project Objects
export async function getAllProjects(): Promise<ProjectCard[]> {
	return getCachedOrFetch("projects", async () => {
		try {
			const data = await cosmic.objects
				.find({
					type: "projects",
				})
				.props("slug,title,metadata")
				.depth(1);

			return data.objects;
		} catch (error) {
			console.error("Error fetching projects:", error);
			return [];
		}
	});
}

// Return All Project Slugs
export async function getAllProjectSlugs(): Promise<{ slug: string }[]> {
	return getCachedOrFetch("project-slugs", async () => {
		try {
			const data = await cosmic.objects
				.find({
					type: "projects",
				})
				.props("slug")
				.depth(1);

			return data.objects;
		} catch (error) {
			console.error("Error fetching all project slugs:", error);
			return [];
		}
	});
}

// Get Project by Slug
export async function getProjectBySlug(
	slug: string
): Promise<ProjectCard | null> {
	return getCachedOrFetch(`project-${slug}`, async () => {
		try {
			const data = await cosmic.objects
				.findOne({
					type: "projects",
					slug,
				})
				.props("title,metadata")
				.depth(1);

			return data;
		} catch (error) {
			console.error("Error fetching project by slug:", error);
			return null;
		}
	});
}

// Return All Experience Card Objects
export async function getAllExperienceCards(): Promise<ExperienceCard[]> {
	return getCachedOrFetch("experiencecards", async () => {
		try {
			const data = await cosmic.objects
				.find({
					type: "experiencecards",
				})
				.props("slug,title,metadata")
				.depth(1);

			return data.objects;
		} catch (error) {
			console.error("Error fetching experience cards:", error);
			return [];
		}
	});
}

// Return All Experience Objects
export async function getAllExperiences(): Promise<ExperienceCard[]> {
	return getCachedOrFetch("experiences", async () => {
		try {
			const data = await cosmic.objects
				.find({
					type: "experiences",
				})
				.props("slug,title,metadata")
				.depth(1);

			return data.objects;
		} catch (error) {
			console.error("Error fetching experience:", error);
			return [];
		}
	});
}

// Return All Experience Slugs
export async function getAllExperienceSlugs(): Promise<{ slug: string }[]> {
	return getCachedOrFetch("experience-slugs", async () => {
		try {
			const data = await cosmic.objects
				.find({
					type: "experiences",
				})
				.props("slug")
				.depth(1);

			return data.objects;
		} catch (error) {
			console.error("Error fetching all experience slugs:", error);
			return [];
		}
	});
}

// Get Experience by Slug
export async function getExperienceBySlug(
	slug: string
): Promise<ExperienceCard | null> {
	return getCachedOrFetch(`experience-${slug}`, async () => {
		try {
			const data = await cosmic.objects
				.findOne({
					type: "experiences",
					slug,
				})
				.props("title,metadata")
				.depth(1);

			return data;
		} catch (error) {
			console.error("Error fetching experience by slug:", error);
			return null;
		}
	});
}

// Return All Post Objects
export async function getAllPosts(): Promise<BlogPost[]> {
	return getCachedOrFetch("posts", async () => {
		try {
			const data = await cosmic.objects
				.find({
					type: "posts",
				})
				.props("slug,title,content,metadata")
				.depth(1);

			return data.objects;
		} catch (error) {
			console.error("Error fetching posts:", error);
			return [];
		}
	});
}

// Return All Post Slugs
export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
	return getCachedOrFetch("post-slugs", async () => {
		try {
			const data = await cosmic.objects
				.find({
					type: "posts",
				})
				.props("slug")
				.depth(1);

			return data.objects;
		} catch (error) {
			console.error("Error fetching post slugs:", error);
			return [];
		}
	});
}

// Get Post by Slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
	return getCachedOrFetch(`post-${slug}`, async () => {
		try {
			const data = await cosmic.objects
				.findOne({
					type: "posts",
					slug,
				})
				.props("title,content,metadata")
				.depth(1);

			return data;
		} catch (error) {
			console.error("Error fetching post:", error);
			return null;
		}
	});
}

// Clear cache function (useful for manual cache invalidation if needed)
export function clearCache(): void {
	cache.clear();
}

// Clear specific cache entry
export function clearCacheEntry(key: string): void {
	cache.delete(key);
}

export { cosmic };
