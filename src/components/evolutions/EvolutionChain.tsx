import React, { useEffect, useRef, useState, useMemo } from 'react';
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
import EvolutionNode from './EvolutionNode';
import EvolutionEdgeLabel from './EvolutionEdgeLabel';
import {
  computeNodesep,
  computeRanksep,
  formatEvolutionConditions,
  nodeSizeFromBp,
  snapToBreakpoints,
  isVariantEvolution,
  mergeLocationEvolutions,
} from '~/utils/evolutions';
import type { PokemonSpeciesEvolutionChain } from '~/server/routers/_app';

/* ------------------------------------------------------------------ */
/* Graph types and helper function                                    */
/* ------------------------------------------------------------------ */

type GraphElements = {
  nodes: Node[];
  edges: Edge[];
  graphWidth: number;
  graphHeight: number;
};

function buildGraph(
  chain: PokemonSpeciesEvolutionChain,
  viewWidth: number,
  viewHeight: number,
): GraphElements {
  const root = chain.pokemonSpecies.find((s) => !s.evolvesFromSpecies);
  if (!root) return { nodes: [], edges: [], graphWidth: 0, graphHeight: 0 };

  // Pre-compute maps for O(1) lookups
  const nameMap = new Map<number, string>();
  const speciesMap = new Map<number, PokemonSpeciesEvolutionChain['pokemonSpecies'][number]>();

  chain.pokemonSpecies.forEach((species) => {
    nameMap.set(species.id, species.name);
    speciesMap.set(species.id, species);
  });

  // Calculate depth map
  const depthMap = new Map<number, number>();
  const queue: { id: number; depth: number }[] = [{ id: root.id, depth: 0 }];

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (depthMap.has(id)) continue;
    depthMap.set(id, depth);

    const species = speciesMap.get(id);
    if (species) {
      species.evolvesToSpecies.forEach((evolution) => {
        if (speciesMap.has(evolution.id)) {
          queue.push({ id: evolution.id, depth: depth + 1 });
        }
      });
    }
  }

  // Calculate layout parameters
  const rankCount = Math.max(...depthMap.values(), 0) + 1;
  const maxSibs = Math.max(...chain.pokemonSpecies.map((s) => s.evolvesToSpecies.length), 1);
  const nodeSize = nodeSizeFromBp(viewWidth, rankCount, maxSibs);
  const hasManyDirectEvolutions = chain.pokemonSpecies.some((s) => s.evolvesToSpecies.length > 3);
  const vertical = viewWidth < 768 || hasManyDirectEvolutions;
  const maxSiblings = Math.max(...chain.pokemonSpecies.map((s) => s.evolvesToSpecies.length), 1);

  // Setup dagre graph
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const rankSeparation = computeRanksep({
    rankdir: vertical ? 'TB' : 'LR',
    containerWidth: viewWidth,
    containerHeight: viewHeight,
    nodeWidth: nodeSize,
    nodeHeight: nodeSize,
    rankCount: rankCount,
  });
  const nodeSeparation = computeNodesep({
    rankdir: vertical ? 'TB' : 'LR',
    containerWidth: viewWidth,
    containerHeight: viewHeight,
    nodeWidth: nodeSize,
    nodeHeight: nodeSize,
    maxSiblings,
  });

  dagreGraph.setGraph({
    rankdir: vertical ? 'TB' : 'LR',
    ranksep: rankSeparation,
    nodesep: nodeSeparation,
  });

  // Pre-compute exclusion sets
  const requirementSpeciesIds = new Set(
    chain.pokemonSpecies
      .flatMap((species) => species.evolvesToSpecies)
      .flatMap((evolution) => evolution.pokemonEvolutions)
      .flatMap((evolution) => [evolution.partySpeciesId, evolution.tradeSpeciesId])
      .filter(Boolean),
  );

  const variantSpeciesIds = new Set<number>();
  chain.pokemonSpecies.forEach((species) => {
    if (isVariantEvolution(species, speciesMap)) {
      variantSpeciesIds.add(species.evolvesToSpecies[0].id);
    }
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Process species for nodes and edges
  chain.pokemonSpecies
    .filter(
      (species) => !requirementSpeciesIds.has(species.id) && !variantSpeciesIds.has(species.id),
    )
    .forEach((species) => {
      const pokemon = species.varieties.find((variety) => variety.isDefault)?.pokemon;
      if (!pokemon) return;

      const label = species.names[0]?.name || species.name;
      const node: Node = {
        id: species.id.toString(),
        type: 'pokemonNode',
        position: { x: 0, y: 0 },
        data: {
          label,
          pokemon,
          speciesId: String(species.id),
          types: pokemon.types,
          hasManyDirectEvolutions,
          isStartNode: species.id === root.id,
          isEndNode: species.evolvesToSpecies.length === 0,
          nodeWidth: nodeSize,
          nodeHeight: nodeSize,
          containerWidth: viewWidth || 800,
        },
      };
      nodes.push(node);
      dagreGraph.setNode(node.id, { width: nodeSize, height: nodeSize });

      if (isVariantEvolution(species, speciesMap)) {
        // Handle variant evolution
        const targetSpeciesInfo = species.evolvesToSpecies[0];
        const targetSpecies = speciesMap.get(targetSpeciesInfo.id)!;

        targetSpeciesInfo.pokemonEvolutions.forEach((evolutionDetail, index) => {
          const variety =
            targetSpecies.varieties[index] || targetSpecies.varieties.find((v) => v.isDefault);
          if (!variety?.pokemon) return;

          const variantNodeId = `${targetSpecies.id}-${variety.pokemon.id}`;
          const variantLabel = `${targetSpecies.names[0]?.name || targetSpecies.name} (${
            variety.pokemon.name
              .split('-')
              .pop()
              ?.replace(/^\w/, (name) => name.toUpperCase()) || 'Form'
          })`;

          const variantNode: Node = {
            id: variantNodeId,
            type: 'pokemonNode',
            position: { x: 0, y: 0 },
            data: {
              label: variantLabel,
              pokemon: variety.pokemon,
              speciesId: String(targetSpecies.id),
              types: variety.pokemon.types,
              hasManyDirectEvolutions,
              isStartNode: false,
              isEndNode: true,
              nodeWidth: nodeSize,
              nodeHeight: nodeSize,
              containerWidth: viewWidth || 800,
              isVariant: true,
            },
          };

          nodes.push(variantNode);
          dagreGraph.setNode(variantNode.id, { width: nodeSize, height: nodeSize });

          const edgeLabel = formatEvolutionConditions(
            evolutionDetail,
            nameMap,
            species.name,
            targetSpecies.name,
          );

          edges.push({
            id: `e${species.id}-${variantNodeId}`,
            source: species.id.toString(),
            target: variantNodeId,
            type: 'custom',
            animated: true,
            data: { label: edgeLabel, hasManyDirectEvolutions, containerWidth: viewWidth },
          });
          dagreGraph.setEdge(species.id.toString(), variantNodeId);
        });
      } else {
        // Handle normal evolution
        species.evolvesToSpecies.forEach((next) => {
          const mergedEvolution = mergeLocationEvolutions(next.pokemonEvolutions);
          const edgeLabel = formatEvolutionConditions(
            mergedEvolution,
            nameMap,
            species.name,
            nameMap.get(next.id) || '',
          );

          edges.push({
            id: `e${species.id}-${next.id}`,
            source: species.id.toString(),
            target: next.id.toString(),
            type: 'custom',
            animated: true,
            data: { label: edgeLabel, hasManyDirectEvolutions, containerWidth: viewWidth },
          });
          dagreGraph.setEdge(species.id.toString(), next.id.toString());
        });
      }
    });

  dagre.layout(dagreGraph);

  // Apply positions
  nodes.forEach((node) => {
    const position = dagreGraph.node(node.id);
    node.position = { x: position.x, y: position.y };
  });

  return {
    nodes,
    edges,
    graphWidth: dagreGraph.graph().width || 0,
    graphHeight: dagreGraph.graph().height || 0,
  };
}

/* ------------------------------------------------------------------ */
/* Component, hooks, render                                           */
/* ------------------------------------------------------------------ */

const nodeTypes = { pokemonNode: EvolutionNode };
const edgeTypes = { custom: EvolutionEdgeLabel };

export default function EvolutionChain({ chain }: { chain: PokemonSpeciesEvolutionChain }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(300);

  useEffect(() => {
    const graphElement = ref.current;
    if (!graphElement) return;

    const resizeObserver = new ResizeObserver(([e]) => {
      setWidth(Math.round(e.contentRect.width));
      setHeight(Math.round(e.contentRect.height));
    });
    resizeObserver.observe(graphElement);
    setWidth(Math.round(graphElement.offsetWidth));
    setHeight(Math.round(graphElement.offsetHeight));

    return () => resizeObserver.disconnect();
  }, []);

  const bpWidth = useMemo(() => snapToBreakpoints(width), [width]);

  const {
    nodes: initialNodes,
    edges: initialEdges,
    graphHeight,
  } = useMemo(() => buildGraph(chain, bpWidth, height), [chain, bpWidth, height]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = React.useCallback(
    (params: Connection | Edge) => setEdges((es) => addEdge(params, es)),
    [setEdges],
  );

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: `${Math.max(graphHeight, 158)}px`,
        minHeight: '144px',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        zoomOnScroll={false}
        nodesDraggable={false}
        panOnDrag={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
