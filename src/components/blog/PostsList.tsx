import {
  createSignal,
  createMemo,
  createEffect,
  For,
  Show,
  onCleanup,
} from "solid-js";
import type { PostIndexItem } from "@app-types/post";
import { usePagination } from "@hooks/usePagination";
import { useDomSync } from "@hooks/useDomSync";
import PaginationControls from "@components/navigation/PaginationControls";
import FilterDropdown from "@components/filters/FilterDropdown";

/**
 * PostsList
 *
 * Client-side island that provides filtering, sorting, and pagination for blog posts.
 */
type Props = {
  initialItems: PostIndexItem[];
};

export default function PostsList(props: Props) {
  const all = props.initialItems ?? [];

  // UI state
  const [sortOrder, setSortOrder] = createSignal<"newest" | "oldest">("newest");
  const [selectedTags, setSelectedTags] = createSignal<string[]>([]);

  // Derive tags
  const tags = createMemo(() => {
    const s = new Set<string>();
    for (const p of all) {
      if (Array.isArray(p.tags)) {
        for (const t of p.tags) {
          if (typeof t === "string" && t.trim()) s.add(t);
        }
      }
    }
    const counts = new Map<string, number>();
    for (const p of all) {
      if (!Array.isArray(p.tags)) continue;
      for (const t of p.tags) {
        if (typeof t !== "string" || !t.trim()) continue;
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }

    return Array.from(s)
      .sort((a, b) => a.localeCompare(b))
      .map((t) => ({ name: t, count: counts.get(t) ?? 0 }));
  });

  // Filter + Sort
  const filteredAndSorted = createMemo(() => {
    let items = all.slice();
    // Exclude drafts
    items = items.filter((i) => !i.draft);

    // Tag filter
    const sel = selectedTags();
    if (sel.length > 0) {
      const s = new Set(sel);
      items = items.filter(
        (i) => Array.isArray(i.tags) && i.tags.some((t) => s.has(t)),
      );
    }

    // Sort
    items.sort((a, b) => {
      const ta = a?.date ? Date.parse(a.date as string) : 0;
      const tb = b?.date ? Date.parse(b.date as string) : 0;
      return sortOrder() === "newest" ? tb - ta : ta - tb;
    });
    return items;
  });

  // Pagination
  const pagination = usePagination(filteredAndSorted, { defaultPageSize: 5 });

  // DOM Sync
  useDomSync({
    visibleSlugs: createMemo(() =>
      pagination.paginatedItems().map((it) => {
        return String(it.slug ?? "").replace(/\.(md|mdx)$/, "");
      }),
    ),
    containerSelector: ".post-list",
    itemSelector: ".post-item",
    normalizeSlug: (s) =>
      String(s ?? "")
        .replace(/\.(md|mdx)$/, "")
        .replace(/^\/posts\//, ""),
  });

  return (
    <section>
      <div class="posts-controls experience-controls">
        <div class="controls-left">
          <div class="control-pair">
            <label for="sort" class="control-label">
              Sort
            </label>
            <select
              id="sort"
              class="control-select"
              value={sortOrder()}
              onChange={(e) => {
                setSortOrder((e.target as HTMLSelectElement).value as any);
                pagination.setPage(1);
              }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          <div class="control-pair">
            <label for="pageSize" class="control-label">
              Per page
            </label>
            <select
              id="pageSize"
              class="control-select compact"
              value={String(pagination.pageSize())}
              onChange={(e) => {
                pagination.setPageSize(
                  Number((e.target as HTMLSelectElement).value),
                );
                pagination.setPage(1);
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>
        </div>

        <div class="controls-right">
          <Show when={tags().length > 0}>
            <FilterDropdown
              id="tagFilter"
              label="Tags"
              items={tags}
              selectedItems={selectedTags}
              setSelectedItems={setSelectedTags}
              placeholder="Search tags..."
              onPageReset={() => pagination.setPage(1)}
            />
          </Show>

          <button
            class="btn-reset"
            onClick={() => {
              setSortOrder("newest");
              setSelectedTags([]);
              pagination.setPageSize(5);
              pagination.setPage(1);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <PaginationControls
        pagination={pagination}
        portalTargetId="posts-pagination-portal"
        class="posts-pagination-controls" // Preserve class for styling if any
      />
    </section>
  );
}
