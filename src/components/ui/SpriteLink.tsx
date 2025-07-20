import Link from 'next/link';
import Sprite from './Sprite';
import { TypeBadgeProps } from '../pokemon-types/TypeBadge';

interface SpriteLinkProps {
  href: string;
  src: string;
  title?: string;
  prefix?: string;
  types?: TypeBadgeProps[];
  className?: string;
}

export default function SpriteLink({
  href,
  src,
  title,
  prefix,
  types,
  className = '',
}: SpriteLinkProps) {
  return (
    <Link href={href}>
      <Sprite
        src={src}
        title={title}
        prefix={prefix}
        types={types}
        className={`group block interactive-link transition-interactive ${className}`}
      />
    </Link>
  );
}
