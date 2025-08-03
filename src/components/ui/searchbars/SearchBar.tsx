'use client';

import React, { useState } from 'react';
import { extractResults, SearchBarProps, useSearchQuery } from './searchbar.config';
import { renderScrollableResults } from './ScrollableResultsContainer';
import Icon from '../icons';

// Generic SearchBar component that works with different search models
export default function SearchBar<SearchResult>({
  model,
  data,
  filterFunction,
  limit = 10,
  placeholder = 'Search...',
  hover = false,
  size = 'md',
  center = true,
  className = '',
  inputClassName = '',
  resultsClassName = '',
  staleTime = 1000 * 60 * 5, // 5 minutes
  scroll = false,
  renderResult,
  renderResultsContainer,
}: SearchBarProps<SearchResult>) {
  const [searchQuery, setSearchQuery] = useState('');

  // Get the appropriate search query hook based on model (only when no local data)
  const searchResults = useSearchQuery(model, searchQuery, limit, staleTime, !data);

  // Handle result click - clears search automatically
  const handleResultClick = () => {
    setSearchQuery('');
  };

  // Get size-based classes
  const getSizeClasses = () => {
    const sizeMap = {
      sm: { base: 'py-2', expanded: 'py-3', icon: 'pl-8' },
      md: { base: 'py-3', expanded: 'py-4', icon: 'pl-10' },
      lg: { base: 'py-4', expanded: 'py-5', icon: 'pl-12' },
    };
    return sizeMap[size];
  };

  const sizeClasses = getSizeClasses();

  // Remote data only when no local data
  const remoteQuery = useSearchQuery(model, searchQuery, limit, staleTime, Boolean(data));

  // Extract results based on data source
  let results: SearchResult[];
  if (data) {
    // Local filtering
    if (searchQuery.length > 0 && filterFunction) {
      results = data.filter((item) => filterFunction(item, searchQuery)).slice(0, limit);
    } else {
      results = [];
    }
  } else if (model) {
    // tRPC data extraction
    results = extractResults(model, remoteQuery.data);
  } else {
    // fallback: no data and no model → empty
    results = [];
  }

  const hasResults = results.length > 0;

  // Render individual results with proper keys
  const resultElements = results.map((result) => (
    <React.Fragment key={(result as any).id}>
      {renderResult(result, handleResultClick)}
    </React.Fragment>
  ));

  // Default results container renderer
  const defaultRenderResultsContainer = (
    resultElements: React.ReactNode[],
    hasResults: boolean,
  ) => (
    <div
      className={`absolute top-full mt-1 w-full bg-surface rounded-lg shadow-lg overflow-hidden transition-colors duration-300 z-50 ${
        hasResults ? 'border border-border' : ''
      } ${resultsClassName}`}
    >
      {resultElements}
    </div>
  );

  const resultsContainerRenderer = scroll
    ? renderScrollableResults
    : renderResultsContainer || defaultRenderResultsContainer;

  return (
    <div
      className={`max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl ${center && 'mx-auto'} ${className}`}
    >
      <div className="relative">
        {/* Search Input Container */}
        <div
          className={`relative overflow-hidden rounded-lg border-2 border-border transition-all duration-300 ${
            hover ? 'hover:border-brand/50' : ''
          }`}
        >
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pr-8 ${sizeClasses.base} ${sizeClasses.icon} bg-surface text-primary transition-all duration-300 placeholder:text-subtle border-none outline-none ${
              hover ? `hover:${sizeClasses.expanded}` : ''
            } ${searchQuery.length > 0 && hover ? sizeClasses.expanded : ''} ${inputClassName}`}
          />
        </div>

        {/* Search Icon */}
        <div
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
            hover ? 'hover:right-5' : ''
          }`}
        >
          <Icon type="search" size="lg" className="text-subtle" />
        </div>

        {/* Search Results */}
        {(data ? searchQuery.length > 0 && hasResults : searchResults.data) &&
          resultsContainerRenderer(resultElements, hasResults)}
      </div>
    </div>
  );
}

SearchBar.displayName = 'SearchBar';
