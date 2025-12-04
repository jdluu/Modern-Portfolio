import {
  For,
  createSignal,
  createMemo,
  createEffect,
  onCleanup,
} from "solid-js";
import type { ProjectCard } from "../../types/project-card";
import { parseDateToTs, isSentinelEnd } from "../../lib/utils";

function normalizeSlug(value: unknown): string {
  return String(value ?? "").replace(/\.(md|mdx)$/i, "");
}

function getComparableTsFromItem(item: ProjectCard): number {
  // Prioritize startDate for sorting
  const startStr = (item as any)?.startDate ?? "";
  const startTs = parseDateToTs(startStr);
  if (!Number.isNaN(startTs)) return startTs;

  // Fallback to endDate or a generic date field if startDate is not available
  const endStr = (item as any)?.endDate ?? (item as any)?.date ?? "";
  if (isSentinelEnd(endStr)) return Infinity;
  const endTs = parseDateToTs(endStr);
  if (!Number.isNaN(endTs)) return endTs;

  // Return 0 if no valid date is found
  return 0;
}

function sortProjectCardsByDateDesc(items: ProjectCard[]): ProjectCard[] {
  return [...items].sort((a, b) => {
    const ta = getComparableTsFromItem(a);
    const tb = getComparableTsFromItem(b);
    if (ta === tb) return 0;
    if (tb === Infinity && ta !== Infinity) return 1;
    if (ta === Infinity && tb !== Infinity) return -1;
    return tb - ta;
  });
}

type Props = {
  initialItems: ProjectCard[];
};

