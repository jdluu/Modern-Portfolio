import {
  createSignal,
  createMemo,
  batch,
  type Accessor,
  type Setter,
} from "solid-js";
import type { ProjectCard } from "@app-types/project-card";
import {
  getYearsFromItems,
  dateSortComparator,
  type DateSortable,
} from "@lib/sort-utils";
import { isSentinelEnd, parseDateToTs } from "@lib/utils";

/**
 * Sort options for project ordering.
 */
export type SortOption = "date-desc" | "date-asc";

/**
 * Result interface for the useProjectFiltering hook.
 * Provides access to reactive state, setters, and computed derivations.
 */
export interface UseProjectFilteringResult {
  /** Current year filter value ("" for all). */
  yearFilter: Accessor<string>;
  /** Setter for year filter. */
  setYearFilter: Setter<string>;
  /** Current sort option. */
  sortOption: Accessor<SortOption>;
  /** Setter for sort option. */
  setSortOption: Setter<SortOption>;
  /** Selected category filters. */
  categoryFilters: Accessor<string[]>;
  /** Setter for category filters. */
  setCategoryFilters: Setter<string[]>;
  /** List of unique years available in the items. */
  years: Accessor<string[]>;
  /** Dynamic counts of categories based on the current year selection. */
  categoryCounts: Accessor<{ name: string; count: number }[]>;
  /** The final list of items after applying all filters and sorting. */
  processedItems: Accessor<ProjectCard[]>;
  /** Resets all filters to default states. */
  resetFilters: () => void;
  /** A summary string of active filters for accessibility/logging. */
  filtersSummary: Accessor<string>;
}

/**
 * Custom hook to manage project filtering, sorting, and aggregation logic.
 *
 * Encapsulates state for the year, sort, and category filters, and computes the
 * derived lists and counts based on the initial items. Designed for use in
 * client-side SolidJS islands.
 *
 * @param initialItems - The initial list of project cards to filter.
 * @returns A reactive object containing filters, counts, and the processed list.
 */
export function useProjectFiltering(
  initialItems: ProjectCard[],
): UseProjectFilteringResult {
  const [yearFilter, setYearFilter] = createSignal(""); // "" means all years
  const [sortOption, setSortOption] = createSignal<SortOption>("date-desc");
  const [categoryFilters, setCategoryFilters] = createSignal<string[]>([]);

  /**
   * Derive unique years from the provided items for the year filter dropdown.
   */
  const years = createMemo(() =>
    getYearsFromItems(initialItems as DateSortable[]),
  );

  /**
   * Internal helper to filter items by year.
   * Checks startDate, endDate, and date fields for matching years.
   */
  const filterByYearHelper = (items: ProjectCard[], yf: string) => {
    if (!yf) return items;
    return items.filter((it) => {
      const cand = [it.startDate, it.endDate, it.date];
      for (const v of cand) {
        if (!v) continue;
        if (isSentinelEnd(v)) {
          if (yf === "Present") return true;
          continue;
        }
        const ts = parseDateToTs(v);
        if (!Number.isNaN(ts)) {
          if (String(new Date(ts).getFullYear()) === yf) return true;
        }
      }
      return false;
    });
  };

  /** Reactive memo of items filtered only by the current year selection. */
  const filteredByYear = createMemo(() => {
    return filterByYearHelper(initialItems, yearFilter());
  });

  /**
   * Computes dynamic counts for categories based on the active year selection, so
   * the dropdown never offers a category that the year filter has emptied.
   */
  const categoryCounts = createMemo(() => {
    const counts = new Map<string, number>();
    filteredByYear().forEach((it) => {
      const list = it.categories ?? [];
      list.forEach((c) => {
        if (!c) return;
        const name = String(c);
        counts.set(name, (counts.get(name) ?? 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  });

  /**
   * The primary derived list of projects, fully filtered and sorted.
   * This is the list ultimately consumed by the UI for rendering.
   */
  const processedItems = createMemo(() => {
    let items = filterByYearHelper(initialItems, yearFilter());

    const catFilters = categoryFilters();
    if (catFilters.length > 0) {
      items = items.filter((it) => {
        const itemCategories = it.categories ?? [];
        return catFilters.some((f) => itemCategories.includes(f));
      });
    }

    const dir = sortOption() === "date-desc" ? "desc" : "asc";
    return items.slice().sort((a, b) => {
      return dateSortComparator(
        a as DateSortable,
        b as DateSortable,
        dir,
        "start-first",
      );
    });
  });

  /**
   * Resets all signal-based state to default values.
   * Utilizes batching to minimize reactive updates.
   */
  const resetFilters = () => {
    batch(() => {
      setYearFilter("");
      setSortOption("date-desc");
      setCategoryFilters([]);
    });
  };

  /**
   * Provides a compact human-readable summary of the active filter state.
   */
  const filtersSummary = createMemo(() => {
    const parts: string[] = [];
    const yf = yearFilter();
    if (yf) parts.push(`Year: ${yf}`);
    const cats = categoryFilters();
    if (cats && cats.length) parts.push(`Categories: ${cats.join(", ")}`);
    parts.push(
      sortOption() === "date-desc"
        ? "Sorted: Newest first"
        : "Sorted: Oldest first",
    );
    return parts.join("; ");
  });

  return {
    yearFilter,
    setYearFilter,
    sortOption,
    setSortOption,
    categoryFilters,
    setCategoryFilters,
    years,
    categoryCounts,
    processedItems,
    resetFilters,
    filtersSummary,
  };
}
