import { For, createSignal, createMemo, createEffect } from "solid-js";
import type { ExperienceCard } from "@app-types/experience-card";
import { usePagination } from "@hooks/usePagination";
import { useDomSync } from "@hooks/useDomSync";
import {
  normalizeSlug,
  getYearsFromItems,
  dateSortComparator,
  type DateSortable,
} from "@lib/sort-utils";
import PaginationControls from "@components/navigation/PaginationControls";
import { isSentinelEnd, parseDateToTs } from "@lib/utils";

/**
 * ExperienceCardList
 *
 * Client-side island that handles filtering, sorting, and pagination for experience items.
 */
type Props = {
  initialItems: ExperienceCard[];
};

export default function ExperienceCardList(props: Props) {
  const [yearFilter, setYearFilter] = createSignal(""); // "" means all years
  const [sortOption, setSortOption] = createSignal<"date-desc" | "date-asc">(
    "date-desc",
  );

  // Derive years
  const years = createMemo(() =>
    getYearsFromItems(props.initialItems as DateSortable[]),
  );

  // Filter & Sort
  const processedItems = createMemo(() => {
    let items = props.initialItems.slice();

    // Year filter (handles multi-field checks)
    const yf = yearFilter();
    if (yf) {
      items = items.filter((it) => {
        const candidates = [it.startDate, it.endDate, it.date];
        for (const v of candidates) {
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
    }

    // Sort
    const dir = sortOption() === "date-desc" ? "desc" : "asc";
    return items.slice().sort((a, b) =>
      dateSortComparator(
        a as DateSortable,
        b as DateSortable,
        dir,
        "end-first", // Experiences prioritize end date usually
      ),
    );
  });

  // Pagination
  const pagination = usePagination(processedItems, { defaultPageSize: 6 });

  // DOM Sync
  useDomSync({
    visibleSlugs: createMemo(() =>
      pagination.paginatedItems().map((it) => it.slug),
    ),
    containerSelector: ".experience-grid",
    itemSelector: ".experience-item",
    normalizeSlug: normalizeSlug,
  });

  // Reset page on filter change
  createEffect(() => {
    yearFilter();
    sortOption();
    pagination.setPage(1);
  });

  return (
    <section>
      <div class="experience-controls">
        <div class="control-pair">
          <label for="year-select" class="control-label">
            Year
          </label>
          <select
            id="year-select"
            class="control-select"
            aria-label="Filter by year"
            value={yearFilter()}
            onChange={(e: Event & { currentTarget: HTMLSelectElement }) =>
              setYearFilter(e.currentTarget.value)
            }
          >
            <option value="">All years</option>
            <For each={years()}>
              {(y: string) => <option value={y}>{y}</option>}
            </For>
          </select>
        </div>

        <div class="control-pair">
          <label for="sort-select" class="control-label">
            Sort by
          </label>
          <select
            id="sort-select"
            class="control-select"
            aria-label="Sort experiences"
            value={sortOption()}
            onChange={(e: Event & { currentTarget: HTMLSelectElement }) =>
              setSortOption(e.currentTarget.value as "date-desc" | "date-asc")
            }
          >
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
          </select>
        </div>

        <div class="control-pair">
          <label for="perpage-select" class="control-label">
            Per page
          </label>
          <select
            id="perpage-select"
            class="control-select compact"
            aria-label="Items per page"
            value={pagination.pageSize()}
            onChange={(e: Event & { currentTarget: HTMLSelectElement }) => {
              pagination.setPageSize(Number(e.currentTarget.value) || 6);
              pagination.setPage(1);
            }}
          >
            <option value="3">3</option>
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="24">24</option>
          </select>
        </div>

        <button
          class="btn-reset"
          onClick={() => {
            setYearFilter("");
            setSortOption("date-desc");
            pagination.setPage(1);
          }}
        >
          Reset
        </button>
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        style="position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;"
      >
        Page {pagination.page()} of {pagination.totalPages()}
      </div>

      {/* Pagination Controls Portal */}
      <PaginationControls
        pagination={pagination}
        portalTargetId="experience-pagination-portal"
      />
    </section>
  );
}
