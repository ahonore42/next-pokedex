import { ReactNode } from 'react';
import { trpc } from '~/utils/trpc';

// Supported search models (for tRPC query selection)
export type SearchModel = 'pokemon' | 'pokemonSpecies' | 'moves' | 'abilities' | 'items';

// Type definitions for search results
export type PokemonSearchResult = {
  id: number;
  name: string;
  sprites: { frontDefault: string | null; frontShiny: string | null } | null;
  types: { type: { name: string } }[];
  pokemonSpecies: { id: number };
};

// Generic search bar props - SearchResult represents the actual data type being searched
export interface SearchBarProps<SearchResult> {
  // The search model to use (determines which tRPC query to call)
  // Only used when 'data' prop is not provided
  model?: SearchModel;
  // Optional local data array for in-page filtering
  // When provided, disables tRPC queries and uses local filtering instead
  data?: SearchResult[];
  /**
   * Filter function for local data
   * Only used when 'data' prop is provided
   * @param item - The data item to test
   * @param searchQuery - The current search query
   * @returns true if item should be included in results
   */
  filterFunction?: (item: SearchResult, searchQuery: string) => boolean;
  limit?: number; // Maximum number of results to return
  placeholder?: string; // Placeholder text for the search input
  hover?: boolean; // Whether to enable hover effects on the search container
  center?: boolean; // Whether or not the conatainter should be centered
  size?: 'sm' | 'md' | 'lg'; // Size variant for the search bar
  className?: string; // Additional CSS classes for the container
  inputClassName?: string; // Additional CSS classes for the input
  resultsClassName?: string; // Additional CSS classes for the results container
  staleTime?: number; // Custom stale time for the query cache (5 minute default)
  scroll?: boolean; // Whether or not to display results as a scrollable list
  /**
   * Render function for each search result
   * @param result - The search result data
   * @param onResultClick - Callback to clear search and handle result selection
   */
  renderResult: (result: SearchResult, onResultClick: () => void) => ReactNode;

  /**
   * Render function for the results container when there are results
   * @param results - Array of result elements
   * @param hasResults - Whether there are any results
   */
  renderResultsContainer?: (results: ReactNode[], hasResults: boolean) => ReactNode;
}

// Hook to get the appropriate search query based on the model
export function useSearchQuery(
  model: SearchModel | undefined,
  query: string,
  limit: number,
  staleTime: number,
  hasLocalData: boolean,
) {
  const enabled = !hasLocalData && Boolean(model) && query.length > 0;

  switch (model) {
    case 'pokemon':
      return trpc.pokemon.search.useQuery({ query, limit }, { enabled, staleTime });
    default:
      // return a never-enabled query so TS is happy
      return trpc.pokemon.search.useQuery({ query: '', limit: 0 }, { enabled: false });
  }
}

// Extract results from query response based on model
export function extractResults(model: SearchModel, data: any): any[] {
  switch (model) {
    case 'pokemon':
      return data?.pokemon || [];
    default:
      console.error(`Unsupported search model in extractResults: ${String(model)}`);
      return [];
  }
}
