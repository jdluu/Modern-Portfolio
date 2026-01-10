import {
  For,
  createSignal,
  createMemo,
  createEffect,
  onCleanup,
  onMount,
} from "solid-js";
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

// Utility to toggle an item in a string-array
function toggleFilterArray(arr: string[], value: string) {
  const s = new Set(arr);
  if (s.has(value)) s.delete(value);
  else s.add(value);
  return Array.from(s);
}

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
  const [langDropdownOpen, setLangDropdownOpen] = createSignal(false);
  const [domDropdownOpen, setDomDropdownOpen] = createSignal(false);
  const [langSearchTerm, setLangSearchTerm] = createSignal("");
  const [domSearchTerm, setDomSearchTerm] = createSignal("");

  let langDropdownRef: HTMLDivElement | undefined;
  let domDropdownRef: HTMLDivElement | undefined;

  // Close dropdowns when clicking outside
  createEffect(() => {
    if (typeof document === "undefined") return;
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (langDropdownRef && !langDropdownRef.contains(t))
        setLangDropdownOpen(false);
      if (domDropdownRef && !domDropdownRef.contains(t))
        setDomDropdownOpen(false);
    }
    document.addEventListener("click", onDocClick);
    onCleanup(() => document.removeEventListener("click", onDocClick));
  });

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
    try {
      const yf = yearFilter();
      const currentDomainFilters = domainFilters() ?? [];

      // Base: Year + Domain (excluding Lang)
      let items = filterByYear(props.initialItems, yf);

      // Domain filters
      if (currentDomainFilters.length > 0) {
        items = items.filter((it) => {
          const itemDomains = it.domains ?? [];
          return currentDomainFilters.some((f) => itemDomains.includes(f));
        });
      }

      // Tally languages
      const counts = new Map<string, number>();
      items.forEach((it) => {
        const list = it.programming_languages ?? [];
        list.forEach((l) => {
          if (!l) return;
          const name = String(l);
          counts.set(name, (counts.get(name) ?? 0) + 1);
        });
      });

      const arr = Array.from(counts.entries()).map(([name, count]) => ({
        name,
        count,
      }));
      arr.sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.name.localeCompare(b.name);
      });
      return arr;
    } catch (e) {
      console.error("languageCounts error:", e);
      return [];
    }
  });

  /**
   * Domains with dynamic counts.
   */
  const domainCounts = createMemo(() => {
    try {
      const yf = yearFilter();
      const currentLanguageFilters = languageFilters() ?? [];

      // Base: Year + Lang (excluding Domain)
      let items = filterByYear(props.initialItems, yf);

      // Language filters
      if (currentLanguageFilters.length > 0) {
        items = items.filter((it) => {
          const itemLangs = it.programming_languages ?? [];
          return currentLanguageFilters.some((f) => itemLangs.includes(f));
        });
      }

      // Tally domains
      const counts = new Map<string, number>();
      items.forEach((it) => {
        const list = it.domains ?? [];
        list.forEach((d) => {
          if (!d) return;
          const name = String(d);
          counts.set(name, (counts.get(name) ?? 0) + 1);
        });
      });

      const arr = Array.from(counts.entries()).map(([name, count]) => ({
        name,
        count,
      }));
      arr.sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.name.localeCompare(b.name);
      });
      return arr;
    } catch (e) {
      console.error("domainCounts error:", e);
      return [];
    }
  });

  // Filtered lists for dropdowns
  const visibleLanguageCounts = createMemo(() => {
    const term = langSearchTerm().trim().toLowerCase();
    const all = languageCounts();
    if (!term) return all;
    return all.filter((l) => l.name.toLowerCase().includes(term));
  });

  const visibleDomainCounts = createMemo(() => {
    const term = domSearchTerm().trim().toLowerCase();
    const all = domainCounts();
    if (!term) return all;
    return all.filter((d) => d.name.toLowerCase().includes(term));
  });

  // Ensure pagination resets when filters change
  const processedItems = createMemo(() => {
    let items = filterByYear(props.initialItems, yearFilter());

    const langFilters = languageFilters();
    if (langFilters.length > 0) {
      items = items.filter((it) => {
        const itemLangs = it.programming_languages ?? [];
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

        <div class="control-pair">
          <label for="project-language-button" class="control-label">
            Languages
          </label>
          <div class="dropdown" ref={(el) => (langDropdownRef = el)}>
            <button
              id="project-language-button"
              class="control-select dropdown-toggle"
              aria-haspopup="true"
              aria-expanded={langDropdownOpen()}
              onClick={() => setLangDropdownOpen((v) => !v)}
              aria-controls="lang-panel"
              type="button"
            >
              {languageFilters().length
                ? `${languageFilters().length} selected`
                : "All languages"}
            </button>

            <div
              id="lang-panel"
              class={`dropdown-panel ${langDropdownOpen() ? "open" : ""}`}
              role="menu"
              aria-label="Programming languages"
            >
              <input
                placeholder="Search languages"
                value={langSearchTerm()}
                onInput={(e) =>
                  setLangSearchTerm((e.target as HTMLInputElement).value)
                }
                class="control-select"
                style={{ width: "100%", "margin-bottom": "0.5rem" } as any}
              />

              <For each={visibleLanguageCounts()}>
                {(l: { name: string; count: number }) => (
                  <label class="dropdown-item" role="menuitemcheckbox">
                    <input
                      type="checkbox"
                      checked={languageFilters().includes(l.name)}
                      onChange={() => {
                        setLanguageFilters((prev) =>
                          toggleFilterArray(prev, l.name),
                        );
                        pagination.setPage(1);
                      }}
                    />
                    <span>
                      {l.name} ({l.count})
                    </span>
                  </label>
                )}
              </For>
            </div>
          </div>
        </div>

        <div class="control-pair">
          <label for="project-domain-button" class="control-label">
            Domains
          </label>
          <div class="dropdown" ref={(el) => (domDropdownRef = el)}>
            <button
              id="project-domain-button"
              class="control-select dropdown-toggle"
              aria-haspopup="true"
              aria-expanded={domDropdownOpen()}
              onClick={() => setDomDropdownOpen((v) => !v)}
              aria-controls="dom-panel"
              type="button"
            >
              {domainFilters().length
                ? `${domainFilters().length} selected`
                : "All domains"}
            </button>

            <div
              id="dom-panel"
              class={`dropdown-panel ${domDropdownOpen() ? "open" : ""}`}
              role="menu"
              aria-label="Domains"
            >
              <input
                placeholder="Search domains"
                value={domSearchTerm()}
                onInput={(e) =>
                  setDomSearchTerm((e.target as HTMLInputElement).value)
                }
                class="control-select"
                style={{ width: "100%", "margin-bottom": "0.5rem" } as any}
              />

              <For each={visibleDomainCounts()}>
                {(d: { name: string; count: number }) => (
                  <label class="dropdown-item" role="menuitemcheckbox">
                    <input
                      type="checkbox"
                      checked={domainFilters().includes(d.name)}
                      onChange={() => {
                        setDomainFilters((prev) =>
                          toggleFilterArray(prev, d.name),
                        );
                        pagination.setPage(1);
                      }}
                    />
                    <span>
                      {d.name} ({d.count})
                    </span>
                  </label>
                )}
              </For>
            </div>
          </div>
        </div>

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
        portalTargetId="project-pagination-portal"
      />
    </section>
  );
}
