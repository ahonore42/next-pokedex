import { useEffect, useState } from 'react';

export function useElementHeight(ref: React.RefObject<HTMLElement | null>) {
  const [height, setHeight] = useState(0); // Default until element is measured

  // Observe container dimensions
  useEffect(() => {
    const element = ref.current; // Get the DOM node
    if (!element) return; // Exit early if ref is null

    // Single ResizeObserver instance
    const observer = new ResizeObserver(
      ([entry]) => setHeight(Math.round(entry.contentRect.height)), // Extract rounded height
    );

    observer.observe(element); // Start listening to size changes
    setHeight(Math.round(element.offsetHeight)); // Sync once on mount for SSR/hydration parity

    return () => observer.disconnect(); // Stop observing and free memory
  }, [ref]); // Re-run only if ref identity changes (rare)

  return height; // Always the latest measured height
}
