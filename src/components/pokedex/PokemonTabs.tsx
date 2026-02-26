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
  disableVirtualScroll?: boolean;
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
  disableVirtualScroll = false,
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

  // When virtual scroll is disabled the table and sprite grid should expand
  // to their full height, so we clear the fixed container height on TabView.
  const tabContainerHeight = disableVirtualScroll ? '' : containerHeight;
  const tableData = disableVirtualScroll ? data : displayedPokemon;

  return (
    <TabView
      initialTab={initialTab}
      containerHeight={tabContainerHeight}
      tabs={[
        {
          label: 'Table View',
          content: (
            <div
              className={tableStyle ? 'shadow-lg rounded-lg overflow-hidden' : ''}
              style={tableStyle ? { backgroundColor: tableStyle } : {}}
            >
              <DataTable
                data={tableData}
                columns={columns}
                border={true}
                rounded={true}
                {...(!disableVirtualScroll && {
                  stickyHeader: { enabled: true, maxHeight: containerHeight },
                  infiniteScroll: {
                    onLoadMore: loadMore,
                    hasMore,
                    isLoading: isAutoLoading,
                    eagerLoad: true,
                    skeletonRows: 5,
                  },
                })}
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
                virtualScroll={
                  disableVirtualScroll
                    ? { enabled: false, rowHeight: 0 }
                    : { enabled: true, rowHeight: 65, overscan: 10, threshold: 100 }
                }
              />
            </div>
          ),
        },
        {
          label: 'Sprite View',
          content: (
            <div className="pt-4">
              <PokedexDisplay
                pokemon={tableData}
                itemsPerPage={disableVirtualScroll ? data.length || 1 : spriteItemsPerPage}
              />
            </div>
          ),
        },
      ]}
    />
  );
}
