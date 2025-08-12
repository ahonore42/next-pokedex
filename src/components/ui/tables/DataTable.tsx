import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { Column } from './tables.config';
import TableColumn from './TableColumn';
import TableRow from './TableRow';
import SkeletonTableRow from '../skeletons/SkeletonTableRow';

// Simplified interfaces - focus on preventing horizontal layout shifts
type LayoutStabilizationConfig = {
  enabled: boolean;
  fixedLayout?: boolean; // Use CSS table-layout: fixed
  preCalculatedWidths?: string[]; // Fixed widths per column ['w-24', 'w-32', etc.]
  minColumnWidth?: string; // Minimum width for all columns
};

type VirtualScrollConfig = {
  enabled: boolean;
  rowHeight: number; // Must match standardRowHeight in pixels
  overscan?: number; // Extra rows to render (default: 5)
  threshold?: number; // When to enable virtualization (default: 100 rows)
};

interface InfiniteScrollConfig {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  eagerLoad?: boolean;
  skeletonRows?: number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  maxColumns?: number;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
  overlayHover?: boolean;
  noPadding?: boolean;
  border?: boolean;
  rounded?: boolean;
  infiniteScroll?: InfiniteScrollConfig;
  stickyHeader?: {
    enabled: boolean;
    maxHeight?: string;
  };
  layoutStabilization?: LayoutStabilizationConfig;
  virtualScroll?: VirtualScrollConfig;
}

