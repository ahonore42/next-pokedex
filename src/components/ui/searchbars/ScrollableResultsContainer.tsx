'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
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
        <div ref={scrollContainerRef} className="max-h-[50vh] overflow-y-auto">
          {results}
        </div>
      </div>

      {/* Scroll indicator */}
      {showScrollIndicator && (
        <div className="absolute top-full mt-1 w-full flex justify-center z-50 pointer-events-none">
          <div className="p-1 mt-[calc(50vh-2rem)]">
            <Icon type="chevron-down" size="md" className="text-brand" />
          </div>
        </div>
      )}
    </div>
  );
}

export const renderScrollableResults = (results: ReactNode[], hasResults: boolean) => (
  <ScrollableResultsContainer results={results} hasResults={hasResults} />
);
