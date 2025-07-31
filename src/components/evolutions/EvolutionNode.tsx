import { Handle, Position } from '@xyflow/react';
import { PokemonSpecies, PokemonTypeName } from '~/server/routers/_app';
import SpriteLink from '../ui/SpriteLink';

export type EvolutionNodeData = {
  label: string;
  pokemon: PokemonSpecies['pokemon'][number];
  types: PokemonTypeName[];
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
  if (!pokemon) return null;

  const sourceHandle = hasManyDirectEvolutions ? Position.Top : Position.Left;
  const targetHandle = hasManyDirectEvolutions ? Position.Bottom : Position.Right;
  const sprite = pokemon.sprites?.frontDefault || '';
  return (
    <div>
      {/* Target Handle - only show if not start node */}
      {!isStartNode && <Handle type="target" position={sourceHandle} />}

      {/* Pokemon Sprite Image */}
      <SpriteLink
        href={`/pokemon/${pokemon.id}`}
        src={sprite}
        title={label}
        types={types}
        className="p-2"
      />

      {/* Source Handle - only show if not end node */}
      {!isEndNode && <Handle type="source" position={targetHandle} />}
    </div>
  );
}
