import { getTypeColor, truncateTypeName } from '~/utils';
import { PokemonTypeName } from '~/server/routers/_app';
import Badge from '../ui/Badge';

export interface TypeBadgeProps {
  type: PokemonTypeName;
  link?: boolean;
  square?: boolean;
  squareSize?: 'sm' | 'md' | 'lg';
  compact?: boolean;
  loading?: boolean;
  onDataLoad?: () => void;
}

export default function TypeBadge({
  type,
  link = true,
  square,
  squareSize,
  compact = false,
  loading = false,
  onDataLoad,
}: TypeBadgeProps) {
  const color = getTypeColor(type);
  const nameLength = square ? 'short' : 'medium';
  const displayName = truncateTypeName(type, nameLength);

  return (
    <Badge
      backgroundColor={color}
      href={link ? `/pokemon-types/${type}` : undefined}
      square={square}
      squareSize={squareSize}
      compact={compact}
      loading={loading}
      onDataLoad={onDataLoad}
    >
      {displayName}
    </Badge>
  );
}

export const renderTypeBadge = ({
  type,
  link,
  square,
  squareSize,
  compact,
  loading,
  onDataLoad,
}: TypeBadgeProps) => (
  <TypeBadge
    type={type}
    link={link}
    square={square}
    squareSize={squareSize}
    compact={compact}
    loading={loading}
    onDataLoad={onDataLoad}
  />
);