export default function ProjectCardList(props: Props) {
  const [yearFilter, setYearFilter] = createSignal(""); // "" means all years
  const [sortOption, setSortOption] = createSignal<"date-desc" | "date-asc">(
    "date-desc",
  );
  const [page, setPage] = createSignal(1);
  // Default page size for projects: 6 items per page
  const [pageSize, setPageSize] = createSignal(6);
  const [languageFilters, setLanguageFilters] = createSignal<string[]>([]);
  const [domainFilters, setDomainFilters] = createSignal<string[]>([]);
  const [langDropdownOpen, setLangDropdownOpen] = createSignal(false);
  const [domDropdownOpen, setDomDropdownOpen] = createSignal(false);
  const [langSearchTerm, setLangSearchTerm] = createSignal("");
  const [domSearchTerm, setDomSearchTerm] = createSignal("");
  let paginationRef: HTMLDivElement | undefined;
  let langDropdownRef: HTMLDivElement | undefined;
  let domDropdownRef: HTMLDivElement | undefined;

  // Utility to toggle an item in a string-array (returns new array)
  function toggleFilterArray(arr: string[], value: string) {
    const s = new Set(arr);
    if (s.has(value)) s.delete(value);
    else s.add(value);
    return Array.from(s);
  }

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

  // Derive available years (and "Present") from date fields
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

  /**
   * Languages with dynamic counts.
   * - Counts are computed dynamically based on current Year and Domain filters,
   *   but EXCLUDING the current language selections (per requirement).
   * - Returns array of { name, count } sorted by count desc then name.
   */
  const languageCounts = createMemo(() => {
    try {
      const yf = yearFilter();
      const currentDomainFilters = domainFilters() ?? [];

      // Start from all initial items and apply Year + Domain filters (but NOT languageFilters)
      let items = props.initialItems ?? [];

      // Year filtering (same logic as processedAll)
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

      // Domain filters (apply current domain filters)
      if (currentDomainFilters && currentDomainFilters.length > 0) {
        items = items.filter((it) => {
          const itemDomains = Array.isArray((it as any)?.domains)
            ? (it as any).domains.map((x: any) => String(x))
            : [];
          return currentDomainFilters.some((f) => itemDomains.includes(f));
        });
      }

      // Tally languages
      const counts = new Map<string, number>();
      items.forEach((it) => {
        const list = (it as any)?.programming_languages ?? [];
        if (Array.isArray(list)) {
          list.forEach((l: any) => {
            if (!l) return;
            const name = String(l);
            counts.set(name, (counts.get(name) ?? 0) + 1);
          });
        }
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
      // Defensive fallback for SSR/runtime errors
      console.error("languageCounts error:", e);
      return [];
    }
  });

  /**
   * Domains with dynamic counts.
   * - Counts are computed dynamically based on current Year and Language filters,
   *   but EXCLUDING the current domain selections (per requirement).
   * - Returns array of { name, count } sorted by count desc then name.
   */
  const domainCounts = createMemo(() => {
    try {
      const yf = yearFilter();
      const currentLanguageFilters = languageFilters() ?? [];

      // Start from all initial items and apply Year + Language filters (but NOT domainFilters)
      let items = props.initialItems ?? [];

      // Year filtering
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

      // Language filters (apply current language filters)
      if (currentLanguageFilters && currentLanguageFilters.length > 0) {
        items = items.filter((it) => {
          const itemLangs = Array.isArray((it as any)?.programming_languages)
            ? (it as any).programming_languages.map((x: any) => String(x))
            : [];
          return currentLanguageFilters.some((f) => itemLangs.includes(f));
        });
      }

      // Tally domains
      const counts = new Map<string, number>();
      items.forEach((it) => {
        const list = (it as any)?.domains ?? [];
        if (Array.isArray(list)) {
          list.forEach((d: any) => {
            if (!d) return;
            const name = String(d);
            counts.set(name, (counts.get(name) ?? 0) + 1);
          });
        }
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

  // Visible lists filtered by search term (preserve counts from languageCounts/domainCounts)
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

  // Reset pagination when filters change
  createEffect(() => {
    // When any of these signals change, reset to page 1
    yearFilter();
    sortOption();
    languageFilters();
    domainFilters();
    setPage(1);
  });

  // Core processing pipeline: filter -> sort -> paginate
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

    // Language filters (OR logic within group)
    const langFilters = languageFilters();
    if (langFilters && langFilters.length > 0) {
      items = items.filter((it) => {
        const itemLangs = Array.isArray((it as any)?.programming_languages)
          ? (it as any).programming_languages.map((x: any) => String(x))
          : [];
        return langFilters.some((f) => itemLangs.includes(f));
      });
    }

    // Domain filters (OR logic within group)
    const domFilters = domainFilters();
    if (domFilters && domFilters.length > 0) {
      items = items.filter((it) => {
        const itemDomains = Array.isArray((it as any)?.domains)
          ? (it as any).domains.map((x: any) => String(x))
          : [];
        return domFilters.some((f) => itemDomains.includes(f));
      });
    }

    // Sorting
    if (sortOption() === "date-desc") {
      items = sortProjectCardsByDateDesc(items);
    } else if (sortOption() === "date-asc") {
      items = sortProjectCardsByDateDesc(items).reverse();
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

  // Toggle visibility of the server-rendered cards.
  createEffect(() => {
    if (typeof document === "undefined") return;

    // Build ordered list of visible slugs from the paginated items
    const visibleSlugs = (paginated() ?? []).map((it) =>
      normalizeSlug((it as any)?.slug),
    );

    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".project-grid > .project-item"),
    );

    // First, toggle visibility for accessibility and layout
    nodes.forEach((node) => {
      const slug = normalizeSlug(node.dataset.slug);
      const shouldShow = visibleSlugs.includes(slug);
      node.style.display = shouldShow ? "" : "none";
      node.setAttribute("aria-hidden", shouldShow ? "false" : "true");
    });

    // Then, reorder the DOM so visible nodes appear in the same order as paginated()
    const grid = document.querySelector<HTMLElement>(".project-grid");
    if (grid) {
      visibleSlugs.forEach((slug) => {
        // Use an attribute selector that matches the data-slug value exactly
        const selector = `.project-item[data-slug="${slug}"]`;
        const node = grid.querySelector<HTMLElement>(selector);
        if (node) {
          // appendChild moves the node to the end in sequence
          grid.appendChild(node);
        }
      });
    }

    // IntersectionObserver + MutationObserver in the section handle image promotion;
    // no manual event dispatch is required here.
  });

  // Helpers for pagination controls
  const canPrev = createMemo(() => page() > 1);
  const canNext = createMemo(() => page() < totalPages());

  // Move pagination controls into the portal rendered in the parent server template
  createEffect(() => {
    if (typeof document === "undefined") return;
    // Wait until the paginationRef is available
    const node = paginationRef;
    const portal = document.getElementById("project-pagination-portal");
    if (!node || !portal) return;
    // Append the pagination controls to the portal so they appear under the server-rendered grid
    if (portal !== node.parentElement) {
      portal.appendChild(node);
    }
    onCleanup(() => {
      // Remove node from DOM when component unmounts (keep portal clean)
      try {
        node.remove();
      } catch (e) {
        /* ignore */
      }
    });
  });

  function onMultiSelectChange(e: Event, setter: (v: string[]) => void) {
    const target = e.target as HTMLSelectElement;
    const selected: string[] = [];
    Array.from(target.selectedOptions).forEach((opt) => {
      if (opt.value) selected.push(opt.value);
    });
    setter(selected);
  }

  // Provide a compact, screen-reader-friendly summary of current filters.
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
    parts.push(`Per page: ${pageSize()}`);
    parts.push(`Page: ${page()} of ${totalPages()}`);
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
            value={pageSize()}
            onChange={(e: any) => {
              setPageSize(Number(e.target.value) || 6);
              setPage(1);
            }}
          >
            <option value="3">3</option>
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
                      onChange={() =>
                        setLanguageFilters(
                          toggleFilterArray(languageFilters(), l.name),
                        )
                      }
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
                      onChange={() =>
                        setDomainFilters(
                          toggleFilterArray(domainFilters(), d.name),
                        )
                      }
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
            setPage(1);
            setLanguageFilters([]);
            setDomainFilters([]);
            setPageSize(6);
          }}
          aria-label="Reset filters"
        >
          Reset
        </button>
      </div>

      {/* Screen-reader-only summary (kept live so ATs announce changes) */}
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
        Page {page()} of {totalPages()}
      </div>

      <div
        ref={(el) => (paginationRef = el!)}
        class="pagination-controls"
        role="navigation"
        aria-label="Project pagination"
      >
        <button
          class="pagination-button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!canPrev()}
          aria-disabled={!canPrev()}
          aria-label={`Previous page, currently on page ${page()}`}
        >
          Previous
        </button>
        <div class="pagination-info" aria-live="polite">
          Page {page()} of {totalPages()}
        </div>
        <button
          class="pagination-button"
          onClick={() => setPage((p) => Math.min(totalPages(), p + 1))}
          disabled={!canNext()}
          aria-disabled={!canNext()}
          aria-label={`Next page, currently on page ${page()}`}
        >
          Next
        </button>
      </div>
    </section>
  );
}
