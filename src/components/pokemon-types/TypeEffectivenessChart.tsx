import { AllEfficaciesOutput, PokemonTypeName } from '~/server/routers/_app';
import {
  buildTypeEfficacyMap,
  getDamageFactorColor,
  getDamageFactorText,
  getTypeEfficacy,
  pokemonTypeMap,
  pokemonTypes,
} from '~/utils';
import { SquareTable, Column } from '../ui/tables';
import TypeBadge from '~/components/pokemon-types/TypeBadge';
import { useBreakpointWidth } from '~/hooks';

// Type for our table rows
type TypeEffectivenessRow = {
  attackingType: PokemonTypeName;
} & Record<`defending_${number}`, number>;

interface TypeEffectivenessChartProps {
  efficacies: AllEfficaciesOutput;
}

export default function TypeEffectivenessChart({ efficacies }: TypeEffectivenessChartProps) {
  const breakpointWidth = useBreakpointWidth();
  // Since this component is only rendered when parent has data, we can assume data exists
  const efficacyMap = buildTypeEfficacyMap(efficacies);

  const squareSize = breakpointWidth < 1024 ? 'sm' : breakpointWidth < 1280 ? 'md' : 'lg';

  // Create table data - one row per attacking type
  const tableData: TypeEffectivenessRow[] = pokemonTypes.map((attackingType) => {
    const row: TypeEffectivenessRow = {
      attackingType,
    };

    // Add effectiveness against each defending type
    pokemonTypes.forEach((defendingType) => {
      row[`defending_${pokemonTypeMap[defendingType]}`] = getTypeEfficacy(
        efficacyMap,
        attackingType,
        defendingType,
      );
    });

    return row;
  });

  // Create columns - first column for attacking type, then one column per defending type
  const columns: Column<TypeEffectivenessRow>[] = [
    {
      header: (
        <div className="text-tiny lg:text-xs text-primary leading-none tracking-tighter text-center">
          DEF→
          <br />
          ATK↓
        </div>
      ),
      accessor: 'attackingType',
      headerClassName: 'text-center w-8 lg:w-10',
      dividerAfter: false,
      cellStyle: () => ({
        className: 'bg-surface-elevated',
      }),
    },
    ...pokemonTypes.map((defendingType, index) => ({
      header: <TypeBadge type={defendingType} link={false} square squareSize={squareSize} />,
      accessor: `defending_${pokemonTypeMap[defendingType]}` as keyof TypeEffectivenessRow,
      columnPadding: 'px-0', // Remove horizontal padding for square cells
      className: 'text-center text-lg font-bold',
      headerClassName: 'text-center ',
      dividerBefore: index === 0,

      cellStyle: (row: TypeEffectivenessRow) => {
        const factor = row[`defending_${pokemonTypeMap[defendingType]}`];
        return {
          className: getDamageFactorColor(factor),
        };
      },
    })),
  ];

  // Custom accessor function for attacking type column
  columns[0].accessor = (row: TypeEffectivenessRow) => (
    <TypeBadge type={row.attackingType} link={false} square squareSize={squareSize} />
  );

  // Custom accessor functions for effectiveness columns
  columns.slice(1).forEach((column, index) => {
    const defendingType = pokemonTypes[index];
    column.accessor = (row: TypeEffectivenessRow) => {
      const factor = row[`defending_${pokemonTypeMap[defendingType]}`];
      return getDamageFactorText(factor);
    };
  });

  return (
    <SquareTable
      data={tableData}
      columns={columns}
      overlayHover
      noPadding
      rounded={true}
      className="shadow-lg"
    />
  );
}
