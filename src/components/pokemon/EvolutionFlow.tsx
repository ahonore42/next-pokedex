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
} from '@xyflow/react';
import * as dagre from '@dagrejs/dagre';

import { EvolutionChainOutput } from '~/server/routers/_app';
import { formatEvolutionConditions } from '~/utils/pokemon';
import EvolutionNode from './EvolutionNode';
import EvolutionEdgeLabel from './EvolutionEdgeLabel';

interface EvolutionFlowProps {
  chain: EvolutionChainOutput;
}

const nodeWidth = 180;
const nodeHeight = 220;
const xGap = 150;
const yGap = 100;

interface GraphElements {
  nodes: Node[];
  edges: Edge[];
  graphWidth: number;
  graphHeight: number;
}

const handleElementLayout = (chain: EvolutionChainOutput): GraphElements => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: yGap, ranksep: xGap });

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const speciesMap = new Map<number, string>();
  chain.pokemonSpecies.forEach((s) => speciesMap.set(s.id, s.name));

  const rootSpecies = chain.pokemonSpecies.find((s) => !s.evolvesFromSpecies);
  if (!rootSpecies) {
    return { nodes: [], edges: [], graphWidth: 0, graphHeight: 0 };
  }

  const coreSpeciesIds = new Set<number>();
  const queue: (typeof rootSpecies)[] = [rootSpecies];
  const visited = new Set<number>();

  while (queue.length > 0) {
    const currentSpecies = queue.shift();
    if (!currentSpecies || visited.has(currentSpecies.id)) {
      continue;
    }
    visited.add(currentSpecies.id);
    coreSpeciesIds.add(currentSpecies.id);

    currentSpecies.evolvesToSpecies.forEach((nextSpeciesInfo) => {
      const nextSpecies = chain.pokemonSpecies.find((s) => s.id === nextSpeciesInfo.id);
      if (nextSpecies) {
        queue.push(nextSpecies);
      }
    });
  }

  const coreSpecies = chain.pokemonSpecies.filter((s) => coreSpeciesIds.has(s.id));

  coreSpecies.forEach((species) => {
    const defaultPokemon = species.varieties.find((v) => v.isDefault)?.pokemon;
    if (!defaultPokemon) {
      return;
    }
    const pokemonName = species.names[0]?.name || species.name;

    const node: Node = {
      id: species.id.toString(),
      type: 'pokemonNode',
      position: { x: 0, y: 0 },
      data: {
        label: pokemonName,
        pokemon: defaultPokemon,
        speciesId: species.id,
        types: defaultPokemon?.types || [],
      },
    };
    nodes.push(node);
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });

    species.evolvesToSpecies.forEach((nextSpecies) => {
      const evolutionDetail = nextSpecies.pokemonEvolutions[0];
      const edgeLabel = evolutionDetail
        ? formatEvolutionConditions(
            evolutionDetail,
            speciesMap,
            species.name,
            speciesMap.get(nextSpecies.id) || '',
          )
        : '';

      const edge: Edge = {
        id: `e${species.id}-${nextSpecies.id}`,
        source: species.id.toString(),
        target: nextSpecies.id.toString(),
        type: 'custom',
        animated: true,
        data: { label: edgeLabel },
      };
      edges.push(edge);
      dagreGraph.setEdge(edge.source, edge.target);
    });
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = { x: nodeWithPosition.x, y: nodeWithPosition.y };
  });

  const graphWidth = dagreGraph.graph().width || 0;
  const graphHeight = dagreGraph.graph().height || 0;

  return { nodes, edges, graphWidth, graphHeight };
};

const nodeTypes = { pokemonNode: EvolutionNode };
const edgeTypes = { custom: EvolutionEdgeLabel };

const EvolutionFlow: React.FC<EvolutionFlowProps> = ({ chain }) => {
  const {
    nodes: initialNodes,
    edges: initialEdges,
    graphWidth,
    graphHeight,
  } = handleElementLayout(chain);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = handleElementLayout(chain);
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
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

export default EvolutionFlow;
