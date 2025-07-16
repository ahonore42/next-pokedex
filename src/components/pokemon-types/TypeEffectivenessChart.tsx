import { trpc } from '~/utils/trpc';
import { AllTypesOutput, AllEfficaciesOutput } from '~/server/routers/_app';
import SectionCard from '~/components/ui/SectionCard';
import DataTable, { Column } from '~/components/ui/DataTable';
import TypeBadge from '~/components/pokemon-types/TypeBadge';
import { MobileTypeChart } from './MobileTypeChart';
import { getDamageFactorColor, getDamageFactorText } from '~/utils/pokemon';
import TypeEffectivenessKey from './TypeEffectivenessKey';
import TypeInfo from './TypeInfo';

// Type for our table rows
interface TypeEffectivenessRow {
  attackingType: AllTypesOutput[0];
  [key: string]: any; // For dynamic defending type columns
}

const TypeEffectivenessChart: React.FC = () => {
  const { data: allTypes } = trpc.types.allTypes.useQuery() as { data: AllTypesOutput };
  const { data: allEfficacies } = trpc.types.getAllTypeEfficacies.useQuery() as {
    data: AllEfficaciesOutput;
  };

  // Since this component is only rendered when parent has data, we can assume data exists
  if (!allTypes || !allEfficacies) {
    return null;
  }

  const efficacyMap = new Map<number, Map<number, number>>();
  allEfficacies.forEach((efficacy) => {
    if (!efficacyMap.has(efficacy.damageType.id)) {
      efficacyMap.set(efficacy.damageType.id, new Map<number, number>());
    }
    efficacyMap.get(efficacy.damageType.id)?.set(efficacy.targetType.id, efficacy.damageFactor);
  });

  const getDamageFactor = (attackingTypeId: number, defendingTypeId: number) => {
    return efficacyMap.get(attackingTypeId)?.get(defendingTypeId) ?? 1; // Default to 1x if no specific efficacy found
  };

  // Sort types by ID to ensure consistent order
  const sortedTypes = [...allTypes].sort((a, b) => a.id - b.id);

  // Create table data - one row per attacking type
  const tableData: TypeEffectivenessRow[] = sortedTypes.map((attackingType) => {
    const row: TypeEffectivenessRow = {
      attackingType,
    };

    // Add effectiveness against each defending type
    sortedTypes.forEach((defendingType) => {
      row[`defending_${defendingType.id}`] = getDamageFactor(attackingType.id, defendingType.id);
    });

    return row;
  });

  // Create columns - first column for attacking type, then one column per defending type
  const columns: Column<TypeEffectivenessRow>[] = [
    {
      header: (
        <div className="text-xs text-primary leading-tight">
          DEF→
          <br />
          ATK↓
        </div>
      ),
      accessor: 'attackingType',
      headerClassName: 'text-center w-8',
      dividerAfter: false,
      cellStyle: () => ({
        className: 'bg-surface-elevated',
      }),
    },
    ...sortedTypes.map((defendingType, index) => ({
      header: <TypeBadge type={defendingType} link={false} short />,
      accessor: `defending_${defendingType.id}` as keyof TypeEffectivenessRow,
      columnPadding: 'px-0', // Remove horizontal padding for square cells
      className: 'text-center text-xl font-bold',
      headerClassName: 'text-center ',
      dividerBefore: index === 0,
      cellStyle: (row: TypeEffectivenessRow) => {
        const factor = row[`defending_${defendingType.id}`] as number;
        return {
          className: getDamageFactorColor(factor),
        };
      },
    })),
  ];

  // Custom accessor function for attacking type column
  columns[0].accessor = (row: TypeEffectivenessRow) => (
    <TypeBadge type={row.attackingType} link={false} short />
  );

  // Custom accessor functions for effectiveness columns
  columns.slice(1).forEach((column, index) => {
    const defendingType = sortedTypes[index];
    column.accessor = (row: TypeEffectivenessRow) => {
      const factor = row[`defending_${defendingType.id}`] as number;
      return getDamageFactorText(factor);
    };
  });

  return (
    <SectionCard title="Type Effectiveness Chart" colorVariant="transparent">
      <div className="hidden md:block mb-6">
        <div className="flex flex-wrap gap-6">
          {/* Left Column - Chart Key/Legend */}

          {/* Right Column - DataTable */}
          <div className="flex flex-col flex-1 lg:flex-row gap-4 justify-center items-center lg:items-start">
            <div className="flex flex-col md:flex-row lg:flex-col gap-4">
              <TypeEffectivenessKey />
              <div className="bg-pokemon rounded-lg p-4 md:flex-1 lg:flex-none lg:w-56 xl:w-64">
                <h4 className="font-semibold text-primary mb-3">Type Chart</h4>
                <p className="text-muted mb-2 text-wrap">
                  The full type chart here displays the strengths and weaknesses of each type. Look
                  down the left hand side for the attacking type, then move across to see how
                  effective it is against each Pokémon type.
                </p>
                <p className="text-muted text-wrap">
                  Use this chart to plan your battle strategy and choose the most effective moves
                  for any situation.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-[698px] xl:w-[930px] flex justify-center">
                <div className="shadow-md rounded-md w-fit origin-center [zoom:0.75] xl:[zoom:1]">
                  <DataTable
                    data={tableData}
                    columns={columns}
                    maxColumns={columns.length}
                    square="w-[930px]"
                    overlayHover
                    noPadding
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View (below lg) */}
      <div className="md:hidden mb-6">
        <MobileTypeChart allTypes={sortedTypes} getDamageFactor={getDamageFactor} />
      </div>

      <TypeInfo />
    </SectionCard>
  );
};

export default TypeEffectivenessChart;
