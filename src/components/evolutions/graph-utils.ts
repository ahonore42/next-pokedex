import { Edge, Node } from '@xyflow/react';
import * as dagre from '@dagrejs/dagre';
import {
  computeNodesep,
  computeRanksep,
  formatEvolutionConditions,
  nodeSizeFromBp,
  isVariantEvolution,
  mergeLocationEvolutions,
} from '~/utils/evolutions';
import type { PokemonSpeciesEvolutionChain } from '~/server/routers/_app';

type GraphElements = {
  nodes: Node[];
  edges: Edge[];
  graphWidth: number;
  graphHeight: number;
};

export function buildEvolutionGraph(
  chain: PokemonSpeciesEvolutionChain,
  viewWidth: number,
  viewHeight: number,
  breakpointWidth: number,
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
  // Override node size for cases with many siblings to prevent oversized nodes
  const nodeSize = nodeSizeFromBp(breakpointWidth, rankCount, maxSibs);
  const hasManyDirectEvolutions = chain.pokemonSpecies.some((s) => s.evolvesToSpecies.length > 3);
  const vertical = hasManyDirectEvolutions;
  const maxSiblings = Math.max(...chain.pokemonSpecies.map((s) => s.evolvesToSpecies.length), 1);

  // Force the graph to use the full container width
  let rankSeparation: number;
  if (!vertical && rankCount > 1) {
    // Calculate exact ranksep to force the graph to fill the container width
    const targetGraphWidth = viewWidth;
    const totalNodeWidth = rankCount * nodeSize;
    const totalSeparationNeeded = targetGraphWidth - totalNodeWidth;
    rankSeparation = Math.max(80, totalSeparationNeeded / (rankCount - 1));
  } else {
    rankSeparation = computeRanksep({
      rankdir: vertical ? 'TB' : 'LR',
      containerWidth: viewWidth,
      containerHeight: viewHeight,
      nodeWidth: nodeSize,
      nodeHeight: nodeSize,
      maxSiblings,
      rankCount: rankCount,
    });
  }

  const nodeSeparation = computeNodesep({
    rankdir: vertical ? 'TB' : 'LR',
    containerWidth: breakpointWidth, // Use breakpointWidth instead of viewWidth
    containerHeight: viewHeight,
    nodeWidth: nodeSize,
    nodeHeight: nodeSize,
    maxSiblings,
  });

  // Setup dagre graph
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
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
          types: pokemon.types.map((type) => type.type.name),
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
          const variantLabel = `${
            variety.pokemon.name
              .split('-')
              .join(' ')
              ?.replace(/^\w/, (name) => name.toUpperCase()) || 'Form'
          }`;

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
