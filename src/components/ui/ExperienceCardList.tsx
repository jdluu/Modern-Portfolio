/** @jsxImportSource solid-js */
import { For, createSignal, createMemo, createEffect, onCleanup } from "solid-js";
import type { ExperienceCardItem } from "../../types/experience-card";
import {
  sortExperienceCardsByDateDesc,
  getComparableTsFromItem,
  filterByCompany,
  filterBySearch,
} from "../../lib/experience-cards.client";

/**
 * ExperienceCardList (Solid.js)
 *
 * Props:
 * - initialItems: ExperienceCardItem[] (rendered statically by Astro and passed into the hydrated component)
 *
 * Behavior:
 * - Manages client-side filtering and sorting only (no API calls).
 * - Uses utilities from src/lib/experience-cards.client.ts for deterministic behavior.
 *
 * Note: This component intentionally mirrors the server-rendered card markup so existing CSS
 * (used by [`src/components/ui/ExperienceCard.astro`](src/components/ui/ExperienceCard.astro:1))
 * applies to client-rendered cards as well.
 */
type Props = {
  initialItems: ExperienceCardItem[];
};

export default function ExperienceCardList(props: Props) {
  const [query, setQuery] = createSignal("");
  const [debouncedQuery, setDebouncedQuery] = createSignal("");
  const [companyFilter, setCompanyFilter] = createSignal("");
  const [sortDesc, setSortDesc] = createSignal(true);
  let searchRef: HTMLInputElement | undefined;

  // Debounce search input (300ms)
  createEffect(() => {
    const q = query();
    const id = setTimeout(() => setDebouncedQuery(q), 300);
    onCleanup(() => clearTimeout(id));
  });

  // Derive distinct company list for a simple filter dropdown
  const companies = createMemo(() => {
    const out = new Set<string>();
    (props.initialItems ?? []).forEach((it) => {
      const c = String(it?.metadata?.company ?? "").trim();
      if (c) out.add(c);
    });
    return Array.from(out).sort();
  });

  // Apply filters + sorting using the shared helpers
  const processed = createMemo(() => {
    let items = props.initialItems ?? [];
    // Company filter
    items = filterByCompany(items, companyFilter());
    // Search filter (debounced)
    items = filterBySearch(items, debouncedQuery());
    // Sort
    items = sortExperienceCardsByDateDesc(items);
    if (!sortDesc()) {
      items = [...items].reverse();
    }
    return items;
  });

  return (
    <section>
      <div class="experience-controls" style={{ "margin-bottom": "1rem", display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
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
            {(c) => <option value={c}>{c}</option>}
          </For>
        </select>

        <button
          onClick={() => setSortDesc(!sortDesc())}
          aria-pressed={sortDesc()}
          style={{ padding: "0.6rem" }}
        >
          {sortDesc() ? "Newest first" : "Oldest first"}
        </button>

        <button
          onClick={() => {
            setQuery("");
            setDebouncedQuery("");
            setCompanyFilter("");
            setSortDesc(true);
            // return focus to search input for keyboard users
            searchRef?.focus();
          }}
          style={{ padding: "0.6rem" }}
        >
          Reset
        </button>
      </div>

      <div aria-live="polite" aria-atomic="true" style="position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;">
        {processed().length} results
      </div>

      <div class="experience-grid">
        <For each={processed()}>
          {(item) => {
            const meta = item?.metadata ?? {};
            const title = item?.title ?? "Untitled";
            const company = meta.company ?? "";
            const thumbnail = meta.thumbnail ?? "";
            const summary = meta.summary ?? "";
            const filenameSafe = item?.slug ?? "";
            const dateStr = meta.date ?? "";

            // Build title + company display
            const titleCompany = company ? `${title} @ ${company}` : title;
            const imgAlt = titleCompany;

            return (
              <div class="experience-item">
                <section class="background">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={imgAlt}
                      class="experience-image"
                      loading="lazy"
                      decoding="async"
                      width="600"
                      height="400"
                    />
                  ) : (
                    <div class="experience-image placeholder" aria-hidden="true"></div>
                  )}
                  <div class="project-container">
                    <section class="more-info" aria-hidden={false}>
                      <span class="project-title">{titleCompany}</span>
                      {dateStr ? (
                        <span class="project-date">{dateStr}</span>
                      ) : <span class="project-date empty" aria-hidden="true"></span>}
                      {summary ? (
                        <p class="project-description">{summary}</p>
                      ) : (
                        <p class="project-description" aria-hidden="true"></p>
                      )}
                    </section>
                    <a class="learn-more" href={`/experiences/${filenameSafe}`}>Learn More</a>
                  </div>
                </section>
              </div>
            );
          }}
        </For>
      </div>
    </section>
  );
}