import { createSignal, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";
import type { UsePaginationResult } from "../../hooks/usePagination";

interface PaginationControlsProps {
  pagination: UsePaginationResult<any>;
  portalTargetId?: string; // e.g. "experience-pagination-portal"
  class?: string;
}

export default function PaginationControls(props: PaginationControlsProps) {
  const { page, totalPages, canPrev, canNext, prevPage, nextPage } = props.pagination;
  const [mounted, setMounted] = createSignal(false);
  
  onMount(() => {
    setMounted(true);
  });

  // Define content as a component so it is not instantiated/hydrated until rendered
  const Content = () => (
    <div class={`pagination-controls ${props.class ?? ""}`}>
      <button
        class="pagination-button"
        onClick={prevPage}
        disabled={!canPrev()}
        aria-disabled={!canPrev()}
      >
        Previous
      </button>
      
      <div class="pagination-info">
        Page {page()} of {totalPages()}
      </div>
      
      <button
        class="pagination-button"
        onClick={nextPage}
        disabled={!canNext()}
        aria-disabled={!canNext()}
      >
        Next
      </button>
    </div>
  );

  /**
   * Hydration strategy:
   * When using a Portal (`portalTargetId` exists), avoid rendering content during SSR/hydration 
   * to prevent mismatches since the target container is empty.
   * Only mount the portal content after client-side mount.
   */
  return (
    <Show
      when={props.portalTargetId}
      fallback={<Content />}
    >
      <Show when={mounted()}>
         <Portal mount={document.getElementById(props.portalTargetId!)!}>
           <Content />
         </Portal>
      </Show>
    </Show>
  );
}
