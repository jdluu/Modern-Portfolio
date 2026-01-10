import { parseDateToTs, isSentinelEnd } from "@lib/utils";

/**
 * Normalizes a slug or filename value.
 */
export function normalizeSlug(value: unknown): string {
  return String(value ?? "").replace(/\.(md|mdx)$/i, "");
}

export interface DateSortable {
  startDate?: string | null;
  endDate?: string | null;
  date?: string | null;
}

/**
 * Comparison helper for sorting items by date (descending/ascending).
 * Handles "Present" (infinity) and undefined dates.
 *
 * @param direction "asc" | "desc"
 * @param mode "start-first" (Project) | "end-first" (Experience)
 */
export function dateSortComparator(
  a: DateSortable,
  b: DateSortable,
  direction: "asc" | "desc",
  mode: "start-first" | "end-first" = "end-first",
): number {
  const getTs = (item: DateSortable) => {
    if (mode === "start-first") {
      const startStr = item.startDate ?? "";
      const startTs = parseDateToTs(startStr);
      if (!Number.isNaN(startTs)) return startTs;
    }

    // Primary: End Date (or fallback for projects)
    const endStr = item.endDate ?? item.date ?? "";
    if (isSentinelEnd(endStr)) return Infinity;
    const endTs = parseDateToTs(endStr);
    if (!Number.isNaN(endTs)) return endTs;

    if (mode === "end-first") {
      // Fallback: Start Date
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
        const y = new Date(ts).getUTCFullYear();
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
