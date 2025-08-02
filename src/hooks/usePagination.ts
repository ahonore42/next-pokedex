import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

interface AutoLoadConfig {
  enabled: boolean;
  delay?: number; // Delay between auto-loads in ms (default: 1000)
  batchSize?: number; // How many pages to auto-load at once (default: 1)
  stopOnInteraction?: boolean; // Stop auto-loading if user manually loads (default: true)
  maxAutoPages?: number; // Maximum pages to auto-load (default: no limit)
}

interface UsePaginationOptions<T> {
  data: T[];
  itemsPerPage: number;
  resetDependency?: any;
  autoLoad?: AutoLoadConfig;
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
  isAutoLoading: boolean;
  stopAutoLoading: () => void;
}

export function usePagination<T>({
  data,
  itemsPerPage,
  resetDependency,
  autoLoad,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const autoLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Reset pagination when resetDependency changes
  useEffect(() => {
    // Stop any ongoing auto-loading
    if (autoLoadTimeoutRef.current) {
      clearTimeout(autoLoadTimeoutRef.current);
      autoLoadTimeoutRef.current = null;
    }

    // Reset all pagination state
    setCurrentPage(1);
    setUserInteracted(false);
    setIsAutoLoading(false);
  }, [resetDependency]);

  // Cleanup and mount management
  useEffect(() => {
    isMountedRef.current = true; // Set mounted flag on mount

    return () => {
      isMountedRef.current = false;

      // Clear any pending timeouts
      if (autoLoadTimeoutRef.current) {
        clearTimeout(autoLoadTimeoutRef.current);
        autoLoadTimeoutRef.current = null;
      }

      // Reset all state to initial values
      setCurrentPage(1);
      setIsAutoLoading(false);
      setUserInteracted(false);
    };
  }, []);

  // Get currently displayed data (paginated)
  const displayedData = useMemo(() => {
    return data.slice(0, currentPage * itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const hasMore = displayedData.length < data.length;
  const totalDisplayed = displayedData.length;
  const totalItems = data.length;

  // Single effect to handle all auto-loading logic
  useEffect(() => {
    // Early returns with debugging
    if (!autoLoad?.enabled) {
      return;
    }

    // User interaction should allow for standard eager loading
    if (userInteracted) {
      return;
    }

    // Exit if no data
    if (data.length === 0) {
      return;
    }

    // Complete data has been loaded
    const currentHasMore = displayedData.length < data.length;
    if (!currentHasMore) {
      return;
    }

    // End auto-load if all pages have been rendered
    const maxAutoPages = autoLoad.maxAutoPages;
    if (maxAutoPages && currentPage >= maxAutoPages) {
      return;
    }

    // Check if we already have a timeout running
    if (autoLoadTimeoutRef.current) {
      return;
    }

    // Auto-load if all conditions are passed
    const delay = autoLoad.delay ?? 1000;
    const batchSize = autoLoad.batchSize ?? 1;

    setIsAutoLoading(true);

    autoLoadTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) {
        // Component unmounted, skip the auto-load
        return;
      }

      if (userInteracted) {
        // User interacted during timeout, skip the auto-load
        setIsAutoLoading(false);
        return;
      }

      // Auto-load the current page
      setCurrentPage((prev) => {
        const newPage = Math.min(prev + batchSize, Math.ceil(data.length / itemsPerPage));
        return newPage;
      });

      setIsAutoLoading(false);
      autoLoadTimeoutRef.current = null; // Clear the ref
    }, delay);

    return () => {
      if (autoLoadTimeoutRef.current) {
        // Clean up timeout
        clearTimeout(autoLoadTimeoutRef.current);
        autoLoadTimeoutRef.current = null;
      }
    };
  }, [autoLoad, currentPage, userInteracted, data.length, displayedData.length, itemsPerPage]);

  // Manual load more function
  const loadMore = useCallback(() => {
    if (!isMountedRef.current) return; // Prevent action if unmounted

    if (hasMore) {
      setUserInteracted(true); // Mark that user has interacted
      setCurrentPage((prev) => prev + 1);

      // Stop auto-loading if configured to do so
      if (autoLoad?.stopOnInteraction !== false) {
        setIsAutoLoading(false);
        if (autoLoadTimeoutRef.current) {
          clearTimeout(autoLoadTimeoutRef.current);
          autoLoadTimeoutRef.current = null;
        }
      }
    }
  }, [hasMore, autoLoad?.stopOnInteraction]);

  // Reset pagination to page 1
  const reset = useCallback(() => {
    if (!isMountedRef.current) return; // Prevent action if unmounted

    setCurrentPage(1);
    setUserInteracted(false);
    setIsAutoLoading(false);
    if (autoLoadTimeoutRef.current) {
      clearTimeout(autoLoadTimeoutRef.current);
      autoLoadTimeoutRef.current = null;
    }
  }, []);

  // Set specific page
  const setPage = useCallback(
    (page: number) => {
      if (!isMountedRef.current) return; // Prevent action if unmounted

      const maxPage = Math.ceil(data.length / itemsPerPage);
      const validPage = Math.max(1, Math.min(page, maxPage));
      setCurrentPage(validPage);
      setUserInteracted(true);

      if (autoLoad?.stopOnInteraction !== false) {
        setIsAutoLoading(false);
        if (autoLoadTimeoutRef.current) {
          clearTimeout(autoLoadTimeoutRef.current);
          autoLoadTimeoutRef.current = null;
        }
      }
    },
    [data.length, itemsPerPage, autoLoad?.stopOnInteraction],
  );

  // Stop auto-loading manually
  const stopAutoLoading = useCallback(() => {
    if (!isMountedRef.current) return; // Prevent action if unmounted

    setIsAutoLoading(false);
    setUserInteracted(true);
    if (autoLoadTimeoutRef.current) {
      clearTimeout(autoLoadTimeoutRef.current);
      autoLoadTimeoutRef.current = null;
    }
  }, []);

  return {
    displayedData,
    currentPage,
    hasMore,
    totalDisplayed,
    totalItems,
    loadMore,
    reset,
    setPage,
    isAutoLoading,
    stopAutoLoading,
  };
}
