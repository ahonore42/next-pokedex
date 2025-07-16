import React, { useMemo } from 'react';
import { CompetitiveRanges, StatValues, getStatColor } from '~/utils/pokemon';
import DataTable, { Column } from '~/components/ui/DataTable';

interface PokemonStatTableProps {
  competitiveRanges: CompetitiveRanges;
  baseStats: StatValues;
}

interface StatTableRow {
  category: string;
  level: string;
  hp: string;
  attack: string;
  defense: string;
  specialAttack: string;
  specialDefense: string;
  speed: string;
  isFirstRowOfGroup?: boolean; // To handle rowspan styling
}

const PokemonStatTable: React.FC<PokemonStatTableProps> = ({ competitiveRanges, baseStats }) => {
  // Calculate total base stats
  const totalBaseStat = Object.values(baseStats).reduce((sum, stat) => sum + stat, 0);

  // Transform the CompetitiveRanges data into table rows
  const tableData = useMemo((): StatTableRow[] => {
    const rows: StatTableRow[] = [];

    // Base Stats row
    rows.push({
      category: 'Base Stats',
      level: `Total: ${totalBaseStat}`,
      hp: String(baseStats.hp),
      attack: String(baseStats.attack),
      defense: String(baseStats.defense),
      specialAttack: String(baseStats.specialAttack),
      specialDefense: String(baseStats.specialDefense),
      speed: String(baseStats.speed),
      isFirstRowOfGroup: true,
    });

    // Max Stats - Hindering Nature (2 rows)
    rows.push({
      category: 'Max Stats\nHindering Nature',
      level: 'Lv. 50',
      hp: `${competitiveRanges.level50.hp.neutral.min} - ${competitiveRanges.level50.hp.neutral.max}`,
      attack: `${competitiveRanges.level50.attack.hindering.min} - ${competitiveRanges.level50.attack.hindering.max}`,
      defense: `${competitiveRanges.level50.defense.hindering.min} - ${competitiveRanges.level50.defense.hindering.max}`,
      specialAttack: `${competitiveRanges.level50.specialAttack.hindering.min} - ${competitiveRanges.level50.specialAttack.hindering.max}`,
      specialDefense: `${competitiveRanges.level50.specialDefense.hindering.min} - ${competitiveRanges.level50.specialDefense.hindering.max}`,
      speed: `${competitiveRanges.level50.speed.hindering.min} - ${competitiveRanges.level50.speed.hindering.max}`,
      isFirstRowOfGroup: true,
    });

    rows.push({
      category: '', // Empty because it's spanned from above
      level: 'Lv. 100',
      hp: `${competitiveRanges.level100.hp.neutral.min} - ${competitiveRanges.level100.hp.neutral.max}`,
      attack: `${competitiveRanges.level100.attack.hindering.min} - ${competitiveRanges.level100.attack.hindering.max}`,
      defense: `${competitiveRanges.level100.defense.hindering.min} - ${competitiveRanges.level100.defense.hindering.max}`,
      specialAttack: `${competitiveRanges.level100.specialAttack.hindering.min} - ${competitiveRanges.level100.specialAttack.hindering.max}`,
      specialDefense: `${competitiveRanges.level100.specialDefense.hindering.min} - ${competitiveRanges.level100.specialDefense.hindering.max}`,
      speed: `${competitiveRanges.level100.speed.hindering.min} - ${competitiveRanges.level100.speed.hindering.max}`,
      isFirstRowOfGroup: false,
    });

    // Max Stats - Neutral Nature (2 rows)
    rows.push({
      category: 'Max Stats\nNeutral Nature',
      level: 'Lv. 50',
      hp: `${competitiveRanges.level50.hp.neutral.min} - ${competitiveRanges.level50.hp.neutral.max}`,
      attack: `${competitiveRanges.level50.attack.neutral.min} - ${competitiveRanges.level50.attack.neutral.max}`,
      defense: `${competitiveRanges.level50.defense.neutral.min} - ${competitiveRanges.level50.defense.neutral.max}`,
      specialAttack: `${competitiveRanges.level50.specialAttack.neutral.min} - ${competitiveRanges.level50.specialAttack.neutral.max}`,
      specialDefense: `${competitiveRanges.level50.specialDefense.neutral.min} - ${competitiveRanges.level50.specialDefense.neutral.max}`,
      speed: `${competitiveRanges.level50.speed.neutral.min} - ${competitiveRanges.level50.speed.neutral.max}`,
      isFirstRowOfGroup: true,
    });

    rows.push({
      category: '', // Empty because it's spanned from above
      level: 'Lv. 100',
      hp: `${competitiveRanges.level100.hp.neutral.min} - ${competitiveRanges.level100.hp.neutral.max}`,
      attack: `${competitiveRanges.level100.attack.neutral.min} - ${competitiveRanges.level100.attack.neutral.max}`,
      defense: `${competitiveRanges.level100.defense.neutral.min} - ${competitiveRanges.level100.defense.neutral.max}`,
      specialAttack: `${competitiveRanges.level100.specialAttack.neutral.min} - ${competitiveRanges.level100.specialAttack.neutral.max}`,
      specialDefense: `${competitiveRanges.level100.specialDefense.neutral.min} - ${competitiveRanges.level100.specialDefense.neutral.max}`,
      speed: `${competitiveRanges.level100.speed.neutral.min} - ${competitiveRanges.level100.speed.neutral.max}`,
      isFirstRowOfGroup: false,
    });

    // Max Stats - Beneficial Nature (2 rows)
    rows.push({
      category: 'Max Stats\nBeneficial Nature',
      level: 'Lv. 50',
      hp: `${competitiveRanges.level50.hp.neutral.min} - ${competitiveRanges.level50.hp.neutral.max}`,
      attack: `${competitiveRanges.level50.attack.beneficial.min} - ${competitiveRanges.level50.attack.beneficial.max}`,
      defense: `${competitiveRanges.level50.defense.beneficial.min} - ${competitiveRanges.level50.defense.beneficial.max}`,
      specialAttack: `${competitiveRanges.level50.specialAttack.beneficial.min} - ${competitiveRanges.level50.specialAttack.beneficial.max}`,
      specialDefense: `${competitiveRanges.level50.specialDefense.beneficial.min} - ${competitiveRanges.level50.specialDefense.beneficial.max}`,
      speed: `${competitiveRanges.level50.speed.beneficial.min} - ${competitiveRanges.level50.speed.beneficial.max}`,
      isFirstRowOfGroup: true,
    });

    rows.push({
      category: '', // Empty because it's spanned from above
      level: 'Lv. 100',
      hp: `${competitiveRanges.level100.hp.neutral.min} - ${competitiveRanges.level100.hp.neutral.max}`,
      attack: `${competitiveRanges.level100.attack.beneficial.min} - ${competitiveRanges.level100.attack.beneficial.max}`,
      defense: `${competitiveRanges.level100.defense.beneficial.min} - ${competitiveRanges.level100.defense.beneficial.max}`,
      specialAttack: `${competitiveRanges.level100.specialAttack.beneficial.min} - ${competitiveRanges.level100.specialAttack.beneficial.max}`,
      specialDefense: `${competitiveRanges.level100.specialDefense.beneficial.min} - ${competitiveRanges.level100.specialDefense.beneficial.max}`,
      speed: `${competitiveRanges.level100.speed.beneficial.min} - ${competitiveRanges.level100.speed.beneficial.max}`,
      isFirstRowOfGroup: false,
    });

    return rows;
  }, [competitiveRanges, baseStats, totalBaseStat]);

  // Define table columns - stats as columns with rowspan support
  const columns = useMemo(
    (): Column<StatTableRow>[] => [
      {
        header: '',
        accessor: 'category',
        className: 'font-medium text-gray-900 dark:text-white whitespace-pre-line',
        headerClassName: 'font-semibold',
        rowspan: (row) => {
          // Base Stats gets rowspan 1, Max Stats categories get rowspan 2
          if (row.isFirstRowOfGroup && row.category !== 'Base Stats') {
            return 2;
          }
          if (row.category === 'Base Stats') {
            return 1;
          }
          return undefined;
        },
        skipRender: (row) => {
          // Skip rendering for second rows of Max Stats groups (when category is empty)
          return row.category === '' && !row.isFirstRowOfGroup;
        },
      },
      {
        header: '',
        accessor: 'level',
        className: 'text-center font-medium text-gray-700 dark:text-gray-300',
        headerClassName: 'text-center font-semibold',
        dividerBefore: (row) => row.category !== 'Base Stats',
      },
      {
        header: 'HP',
        accessor: 'hp',
        className: 'text-center font-mono text-sm',
        headerClassName: 'text-center font-semibold',
        cellStyle: (row) => ({
          className:
            row.category === 'Base Stats'
              ? `${getStatColor(baseStats.hp, 'text')} font-bold`
              : undefined,
        }),
      },
      {
        header: 'Attack',
        accessor: 'attack',
        className: 'text-center font-mono text-sm',
        headerClassName: 'text-center font-semibold',
        cellStyle: (row) => ({
          className:
            row.category === 'Base Stats'
              ? `${getStatColor(baseStats.attack, 'text')} font-bold`
              : undefined,
        }),
      },
      {
        header: 'Defense',
        accessor: 'defense',
        className: 'text-center font-mono text-sm',
        headerClassName: 'text-center font-semibold',
        cellStyle: (row) => ({
          className:
            row.category === 'Base Stats'
              ? `${getStatColor(baseStats.defense, 'text')} font-bold`
              : undefined,
        }),
      },
      {
        header: 'Sp. Attack',
        accessor: 'specialAttack',
        className: 'text-center font-mono text-sm',
        headerClassName: 'text-center font-semibold',
        cellStyle: (row) => ({
          className:
            row.category === 'Base Stats'
              ? `${getStatColor(baseStats.specialAttack, 'text')} font-bold`
              : undefined,
        }),
      },
      {
        header: 'Sp. Defense',
        accessor: 'specialDefense',
        className: 'text-center font-mono text-sm',
        headerClassName: 'text-center font-semibold',
        cellStyle: (row) => ({
          className:
            row.category === 'Base Stats'
              ? `${getStatColor(baseStats.specialDefense, 'text')} font-bold`
              : undefined,
        }),
      },
      {
        header: 'Speed',
        accessor: 'speed',
        className: 'text-center font-mono text-sm',
        headerClassName: 'text-center font-semibold',
        cellStyle: (row) => ({
          className:
            row.category === 'Base Stats'
              ? `${getStatColor(baseStats.speed, 'text')} font-bold`
              : undefined,
        }),
      },
    ],
    [baseStats],
  );

  return (
    <div className="space-y-4">
      <DataTable data={tableData} columns={columns} />
    </div>
  );
};

export default PokemonStatTable;
