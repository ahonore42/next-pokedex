import React, { useCallback, useEffect, useState, useRef } from 'react';
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
import { formatEvolutionConditions } from '~/utils/pokemon';
import EvolutionNode from './EvolutionNode';
import EvolutionEdgeLabel from './EvolutionEdgeLabel';
import { computeNodesep, computeRanksep } from '~/utils/pokemon';
import type { SpeciesEvolutionChain } from '~/server/routers/_app';

interface EvolutionChainProps {
  chain: SpeciesEvolutionChain;
}

interface GraphElements {
  nodes: Node[];
  edges: Edge[];
  graphWidth: number;
  graphHeight: number;
}

const handleElementLayoutWithWidth = (
  chain: SpeciesEvolutionChain,
  containerWidth: number,
  containerHeight: number,
): GraphElements => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Calculate number of evolution stages for dynamic spacing
  const rootSpecies = chain.pokemonSpecies.find((s) => !s.evolvesFromSpecies);
  if (!rootSpecies) {
    return { nodes: [], edges: [], graphWidth: 0, graphHeight: 0 };
  }

  // Count the number of evolution stages
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

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const speciesMap = new Map<number, string>();
  chain.pokemonSpecies.forEach((s) => speciesMap.set(s.id, s.name));

  const coreSpecies = chain.pokemonSpecies.filter((s) => coreSpeciesIds.has(s.id));

  const nodeCount = coreSpeciesIds.size;

  // Use fixed, uniform node sizing
  const nodeWidth = 160;
  const nodeHeight = 180;

  const hasManyDirectEvolutions = chain.pokemonSpecies.some(
    (species) => species.evolvesToSpecies.length > 3,
  );
  const shouldUseVerticalLayout = containerWidth < 768 || hasManyDirectEvolutions;
  const maxSiblingsCount = Math.max(
    ...coreSpecies.map((s) => s.evolvesToSpecies.length || 0),
    1, // in case all are 0
  );

  const rankdir = shouldUseVerticalLayout ? 'TB' : 'LR';
  const ranksep = computeRanksep({
    rankdir,
    containerWidth,
    containerHeight,
    nodeWidth,
    nodeHeight,
    rankCount: nodeCount,
  });

  const nodesep = computeNodesep({
    rankdir,
    containerWidth,
    containerHeight,
    nodeWidth,
    nodeHeight,
    maxSiblings: maxSiblingsCount,
  });

  dagreGraph.setGraph({
    rankdir,
    nodesep,
    ranksep,
  });

  coreSpecies.forEach((species) => {
    const defaultPokemon = species.varieties.find((v) => v.isDefault)?.pokemon;
    if (!defaultPokemon) {
      return;
    }
    const pokemonName = species.names[0]?.name || species.name;
    const isStartNode = species.id === rootSpecies.id;
    const isEndNode = species.evolvesToSpecies.length === 0;

    const node: Node = {
      id: species.id.toString(),
      type: 'pokemonNode',
      position: { x: 0, y: 0 },
      data: {
        label: pokemonName,
        pokemon: defaultPokemon,
        speciesId: species.id,
        types: defaultPokemon?.types || [],
        hasManyDirectEvolutions: hasManyDirectEvolutions,
        isStartNode: isStartNode,
        isEndNode: isEndNode,
        nodeWidth: nodeWidth,
        nodeHeight: nodeHeight,
        containerWidth: containerWidth,
      },
    };
    nodes.push(node);
    dagreGraph.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
    });

    species.evolvesToSpecies.forEach((nextSpecies, index) => {
      const evolutionDetail = species.pokemonEvolutions?.[index] || species.pokemonEvolutions?.[0];

      // Always call formatEvolutionConditions, even with null/undefined evolution data
      const edgeLabel = formatEvolutionConditions(
        evolutionDetail,
        speciesMap,
        species.name,
        speciesMap.get(nextSpecies.id) || '',
      );

      const edge: Edge = {
        id: `e${species.id}-${nextSpecies.id}`,
        source: species.id.toString(),
        target: nextSpecies.id.toString(),
        type: 'custom',
        animated: true,
        data: {
          label: edgeLabel,
          hasManyDirectEvolutions: hasManyDirectEvolutions,
          containerWidth: containerWidth,
        },
      };
      edges.push(edge);
      dagreGraph.setEdge(edge.source, edge.target);
    });
  });

  dagre.layout(dagreGraph);

  // Get actual node positions first
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = { x: nodeWithPosition.x, y: nodeWithPosition.y };
  });

  // Center the entire chain in the container
  if (nodes.length > 0) {
    const nodePositions = nodes.map((node) => node.position.x);
    const leftmostNodeX = Math.min(...nodePositions);
    const rightmostNodeX = Math.max(...nodePositions);

    // Calculate the actual span from left edge of leftmost node to right edge of rightmost node
    const leftEdge = leftmostNodeX - nodeWidth / 2;
    const rightEdge = rightmostNodeX + nodeWidth / 2;
    const totalSpan = rightEdge - leftEdge;

    // Calculate where the left edge should be to center the span
    const targetLeftEdge = (containerWidth - totalSpan) / 2;

    // Calculate the offset needed
    const offset = targetLeftEdge - leftEdge;

    // Apply offset to all nodes
    nodes.forEach((node) => {
      node.position.x += offset;
    });
  }

  const graphWidth = dagreGraph.graph().width || 0;
  const graphHeight = dagreGraph.graph().height || 0;

  return { nodes, edges, graphWidth, graphHeight };
};

const nodeTypes = { pokemonNode: EvolutionNode };
const edgeTypes = { custom: EvolutionEdgeLabel };

const EvolutionChain: React.FC<EvolutionChainProps> = ({ chain }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [containerHeight, setContainerHeight] = useState(300);

  // ResizeObserver to track container width changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;

        if (newWidth !== containerWidth) {
          setContainerWidth(newWidth);
        }
        if (newHeight !== containerHeight) {
          setContainerHeight(newHeight);
        }
      }
    });

    resizeObserver.observe(container);

    // Set initial width
    const initialWidth = container.offsetWidth;
    if (initialWidth > 0) {
      setContainerWidth(initialWidth);
    }

    const initialHeight = container.offsetHeight;
    if (initialHeight > 0) {
      setContainerHeight(initialHeight);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerWidth, containerHeight]);

  const {
    nodes: initialNodes,
    edges: initialEdges,
    graphWidth,
    graphHeight,
  } = handleElementLayoutWithWidth(chain, containerWidth, containerHeight);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = handleElementLayoutWithWidth(
      chain,
      containerWidth,
      containerHeight,
    );
    setNodes(newNodes);
    setEdges(newEdges);
  }, [chain, containerWidth, containerHeight, setNodes, setEdges]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        minWidth: `${Math.max(graphWidth, 400)}px`,
        height: `${Math.max(graphHeight, 200)}px`,
        minHeight: '200px',
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
};

export default EvolutionChain;
