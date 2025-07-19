import Link from 'next/link';
import Sprite from './Sprite';

interface SpriteLinkProps {
  href: string;
  src: string;
  title?: string;
  prefix?: string;
  className?: string;
}

export default function SpriteLink({ href, src, title, prefix, className = '' }: SpriteLinkProps) {
  return (
    <Link href={href}>
      <Sprite
        src={src}
        title={title}
        prefix={prefix}
        className={`group block interactive-link ${className}`}
      />
    </Link>
  );
}
