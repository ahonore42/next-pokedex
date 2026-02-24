import { useGenerationFilter, pokemonFlavorTextsConfig } from '~/hooks';
import { PokemonSpecies } from '~/server/routers/_app';
import { getGameColor, parseGenerationToNumber } from '~/utils';
import DataTable, { Column } from '~/components/ui/tables';
import GenerationFilter from '../pokedex/GenerationFilter';

type FlavorTextTableRow = {
  generation: string;
  version: string;
  flavorText: string;
};

interface PokemonFlavorTextProps {
  flavorTexts: PokemonSpecies['flavorTexts'];
}

export default function PokemonFlavorText({ flavorTexts }: PokemonFlavorTextProps) {
  const {
    selectedGenerationId,
    setSelectedGenerationId,
    filteredItems: filteredFlavorTexts,
    availableGenerations,
  } = useGenerationFilter(flavorTexts, pokemonFlavorTextsConfig);

  // Transform flavorTexts into table data
  const tableData: FlavorTextTableRow[] = filteredFlavorTexts.map((entry) => ({
    generation: `Generation ${parseGenerationToNumber(entry.version.versionGroup.generation.name)}`,
    version: entry.version.name.replaceAll('-', ' '),
    flavorText: entry.flavorText,
  }));

  // Define table columns
  const columns: Column<FlavorTextTableRow>[] = [
    {
      header: '',
      accessor: 'version',
      className: 'capitalize whitespace-nowrap text-center font-semibold',
      headerClassName: 'hidden',
      // dividerAfter: true,
      cellStyle: (data) => {
        const gameColors = getGameColor(data.version);
        return {
          className: `rounded-lg shadow-md ${gameColors.bg} ${gameColors.text} align-middle flex justify-center items-center`,
        };
      },
    },
    {
      header: '',
      accessor: 'flavorText',
      className: 'leading-relaxed text-left font-medium',
      headerClassName: 'hidden',
    },
  ];

  return (
    <div className="w-full">
      <GenerationFilter
        title="Flavor Texts"
        selectedGenerationId={selectedGenerationId}
        setSelectedGenerationId={setSelectedGenerationId}
        availableGenerations={availableGenerations}
      />
      <DataTable data={tableData} columns={columns} />
    </div>
  );
}
