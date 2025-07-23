import { PokemonSpecies } from '~/server/routers/_app';

interface SpecialAttributesProps {
  species: PokemonSpecies;
  className?: string;
}

const SpecialAttributes: React.FC<SpecialAttributesProps> = ({ species, className = '' }) => {
  // Define attribute configurations
  const attributes = [
    {
      condition: species.isLegendary,
      label: 'Legendary',
      colorClasses: 'bg-purple-100 text-purple-800',
    },
    {
      condition: species.isMythical,
      label: 'Mythical',
      colorClasses: 'bg-pink-100 text-pink-800',
    },
    {
      condition: species.isBaby,
      label: 'Baby',
      colorClasses: 'bg-yellow-100 text-yellow-800',
    },
  ];

  // Filter to only attributes that should be displayed
  const visibleAttributes = attributes.filter((attr) => attr.condition);

  // Don't render if no attributes are present
  if (visibleAttributes.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {visibleAttributes.map((attr, index) => (
        <span
          key={index}
          className={`px-2 py-1 ${attr.colorClasses} rounded-full text-xs font-medium`}
        >
          {attr.label}
        </span>
      ))}
    </div>
  );
};

export default SpecialAttributes;
