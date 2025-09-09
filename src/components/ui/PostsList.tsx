/** @jsxImportSource solid-js */
import { createSignal, createMemo, For, Show } from "solid-js";
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
      items = items.filter((i) => Array.isArray(i.tags) && i.tags.includes(tag));
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
  const totalPages = createMemo(() => Math.max(1, Math.ceil(totalItems() / pageSize())));
 
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
 
  return (
    <section>
      <div class="posts-controls" style={{ "margin-bottom": "1rem", display: "flex", "gap": "0.75rem", "flex-wrap": "wrap", "align-items": "center" }}>
        <div>
          <label for="sort" style={{ "margin-right": "0.5rem", "font-weight": "600" }}>Sort</label>
          <select id="sort" value={sortOrder()} onChange={(e) => { setSortOrder((e.target as HTMLSelectElement).value as any); setPage(1); }}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
 
        <div>
          <label for="pageSize" style={{ "margin-right": "0.5rem", "font-weight": "600" }}>Per page</label>
          <select id="pageSize" value={String(pageSize())} onChange={(e) => changePageSize(Number((e.target as HTMLSelectElement).value))}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>
 
        {/* drafts are permanently excluded; draft toggle removed */}
 
        <div style={{ "margin-left": "auto", display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <Show when={tags().length > 0}>
            <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
              <label style={{ "font-weight": "600", "margin-right": "0.5rem" }}>Tag</label>
              <select value={selectedTag() ?? ""} onChange={(e) => selectTag((e.target as HTMLSelectElement).value || null)}>
                <option value="">All</option>
                <For each={tags()}>
                  {(t) => <option value={t}>{t}</option>}
                </For>
              </select>
            </div>
          </Show>
        </div>
      </div>
 
      <Show when={totalItems() === 0}>
        <p class="empty-text">No posts match your filters.</p>
      </Show>
 
      <Show when={totalItems() > 0}>
        <ul class="post-list" role="list">
          <For each={pageItems()}>
            {(post) => (
              <li class="post-item">
                <a href={`/posts/${post.slug}`} class="post-card">
                  <h2 class="post-card-title">{post.title}</h2>
 
                  {post.date && (
                    <time class="post-card-date">
                      {new Date(post.date).toLocaleDateString()}
                    </time>
                  )}
 
                  {post.tags && post.tags.length > 0 && (
                    <div class="post-card-tags" aria-hidden="false">
                      {post.tags.slice(0, 6).map((tag) => (
                        <span class="tag-chip">#{tag}</span>
                      ))}
                    </div>
                  )}
 
                  {post.description && post.description.length > 0 && (
                    <p class="post-card-desc line-clamp-3">{post.description}</p>
                  )}
                </a>
              </li>
            )}
          </For>
        </ul>
 
        <div class="pagination" style={{ "margin-top": "1rem", display: "flex", "gap": "0.5rem", "align-items": "center", "justify-content": "center" }}>
          <button type="button" onClick={goPrev} disabled={page() <= 1}>Previous</button>
          <span aria-live="polite" style={{ "min-width": "8rem", "text-align": "center" }}>
            Page {page()} of {totalPages()} — {totalItems()} posts
          </span>
          <button type="button" onClick={goNext} disabled={page() >= totalPages()}>Next</button>
        </div>
      </Show>
    </section>
  );
}