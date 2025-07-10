import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Position,
  Handle
} from '@xyflow/react';

import * as dagre from '@dagrejs/dagre';

import { EvolutionChainOutput, EvolutionSpecies } from '~/server/routers/_app';
import { TypeBadge } from '~/components/ui/TypeBadge';
import Link from 'next/link';

interface EvolutionFlowProps {
  chain: EvolutionChainOutput;
}

const nodeWidth = 180;
const nodeHeight = 220;
const xGap = 50;
const yGap = 100;

interface LayoutedElements {
  nodes: Node[];
  edges: Edge[];
  graphWidth: number;
  graphHeight: number;
}

const getLayoutedElements = (chain: EvolutionChainOutput): LayoutedElements => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: xGap, edgesep: yGap }); // Set graph options for horizontal layout

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Add nodes to the dagre graph and React Flow nodes array
  chain.pokemonSpecies.forEach(species => {
    const defaultPokemon = species.varieties.find(v => v.isDefault)?.pokemon;
    if (!defaultPokemon) {
      return; // Skip if no default pokemon found for species
    }
    const pokemonName = species.names[0]?.name || species.name;

    const node: Node = {
      id: species.id.toString(),
      type: 'pokemonNode',
      position: { x: 0, y: 0 }, // Dagre will set this
      data: {
        label: pokemonName,
        pokemon: defaultPokemon,
        speciesId: species.id,
        types: defaultPokemon?.types || [],
      },
    };
    nodes.push(node);
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });

    // Add edges to the dagre graph and React Flow edges array
    species.evolvesToSpecies.forEach(nextSpecies => {
      const edge: Edge = {
        id: `e${species.id}-${nextSpecies.id}`,
        source: species.id.toString(),
        target: nextSpecies.id.toString(),
        type: 'smoothstep',
        animated: true,
      };
      edges.push(edge);
      dagreGraph.setEdge(edge.source, edge.target);
    });
  });

  dagre.layout(dagreGraph);

  // Apply dagre positions to React Flow nodes
  nodes.forEach(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = { x: nodeWithPosition.x, y: nodeWithPosition.y };
  });

  const graphWidth = dagreGraph.graph().width || 0;
  const graphHeight = dagreGraph.graph().height || 0;

  return { nodes, edges, graphWidth, graphHeight };
};

const PokemonNode: React.FC<{ data: any }> = ({ data }) => {
  const pokemon = data.pokemon;
  if (!pokemon) {
    return null; // Should not happen if data is consistent
  }

  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-2 border border-gray-300 dark:border-gray-600 w-[160px] h-[200px] flex flex-col items-center justify-between">
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
              src="/images/pokeball.png" // Fallback image
              alt="No sprite available"
              className="w-full h-full object-contain"
            />
          )}
        </div>
        <p className="text-center text-lg font-medium text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 capitalize mt-2">
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

const nodeTypes = { pokemonNode: PokemonNode };

const EvolutionFlow: React.FC<EvolutionFlowProps> = ({ chain }) => {
  const { nodes: initialNodes, edges: initialEdges, graphWidth, graphHeight } = getLayoutedElements(chain);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges, graphWidth: newGraphWidth, graphHeight: newGraphHeight } = getLayoutedElements(chain);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [chain, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', minWidth: `${graphWidth}px`, height: `${graphHeight}px` }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

export default EvolutionFlow;
