import React, { useMemo, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  ReactFlowProvider,
  ReactFlowInstance,
} from '@xyflow/react';
import { useBreakpointWidth, useElementHeight, useReactFlowFitView } from '~/hooks';
import { buildEvolutionGraph } from './graph-utils';
import type { PokemonSpeciesEvolutionChain } from '~/server/routers/_app';
import EvolutionNode from './EvolutionNode';
import EvolutionEdgeLabel from './EvolutionEdgeLabel';

const nodeTypes = { pokemonNode: EvolutionNode };
const edgeTypes = { custom: EvolutionEdgeLabel };

type EvolutionChainProps = {
  chain: PokemonSpeciesEvolutionChain;
  className?: string;
};

// Inner component that uses ReactFlow
function EvolutionChainInner({ chain }: EvolutionChainProps) {
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // // Observe actual container dimensions
  const actualHeight = useElementHeight(containerRef);
  // Use the appropriate width for given breakpoints, 150ms debounce to prevent layout snapping
  const breakpointWidth = useBreakpointWidth(50);
  // Resize and center the container with ReactFlow's fitView
  useReactFlowFitView(reactFlowInstance, breakpointWidth);

  // Build graph using actual dimensions for layout, breakpoint for decisions
  const {
    nodes: initialNodes,
    edges: initialEdges,
    graphHeight,
  } = useMemo(
    () => buildEvolutionGraph(chain, breakpointWidth, actualHeight, breakpointWidth),
    [chain, breakpointWidth, actualHeight],
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((es) => addEdge(params, es)),
    [setEdges],
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    // Call fitView immediately to ensure graph is fully rendered
    instance.fitView({ duration: 0 });
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: `${breakpointWidth}px`,
        height: `${Math.max(graphHeight, 180)}px`,
        minHeight: '180px',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
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

// Main component wrapped with ReactFlowProvider and centering
export default function EvolutionChain({ chain, className }: EvolutionChainProps) {
  return (
    <div className={`py-4 flex justify-center items-center ${className}`}>
      <ReactFlowProvider>
        <EvolutionChainInner chain={chain} />
      </ReactFlowProvider>
    </div>
  );
}
