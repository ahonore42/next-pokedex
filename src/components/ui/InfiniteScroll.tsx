import { useEffect, useRef } from 'react';

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  children: React.ReactNode;
  eagerLoad?: boolean;
}

export default function InfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  children,
  eagerLoad = false,
}: InfiniteScrollProps) {
  const lastElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      },
      {
        // When eagerLoad is true, trigger loading 50vh before reaching the bottom
        rootMargin: eagerLoad ? '0px 0px 50% 0px' : '0px',
      },
    );

    const currentElement = lastElementRef.current; // Copy to a variable

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        // Use the copied variable in cleanup
        observer.unobserve(currentElement);
      }
    };
  }, [isLoading, hasMore, onLoadMore, eagerLoad]);

  return (
    <div>
      {children}
      <div ref={lastElementRef} />
    </div>
  );
}
