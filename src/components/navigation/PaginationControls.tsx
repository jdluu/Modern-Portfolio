import { createSignal, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";
import type { UsePaginationResult } from "@hooks/usePagination";
import "./PaginationControls.css";

/**
 * Props for the PaginationControls component.
 */
interface PaginationControlsProps {
  /** The pagination result object containing signals and control functions. */
  pagination: UsePaginationResult<any>;
  /** Optional ID of a DOM element to portal the controls into. */
  portalTargetId?: string;
  /** Optional CSS class for the root container. */
  class?: string;
}

/**
 * PaginationControls component.
 *
 * Renders "Previous" and "Next" buttons with page information.
 * Supports portaling into a separate DOM element, which is useful for
 * placing pagination controls outside of the main component's container
 * (e.g., in a fixed footer or above a list).
 *
 * Handles SSR/Hydration carefully by only mounting portals after the client mount.
 */
export default function PaginationControls(props: PaginationControlsProps) {
  const [mounted, setMounted] = createSignal(false);

  onMount(() => {
    setMounted(true);
  });

  /**
   * Internal component to render the actual control buttons and info.
   */
  const Content = () => {
    // Access signals from props.pagination within the tracked scope of this component
    const { page, totalPages, canPrev, canNext, prevPage, nextPage } =
      props.pagination;

    return (
      <div class={`pagination-controls ${props.class ?? ""}`}>
        <button
          class="pagination-button"
          onClick={prevPage}
          disabled={!canPrev()}
          aria-label="Previous page"
          aria-disabled={!canPrev()}
        >
          Previous
        </button>

        <div class="pagination-info" aria-live="polite">
          Page {page()} of {totalPages()}
        </div>

        <button
          class="pagination-button"
          onClick={nextPage}
          disabled={!canNext()}
          aria-label="Next page"
          aria-disabled={!canNext()}
        >
          Next
        </button>
      </div>
    );
  };

  /**
   * Rendering logic:
   * 1. If no portalTargetId, render normally in-place.
   * 2. If portalTargetId exists, wait for mount and render via Portal.
   */
  return (
    <Show when={props.portalTargetId} fallback={<Content />}>
      <Show when={mounted()}>
        <Portal mount={document.getElementById(props.portalTargetId!)!}>
          <Content />
        </Portal>
      </Show>
    </Show>
  );
}
