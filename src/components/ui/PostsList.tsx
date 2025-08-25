/** @jsxImportSource solid-js */
import { For } from "solid-js";
import type { PostIndexItem } from "../../types/post";

/**
 * PostsList (Solid.js)
 *
 * Props:
 * - initialItems: PostIndexItem[] (rendered statically by Astro and passed into the hydrated component)
 *
 * Behavior:
 * - Purely rendering component; no API calls or client-side filtering by default
 * - Defensive rendering for optional description/tags
 */
type Props = {
  initialItems: PostIndexItem[];
};

export default function PostsList(props: Props) {
  const items = props.initialItems ?? [];

  return (
    <section>
      {items.length === 0 ? (
        <p class="empty-text">No posts published yet.</p>
      ) : (
        <ul class="post-list" role="list">
          <For each={items}>
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
      )}
    </section>
  );
}