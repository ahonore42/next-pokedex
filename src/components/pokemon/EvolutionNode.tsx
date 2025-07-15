import { Handle, Position } from '@xyflow/react';
import Link from 'next/link';
import { TypeBadge } from '~/components/ui/TypeBadge';

const EvolutionNode: React.FC<{ data: any }> = ({ data }) => {
  const pokemon = data.pokemon;
  if (!pokemon) {
    return null;
  }

  const hasManyDirectEvolutions = data?.hasManyDirectEvolutions as boolean;
  const isStartNode = data?.isStartNode as boolean;
  const isEndNode = data?.isEndNode as boolean;
  const sourceHandle = hasManyDirectEvolutions ? Position.Top : Position.Left;
  const targetHandle = hasManyDirectEvolutions ? Position.Bottom : Position.Right;

  // Use responsive sizing if provided, otherwise fall back to defaults
  const nodeWidth = data.nodeWidth || 160;
  const nodeHeight = data.nodeHeight || 180;
  const containerWidth = data.containerWidth || 800;

  // Calculate responsive image size
  const imageSize = Math.max(Math.min(nodeWidth * 0.7, 112), 80);

  // Calculate responsive text size
  const textSizeClass =
    containerWidth < 640 ? 'text-xs' : containerWidth < 768 ? 'text-sm' : 'text-base';

  return (
    <div
      className={`rounded-lg shadow-md p-2 border flex flex-col items-center justify-between dark:bg-gray-800 border-gray-700 bg-indigo-100 border-indigo-200'
      }`}
      style={{
        width: `${nodeWidth}px`,
        height: `${nodeHeight}px`,
        minWidth: '120px',
        minHeight: '140px',
      }}
    >
      {/* Target Handle - only show if not start node */}
      {!isStartNode && <Handle type="target" position={sourceHandle} />}

      <Link
        href={`/pokemon/${pokemon.id}`}
        className="flex flex-col items-center group w-full h-full justify-between py-1"
      >
        {/* Pokemon Image */}
        <div
          className="relative flex-shrink-0 flex items-center justify-center"
          style={{
            width: `${imageSize}px`,
            height: `${imageSize}px`,
          }}
        >
          {pokemon.sprites?.frontDefault ? (
            <img
              src={pokemon.sprites.frontDefault}
              alt={data.label}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          ) : (
            <img
              src="/images/pokeball.png"
              alt="No sprite available"
              className="w-full h-full object-contain opacity-50"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          )}
        </div>

        {/* Pokemon Name */}
        <p
          className={`text-center font-medium leading-tight ${textSizeClass} group-hover:text-gray-600 dark:group-hover:text-indigo-800 capitalize px-1 mt-1`}
          style={{
            wordBreak: 'break-word',
            lineHeight: '1.2',
          }}
          title={data.label} // Tooltip for full name on hover
        >
          {data.label}
        </p>

        {/* Type Badges */}
        <div className="flex gap-1 justify-center flex-wrap mt-1 px-1">
          {data.types.map((typeInfo: any) => (
            <div key={typeInfo.type.id} className="transform scale-75 sm:scale-90 md:scale-100">
              <TypeBadge type={typeInfo.type} link={false} />
            </div>
          ))}
        </div>
      </Link>

      {/* Source Handle - only show if not end node */}
      {!isEndNode && <Handle type="source" position={targetHandle} />}
    </div>
  );
};

export default EvolutionNode;
