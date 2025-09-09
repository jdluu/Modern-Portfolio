import {
  For,
  createSignal,
  createMemo,
  createEffect,
  onCleanup,
} from "solid-js";
import type { ExperienceCardItem } from "../../types/experience-card";
import { parseDateToTs, isSentinelEnd } from "../../lib/utils";

function getComparableTsFromItem(item: ExperienceCardItem): number {
  const meta = (item as any)?.metadata ?? {};
  const endStr = meta?.endDate ?? meta?.date ?? "";
  if (isSentinelEnd(endStr)) return Infinity;
  const endTs = parseDateToTs(endStr);
  if (!Number.isNaN(endTs)) return endTs;
  const startTs = parseDateToTs(meta?.startDate ?? "");
  if (!Number.isNaN(startTs)) return startTs;
  return 0;
}

function sortExperienceCardsByDateDesc(
  items: ExperienceCardItem[]
): ExperienceCardItem[] {
  return [...items].sort((a, b) => {
    const ta = getComparableTsFromItem(a);
    const tb = getComparableTsFromItem(b);
    if (ta === tb) return 0;
    if (tb === Infinity && ta !== Infinity) return 1;
    if (ta === Infinity && tb !== Infinity) return -1;
    return tb - ta;
  });
}

function filterByCompany(
  items: ExperienceCardItem[],
  company?: string
): ExperienceCardItem[] {
  if (!company) return items;
  const needle = company.toLowerCase();
  return items.filter((it) => {
    const c = String((it as any)?.metadata?.company ?? "").toLowerCase();
    return c.includes(needle);
  });
}

function filterBySearch(
  items: ExperienceCardItem[],
  query?: string
): ExperienceCardItem[] {
  if (!query) return items;
  const q = query.toLowerCase().trim();
  return items.filter((it) => {
    const title = String(it?.title ?? "").toLowerCase();
    const company = String((it as any)?.metadata?.company ?? "").toLowerCase();
    const summary = String((it as any)?.metadata?.summary ?? "").toLowerCase();
    return title.includes(q) || company.includes(q) || summary.includes(q);
  });
}

/**
 * ExperienceCardList (Solid.js)
 *
 * Features added/required:
 * - Sorting (default: newest first). Options: Newest first, Oldest first, Company A–Z
 * - Filtering: search, company, year (based on startDate/endDate/date; "Present" supported)
 * - Pagination: page size selector + prev/next controls
 *
 * Props:
 * - initialItems: ExperienceCardItem[] (rendered statically by Astro and passed into the hydrated component)
 */
type Props = {
  initialItems: ExperienceCardItem[];
};

