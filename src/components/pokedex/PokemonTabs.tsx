import TabView from '../ui/TabView';
import DataTable, { Column, pokemonColumns } from '../ui/tables';
import PokedexDisplay from './PokedexDisplay';
import { usePagination } from '~/hooks';
import { PokemonListData } from '~/lib/types';

interface PokemonTabsProps {
  data: PokemonListData[]; // The complete dataset of Pokemon to display

  // Pagination configuration
  itemsPerPage?: number; // How many items to show per page for table view (default: 25)
  resetDependency?: string | number | undefined; // When this value changes, pagination resets to page 1
  // Optional customizations with sensible defaults
  initialTab?: 'Table View' | 'Sprite View'; // Which tab to show initially (default: 'Table View')
  containerHeight?: string; // Height of the tab container (default: 'h-240')
  columns?: Column<PokemonListData>[]; // Table columns to display (default: pokemonColumns)
  spriteViewConfig?: {
    itemsPerPage?: number; // How many sprites to show per page (default: 100)
  };
  tableStyle?: string;
}

export default function PokemonTabs({
  data,
  itemsPerPage = 25,
  resetDependency,
  initialTab = 'Table View',
  containerHeight = 'h-240',
  columns = pokemonColumns,
  spriteViewConfig = {},
  tableStyle = '',
}: PokemonTabsProps) {
  const { itemsPerPage: spriteItemsPerPage = 100 } = spriteViewConfig;

  const {
    displayedData: displayedPokemon,
    hasMore,
    loadMore,
    isAutoLoading,
  } = usePagination({
    data,
    itemsPerPage,
    resetDependency,
    autoLoad: {
      enabled: true,
      delay: 10,
      stopOnInteraction: false,
      maxAutoPages: Math.ceil(data.length / itemsPerPage),
      batchSize: 2,
    },
  });

  return (
    <TabView
      initialTab={initialTab}
      containerHeight={containerHeight}
      tabs={[
        {
          label: 'Table View',
          content: (
            <div
              className={tableStyle ? 'shadow-lg rounded-lg overflow-hidden' : ''}
              style={tableStyle ? { backgroundColor: tableStyle } : {}}
            >
              <DataTable
                data={displayedPokemon}
                columns={columns}
                border={true}
                rounded={true}
                stickyHeader={{
                  enabled: true,
                  maxHeight: containerHeight,
                }}
                infiniteScroll={{
                  onLoadMore: loadMore,
                  hasMore,
                  isLoading: isAutoLoading,
                  eagerLoad: true,
                  skeletonRows: 5,
                }}
                layoutStabilization={{
                  enabled: true,
                  fixedLayout: true,
                  minColumnWidth: 'min-w-16',
                  preCalculatedWidths: [
                    'w-16',
                    'w-40',
                    'w-24',
                    'w-40',
                    'w-16',
                    'w-16',
                    'w-16',
                    'w-18',
                    'w-18',
                    'w-18',
                    'w-18',
                  ],
                }}
                virtualScroll={{
                  enabled: true,
                  rowHeight: 65,
                  overscan: 10,
                  threshold: 100,
                }}
              />
            </div>
          ),
        },
        {
          label: 'Sprite View',
          content: (
            <div className="pt-4">
              <PokedexDisplay pokemon={displayedPokemon} itemsPerPage={spriteItemsPerPage} />
            </div>
          ),
        },
      ]}
    />
  );
}
