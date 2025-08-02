import React, { useState, useMemo, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Column } from './tables.config';
import TableColumn from './TableColumn';
import TableRow from './TableRow';
import SkeletonTableRow from '../skeletons/SkeletonTableRow';

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
}: DataTableProps<T>) {
  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const lastElementRef = useRef<HTMLTableRowElement | null>(null);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    const newSortKey = column.header as string;
    if (sortBy === newSortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortKey);
      setSortOrder('desc');
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

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!infiniteScroll || infiniteScroll.isLoading) return;

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
  }, [infiniteScroll]);

  const visibleColumns = columns.slice(0, maxColumns);

  return (
    <div
      className={clsx(
        'flex flex-col w-full',
        stickyHeader?.enabled && (stickyHeader.maxHeight || 'max-h-128'),
        stickyHeader?.enabled && 'overflow-auto',
        !stickyHeader?.enabled && rounded && 'rounded-lg overflow-scroll',
        border && 'border-2 border-border',
        stickyHeader?.enabled && rounded && 'rounded-lg',
      )}
    >
      <table className="border-collapse divide-y divide-border">
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
              />
            ))}
          </tr>
        </thead>

        {/* TABLE BODY - Data rows */}
        <tbody className="">
          {sortedData.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              row={row}
              rowIndex={rowIndex}
              visibleColumns={visibleColumns}
              sortedDataLength={sortedData.length}
              overlayHover={overlayHover}
              noPadding={noPadding}
            />
          ))}

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
          {infiniteScroll && infiniteScroll.hasMore && (
            <tr ref={lastElementRef} style={{ height: '1px' }}>
              <td colSpan={visibleColumns.length} style={{ padding: 0, border: 'none' }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
