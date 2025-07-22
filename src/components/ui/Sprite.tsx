import { TypeBadgeProps } from '../pokemon-types/TypeBadge';
import TypeBadgesDisplay from '../pokemon-types/TypeBadgesDisplay';

interface SpriteProps {
  src?: string;
  title?: string;
  prefix?: string;
  types?: TypeBadgeProps[];
  variant?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  fallback?: boolean;
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
  className = '',
}: SpriteProps) {
  const variants = {
    sm: { img: 'w-16 h-16', container: 'w-20 h-20' },
    md: { img: 'w-24 h-24', text: 'text-sm', container: types ? 'min-w-36 h-36' : 'min-w-32 h-32' }, // Responsive displays
    lg: { img: 'w-32 h-32', text: 'text-sm', container: types ? 'w-44 h-44' : 'w-36 h-36' },
  };
  return (
    <div
      className={`text-center flex flex-col items-center justify-center text-primary rounded-lg border border-border 
      ${hover ? 'surface-hover' : 'surface'} ${variants[variant].container} ${className}`}
    >
      {src && !fallback ? (
        <img src={src} alt={title} className={`mx-auto ${variants[variant].img}`} />
      ) : (
        <div className="text-slate-300 dark:text-slate-500">
          <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {(title || prefix) && variant !== 'sm' && (
        <div>
          <div
            className={`flex justify-center align-center items-center gap-1 mb-2 leading-none text-nowrap ${variants[variant].text}`}
          >
            <p className="text-muted">#{prefix}</p>
            <p className="font-bold capitalize">{title}</p>
          </div>
          {types && <TypeBadgesDisplay types={types} className="mx-auto mb-2" compact />}
        </div>
      )}
    </div>
  );
}
