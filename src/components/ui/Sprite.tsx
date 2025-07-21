import { TypeBadgeProps } from '../pokemon-types/TypeBadge';
import TypeBadgesDisplay from '../pokemon-types/TypeBadgesDisplay';

interface SpriteProps {
  src: string;
  title?: string;
  prefix?: string;
  types?: TypeBadgeProps[];
  variant?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
}

export default function Sprite({
  src,
  title,
  prefix,
  types,
  variant = 'md',
  hover = false,
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
      <img src={src} alt={title} className={`mx-auto ${variants[variant].img}`} />
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
