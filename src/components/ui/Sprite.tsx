import { ReactNode, useState, useEffect } from 'react';
import { PokemonTypeName } from '~/server/routers/_app';
import TypeBadgesDisplay from '../pokemon-types/TypeBadgesDisplay';
import Icon from './icons';
import Image from 'next/image';
import { SkeletonSprite } from './skeletons';

interface SpriteProps {
  src?: string;
  alt?: string;
  title?: string;
  prefix?: string;
  types?: PokemonTypeName[];
  variant?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  fallback?: boolean;
  children?: ReactNode;
  className?: string;
  onImageLoad?: () => void;
}

export default function Sprite({
  src,
  alt,
  title,
  prefix,
  types,
  variant = 'md',
  hover = false,
  fallback = false,
  children,
  className = '',
  onImageLoad,
}: SpriteProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const variants = {
    sm: { img: 'w-16 h-16' },
    md: { img: 'w-24 h-24', text: 'text-sm', container: types ? 'min-w-36 h-36' : 'min-w-32 h-32' },
    lg: { img: 'w-32 h-32', text: 'text-sm', container: types ? 'w-44 h-44' : 'w-36 h-36' },
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    onImageLoad?.(); // This should trigger the hook callback
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

  // Use SkeletonSprite while loading
  if (shouldShowLoading) {
    const hasTypes = types ? true : false;
    return (
      <>
        <SkeletonSprite variant={variant} types={hasTypes} className={className} />
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

  const spriteImage = (
    <div
      className={`relative ${variants[variant].img} flex items-center justify-center 
      ${variant === 'sm' && shouldShowFallback && 'bg-slate-50 dark:bg-surface-elevated rounded-lg'}`}
    >
      {src && !shouldShowFallback && (
        <Image
          src={src}
          alt={alt || 'Sprite'}
          fill
          sizes="(min-width: 360px) 448px, 48px"
          priority={true}
          quality={100}
          className={`${variants[variant].img} transition-opacity duration-200 opacity-100 object-contain`}
          fetchPriority="high"
          loading="eager"
          crossOrigin="anonymous"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {shouldShowFallback && (
        <div className="text-slate-300 dark:text-slate-500">
          <Icon size="xl" type="image" />
        </div>
      )}
    </div>
  );

  if (variant === 'sm') {
    return spriteImage;
  }

  return (
    <div
      className={`text-center flex flex-col items-center justify-center text-primary rounded-lg border border-border 
      ${hover ? 'surface-hover' : 'surface'} ${variants[variant].container} ${className}`}
    >
      {spriteImage}

      {/* Only render text content when image is loaded or fallback is shown */}
      {title && (imageLoaded || shouldShowFallback) && (
        <div>
          <div
            className={`flex justify-center align-center items-center gap-1 mb-2 leading-none text-nowrap ${variants[variant].text}`}
          >
            {prefix && <p className="text-muted">#{prefix}</p>}
            <p className="font-semibold capitalize">{title}</p>
          </div>
          {types && <TypeBadgesDisplay types={types} className="mx-auto mb-2" compact />}
        </div>
      )}

      {/* Only render children when the title is not present and the image is loaded */}
      {children && !title && imageLoaded && (
        <div
          className={`flex justify-center items-center leading-none text-nowrap ${variants[variant].text}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
