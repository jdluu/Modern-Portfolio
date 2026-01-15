import { For, createSignal, createMemo, createEffect } from "solid-js";
import type { ProjectCard } from "@app-types/project-card";
import { usePagination } from "@hooks/usePagination";
import { useDomSync } from "@hooks/useDomSync";
import {
  normalizeSlug,
  getYearsFromItems,
  dateSortComparator,
  type DateSortable,
} from "@lib/sort-utils";
import PaginationControls from "./PaginationControls";
import { isSentinelEnd, parseDateToTs } from "@lib/utils";
import FilterDropdown from "./FilterDropdown";

/**
 * ProjectCardList
 *
 * Client-side island for project filtering, sorting, and pagination.
 */
type Props = {
  initialItems: ProjectCard[];
};

export default function ProjectCardList(props: Props) {
  const [yearFilter, setYearFilter] = createSignal(""); // "" means all years
  const [sortOption, setSortOption] = createSignal<"date-desc" | "date-asc">(
    "date-desc",
  );

  const [languageFilters, setLanguageFilters] = createSignal<string[]>([]);
  const [domainFilters, setDomainFilters] = createSignal<string[]>([]);

  // Derive unique years
  const years = createMemo(() =>
    getYearsFromItems(props.initialItems as DateSortable[]),
  );

  // Shared filter helper
  const filterByYear = (items: ProjectCard[], yf: string) => {
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

  /**
   * Languages with dynamic counts.
   */
  const languageCounts = createMemo(() => {
    const yf = yearFilter();
    const currentDomainFilters = domainFilters() ?? [];

    let items = filterByYear(props.initialItems, yf);

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
    const yf = yearFilter();
    const currentLanguageFilters = languageFilters() ?? [];

    let items = filterByYear(props.initialItems, yf);

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
    let items = filterByYear(props.initialItems, yearFilter());

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

  const pagination = usePagination(processedItems, { defaultPageSize: 6 });

  const visibleSlugsChecker = createMemo(() =>
    pagination.paginatedItems().map((it) => (it as any).slug),
  );

  useDomSync({
    visibleSlugs: visibleSlugsChecker,
    containerSelector: ".project-grid",
    itemSelector: ".project-item",
    normalizeSlug: normalizeSlug,
  });

  // Reset pagination when filters change
  createEffect(() => {
    yearFilter();
    sortOption();
    languageFilters();
    domainFilters();
    pagination.setPage(1);
  });

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
    parts.push(`Per page: ${pagination.pageSize()}`);
    parts.push(`Page: ${pagination.page()} of ${pagination.totalPages()}`);
    return parts.join("; ");
  });

  return (
    <section>
      <div
        class="experience-controls"
        role="region"
        aria-labelledby="projects-controls-label"
      >
        <h3 id="projects-controls-label" class="sr-only">
          Project filters and controls
        </h3>

        <div class="control-pair">
          <label for="project-year-select" class="control-label">
            Year
          </label>
          <select
            id="project-year-select"
            class="control-select"
            aria-label="Filter by year"
            aria-describedby="project-filters-summary"
            value={yearFilter()}
            onChange={(e: any) => setYearFilter(e.target.value)}
          >
            <option value="">All years</option>
            <For each={years()}>
              {(y: string) => <option value={y}>{y}</option>}
            </For>
          </select>
        </div>

        <div class="control-pair">
          <label for="project-sort-select" class="control-label">
            Sort by
          </label>
          <select
            id="project-sort-select"
            class="control-select"
            aria-label="Sort projects"
            aria-describedby="project-filters-summary"
            value={sortOption()}
            onChange={(e: any) => setSortOption(e.target.value)}
          >
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
          </select>
        </div>

        <div class="control-pair">
          <label for="project-perpage-select" class="control-label">
            Per page
          </label>
          <select
            id="project-perpage-select"
            class="control-select compact"
            aria-label="Items per page"
            aria-describedby="project-filters-summary"
            value={String(pagination.pageSize())}
            onChange={(e: any) => {
              pagination.setPageSize(Number(e.target.value) || 6);
              pagination.setPage(1);
            }}
          >
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="24">24</option>
          </select>
        </div>

        <FilterDropdown
          id="project-language-button"
          label="Languages"
          items={languageCounts}
          selectedItems={languageFilters}
          setSelectedItems={setLanguageFilters}
          placeholder="Search languages"
          onPageReset={() => pagination.setPage(1)}
        />

        <FilterDropdown
          id="project-domain-button"
          label="Domains"
          items={domainCounts}
          selectedItems={domainFilters}
          setSelectedItems={setDomainFilters}
          placeholder="Search domains"
          onPageReset={() => pagination.setPage(1)}
        />

        <button
          class="btn-reset"
          onClick={() => {
            setYearFilter("");
            setSortOption("date-desc");
            pagination.setPage(1);
            setLanguageFilters([]);
            setDomainFilters([]);
            pagination.setPageSize(6);
          }}
          aria-label="Reset filters"
        >
          Reset
        </button>
      </div>

      {/* SR Only Summary */}
      <div
        id="project-filters-summary"
        class="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {filtersSummary()}
      </div>

      {/* Pagination summary for screen readers */}
      <div aria-live="polite" aria-atomic="true" class="sr-only">
        Page {pagination.page()} of {pagination.totalPages()}
      </div>

      {/* Pagination Controls Portal */}
      <PaginationControls
        pagination={pagination}
        portalTargetId="project-pagination-portal"
      />
    </section>
  );
}
