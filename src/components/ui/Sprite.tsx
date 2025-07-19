interface SpriteProps {
  src: string;
  title: string;
  prefix?: string;
  className?: string;
}

export default function Sprite({ src, title, prefix, className = '' }: SpriteProps) {
  return (
    <div
      className={`surface text-center flex flex-col items-center 
         p-x-4 p-y-2 rounded-lg border border-border ${className}
        `}
    >
      <img src={src} alt={title} className="mx-auto" />
      <div className="flex justify-center align-center gap-2 mb-2 text-sm">
        <p className="text-muted">#{prefix}</p>
        <p className="font-bold capitalize">{title}</p>
      </div>
    </div>
  );
}
