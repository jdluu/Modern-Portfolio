// Tina API helpers for Experiences + Posts
//
// Rewritten to use the auto-generated Tina client correctly for build-time
// data fetching. The core goals:
// - Use postConnection(...) for list queries (with a reasonable default limit)
// - Provide a single-document lookup via client.queries.post({ relativePath })
// - Normalize posts for the app (slug, date, tags, draft, hero, description)
// - Keep a small in-memory cache to avoid repeated work during builds
//
import { client } from '../../tina/__generated__/client';

import type { ExperienceCardItem } from "../types/experience-card";
import type { Experience } from "../types/experience";
import type { PostProps } from "../types/post";
import { pickImageString } from "./utils";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedOrFetch<T>(_key: string, fetcher: () => Promise<T>): Promise<T> {
  // Disable caching entirely to avoid any chance of stale/empty data during dev/build.
  // If needed later, re-enable with environment-aware TTL logic.
  return await fetcher();
}

/**
 * Experience card helpers (unchanged behavior)
 */
export async function getExperienceCardNodes(options?: { first?: number }): Promise<any[]> {
  const first = options?.first ?? 200;
  return getCachedOrFetch(`experiencecards:nodes:${first}`, async () => {
    const resp = await client.queries.experiencecardConnection({ first });
    const edges = resp?.data?.experiencecardConnection?.edges ?? [];
    const nodes = Array.isArray(edges) ? edges.map((e: any) => e?.node).filter((n: any) => n != null) : [];
    return nodes;
  });
}

export function mapExperienceCardNodeToItem(node: any): ExperienceCardItem {
  const metadata = (node?.metadata ?? {}) as any;
  // Prefer relativePath for a stable slug, fall back to filename if needed.
  const rel = node?._sys?.relativePath ?? node?._sys?.filename ?? '';
  const filename = String(rel);
  const basename = filename.split(/[\\/]/).pop() ?? filename;
  const slug = String(basename).replace(/\.[^/.]+$/i, '').toLowerCase();
  return {
    title: node?.title ?? 'Untitled',
    slug,
    metadata,
  } as ExperienceCardItem;
}

export async function listExperienceCardItems(options?: { first?: number }): Promise<ExperienceCardItem[]> {
  const nodes = await getExperienceCardNodes({ first: options?.first });
  return nodes.map(mapExperienceCardNodeToItem);
}

/**
 * Experience collection helper (unchanged behavior)
 */
export async function fetchExperiences(options?: { first?: number; sort?: string; filter?: any; }): Promise<Experience[]> {
  // NOTE: This function performs a list query and is available for debugging,
  // but production pages should prefer single-document queries or the slug-only
  // list helper below to avoid fetching large document graphs during builds.
  const first = options?.first ?? 200;
  return getCachedOrFetch(`experiences:${first}:${options?.sort ?? ''}`, async () => {
    try {
      const resp = await client.queries.experienceConnection({ first, sort: options?.sort, filter: options?.filter });
      const edges = resp?.data?.experienceConnection?.edges ?? [];
      const nodes = Array.isArray(edges) ? edges.map((e: any) => e?.node).filter((n: any) => n != null) : [];

      const experiences = nodes.map((node: any) => {
        return {
          title: node?.title ?? 'Untitled',
          draft: node?.draft ?? false,
          company: node?.company ?? undefined,
          logistics: node?.logistics ?? undefined,
          technologies: node?.technologies ?? undefined,
          work: node?.work ?? undefined,
          showcase: node?.showcase ?? undefined,
          card: node?.card ?? undefined,
          _sys: node?._sys,
          raw: node,
        } as Experience;
      });

      return experiences;
    } catch (err) {
      console.error('Error fetching experiences from Tina:', err);
      return [];
    }
  });
}

export async function listExperienceSlugs(options?: { first?: number }): Promise<string[]> {
  const first = options?.first ?? 500;
  try {
    const resp = await client.queries.experienceConnection({ first });
    const edges = resp?.data?.experienceConnection?.edges ?? [];
    const nodes = Array.isArray(edges) ? edges.map((e: any) => e?.node).filter((n: any) => n != null) : [];

    const out: string[] = [];
    for (const node of nodes) {
      // Exclude drafts from the public slug list
      if (node?.draft === true) continue;
      const rel = node?._sys?.relativePath ?? node?._sys?.filename ?? '';
      const filename = String(rel);
      const basename = filename.split(/[\\/]/).pop() ?? filename;
      const slug = String(basename).replace(/\.[^/.]+$/i, '').toLowerCase();
      if (slug) out.push(slug);
    }
    return out;
  } catch (err) {
    console.error('Error listing experience slugs from Tina:', err);
    return [];
  }
}

/**
 * Fetch a single experience document by slug using Tina's single-document query.
 * Tries common filename extensions (.md, .mdx) and maps the returned node to the
 * Experience shape expected by the app. Does NOT scan all experiences as a fallback.
 */
export async function fetchExperienceBySlug(slug: string): Promise<Experience | null> {
  if (!slug) return null;
  const normalized = String(slug).toLowerCase();

  const tryPaths = [`${normalized}.md`, `${normalized}.mdx`];
  for (const p of tryPaths) {
    try {
      const res = await client.queries.experience({ relativePath: p }).catch(() => null);
      const node = res?.data?.experience ?? null;
      if (node) {
        return {
          title: node?.title ?? 'Untitled',
          draft: node?.draft ?? false,
          company: node?.company ?? undefined,
          logistics: node?.logistics ?? undefined,
          technologies: node?.technologies ?? undefined,
          work: node?.work ?? undefined,
          showcase: node?.showcase ?? undefined,
          card: node?.card ?? undefined,
          _sys: node?._sys,
          raw: node,
        } as Experience;
      }
    } catch (err) {
      // continue to next extension
    }
  }

  // Not found via single-document query
  return null;
}

