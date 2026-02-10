import { For, createEffect } from "solid-js";
import type { ProjectCard } from "@app-types/project-card";
import { usePagination } from "@hooks/usePagination";
import { useDomSync } from "@hooks/useDomSync";
import { normalizeSlug } from "@lib/sort-utils";
import PaginationControls from "@components/navigation/PaginationControls";
import FilterDropdown from "./FilterDropdown";
import {
  useProjectFiltering,
  type SortOption,
} from "@hooks/useProjectFiltering";

/**
 * ProjectCardList
 *
 * Client-side island for project filtering, sorting, and pagination.
 */
type Props = {
  initialItems: ProjectCard[];
};

export default function ProjectCardList(props: Props) {
  const {
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
  } = useProjectFiltering(props.initialItems);

  const pagination = usePagination(processedItems, { defaultPageSize: 6 });

  const visibleSlugsChecker = () =>
    pagination.paginatedItems().map((it) => it.slug);

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
            onChange={(
              e: Event & {
                currentTarget: HTMLSelectElement;
                target: HTMLSelectElement;
              },
            ) => setYearFilter(e.currentTarget.value)}
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
            onChange={(
              e: Event & {
                currentTarget: HTMLSelectElement;
                target: HTMLSelectElement;
              },
            ) => setSortOption(e.currentTarget.value as SortOption)}
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
            onChange={(
              e: Event & {
                currentTarget: HTMLSelectElement;
                target: HTMLSelectElement;
              },
            ) => {
              pagination.setPageSize(Number(e.currentTarget.value) || 6);
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
            resetFilters();
            pagination.setPage(1);
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
