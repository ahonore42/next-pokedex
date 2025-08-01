import { PokemonTypeName } from '~/server/routers/_app';
import TypeBadge from './TypeBadge';

interface TypeBadgesDisplayProps {
  types: PokemonTypeName[];
  link?: boolean;
  compact?: boolean;
  loading?: boolean;
  className?: string;
}

export default function TypeBadgesDisplay({
  types,
  link = false,
  compact,
  loading,
  className = '',
}: TypeBadgesDisplayProps) {
  if (!types || types.length === 0) {
    return null;
  }

  return (
    <div className={`flex w-fit justify-center flex-nowrap gap-1 ${className}`}>
      {types.map((type) => (
        <div key={type}>
          <TypeBadge type={type} link={link} compact={compact} loading={loading} />
        </div>
      ))}
    </div>
  );
}

export const renderTypeBadgesDisplay = ({
  types,
  link,
  compact,
  loading,
  className,
}: TypeBadgesDisplayProps) => (
  <div className="flex justify-center items-center">
    <TypeBadgesDisplay
      types={types}
      link={link}
      compact={compact}
      loading={loading}
      className={className}
    />
  </div>
);
