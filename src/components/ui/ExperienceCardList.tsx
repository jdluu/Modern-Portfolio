import {
  For,
  createSignal,
  createMemo,
  createEffect,
  onCleanup,
} from "solid-js";
import type { ExperienceCard } from "../../types/experience-card";
import { parseDateToTs, isSentinelEnd } from "../../lib/utils";

function normalizeSlug(value: unknown): string {
  return String(value ?? "").replace(/\.(md|mdx)$/i, "");
}

function getComparableTsFromItem(item: ExperienceCard): number {
  const endStr = (item as any)?.endDate ?? (item as any)?.date ?? "";
  if (isSentinelEnd(endStr)) return Infinity;
  const endTs = parseDateToTs(endStr);
  if (!Number.isNaN(endTs)) return endTs;
  const startTs = parseDateToTs((item as any)?.startDate ?? "");
  if (!Number.isNaN(startTs)) return startTs;
  return 0;
}

function sortExperienceCardsByDateDesc(
  items: ExperienceCard[],
): ExperienceCard[] {
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
 * ExperienceCardList
 *
 * Client-side island that handles filtering, sorting, and pagination for experience items.
 *
 * Features:
 * - Sorting: Newest, Oldest
 * - Filtering: Year (including "Present")
 * - Pagination: Adjustable page size
 *
 * @param props.initialItems - Statically rendered items passed from Astro.
 */
type Props = {
  initialItems: ExperienceCard[];
};

export default function ExperienceCardList(props: Props) {
  const [yearFilter, setYearFilter] = createSignal(""); // "" means all years
  const [sortOption, setSortOption] = createSignal<"date-desc" | "date-asc">(
    "date-desc",
  );
  const [page, setPage] = createSignal(1);
  const [pageSize, setPageSize] = createSignal(6);
  let paginationRef: HTMLDivElement | undefined;

  /**
   * Derive unique years from date fields.
   * Includes "Present" if sentinel date is found.
   */
  const years = createMemo(() => {
    const out = new Set<string>();
    (props.initialItems ?? []).forEach((it) => {
      const candidates = [
        (it as any)?.startDate ?? "",
        (it as any)?.endDate ?? "",
        (it as any)?.date ?? "",
      ];
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
    // Sort years descending (Present at top)
    const arr = Array.from(out.values());
    arr.sort((a, b) => {
      if (a === "Present") return -1;
      if (b === "Present") return 1;
      return Number(b) - Number(a);
    });
    return arr;
  });

  // Reset pagination when filters change
  createEffect(() => {
    yearFilter();
    sortOption();
    setPage(1);
  });

  // Filter -> Sort -> Paginate
  const processedAll = createMemo(() => {
    let items = props.initialItems ?? [];
    // Year filter
    const yf = yearFilter();
    if (yf) {
      items = items.filter((it) => {
        const cand = [
          (it as any)?.startDate ?? "",
          (it as any)?.endDate ?? "",
          (it as any)?.date ?? "",
        ];
        const yearsFound = new Set<string>();
        for (const v of cand) {
          if (!v) continue;
          if (isSentinelEnd(v)) yearsFound.add("Present");
          else {
            const ts = parseDateToTs(v);
            if (!Number.isNaN(ts))
              yearsFound.add(String(new Date(ts).getFullYear()));
          }
        }
        return yearsFound.has(yf);
      });
    }

    // Sorting
    if (sortOption() === "date-desc") {
      items = sortExperienceCardsByDateDesc(items);
    } else if (sortOption() === "date-asc") {
      items = sortExperienceCardsByDateDesc(items).reverse();
    }

    return items;
  });

  const totalCount = createMemo(() => processedAll().length);
  const totalPages = createMemo(() =>
    Math.max(1, Math.ceil(totalCount() / pageSize())),
  );
  const paginated = createMemo(() => {
    const p = Math.min(Math.max(1, page()), totalPages());
    const size = pageSize();
    const all = processedAll();
    const start = (p - 1) * size;
    return all.slice(start, start + size);
  });

  /**
   * Sync visual state with server-rendered DOM.
   *
   * The actual card markup is rendered by Astro (SSR).
   * This effect toggles visibility (`display: none`) and reorders DOM nodes
   * to match the current client-side filter/sort state.
   */
  createEffect(() => {
    if (typeof document === "undefined") return;

    // Build ordered list of visible slugs from the paginated items
    const visibleSlugs = (paginated() ?? []).map((it) =>
      normalizeSlug((it as any)?.slug),
    );

    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".experience-grid > .experience-item",
      ),
    );

    // Toggle visibility
    nodes.forEach((node) => {
      const slug = normalizeSlug(node.dataset.slug);
      const shouldShow = visibleSlugs.includes(slug);
      node.style.display = shouldShow ? "" : "none";
      node.setAttribute("aria-hidden", shouldShow ? "false" : "true");
    });

    // Reorder DOM to match pagination
    const grid = document.querySelector<HTMLElement>(".experience-grid");
    if (grid) {
      visibleSlugs.forEach((slug) => {
        const selector = `.experience-item[data-slug="${slug}"]`;
        const node = grid.querySelector<HTMLElement>(selector);
        if (node) {
          grid.appendChild(node);
        }
      });
    }
  });

  // Helpers for pagination controls
  const canPrev = createMemo(() => page() > 1);
  const canNext = createMemo(() => page() < totalPages());

  // Portal pagination controls to the parent container
  createEffect(() => {
    if (typeof document === "undefined") return;
    const node = paginationRef;
    const portal = document.getElementById("experience-pagination-portal");
    if (!node || !portal) return;
    if (portal !== node.parentElement) {
      portal.appendChild(node);
    }
    onCleanup(() => {
      try {
        node.remove();
      } catch (e) {
        /* ignore */
      }
    });
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
            onChange={(e: any) => setYearFilter(e.target.value)}
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
            onChange={(e: any) => setSortOption(e.target.value)}
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
            value={pageSize()}
            onChange={(e: any) => {
              setPageSize(Number(e.target.value) || 3);
              setPage(1);
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
            setPage(1);
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
        Page {page()} of {totalPages()}
      </div>

      {/* Server-rendered grid lives in parent. Island controls visibility via data-slug. */}

      {/* Pagination Controls */}
      <div ref={(el) => (paginationRef = el!)} class="pagination-controls">
        <button
          class="pagination-button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!canPrev()}
          aria-disabled={!canPrev()}
        >
          Previous
        </button>
        <div class="pagination-info">
          Page {page()} of {totalPages()}
        </div>
        <button
          class="pagination-button"
          onClick={() => setPage((p) => Math.min(totalPages(), p + 1))}
          disabled={!canNext()}
          aria-disabled={!canNext()}
        >
          Next
        </button>
      </div>
    </section>
  );
}