export default function ExperienceCardList(props: Props) {
  const [query, setQuery] = createSignal("");
  const [debouncedQuery, setDebouncedQuery] = createSignal("");
  const [companyFilter, setCompanyFilter] = createSignal("");
  const [yearFilter, setYearFilter] = createSignal(""); // "" means all years
  const [sortOption, setSortOption] = createSignal<
    "date-desc" | "date-asc" | "company-asc"
  >("date-desc");
  const [page, setPage] = createSignal(1);
  const [pageSize, setPageSize] = createSignal(6);
  let searchRef: HTMLInputElement | undefined;

  // Debounce search input (300ms)
  createEffect(() => {
    const q = query();
    const id = setTimeout(() => setDebouncedQuery(q), 300);
    onCleanup(() => clearTimeout(id));
  });

  // Distinct companies for filter dropdown
  const companies = createMemo(() => {
    const out = new Set<string>();
    (props.initialItems ?? []).forEach((it) => {
      const c = String(it?.metadata?.company ?? "").trim();
      if (c) out.add(c);
    });
    return Array.from(out).sort();
  });

  // Derive available years (and "Present") from metadata dates
  const years = createMemo(() => {
    const out = new Set<string>();
    (props.initialItems ?? []).forEach((it) => {
      const meta = it?.metadata ?? {};
      const candidates = [
        meta?.startDate ?? "",
        meta?.endDate ?? "",
        meta?.date ?? "",
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
    // When any of these signals change, reset to page 1
    debouncedQuery();
    companyFilter();
    yearFilter();
    sortOption();
    setPage(1);
  });

  // Core processing pipeline: filter -> sort -> paginate
  const processedAll = createMemo(() => {
    let items = props.initialItems ?? [];
    // Company filter
    items = filterByCompany(items, companyFilter());
    // Search filter
    items = filterBySearch(items, debouncedQuery());
    // Year filter
    const yf = yearFilter();
    if (yf) {
      items = items.filter((it) => {
        const meta = it?.metadata ?? {};
        const cand = [
          meta?.startDate ?? "",
          meta?.endDate ?? "",
          meta?.date ?? "",
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
    } else if (sortOption() === "company-asc") {
      items = [...items].sort((a, b) => {
        const aa = String(a?.metadata?.company ?? "").toLowerCase();
        const bb = String(b?.metadata?.company ?? "").toLowerCase();
        return aa.localeCompare(bb);
      });
    }

    return items;
  });

  const totalCount = createMemo(() => processedAll().length);
  const totalPages = createMemo(() =>
    Math.max(1, Math.ceil(totalCount() / pageSize()))
  );
  const paginated = createMemo(() => {
    const p = Math.min(Math.max(1, page()), totalPages());
    const size = pageSize();
    const all = processedAll();
    const start = (p - 1) * size;
    return all.slice(start, start + size);
  });

  // Toggle visibility of the server-rendered cards.
  // The server renders a sibling .experience-grid with children:
  // <div class="experience-item" data-slug="..."><ExperienceCard .../></div>
  // This effect hides/shows those nodes based on the currently paginated items.
  createEffect(() => {
    if (typeof document === "undefined") return;
    const visible = new Set<string>(
      (paginated() ?? []).map((it) =>
        String((it as any)?.slug ?? "").replace(/\.(md|mdx)$/, "")
      )
    );

    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".experience-grid > .experience-item")
    );
    nodes.forEach((node) => {
      const slug = String(node.dataset.slug ?? "").replace(/\.(md|mdx)$/, "");
      const shouldShow = visible.has(slug);
      // Use inline styles to avoid coupling with CSS modules; also set aria-hidden.
      node.style.display = shouldShow ? "" : "none";
      node.setAttribute("aria-hidden", shouldShow ? "false" : "true");
    });
  });

  // Helpers for pagination controls
  const canPrev = createMemo(() => page() > 1);
  const canNext = createMemo(() => page() < totalPages());

  return (
    <section>
      <div
        class="experience-controls"
        style={{
          "margin-bottom": "1rem",
          display: "flex",
          gap: "0.5rem",
          "flex-wrap": "wrap",
          "align-items": "center",
        }}
      >
        <input
          ref={(el) => (searchRef = el!)}
          aria-label="Search experiences"
          placeholder="Search title, company, summary..."
          value={query()}
          onInput={(e: any) => setQuery(e.target.value)}
          style="padding:0.6rem;min-width:220px"
        />

        <select
          aria-label="Filter by company"
          value={companyFilter()}
          onChange={(e: any) => setCompanyFilter(e.target.value)}
          style={{ padding: "0.6rem" }}
        >
          <option value="">All companies</option>
          <For each={companies()}>
            {(c: string) => <option value={c}>{c}</option>}
          </For>
        </select>

        <select
          aria-label="Filter by year"
          value={yearFilter()}
          onChange={(e: any) => setYearFilter(e.target.value)}
          style={{ padding: "0.6rem" }}
        >
          <option value="">All years</option>
          <For each={years()}>
            {(y: string) => <option value={y}>{y}</option>}
          </For>
        </select>

        <select
          aria-label="Sort experiences"
          value={sortOption()}
          onChange={(e: any) => setSortOption(e.target.value)}
          style={{ padding: "0.6rem" }}
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="company-asc">Company A–Z</option>
        </select>

        <label style="display:inline-flex;align-items:center;gap:0.5rem">
          <span class="sr-only">Items per page</span>
          <select
            aria-label="Items per page"
            value={pageSize()}
            onChange={(e: any) => {
              setPageSize(Number(e.target.value) || 6);
              setPage(1);
            }}
            style={{ padding: "0.4rem" }}
          >
            <option value="6">6 / page</option>
            <option value="12">12 / page</option>
            <option value="24">24 / page</option>
          </select>
        </label>

        <button
          onClick={() => {
            setQuery("");
            setDebouncedQuery("");
            setCompanyFilter("");
            setYearFilter("");
            setSortOption("date-desc");
            setPage(1);
            searchRef?.focus();
          }}
          style={{ padding: "0.6rem" }}
        >
          Reset
        </button>
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        style="position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;"
      >
        {totalCount()} results, page {page()} of {totalPages()}
      </div>

      {/* Server-rendered grid of ExperienceCard entries lives in the parent (ExperienceSection).
          This client island controls visibility only (via data-slug on each .experience-item). */}

      {/* Pagination Controls */}
      <div
        class="pagination-controls"
        style={{
          display: "flex",
          gap: "0.5rem",
          "align-items": "center",
          "margin-top": "1rem",
        }}
      >
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!canPrev()}
          aria-disabled={!canPrev()}
          style={{ padding: "0.5rem" }}
        >
          Prev
        </button>
        <div>
          Page {page()} of {totalPages()} — Showing{" "}
          {Math.min((page() - 1) * pageSize() + 1, totalCount())}-
          {Math.min(page() * pageSize(), totalCount())} of {totalCount()}
        </div>
        <button
          onClick={() => setPage((p) => Math.min(totalPages(), p + 1))}
          disabled={!canNext()}
          aria-disabled={!canNext()}
          style={{ padding: "0.5rem" }}
        >
          Next
        </button>
      </div>
    </section>
  );
}