/**
 * Posts helpers (rewritten to align with Tina docs and project requirements)
 *
 * - fetchPosts: use postConnection with a sensible default (first: 50)
 * - Always normalize fields we rely on in the UI
 * - Ensure the returned list is sorted by date descending (newest first)
 */
export async function fetchPosts(options?: { first?: number; sort?: string; filter?: any; }): Promise<(PostProps & { description?: string; tags?: string[]; draft?: boolean; _sys?: any; raw?: any; slug?: string })[]> {
  const first = options?.first ?? 50;
  const sort = options?.sort ?? "date:desc";
  const cacheKey = `posts:${first}:${sort}:${JSON.stringify(options?.filter ?? null)}`;
  return getCachedOrFetch(cacheKey, async () => {
    try {
      // Use the generated Tina client for all environments (cloud or local configured endpoint).
      const resp = await client.queries.postConnection({ first, sort, filter: options?.filter });
      if (resp?.errors && Array.isArray(resp.errors) && resp.errors.length > 0) {
        console.error("[Tina] postConnection errors:", resp.errors);
      }
      const edges = resp?.data?.postConnection?.edges ?? [];
      const nodes = Array.isArray(edges) ? edges.map((e: any) => e?.node).filter((n: any) => n != null) : [];

      const posts = nodes.map((node: any) => {
        // Prefer relativePath for stable slugs; fall back to filename if necessary.
        const rel = node?._sys?.relativePath ?? node?._sys?.filename ?? '';
        const full = String(rel);
        const basename = full.split(/[\\/]/).pop() ?? full;
        const slug = String(basename).replace(/\.[^/.]+$/i, '').toLowerCase();

        return {
          title: node?.title ?? 'Untitled',
          date: node?.date ?? null,
          content: node?.content ?? '',
          description: node?.description ?? '',
          tags: Array.isArray(node?.tags) ? node.tags.filter((t: any) => typeof t === "string") : [],
          links: Array.isArray(node?.links)
            ? node.links.filter((l: any) => l != null).map((l: any) => ({ label: l.label, url: l.url }))
            : [],
          hero: pickImageString(node?.hero) ?? null,
          draft: Boolean(node?.draft),
          _sys: node?._sys,
          raw: node,
          slug,
        } as PostProps & { description?: string; tags?: string[]; draft?: boolean; _sys?: any; raw?: any; slug?: string };
      });

      // Exclude drafts strictly (only remove when draft is true), then sort newest-first as a safety.
      const visible = posts.filter((p: any) => p?.draft !== true);
      visible.sort((a: any, b: any) => {
        const ta = a?.date ? Date.parse(a.date as string) : 0;
        const tb = b?.date ? Date.parse(b.date as string) : 0;
        return tb - ta;
      });

      return visible;
    } catch (err) {
      console.error('Error fetching posts from Tina:', err);
      return [];
    }
  });
}

/**
 * Attempt to fetch a single post by slug using the generated single-document query.
 * Tina's single-document queries expect a relativePath (filename), so we try common
 * extensions (.md, .mdx) first. If that fails we fall back to scanning the list.
 */
export async function fetchPostBySlug(slug: string): Promise<(PostProps & { description?: string; tags?: string[]; draft?: boolean; _sys?: any; raw?: any; slug?: string }) | null> {
  if (!slug) return null;
  const normalized = String(slug).toLowerCase();

  // Try .md then .mdx via single-document query
  const tryPaths = [`${normalized}.md`, `${normalized}.mdx`];
  for (const p of tryPaths) {
    try {
      // client.queries.post returns { data: { post: { ... } } } shape
      const res = await client.queries.post({ relativePath: p }).catch(() => null);
      const node = res?.data?.post ?? null;
      if (node) {
        const rel = node?._sys?.relativePath ?? node?._sys?.filename ?? p;
        const filename = String(rel);
        const basename = filename.split(/[\\/]/).pop() ?? filename;
        const outSlug = String(basename).replace(/\.[^/.]+$/i, '').toLowerCase();
        return {
          title: node?.title ?? 'Untitled',
          date: node?.date ?? null,
          content: node?.content ?? '',
          description: node?.description ?? '',
          tags: Array.isArray(node?.tags) ? node.tags.filter((t: any) => typeof t === 'string') : [],
          links: Array.isArray(node?.links)
            ? node.links.filter((l: any) => l != null).map((l: any) => ({ label: l.label, url: l.url }))
            : [],
          hero: pickImageString(node?.hero) ?? null,
          draft: Boolean(node?.draft),
          _sys: node?._sys,
          raw: node,
          slug: outSlug,
        };
      }
    } catch (err) {
      // ignore and continue to next attempt
    }
  }

  // Fallback: scan fetched posts (cached) for a match
  const all = await fetchPosts({ first: 500 });
  const found = all.find((p: any) => {
    const rel = p?._sys?.relativePath ?? p?._sys?.filename ?? '';
    const filename = String(rel);
    const basename = filename.split(/[\\/]/).pop() ?? filename;
    const s = String(basename).replace(/\.[^/.]+$/i, '').toLowerCase();
    return s === normalized || p.slug === normalized;
  });
  return found ?? null;
}

export function clearTinaCache() {
  cache.clear();
}