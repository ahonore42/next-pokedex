import { ReactNode, useState } from 'react';
import { TypeBadgeProps } from '../pokemon-types/TypeBadge';
import TypeBadgesDisplay from '../pokemon-types/TypeBadgesDisplay';
import Icon from './icons';

interface SpriteProps {
  src?: string;
  title?: string;
  prefix?: string;
  types?: TypeBadgeProps[];
  variant?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  fallback?: boolean;
  children?: ReactNode;
  className?: string;
}

export default function Sprite({
  src,
  title,
  prefix,
  types,
  variant = 'md',
  hover = false,
  fallback = false,
  children,
  className = '',
}: SpriteProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const variants = {
    sm: { img: 'w-16 h-16', container: 'w-20 h-20' },
    md: { img: 'w-24 h-24', text: 'text-sm', container: types ? 'min-w-36 h-36' : 'min-w-32 h-32' },
    lg: { img: 'w-32 h-32', text: 'text-sm', container: types ? 'w-44 h-44' : 'w-36 h-36' },
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const shouldShowFallback = fallback || imageError || !src;
  const shouldShowLoading = src && !fallback && !imageLoaded && !imageError;

  return (
    <div
      className={`text-center flex flex-col items-center justify-center text-primary rounded-lg border border-border 
      ${hover ? 'surface-hover' : 'surface'} ${variants[variant].container} ${className}`}
    >
      {/* Image Container - maintain consistent height */}
      <div className={`relative ${variants[variant].img} flex items-center justify-center`}>
        {shouldShowLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon type="loading" size="lg" className="text-slate-400 dark:text-slate-500" />
          </div>
        )}

        {src && !shouldShowFallback && (
          <img
            src={src}
            alt={title}
            className={`${variants[variant].img} transition-opacity duration-200 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
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

      {/* Only render text content when image is loaded or fallback is shown */}
      {title && variant !== 'sm' && (imageLoaded || shouldShowFallback) && (
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
      {children && !title && imageLoaded && children}
    </div>
  );
}
