// Tina API helpers for Experiences + Posts
import { client } from '../../tina/__generated__/client';

import type { ExperienceCardItem } from "../types/experience-card";
import type { Experience } from "../types/experience";
import type { PostProps } from "../types/post";
import { parseDateToTs, isSentinelEnd, pickImageString } from "./utils";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  try {
    const data = await fetcher();
    cache.set(key, { data, timestamp: now });
    return data;
  } catch (err) {
    if (cached) return cached.data as T;
    throw err;
  }
}

const getComparableTs = (node: any): number => {
  const meta = node?.metadata ?? {};
  const endStr = meta?.endDate ?? meta?.date ?? '';
  if (isSentinelEnd(endStr)) return Infinity;
  const endTs = parseDateToTs(endStr);
  if (!Number.isNaN(endTs)) return endTs;
  const startTs = parseDateToTs(meta?.startDate ?? '');
  if (!Number.isNaN(startTs)) return startTs;
  return 0;
};

/**
 * Fetch experience card list from Tina and return normalized items.
 * - Tina-only (no DEV filesystem fallback)
 * - Sorts by computed timestamp (endDate/date > startDate) with sentinel (9999) treated as Present
 */
export async function fetchExperienceCards(options?: { first?: number; sort?: string; }): Promise<ExperienceCardItem[]> {
  const first = options?.first ?? 200;
  return getCachedOrFetch(`experiencecards:${first}:${options?.sort ?? ''}`, async () => {
    try {
      const resp = await client.queries.experiencecardConnection({ first, sort: options?.sort });
      const edges = resp?.data?.experiencecardConnection?.edges ?? [];
      const nodes = Array.isArray(edges) ? edges.map((e: any) => e?.node).filter((n: any) => n != null) : [];
      const sorted = [...nodes].sort((a: any, b: any) => {
        const ta = getComparableTs(a);
        const tb = getComparableTs(b);
        if (ta === tb) return 0;
        if (tb === Infinity && ta !== Infinity) return 1;
        if (ta === Infinity && tb !== Infinity) return -1;
        return tb - ta;
      });

      const experiences = sorted.map((node: any) => {
        const metadata = (node?.metadata ?? {}) as any;
        const filename = node?._sys?.filename ?? '';
        const slug = String(filename).replace(/\.mdx?$/i, '').toLowerCase();
        return {
          title: node?.title ?? 'Untitled',
          slug,
          metadata,
          thumbnail: metadata?.thumbnail ?? '',
          description: metadata?.summary ?? '',
          date: metadata?.date ?? '',
        } as ExperienceCardItem;
      });

      return experiences;
    } catch (error) {
      console.error('Error fetching experience cards from Tina:', error);
      return [];
    }
  });
}

/**
 * Fetch full 'experience' documents from Tina and return normalized Experience objects.
 * - Uses the generated 'experienceConnection' query.
 * - Returns the raw Tina node in the result for callers that need full access.
 */
export async function fetchExperiences(options?: { first?: number; sort?: string; filter?: any; }): Promise<Experience[]> {
  const first = options?.first ?? 200;
  return getCachedOrFetch(`experiences:${first}:${options?.sort ?? ''}`, async () => {
    try {
      const resp = await client.queries.experienceConnection({ first, sort: options?.sort, filter: options?.filter });
      const edges = resp?.data?.experienceConnection?.edges ?? [];
      const nodes = Array.isArray(edges) ? edges.map((e: any) => e?.node).filter((n: any) => n != null) : [];

      // Map Tina 'experience' nodes into our Experience type (keeps raw node accessible)
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
          _values: node?._values,
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

export async function fetchExperienceBySlug(slug: string): Promise<Experience | null> {
  if (!slug) return null;
  const normalized = String(slug).toLowerCase();
  // Leverage the cached fetchExperiences for robustness and to reuse cache
  const all = await fetchExperiences({ first: 500 });
  const found = all.find((exp: any) => {
    const filename = exp?._sys?.filename ?? '';
    const s = String(filename).replace(/\.mdx?$/i, '').toLowerCase();
    return s === normalized;
  });
  return found ?? null;
}

/**
 * Fetch posts from Tina and normalize fields.
 * - Tina-only (no DEV filesystem fallback)
 * - Returns array of normalized post objects (includes slug, draft flag and raw node)
 */
export async function fetchPosts(options?: { first?: number; sort?: string; filter?: any; }): Promise<(PostProps & { draft?: boolean; _sys?: any; raw?: any; slug?: string })[]> {
  const first = options?.first ?? 200;
  return getCachedOrFetch(`posts:${first}:${options?.sort ?? ''}`, async () => {
    try {
      const resp = await client.queries.postConnection({ first, sort: options?.sort, filter: options?.filter });
      const edges = resp?.data?.postConnection?.edges ?? [];
      const nodes = Array.isArray(edges) ? edges.map((e: any) => e?.node).filter((n: any) => n != null) : [];

      const posts = nodes.map((node: any) => {
        const filename = node?._sys?.filename ?? '';
        const slug = String(filename).replace(/\.mdx?$/i, '').toLowerCase();
        return {
          title: node?.title ?? 'Untitled',
          date: node?.date ?? null,
          content: node?.content ?? '',
          links: Array.isArray(node?.links) ? node.links : [],
          hero: pickImageString(node?.hero) ?? null,
          draft: Boolean(node?.draft),
          _sys: node?._sys,
          raw: node,
          slug,
        };
      });

      return posts;
    } catch (err) {
      console.error('Error fetching posts from Tina:', err);
      return [];
    }
  });
}

export async function fetchPostBySlug(slug: string): Promise<(PostProps & { draft?: boolean; _sys?: any; raw?: any; slug?: string }) | null> {
  if (!slug) return null;
  const normalized = String(slug).toLowerCase();
  const all = await fetchPosts({ first: 500 });
  const found = all.find((p: any) => {
    const filename = p?._sys?.filename ?? '';
    const s = String(filename).replace(/\.mdx?$/i, '').toLowerCase();
    return s === normalized || p.slug === normalized;
  });
  return found ?? null;
}

export function clearTinaCache() {
  cache.clear();
}