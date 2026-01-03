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

export function useDomSync(options: UseDomSyncOptions) {
  const {
    visibleSlugs,
    containerSelector,
    itemSelector,
    normalizeSlug = (s) => s,
  } = options;

  createEffect(() => {
    if (typeof document === "undefined") return;

    const slugs = visibleSlugs().map(normalizeSlug);
    
    // Attempt to find container with retries to handle hydration race conditions
    const attemptSync = (retries = 0) => {
      const container = document.querySelector<HTMLElement>(containerSelector);
      
      if (!container) {
        // console.log(`useDomSync: Container ${containerSelector} not found. Retry ${retries}`);
        if (retries < 10) {
          requestAnimationFrame(() => attemptSync(retries + 1));
        }
        return;
      }

      const nodes = Array.from(
        container.querySelectorAll<HTMLElement>(itemSelector)
      );

      if (nodes.length === 0) {
         // console.log(`useDomSync: No nodes found in ${containerSelector}. Retry ${retries}`);
        if (retries < 20) {
          requestAnimationFrame(() => attemptSync(retries + 1));
        }
        return;
      }

      // 1. Toggle visibility
      nodes.forEach((node) => {
        const rawSlug = node.dataset.slug ?? "";
        const slug = normalizeSlug(rawSlug);
        const shouldShow = slugs.includes(slug);
        
        node.style.display = shouldShow ? "" : "none";
        node.setAttribute("aria-hidden", shouldShow ? "false" : "true");
      });

      // 2. Reorder DOM to match the order of visibleSlugs
      slugs.forEach((slug) => {
        const node = nodes.find((n) => normalizeSlug(n.dataset.slug ?? "") === slug);
        if (node) {
          container.appendChild(node); 
        } else {
           console.warn(`useDomSync: Node for slug '${slug}' not found during reorder.`);
        }
      });
    };

    attemptSync();
  });
}
