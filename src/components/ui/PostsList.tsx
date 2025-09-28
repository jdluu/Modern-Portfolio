import {
  createSignal,
  createMemo,
  createEffect,
  For,
  Show,
  onCleanup,
} from "solid-js";
import type { PostIndexItem } from "../../types/post";

/**
 * PostsList (Solid.js) — interactive island
 *
 * Client-side behavior (in-memory only):
 * - Holds the full list of posts in memory (props.initialItems)
 * - Sorting (newest-first / oldest-first)
 * - Filter by tag
 * - Pagination with page size selector (5,10,20) and Prev/Next controls
 * - Drafts are always excluded (no toggle)
 *
 * Important: This component performs NO network requests. All operations are
 * pure array transforms on the initialItems passed from the server.
 */
type Props = {
  initialItems: PostIndexItem[];
};

export default function PostsList(props: Props) {
  const all = props.initialItems ?? [];

  // UI state
  const [sortOrder, setSortOrder] = createSignal<"newest" | "oldest">("newest");
  // support multiple selected tags
  const [selectedTags, setSelectedTags] = createSignal<string[]>([]);
  const [pageSize, setPageSize] = createSignal<number>(5); // default view shows 5 posts
  const [page, setPage] = createSignal<number>(1);

  // Tag panel UI helpers (searchable, toggleable panel for many tags)
  const [showTagPanel, setShowTagPanel] = createSignal<boolean>(false);
  const [tagFilterTerm, setTagFilterTerm] = createSignal<string>("");
  let tagPanelRef: HTMLElement | undefined;

  // Derived unique tags from all posts (for filter UI)
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

  // Close tag panel when clicking outside
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

  // Filter + Sort (pure, in-memory)
  const filteredAndSorted = createMemo(() => {
    let items = all.slice();
    // always exclude drafts (server and UI)
    items = items.filter((i) => !i.draft);
    // tag filter (support multiple tags — include item if it matches any selected tag)
    const sel = selectedTags();
    if (sel.length > 0) {
      const s = new Set(sel);
      items = items.filter(
        (i) => Array.isArray(i.tags) && i.tags.some((t) => s.has(t)),
      );
    }
    // sort by date (newest/oldest)
    items.sort((a, b) => {
      const ta = a?.date ? Date.parse(a.date as string) : 0;
      const tb = b?.date ? Date.parse(b.date as string) : 0;
      return sortOrder() === "newest" ? tb - ta : ta - tb;
    });
    return items;
  });

  const totalItems = createMemo(() => filteredAndSorted().length);
  const totalPages = createMemo(() =>
    Math.max(1, Math.ceil(totalItems() / pageSize())),
  );

  // Current page items
  const pageItems = createMemo(() => {
    const pg = Math.max(1, Math.min(page(), totalPages()));
    const size = pageSize();
    const start = (pg - 1) * size;
    return filteredAndSorted().slice(start, start + size);
  });

  // Helpers
  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const set = new Set(prev);
      if (set.has(tag)) set.delete(tag);
      else set.add(tag);
      return Array.from(set);
    });
    setPage(1);
  }
  function changePageSize(n: number) {
    setPageSize(n);
    setPage(1);
  }
  function goPrev() {
    setPage(Math.max(1, page() - 1));
  }
  function goNext() {
    setPage(Math.min(totalPages(), page() + 1));
  }

  // When pageItems (server list window) changes, toggle visibility of server-rendered .post-item nodes.
  createEffect(() => {
    if (typeof document === "undefined") return;
    const visibleSlugs = new Set(
      (pageItems() ?? []).map((p) =>
        String(p.slug ?? "").replace(/\.(md|mdx)$/, ""),
      ),
    );
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".post-list > .post-item"),
    );
    nodes.forEach((n) => {
      const slug = String(
        n.dataset.slug ??
          n.querySelector("a")?.getAttribute("href")?.split("/posts/")[1] ??
          "",
      ).replace(/\.(md|mdx)$/, "");
      const show = visibleSlugs.has(slug);
      n.style.display = show ? "" : "none";
      n.setAttribute("aria-hidden", show ? "false" : "true");
    });
  });

  // Render pagination controls into the server-rendered placeholder below the posts.
  // This keeps the server list as the canonical DOM for SEO while the island controls
  // pagination/filters via toggling and by mounting controls into the placeholder.
  createEffect(() => {
    if (typeof document === "undefined") return;
    const placeholder = document.querySelector<HTMLElement>(
      ".posts-pagination-placeholder",
    );
    if (!placeholder) return;
    // Build controls HTML (use theme-aware CSS classes instead of inline colours)
    const prevDisabled = page() <= 1;
    const nextDisabled = page() >= totalPages();
    placeholder.innerHTML = "";
    const container = document.createElement("div");
    // assign both a generic pagination-controls class and a posts-specific wrapper
    container.className = "pagination-controls posts-pagination-controls";
    container.style.display = "flex";
    container.style.gap = "1rem";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "pagination-button";
    prevBtn.textContent = "Previous";
    prevBtn.disabled = prevDisabled;
    prevBtn.addEventListener("click", () => goPrev());

    const info = document.createElement("div");
    info.className = "pagination-info";
    info.textContent = `Page ${page()} of ${totalPages()}`;

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "pagination-button";
    nextBtn.textContent = "Next";
    nextBtn.disabled = nextDisabled;
    nextBtn.addEventListener("click", () => goNext());

    container.appendChild(prevBtn);
    container.appendChild(info);
    container.appendChild(nextBtn);
    placeholder.appendChild(container);
  });

  return (
    <section>
      <div class="posts-controls experience-controls">
        <div
          class="controls-left"
          style={{
            display: "flex",
            gap: "0.75rem",
            "flex-wrap": "wrap",
            "align-items": "center",
          }}
        >
          <div>
            <label
              for="sort"
              style={{ "margin-right": "0.5rem", "font-weight": "600" }}
            >
              Sort
            </label>
            <select
              id="sort"
              value={sortOrder()}
              onChange={(e) => {
                setSortOrder((e.target as HTMLSelectElement).value as any);
                setPage(1);
              }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          <div>
            <label
              for="pageSize"
              style={{ "margin-right": "0.5rem", "font-weight": "600" }}
            >
              Per page
            </label>
            <select
              id="pageSize"
              value={String(pageSize())}
              onChange={(e) =>
                changePageSize(Number((e.target as HTMLSelectElement).value))
              }
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>
        </div>

        <div
          class="controls-right"
          style={{
            display: "flex",
            gap: "0.5rem",
            "align-items": "center",
          }}
        >
          <Show when={tags().length > 0}>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                "align-items": "center",
              }}
            >
              <label style={{ "font-weight": "600", "margin-right": "0.5rem" }}>
                Filter by Tag
              </label>

              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setShowTagPanel((s) => !s)}
                  aria-expanded={showTagPanel()}
                  style={{
                    padding: "0.25rem 0.6rem",
                    "border-radius": "6px",
                    border: "1px solid var(--m3-color-outline)",
                    background: "transparent",
                    display: "inline-flex",
                    gap: "0.5rem",
                    "align-items": "center",
                  }}
                >
                  <span
                    style={{
                      background: "var(--m3-color-surface-variant)",
                      "border-radius": "999px",
                      padding: "0 0.4rem",
                      "font-weight": "600",
                    }}
                  >
                    {selectedTags().length === 0
                      ? "All"
                      : selectedTags().length}
                  </span>
                </button>

                <Show when={showTagPanel()}>
                  <div
                    ref={(el) => (tagPanelRef = el!)}
                    role="dialog"
                    aria-label="Tag selector"
                    style={{
                      position: "absolute",
                      right: "0px",
                      "z-index": "1000",
                      "min-width": "220px",
                      "max-width": "360px",
                      padding: "0.5rem",
                      "margin-top": "0.5rem",
                      "border-radius": "8px",
                      border: "1px solid var(--m3-color-outline)",
                      background: "var(--m3-color-surface)",
                      "box-shadow": "0 6px 18px rgba(0,0,0,0.08)",
                      "max-height": "260px",
                      overflow: "auto",
                    }}
                  >
                    <input
                      placeholder="Search tags"
                      value={tagFilterTerm()}
                      onInput={(e) =>
                        setTagFilterTerm((e.target as HTMLInputElement).value)
                      }
                      style={{
                        width: "100%",
                        padding: "0.45rem 0.5rem",
                        "border-radius": "6px",
                        border: "1px solid var(--m3-color-outline)",
                        "margin-bottom": "0.5rem",
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        "flex-direction": "column",
                        gap: "0.25rem",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTags([]);
                          setPage(1);
                        }}
                        style={{
                          padding: "0.35rem 0.5rem",
                          "border-radius": "6px",
                          border: "1px solid var(--m3-color-outline)",
                          background:
                            selectedTags().length === 0
                              ? "var(--m3-color-primary)"
                              : "transparent",
                          color:
                            selectedTags().length === 0
                              ? "var(--m3-color-on-primary)"
                              : "inherit",
                          "text-align": "left",
                        }}
                      >
                        <span style={{ "margin-right": "0.5rem" }}>
                          {selectedTags().length === 0 ? "✓" : "○"}
                        </span>
                        All
                      </button>

                      <For each={visibleTags()}>
                        {(t) => {
                          const isSel = () => selectedTags().includes(t);
                          return (
                            <label
                              style={{
                                display: "flex",
                                "align-items": "center",
                                gap: "0.5rem",
                                padding: "0.25rem 0.25rem",
                                "border-radius": "6px",
                                cursor: "pointer",
                                background: isSel()
                                  ? "var(--m3-color-surface-variant)"
                                  : "transparent",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSel()}
                                onChange={() => toggleTag(t)}
                                aria-checked={isSel()}
                              />
                              <span style={{ flex: "1 1 auto" }}>{t}</span>
                              <span style={{ opacity: isSel() ? 1 : 0.45 }}>
                                {isSel() ? "✓" : "○"}
                              </span>
                            </label>
                          );
                        }}
                      </For>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        "justify-content": "flex-end",
                        "margin-top": "0.5rem",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setShowTagPanel(false)}
                        style={{
                          padding: "0.35rem 0.5rem",
                          "border-radius": "6px",
                          border: "1px solid var(--m3-color-outline)",
                          background: "transparent",
                        }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </Show>
              </div>
            </div>
          </Show>

          <button
            class="btn-reset"
            onClick={() => {
              setSortOrder("newest");
              setSelectedTags([]);
              setPageSize(5);
              setPage(1);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Note: The actual list elements are server-rendered in BlogSection. This island only controls visibility. */}
    </section>
  );
}
