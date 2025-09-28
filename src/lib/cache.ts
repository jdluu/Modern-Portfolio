// Lightweight in-memory cache with TTL suitable for build/runtime usage.
export const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key) as CacheEntry<T> | undefined;

  if (existing && now - existing.timestamp < ttlMs) {
    return existing.data;
  }

  try {
    const data = await fetcher();
    cache.set(key, { data, timestamp: now });
    return data;
  } catch (err) {
    // If fetching fails but we have stale data, return it rather than throwing.
    if (existing) return existing.data;
    throw err;
  }
}

export function clearCache(): void {
  cache.clear();
}

export function clearCacheEntry(key: string): void {
  cache.delete(key);
}
