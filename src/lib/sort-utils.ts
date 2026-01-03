import { parseDateToTs, isSentinelEnd } from "../lib/utils";

/**
 * Normalizes a slug or filename value.
 */
export function normalizeSlug(value: unknown): string {
  return String(value ?? "").replace(/\.(md|mdx)$/i, "");
}

/**
 * Comparison helper for sorting items by date (descending/ascending).
 * Handles "Present" (infinity) and undefined dates.
 */
export interface DateSortable {
  startDate?: string | null;
  endDate?: string | null;
  date?: string | null;
}

export function getComparableTsFromItem(item: DateSortable): number {
  // Prioritize startDate for strict timeline sorting if available (like in Projects)
  // or fall through logic depending on usage. 
  // Refactored to cover both Experience (Prioritizes End) and Project (Prioritizes Start) logic if possible,
  // or just stick to a consistent standard.
  // The existing Experience logic: End > Start > 0.
  // The existing Project logic: Start > End > 0.
  
  // Let's verify usage. Experience wants to show "Current" things first (End date).
  // Projects want to show "Newest created" (Start date) usually?
  // Actually, ExperienceCardList.tsx uses EndDate primarily (sentinel check).
  // ProjectCardList.tsx uses StartDate primarily.
  
  // To keep it simple, we might need two getters or a config.
  // For now, let's export the generic Date parser and specific comparators.
  return 0; // Placeholder, better to implement specific sorters below.
}

export function dateSortComparator(
  a: DateSortable, 
  b: DateSortable, 
  direction: "asc" | "desc", 
  mode: "start-first" | "end-first" = "end-first"
): number {
  const getTs = (item: DateSortable) => {
    if (mode === "start-first") {
        const startStr = item.startDate ?? "";
        const startTs = parseDateToTs(startStr);
        if (!Number.isNaN(startTs)) return startTs;
    }
    
    // Fallback to End Date (or primary for end-first)
    const endStr = item.endDate ?? item.date ?? "";
    if (isSentinelEnd(endStr)) return Infinity; // "Present"
    const endTs = parseDateToTs(endStr);
    if (!Number.isNaN(endTs)) return endTs;
    
    if (mode === "end-first") {
        // Fallback to start if end is missing
        const sStr = item.startDate ?? "";
        const sTs = parseDateToTs(sStr);
        if (!Number.isNaN(sTs)) return sTs;
    }

    return 0;
  };

  const ta = getTs(a);
  const tb = getTs(b);
  
  if (ta === tb) return 0;
  if (ta === Infinity) return direction === "desc" ? -1 : 1;
  if (tb === Infinity) return direction === "desc" ? 1 : -1;
  
  return direction === "desc" ? tb - ta : ta - tb;
}

export function getYearsFromItems(items: DateSortable[]): string[] {
  const out = new Set<string>();
  items.forEach((it) => {
    const candidates = [it.startDate, it.endDate, it.date];
    candidates.forEach((v) => {
      if (!v) return;
      if (isSentinelEnd(v)) {
        out.add("Present");
        return;
      }
      const ts = parseDateToTs(v);
      if (!Number.isNaN(ts)) {
        const y = new Date(ts).getFullYear();
        out.add(String(y));
      }
    });
  });
  
  const arr = Array.from(out.values());
  arr.sort((a, b) => {
    if (a === "Present") return -1;
    if (b === "Present") return 1;
    return Number(b) - Number(a);
  });
  return arr;
}
