import { pokemonTypes } from '~/utils';
import TypeBadge from '~/components/pokemon-types/TypeBadge';
import Badge from '~/components/ui/Badge';

interface TypesDisplayProps {
  link?: boolean;
  onClick?: (type: string | null) => void;
  selectedType?: string | null;
  allTypes?: boolean;
  className?: string;
}

export default function TypesDisplay({
  link = false,
  onClick,
  selectedType,
  allTypes = false,
  className,
}: TypesDisplayProps) {
  const interactive = onClick || link;
  const selectedStyle = 'border-2 border-brand flex justify-center items-center rounded-md';
  return (
    <div
      className={`py-1 min-h-6 flex flex-wrap gap-2 justify-center items-center ${interactive && 'cursor-pointer'} ${className}`}
    >
      {allTypes && (
        <span
          onClick={onClick ? () => onClick(null) : undefined}
          key="all-types"
          className={allTypes && selectedType === null ? selectedStyle : undefined}
        >
          <Badge className="bg-surface-elevated">ALL</Badge>
        </span>
      )}

      {pokemonTypes.map((type, index) => {
        const isSelected = selectedType === type;

        return (
          <span
            onClick={onClick ? () => onClick(type) : undefined}
            key={`${type}_${index}`}
            className={`
              ${isSelected && selectedStyle}
            `}
          >
            <TypeBadge type={type} link={link} />
          </span>
        );
      })}
    </div>
  );
}
