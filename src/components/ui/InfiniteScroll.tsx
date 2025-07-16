import { useEffect, useRef } from 'react';

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}

export default function InfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  children,
}: InfiniteScrollProps) {
  const lastElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });

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
  }, [isLoading, hasMore, onLoadMore]);

  return (
    <div>
      {children}
      <div ref={lastElementRef} />
    </div>
  );
}
