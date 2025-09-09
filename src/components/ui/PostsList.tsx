import { createSignal, createMemo, createEffect, For, Show } from "solid-js";
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
  const [selectedTag, setSelectedTag] = createSignal<string | null>(null);
  const [pageSize, setPageSize] = createSignal<number>(5); // default view shows 5 posts
  const [page, setPage] = createSignal<number>(1);

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

  // Filter + Sort (pure, in-memory)
  const filteredAndSorted = createMemo(() => {
    let items = all.slice();
    // always exclude drafts (server and UI)
    items = items.filter((i) => !i.draft);
    // tag filter
    const tag = selectedTag();
    if (tag) {
      items = items.filter(
        (i) => Array.isArray(i.tags) && i.tags.includes(tag)
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
    Math.max(1, Math.ceil(totalItems() / pageSize()))
  );

  // Current page items
  const pageItems = createMemo(() => {
    const pg = Math.max(1, Math.min(page(), totalPages()));
    const size = pageSize();
    const start = (pg - 1) * size;
    return filteredAndSorted().slice(start, start + size);
  });

  // Helpers
  function selectTag(tag: string | null) {
    setSelectedTag(tag);
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
      (pageItems() ?? []).map((p) => String(p.slug ?? "").replace(/\.(md|mdx)$/, ""))
    );
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".post-list > .post-item"));
    nodes.forEach((n) => {
      const slug = String(n.dataset.slug ?? n.querySelector("a")?.getAttribute("href")?.split("/posts/")[1] ?? "").replace(/\.(md|mdx)$/, "");
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
    const placeholder = document.querySelector<HTMLElement>(".posts-pagination-placeholder");
    if (!placeholder) return;
    // Build controls HTML
    const prevDisabled = page() <= 1;
    const nextDisabled = page() >= totalPages();
    placeholder.innerHTML = "";
    const container = document.createElement("div");
    container.className = "posts-pagination-controls";
    container.style.display = "flex";
    container.style.gap = "1rem";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.textContent = "Previous";
    prevBtn.disabled = prevDisabled;
    prevBtn.style.padding = "0.6rem 0.9rem";
    prevBtn.style.borderRadius = "8px";
    prevBtn.style.border = "1px solid var(--m3-color-outline)";
    prevBtn.style.background = prevDisabled ? "transparent" : "var(--m3-color-primary)";
    prevBtn.style.color = prevDisabled ? "var(--m3-color-on-surface-variant)" : "var(--m3-color-on-primary)";
    prevBtn.style.cursor = prevDisabled ? "not-allowed" : "pointer";
    prevBtn.addEventListener("click", () => goPrev());

    const info = document.createElement("div");
    info.textContent = `Page ${page()} of ${totalPages()} — ${totalItems()} posts`;
    info.style.padding = "0.45rem 0.9rem";
    info.style.borderRadius = "999px";
    info.style.background = "var(--m3-color-surface-variant)";
    info.style.color = "var(--m3-color-on-surface-variant)";
    info.style.fontWeight = "600";

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.textContent = "Next";
    nextBtn.disabled = nextDisabled;
    nextBtn.style.padding = "0.6rem 0.9rem";
    nextBtn.style.borderRadius = "8px";
    nextBtn.style.border = "1px solid var(--m3-color-outline)";
    nextBtn.style.background = nextDisabled ? "transparent" : "var(--m3-color-primary)";
    nextBtn.style.color = nextDisabled ? "var(--m3-color-on-surface-variant)" : "var(--m3-color-on-primary)";
    nextBtn.style.cursor = nextDisabled ? "not-allowed" : "pointer";
    nextBtn.addEventListener("click", () => goNext());

    container.appendChild(prevBtn);
    container.appendChild(info);
    container.appendChild(nextBtn);
    placeholder.appendChild(container);
  });

  return (
    <section>
      <div
        class="posts-controls"
        style={{
          "margin-bottom": "1rem",
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

        <div
          style={{
            "margin-left": "auto",
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
                Tag
              </label>
              <select
                value={selectedTag() ?? ""}
                onChange={(e) =>
                  selectTag((e.target as HTMLSelectElement).value || null)
                }
              >
                <option value="">All</option>
                <For each={tags()}>{(t) => <option value={t}>{t}</option>}</For>
              </select>
            </div>
          </Show>
        </div>
      </div>


      {/* Note: The actual list elements are server-rendered in BlogSection. This island only controls visibility. */}

    </section>
  );
}
