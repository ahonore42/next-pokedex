import { useState, useEffect } from 'react';

// Breakpoint detection for layout decisions
export const useBreakpointWidth = (timeout?: number) => {
  const [width, setWidth] = useState(768); // Default fallback until first measurement

  useEffect(() => {
    // Ordered from largest to smallest for correct match priority
    const breakpoints = [
      { query: '(min-width: 1536px)', width: 1536 },
      { query: '(min-width: 1280px)', width: 1280 },
      { query: '(min-width: 1024px)', width: 1024 },
      { query: '(min-width: 768px)', width: 768 },
      { query: '(min-width: 640px)', width: 640 },
    ];

    const update = () => {
      const match = breakpoints.find(({ query }) => window.matchMedia(query).matches) || {
        width: 480,
      }; // Default for <640
      setWidth(match.width); // Single state update per run
    };

    // Shared timer across all listeners
    let id: NodeJS.Timeout;
    const debounced = () => {
      clearTimeout(id); // Cancel any pending update
      id = setTimeout(update, timeout ? timeout : 0); // Optional debounce timeout to prevent snapping
    };

    update(); // Immediate first call to avoid flash of wrong breakpoint

    // Store references for clean up
    const mediaQueries = breakpoints.map(({ query }) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', debounced); // Only one listener per breakpoint
      return mediaQuery;
    });

    return () => {
      clearTimeout(id); // Prevent update after unmount
      mediaQueries.forEach((m) => m.removeEventListener('change', debounced)); // Remove all listeners
    };
  }, [timeout]); // Runs once on mount

  // 1536 | 1280 | 1024 | 768 | 640 | 480
  return width;
};
