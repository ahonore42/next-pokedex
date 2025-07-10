import { Handle, Position } from '@xyflow/react';
import Link from 'next/link';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { TypeBadge } from '~/components/ui/TypeBadge';

const EvolutionNode: React.FC<{ data: any }> = ({ data }) => {
  const { theme } = useTheme();
  const pokemon = data.pokemon;
  if (!pokemon) {
    return null; // Should not happen if data is consistent
  }

  return (
    <div
      className={`rounded-lg shadow-md p-2 border w-[160px] h-[200px] flex flex-col items-center justify-between ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-indigo-100 border-indigo-200'
      }`}
    >
      <Handle type="target" position={Position.Left} />
      <Link href={`/pokemon/${pokemon.id}`} className="flex flex-col items-center group w-full">
        <div className="relative w-28 h-28">
          {pokemon.sprites?.frontDefault ? (
            <img
              src={pokemon.sprites.frontDefault}
              alt={data.label}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <img
              src="/images/pokeball.png"
              alt="No sprite available"
              className="w-full h-full object-contain"
            />
          )}
        </div>
        <p className={`text-center text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'} group-hover:text-gray-600 dark:group-hover:text-gray-600 capitalize mt-2`}>
          {data.label}
        </p>
      </Link>
      <div className="flex gap-1 mt-1 justify-center">
        {data.types.map((typeInfo: any) => (
          <TypeBadge key={typeInfo.type.id} type={typeInfo.type} />
        ))}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default EvolutionNode;
