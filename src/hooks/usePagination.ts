import { useState, useEffect, useMemo } from 'react';

interface UsePaginationOptions<T> {
  data: T[];
  itemsPerPage: number;
  resetDependency?: any; // When this value changes, reset to page 1
}

interface UsePaginationReturn<T> {
  displayedData: T[];
  currentPage: number;
  hasMore: boolean;
  totalDisplayed: number;
  totalItems: number;
  loadMore: () => void;
  reset: () => void;
  setPage: (page: number) => void;
}

export function usePagination<T>({
  data,
  itemsPerPage,
  resetDependency,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when resetDependency changes
  useEffect(() => {
    setCurrentPage(1);
  }, [resetDependency]);

  // Get currently displayed data (paginated)
  const displayedData = useMemo(() => {
    return data.slice(0, currentPage * itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const hasMore = displayedData.length < data.length;
  const totalDisplayed = displayedData.length;
  const totalItems = data.length;

  // Load more data when called
  const loadMore = () => {
    if (hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Reset pagination to page 1
  const reset = () => {
    setCurrentPage(1);
  };

  // Set specific page
  const setPage = (page: number) => {
    const maxPage = Math.ceil(data.length / itemsPerPage);
    const validPage = Math.max(1, Math.min(page, maxPage));
    setCurrentPage(validPage);
  };

  return {
    displayedData,
    currentPage,
    hasMore,
    totalDisplayed,
    totalItems,
    loadMore,
    reset,
    setPage,
  };
}
