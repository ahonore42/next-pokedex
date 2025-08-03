// src/components/ui/searchbars/ScrollableResultsContainer.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '../icons';

interface ScrollableResultsContainerProps {
  results: React.ReactNode[];
  hasResults: boolean;
  resultsClassName?: string;
}

export default function ScrollableResultsContainer({
  results,
  hasResults,
  resultsClassName = '',
}: ScrollableResultsContainerProps) {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollIndicator = () => {
      const { scrollHeight, clientHeight, scrollTop } = container;
      const hasMoreBelow =
        scrollHeight > clientHeight && scrollTop + clientHeight < scrollHeight - 5; // 5px buffer
      setShowScrollIndicator(hasMoreBelow);
    };

    // Check initially
    checkScrollIndicator();

    // Check on scroll
    container.addEventListener('scroll', checkScrollIndicator);

    return () => container.removeEventListener('scroll', checkScrollIndicator);
  }, [results.length]);

  if (!hasResults) return null;

  return (
    <div className="relative">
      <div
        className={`absolute top-full mt-1 w-full bg-surface rounded-lg shadow-lg transition-colors duration-300 z-50 border border-border ${resultsClassName}`}
      >
        <div ref={scrollContainerRef} className="max-h-80 overflow-y-auto">
          {results}
        </div>
      </div>

      {/* Scroll indicator */}
      {showScrollIndicator && (
        <div className="absolute top-full mt-1 w-full flex justify-center z-50 pointer-events-none">
          <div className="p-1 shadow-lg mt-72">
            <Icon type="chevron-down" size="sm" className="text-subtle" />
          </div>
        </div>
      )}
    </div>
  );
}

export const renderScrollableResults = (results: React.ReactNode[], hasResults: boolean) => (
  <ScrollableResultsContainer results={results} hasResults={hasResults} />
);
