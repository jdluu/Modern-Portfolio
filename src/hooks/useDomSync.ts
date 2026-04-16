import { createEffect, type Accessor } from "solid-js";

interface UseDomSyncOptions {
  /**
   * List of slugs that should be currently visible.
   */
  visibleSlugs: Accessor<string[]>;
  /**
   * Selector for the container element (e.g., ".experience-grid").
   */
  containerSelector: string;
  /**
   * Selector for the individual item elements (e.g., ".experience-item").
   */
  itemSelector: string;
  /**
   * Function to normalize slugs if needed (optional).
   * Defaults to exact match.
   */
  normalizeSlug?: (slug: string) => string;
}

/**
 * Custom hook that synchronizes the order and visibility of server-rendered DOM nodes
 * with client-side reactive state from a SolidJS island.
 *
 * This ensures that filtering and pagination changes made in the client are reflected
 * in the static HTML grid rendered by Astro, preserving SEO and performance benefits.
 *
 * @param options - Configuration options for targeting the DOM and providing visible slugs.
 */
export function useDomSync(options: UseDomSyncOptions) {
  const {
    visibleSlugs,
    containerSelector,
    itemSelector,
    normalizeSlug = (s) => s,
  } = options;

  createEffect(() => {
    if (typeof document === "undefined") return;

    // Use a Set for O(1) lookup
    const slugsArray = visibleSlugs();
    const slugsSet = new Set(slugsArray.map(normalizeSlug));

    // Attempt to find container with retries to handle hydration race conditions
    const attemptSync = (retries = 0) => {
      const container = document.querySelector<HTMLElement>(containerSelector);

      if (!container) {
        if (retries < 10) {
          requestAnimationFrame(() => attemptSync(retries + 1));
        }
        return;
      }

      const nodes = Array.from(
        container.querySelectorAll<HTMLElement>(itemSelector),
      );

      if (nodes.length === 0) {
        if (retries < 20) {
          requestAnimationFrame(() => attemptSync(retries + 1));
        }
        return;
      }

      // Map nodes by normalized slug for O(1) retrieval during reorder
      const nodesMap = new Map<string, HTMLElement>();

      // 1. Toggle visibility and build nodesMap
      nodes.forEach((node) => {
        const rawSlug = node.dataset.slug ?? "";
        const normalized = normalizeSlug(rawSlug);
        const shouldShow = slugsSet.has(normalized);

        node.style.display = shouldShow ? "" : "none";
        node.setAttribute("aria-hidden", shouldShow ? "false" : "true");

        nodesMap.set(normalized, node);
      });

      // 2. Reorder DOM to match the order of visibleSlugs using a fragment for batching
      const fragment = document.createDocumentFragment();
      let hasChange = false;

      slugsArray.forEach((slug) => {
        const normalized = normalizeSlug(slug);
        const node = nodesMap.get(normalized);
        if (node) {
          fragment.appendChild(node);
          hasChange = true;
        } else {
          console.warn(
            `useDomSync: Node for slug '${slug}' not found during reorder.`,
          );
        }
      });

      if (hasChange) {
        container.appendChild(fragment);
      }
    };

    attemptSync();
  });
}
