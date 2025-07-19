interface SpriteProps {
  src: string;
  title?: string;
  prefix?: string;
  variant?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Sprite({
  src,
  title,
  prefix,
  variant = 'md',
  className = '',
}: SpriteProps) {
  const variants = {
    sm: { img: 'w-16 h-16', container: 'w-20 h-20' },
    md: { img: 'w-24 h-24', text: 'text-sm', container: 'min-w-32 h-32' }, // Responsive displays
    lg: { img: 'w-32 h-32', text: 'text-sm', container: 'w-40 h-40' },
  };
  return (
    <div
      className={`surface text-center flex flex-col items-center justify-center text-primary
          rounded-lg border border-border ${variants[variant].container} ${className}
        `}
    >
      <img src={src} alt={title} className={`mx-auto ${variants[variant].img}`} />
      {(title || prefix) && variant !== 'sm' && (
        <div
          className={`flex justify-center align-center gap-1 mb-2 text-nowrap ${variants[variant].text}`}
        >
          <p className="text-muted">#{prefix}</p>
          <p className="font-bold capitalize">{title}</p>
        </div>
      )}
    </div>
  );
}
