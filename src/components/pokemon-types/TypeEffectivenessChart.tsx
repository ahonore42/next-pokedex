import { trpc } from '~/utils/trpc';
import { AllTypesOutput, AllEfficaciesOutput } from '~/server/routers/_app';
import { getDamageFactorColor, getDamageFactorText } from '~/utils/pokemon';
import DataTable, { Column } from '~/components/ui/DataTable';
import TypeBadge from '~/components/pokemon-types/TypeBadge';
import MobileTypeChart from './MobileTypeChart';
import SectionCard from '~/components/ui/SectionCard';
import TypeEffectivenessKey from './TypeEffectivenessKey';
import TypeInfo from './TypeInfo';

// Type for our table rows
interface TypeEffectivenessRow {
  attackingType: AllTypesOutput[number];
  [key: string]: any; // For dynamic defending type columns
}

export default function TypeEffectivenessChart() {
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
      header: <TypeBadge type={defendingType} link={false} square />,
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
    <TypeBadge type={row.attackingType} link={false} square />
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
          <div className="flex flex-col flex-1 lg:flex-row gap-4 justify-center items-center lg:items-start">
            <TypeEffectivenessKey />
            <div className="flex justify-center">
              <div className="w-[698px] xl:w-[930px] flex justify-center">
                <div className="shadow-md w-fit origin-center [zoom:0.75] xl:[zoom:1]">
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
}