export default function DataTable<T>({
  data,
  columns,
  maxColumns = 12,
  initialSortBy = undefined,
  initialSortOrder = 'asc',
  overlayHover = false,
  noPadding = false,
  border = false,
  rounded = false,
  infiniteScroll,
  stickyHeader,
  layoutStabilization = {
    enabled: true,
    fixedLayout: true, // Prevents column width recalculation
    minColumnWidth: 'min-w-24', // Minimum width to prevent squashing
  },
  virtualScroll = {
    enabled: true,
    rowHeight: 72,
    overscan: 5,
    threshold: 100,
  },
}: DataTableProps<T>) {
  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const lastElementRef = useRef<HTMLTableRowElement | null>(null);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Enhanced sorting logic with scroll-to-top
  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    const newSortKey = column.header as string;
    if (sortBy === newSortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortKey);
      // Sort alphabetically ascending on first click for name/text columns
      const isNameColumn =
        typeof column.sortKey === 'function' && column.sortKey.toString().includes('row.name');
      setSortOrder(isNameColumn ? 'asc' : 'desc');
    }

    // Scroll to top after sorting if not already at the top
    if (tableContainerRef.current && tableContainerRef.current.scrollTop > 0) {
      tableContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const sortedData = useMemo(() => {
    if (!sortBy) return data;

    const sorted = [...data].sort((a, b) => {
      let valA: any;
      let valB: any;

      const column = columns.find((col) => col.header === sortBy);

      if (!column) {
        return 0;
      }

      const effectiveSortKey = column.sortKey || column.accessor;

      if (typeof effectiveSortKey === 'function') {
        valA = effectiveSortKey(a);
        valB = effectiveSortKey(b);
      } else {
        valA = a[effectiveSortKey];
        valB = b[effectiveSortKey];
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
    return sorted;
  }, [data, sortBy, sortOrder, columns]);

  // Virtual scrolling calculations
  const shouldUseVirtualScroll = useMemo(() => {
    return virtualScroll.enabled && sortedData.length >= (virtualScroll.threshold || 100);
  }, [virtualScroll.enabled, sortedData.length, virtualScroll.threshold]);

  const virtualScrollParams = useMemo(() => {
    if (!shouldUseVirtualScroll || containerHeight === 0) {
      return {
        startIndex: 0,
        endIndex: sortedData.length,
        offsetY: 0,
        totalHeight: sortedData.length * virtualScroll.rowHeight,
      };
    }

    const itemHeight = virtualScroll.rowHeight;
    const overscan = virtualScroll.overscan || 5;
    const visibleCount = Math.ceil(containerHeight / itemHeight);

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(sortedData.length, startIndex + visibleCount + overscan * 2);

    const offsetY = startIndex * itemHeight;
    const totalHeight = sortedData.length * itemHeight;

    return {
      startIndex,
      endIndex,
      offsetY,
      totalHeight,
    };
  }, [shouldUseVirtualScroll, containerHeight, scrollTop, sortedData.length, virtualScroll]);

  // Get visible data for rendering
  const visibleData = useMemo(() => {
    if (!shouldUseVirtualScroll) {
      return sortedData;
    }
    return sortedData.slice(virtualScrollParams.startIndex, virtualScrollParams.endIndex);
  }, [
    shouldUseVirtualScroll,
    sortedData,
    virtualScrollParams.startIndex,
    virtualScrollParams.endIndex,
  ]);

  // Scroll handler for virtual scrolling
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (shouldUseVirtualScroll) {
        setScrollTop(e.currentTarget.scrollTop);
      }
    },
    [shouldUseVirtualScroll],
  );

  // Container height measurement
  useEffect(() => {
    if (!shouldUseVirtualScroll || !tableContainerRef.current) return;

    const container = tableContainerRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    setContainerHeight(container.clientHeight);

    return () => resizeObserver.disconnect();
  }, [shouldUseVirtualScroll]);

  // Enhanced intersection observer for infinite scroll
  useEffect(() => {
    if (!infiniteScroll || infiniteScroll.isLoading || shouldUseVirtualScroll) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && infiniteScroll.hasMore) {
          infiniteScroll.onLoadMore();
        }
      },
      {
        rootMargin: infiniteScroll.eagerLoad ? '0px 0px 50% 0px' : '0px',
      },
    );

    const currentElement = lastElementRef.current;

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [infiniteScroll, shouldUseVirtualScroll]);

  const visibleColumns = columns.slice(0, maxColumns);

  return (
    <div
      ref={tableContainerRef}
      className={clsx(
        'flex flex-col w-full',
        stickyHeader?.enabled && (stickyHeader.maxHeight || 'min-h-96'),
        stickyHeader?.enabled && 'overflow-auto',
        !stickyHeader?.enabled && rounded && 'rounded-lg overflow-scroll',
        border && 'border-2 border-border',
        stickyHeader?.enabled && rounded && 'rounded-lg',
      )}
      onScroll={handleScroll}
    >
      <table
        className={clsx(
          'border-collapse divide-y divide-border',
          // Fixed layout prevents horizontal shifts by not recalculating column widths
          layoutStabilization.enabled && layoutStabilization.fixedLayout && 'table-fixed w-full',
        )}
      >
        {/* TABLE HEADER - Column definitions */}
        <thead>
          <tr
            className={clsx(
              'border-b-2 border-border theme-transition',
              stickyHeader?.enabled && 'sticky top-0 bg-white dark:bg-surface z-10 shadow-md',
            )}
          >
            {visibleColumns.map((column, index) => (
              <TableColumn
                key={index}
                column={column}
                index={index}
                visibleColumnsLength={visibleColumns.length}
                sortBy={sortBy}
                onSort={handleSort}
                noPadding={noPadding}
                fixedWidth={
                  layoutStabilization.enabled
                    ? layoutStabilization.preCalculatedWidths?.[index] ||
                      layoutStabilization.minColumnWidth
                    : undefined
                }
              />
            ))}
          </tr>
        </thead>

        {/* TABLE BODY - Data rows */}
        <tbody className="">
          {/* Virtual scroll spacer top */}
          {shouldUseVirtualScroll && virtualScrollParams.offsetY > 0 && (
            <tr>
              <td
                colSpan={visibleColumns.length}
                className="p-0 border-0"
                style={{
                  height: virtualScrollParams.offsetY,
                }}
              />
            </tr>
          )}

          {/* Visible data rows */}
          {visibleData.map((row, dataIndex) => {
            const actualIndex = shouldUseVirtualScroll
              ? virtualScrollParams.startIndex + dataIndex
              : dataIndex;

            return (
              <TableRow
                key={actualIndex}
                row={row}
                rowIndex={actualIndex}
                visibleColumns={visibleColumns}
                sortedDataLength={sortedData.length}
                overlayHover={overlayHover}
                noPadding={noPadding}
              />
            );
          })}

          {/* Virtual scroll spacer bottom */}
          {shouldUseVirtualScroll && (
            <tr>
              <td
                colSpan={visibleColumns.length}
                className="p-0 border-0"
                style={{
                  height: Math.max(
                    0,
                    virtualScrollParams.totalHeight -
                      virtualScrollParams.offsetY -
                      visibleData.length * virtualScroll.rowHeight,
                  ),
                }}
              />
            </tr>
          )}

          {/* Skeleton rows while loading more data */}
          {infiniteScroll?.isLoading &&
            Array.from({ length: infiniteScroll.skeletonRows || 3 }).map((_, index) => (
              <SkeletonTableRow
                key={`skeleton-${index}`}
                columns={visibleColumns}
                noPadding={noPadding}
              />
            ))}

          {/* Intersection observer sentinel row for infinite scroll */}
          {infiniteScroll && infiniteScroll.hasMore && !shouldUseVirtualScroll && (
            <tr ref={lastElementRef} style={{ height: '1px' }}>
              <td colSpan={visibleColumns.length} style={{ padding: 0, border: 'none' }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
