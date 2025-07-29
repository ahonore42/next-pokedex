import { useState, useEffect } from 'react';
import Image from 'next/image';
import Icon from './icons';
import { SkeletonArtwork } from './skeletons';

interface ArtworkImageProps {
  src?: string;
  alt?: string;
  size?: string;
  sizes?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  fallback?: boolean;
  className?: string;
  onImageLoad?: () => void;
  priority?: boolean;
  quality?: number;
}

export default function ArtworkImage({
  src,
  alt,
  size = 'size-48 lg:size-72',
  sizes = '(min-width: 360px) 448px, 48px',
  aspectRatio = 'square',
  fallback = false,
  className = '',
  onImageLoad,
  priority = true,
  quality = 100,
}: ArtworkImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const aspectRatios = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    onImageLoad?.();
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    onImageLoad?.();
  };

  const shouldShowFallback = fallback || imageError || !src;
  const shouldShowLoading = src && !fallback && !imageLoaded && !imageError;

  // Handle immediate fallback cases
  useEffect(() => {
    if (shouldShowFallback && onImageLoad) {
      onImageLoad();
    }
  }, [shouldShowFallback, onImageLoad]);

  // Use SkeletonArtwork while loading
  if (shouldShowLoading) {
    return (
      <>
        <SkeletonArtwork size={size} aspectRatio={aspectRatio} />
        {/* Hidden image to trigger loading */}
        <img
          src={src}
          alt=""
          className="hidden"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </>
    );
  }

  return (
    <div
      className={`relative ${size} ${aspectRatios[aspectRatio]} ${className}`}
    >
      {/* Image Container */}
      <div className="relative w-full h-full">
        {src && !shouldShowFallback && (
          <Image
            src={src}
            alt={alt || 'Artwork'}
            fill
            priority={priority}
            quality={quality}
            sizes={sizes}
            className="object-contain"
            fetchPriority="high"
            loading="eager"
            crossOrigin="anonymous"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {shouldShowFallback && (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-500">
            <Icon size="xl" type="image" />
          </div>
        )}
      </div>
    </div>
  );
}
