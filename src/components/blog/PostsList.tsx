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

  // Tag panel UI helpers
  const [showTagPanel, setShowTagPanel] = createSignal<boolean>(false);
  const [tagFilterTerm, setTagFilterTerm] = createSignal<string>("");
  let tagPanelRef: HTMLElement | undefined;

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
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  });

  const visibleTags = createMemo(() => {
    const term = tagFilterTerm().trim().toLowerCase();
    if (!term) return tags();
    return tags().filter((t) => t.toLowerCase().includes(term));
  });

  // Tag counts
  const tagCounts = createMemo(() => {
    const counts = new Map<string, number>();
    for (const p of all) {
      if (!Array.isArray(p.tags)) continue;
      for (const t of p.tags) {
        if (typeof t !== "string" || !t.trim()) continue;
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return counts;
  });

  // Close tag panel
  createEffect(() => {
    if (typeof document === "undefined") return;
    if (!showTagPanel()) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!tagPanelRef) return;
      if (target && tagPanelRef.contains(target)) return;
      setShowTagPanel(false);
    };
    document.addEventListener("click", handler);
    onCleanup(() => document.removeEventListener("click", handler));
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
    items.slice().sort((a, b) => {
      const ta = a?.date ? Date.parse(a.date as string) : 0;
      const tb = b?.date ? Date.parse(b.date as string) : 0;
      return sortOrder() === "newest" ? tb - ta : ta - tb;
    });
    return items;
  });

  // Pagination
  const pagination = usePagination(filteredAndSorted, { defaultPageSize: 5 });

  // Helpers
  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const set = new Set(prev);
      if (set.has(tag)) set.delete(tag);
      else set.add(tag);
      return Array.from(set);
    });
    pagination.setPage(1);
  }

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
            <div class="control-pair">
              <label for="tagFilter" class="control-label">
                Filter by Tag
              </label>
              <div class="dropdown" style={{ position: "relative" } as any}>
                <button
                  type="button"
                  onClick={() => setShowTagPanel((s) => !s)}
                  aria-expanded={showTagPanel()}
                  aria-haspopup="true"
                  aria-controls="tag-panel"
                  class="control-select dropdown-toggle"
                >
                  <span class="sr-only">Toggle tag selector</span>
                  <span
                    style={
                      {
                        "border-radius": "999px",
                        padding: "0 0.4rem",
                        "font-weight": "600",
                      } as any
                    }
                  >
                    {selectedTags().length === 0
                      ? "All"
                      : selectedTags().length}
                  </span>
                </button>

                <div
                  ref={(el) => (tagPanelRef = el!)}
                  id="tag-panel"
                  role="menu"
                  aria-label="Tag selector"
                  class={`dropdown-panel ${showTagPanel() ? "open" : ""}`}
                >
                  <input
                    placeholder="Search tags"
                    value={tagFilterTerm()}
                    onInput={(e) =>
                      setTagFilterTerm((e.target as HTMLInputElement).value)
                    }
                    class="control-select"
                    style={{ width: "100%", "margin-bottom": "0.5rem" } as any}
                  />

                  <div
                    style={
                      {
                        display: "flex",
                        "flex-direction": "column",
                        gap: "0.25rem",
                      } as any
                    }
                  >
                    <button
                      type="button"
                      role="menuitemcheckbox"
                      aria-checked={selectedTags().length === 0}
                      onClick={() => {
                        setSelectedTags([]);
                        pagination.setPage(1);
                      }}
                      class="dropdown-item"
                      style={{ "justify-content": "space-between" } as any}
                    >
                      <span>
                        <span style={{ "margin-right": "0.5rem" } as any}>
                          {selectedTags().length === 0 ? "✓" : "○"}
                        </span>
                        All
                      </span>
                    </button>

                    <For each={visibleTags()}>
                      {(t) => {
                        const isSel = () => selectedTags().includes(t);
                        const count = tagCounts().get(t) ?? 0;
                        return (
                          <label
                            class="dropdown-item"
                            role="menuitemcheckbox"
                            aria-checked={isSel()}
                            style={
                              {
                                display: "flex",
                                "align-items": "center",
                                "justify-content": "space-between",
                                gap: "0.75rem",
                              } as any
                            }
                          >
                            <span
                              style={
                                {
                                  display: "flex",
                                  "align-items": "center",
                                  gap: "0.5rem",
                                } as any
                              }
                            >
                              <input
                                type="checkbox"
                                checked={isSel()}
                                onChange={() => toggleTag(t)}
                                aria-checked={isSel()}
                              />
                              <span>{t}</span>
                            </span>
                            <span style={{ opacity: isSel() ? 1 : 0.75 }}>
                              {count}
                            </span>
                          </label>
                        );
                      }}
                    </For>
                  </div>
                </div>
              </div>
            </div>
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
