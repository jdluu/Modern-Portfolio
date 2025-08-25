/**
 * Client-only utilities for experience cards.
 * These are intended to run in the browser (Solid.js) for sorting and filtering
 * without additional API calls. Keep these pure so they can be used on the client.
 */

import type { ExperienceCardItem } from "../types/experience-card";
import { parseDateToTs, isSentinelEnd } from "./utils";

/**
 * Compute a comparable timestamp for ExperienceCardItem.
 * Priority: metadata.date (end/date) > metadata.endDate > metadata.startDate
 * Sentinel years (>= 9999) are treated as Infinity to represent "Present".
 */
export function getComparableTsFromItem(item: ExperienceCardItem): number {
  const meta = item?.metadata ?? {};
  const endStr = meta?.endDate ?? meta?.date ?? "";
  if (isSentinelEnd(endStr)) return Infinity;
  const endTs = parseDateToTs(endStr);
  if (!Number.isNaN(endTs)) return endTs;
  const startTs = parseDateToTs(meta?.startDate ?? "");
  if (!Number.isNaN(startTs)) return startTs;
  return 0;
}

/**
 * Sort experience cards in descending order by computed timestamp.
 * Items with "Present" (Infinity) will appear first.
 */
export function sortExperienceCardsByDateDesc(items: ExperienceCardItem[]): ExperienceCardItem[] {
  return [...items].sort((a, b) => {
    const ta = getComparableTsFromItem(a);
    const tb = getComparableTsFromItem(b);
    if (ta === tb) return 0;
    if (tb === Infinity && ta !== Infinity) return 1;
    if (ta === Infinity && tb !== Infinity) return -1;
    return tb - ta;
  });
}

/**
 * Simple filters commonly used by the ExperienceCardList component.
 */

export function filterByCompany(items: ExperienceCardItem[], company?: string): ExperienceCardItem[] {
  if (!company) return items;
  const needle = company.toLowerCase();
  return items.filter((it) => {
    const c = String(it?.metadata?.company ?? "").toLowerCase();
    return c.includes(needle);
  });
}

export function filterBySearch(items: ExperienceCardItem[], query?: string): ExperienceCardItem[] {
  if (!query) return items;
  const q = query.toLowerCase().trim();
  return items.filter((it) => {
    const title = String(it.title ?? "").toLowerCase();
    const company = String(it?.metadata?.company ?? "").toLowerCase();
    const summary = String(it?.metadata?.summary ?? "").toLowerCase();
    return title.includes(q) || company.includes(q) || summary.includes(q);
  });
}