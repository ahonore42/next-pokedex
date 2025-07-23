import { Handle, Position } from '@xyflow/react';
import Link from 'next/link';
import { PokemonSpecies } from '~/server/routers/_app';
import { TypeBadgeProps } from '../pokemon-types/TypeBadge';
import Sprite from '../ui/Sprite';

export type EvolutionNodeData = {
  label: string;
  pokemon: PokemonSpecies['pokemon'][number];
  types: TypeBadgeProps[];
  hasManyDirectEvolutions: boolean;
  isStartNode: boolean;
  isEndNode: boolean;
  nodeWidth: number;
  nodeHeight: number;
  containerWidth: number;
};

export type EvolutionNodeProps = {
  id: string;
  type: string;
  data: EvolutionNodeData;
};

export default function EvolutionNode({ data }: EvolutionNodeProps) {
  const { label, pokemon, types, hasManyDirectEvolutions, isStartNode, isEndNode } = data;
  if (!pokemon) {
    return null;
  }

  const sourceHandle = hasManyDirectEvolutions ? Position.Top : Position.Left;
  const targetHandle = hasManyDirectEvolutions ? Position.Bottom : Position.Right;

  return (
    <div>
      {/* Target Handle - only show if not start node */}
      {!isStartNode && <Handle type="target" position={sourceHandle} />}

      <Link href={`/pokemon/${pokemon.id}`} className="">
        {/* Pokemon Image */}
        <div>
          {pokemon.sprites?.frontDefault ? (
            <Sprite
              src={pokemon.sprites.frontDefault}
              variant="md"
              title={label}
              types={types}
              className="bg-surface hover:bg-hover"
            />
          ) : (
            <Sprite variant="md" fallback />
          )}
        </div>
      </Link>

      {/* Source Handle - only show if not end node */}
      {!isEndNode && <Handle type="source" position={targetHandle} />}
    </div>
  );
}
