import { createSignal, createMemo, type Accessor } from "solid-js";

export interface PaginationOptions {
  defaultPage?: number;
  defaultPageSize?: number;
}

export interface UsePaginationResult<T> {
  page: Accessor<number>;
  setPage: (p: number | ((prev: number) => number)) => void;
  pageSize: Accessor<number>;
  setPageSize: (s: number) => void;
  totalPages: Accessor<number>;
  paginatedItems: Accessor<T[]>;
  canPrev: Accessor<boolean>;
  canNext: Accessor<boolean>;
  nextPage: () => void;
  prevPage: () => void;
}

export function usePagination<T>(
  items: Accessor<T[]>,
  options: PaginationOptions = {}
): UsePaginationResult<T> {
  const [page, setPage] = createSignal(options.defaultPage ?? 1);
  const [pageSize, setPageSize] = createSignal(options.defaultPageSize ?? 6);

  const totalCount = createMemo(() => items().length);
  
  const totalPages = createMemo(() =>
    Math.max(1, Math.ceil(totalCount() / pageSize()))
  );

  const paginatedItems = createMemo(() => {
    // Ensure current page is valid for current data
    const safePage = Math.min(Math.max(1, page()), totalPages());
    if (safePage !== page()) {
      setPage(safePage);
    }
    
    const size = pageSize();
    const start = (safePage - 1) * size;
    return items().slice(start, start + size);
  });

  const canPrev = createMemo(() => page() > 1);
  const canNext = createMemo(() => page() < totalPages());

  const nextPage = () => setPage((p) => Math.min(totalPages(), p + 1));
  const prevPage = () => setPage((p) => Math.max(1, p - 1));

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedItems,
    canPrev,
    canNext,
    nextPage,
    prevPage,
  };
}
