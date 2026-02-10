import { createSignal, createMemo, type Accessor, type Setter } from "solid-js";
import type { ProjectCard } from "@app-types/project-card";
import {
  getYearsFromItems,
  dateSortComparator,
  type DateSortable,
} from "@lib/sort-utils";
import { isSentinelEnd, parseDateToTs } from "@lib/utils";

export type SortOption = "date-desc" | "date-asc";

/**
 * Result interface for the useProjectFiltering hook.
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
  /** Selected language filters. */
  languageFilters: Accessor<string[]>;
  /** Setter for language filters. */
  setLanguageFilters: Setter<string[]>;
  /** Selected domain filters. */
  domainFilters: Accessor<string[]>;
  /** Setter for domain filters. */
  setDomainFilters: Setter<string[]>;
  /** List of unique years available in the items. */
  years: Accessor<string[]>;
  /** Dynamic counts of languages based on current filters. */
  languageCounts: Accessor<{ name: string; count: number }[]>;
  /** Dynamic counts of domains based on current filters. */
  domainCounts: Accessor<{ name: string; count: number }[]>;
  /** The final list of items after filtering and sorting. */
  processedItems: Accessor<ProjectCard[]>;
  /** Resets all filters to default states. */
  resetFilters: () => void;
  /** A summary string of active filters for accessibility/logging. */
  filtersSummary: Accessor<string>;
}

/**
 * Custom hook to manage project filtering, sorting, and aggregation logic.
 *
 * Encapsulates state for year, sort, language, and domain filters, and computes
 * derived lists and counts based on the initial items.
 *
 * @param initialItems - The initial list of project cards to filter.
 */
export function useProjectFiltering(
  initialItems: ProjectCard[],
): UseProjectFilteringResult {
  const [yearFilter, setYearFilter] = createSignal(""); // "" means all years
  const [sortOption, setSortOption] = createSignal<SortOption>("date-desc");
  const [languageFilters, setLanguageFilters] = createSignal<string[]>([]);
  const [domainFilters, setDomainFilters] = createSignal<string[]>([]);

  // Derive unique years
  const years = createMemo(() =>
    getYearsFromItems(initialItems as DateSortable[]),
  );

  // Shared filter helper
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

  const filteredByYear = createMemo(() => {
    return filterByYearHelper(initialItems, yearFilter());
  });

  /**
   * Languages with dynamic counts.
   */
  const languageCounts = createMemo(() => {
    const currentDomainFilters = domainFilters() ?? [];
    let items = filteredByYear();

    if (currentDomainFilters.length > 0) {
      items = items.filter((it) => {
        const itemDomains = it.domains ?? [];
        return currentDomainFilters.some((f) => itemDomains.includes(f));
      });
    }

    const counts = new Map<string, number>();
    items.forEach((it) => {
      const list = it.programming_languages ?? [];
      const normalizedInProject = new Set<string>();

      list.forEach((l) => {
        if (!l) return;
        const name = String(l);
        const lower = name.toLowerCase();

        // Exclude HTML and CSS
        if (lower === "html" || lower === "css") return;

        // Normalize JS/TS variants
        if (["javascript", "js", "typescript"].includes(lower)) {
          normalizedInProject.add("JavaScript / TypeScript");
        } else {
          normalizedInProject.add(name);
        }
      });

      normalizedInProject.forEach((name) => {
        counts.set(name, (counts.get(name) ?? 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  });

  /**
   * Domains with dynamic counts.
   */
  const domainCounts = createMemo(() => {
    const currentLanguageFilters = languageFilters() ?? [];
    let items = filteredByYear();

    if (currentLanguageFilters.length > 0) {
      items = items.filter((it) => {
        const itemLangs = it.programming_languages ?? [];
        return currentLanguageFilters.some((f) => itemLangs.includes(f));
      });
    }

    const counts = new Map<string, number>();
    items.forEach((it) => {
      const list = it.domains ?? [];
      list.forEach((d) => {
        if (!d) return;
        const name = String(d);
        counts.set(name, (counts.get(name) ?? 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  });

  // Ensure pagination resets when filters change
  const processedItems = createMemo(() => {
    let items = filterByYearHelper(initialItems, yearFilter());

    const langFilters = languageFilters();
    if (langFilters.length > 0) {
      items = items.filter((it) => {
        const itemLangs = (it.programming_languages ?? []).map((l) => {
          const name = String(l);
          const lower = name.toLowerCase();
          if (["javascript", "js", "typescript"].includes(lower)) {
            return "JavaScript / TypeScript";
          }
          return name;
        });
        return langFilters.some((f) => itemLangs.includes(f));
      });
    }

    const domFilters = domainFilters();
    if (domFilters.length > 0) {
      items = items.filter((it) => {
        const itemDomains = it.domains ?? [];
        return domFilters.some((f) => itemDomains.includes(f));
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

  const resetFilters = () => {
    setYearFilter("");
    setSortOption("date-desc");
    setLanguageFilters([]);
    setDomainFilters([]);
  };

  // Provide a compact summary of current filters.
  const filtersSummary = createMemo(() => {
    const parts: string[] = [];
    const yf = yearFilter();
    if (yf) parts.push(`Year: ${yf}`);
    const langs = languageFilters();
    if (langs && langs.length) parts.push(`Languages: ${langs.join(", ")}`);
    const doms = domainFilters();
    if (doms && doms.length) parts.push(`Domains: ${doms.join(", ")}`);
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
    languageFilters,
    setLanguageFilters,
    domainFilters,
    setDomainFilters,
    years,
    languageCounts,
    domainCounts,
    processedItems,
    resetFilters,
    filtersSummary,
  };
}
