import React, { useMemo } from 'react';
import {
  convertStatsArrayToValues,
  getCompetitiveStatRanges,
  getStatName,
  getStatColor,
} from '~/utils';
import DataTable, { Column } from '~/components/ui/tables';
import { PokemonInSpecies } from '~/server/routers/_app';
import SectionCard from '../ui/SectionCard';
import { useBreakpointWidth } from '~/hooks';

interface PokemonStatTableProps {
  stats: PokemonInSpecies['stats'];
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

const PokemonStatTable: React.FC<PokemonStatTableProps> = ({ stats }) => {
  const breakpointWidth = useBreakpointWidth();
  const isMobile = breakpointWidth < 1024;
  const baseStats = convertStatsArrayToValues(stats);
  const competitiveRanges = getCompetitiveStatRanges(baseStats);

  // Transform the CompetitiveRanges data into table rows
  const tableData = useMemo((): StatTableRow[] => {
    const rows: StatTableRow[] = [];

    // Max Stats row
    rows.push({
      category: 'Max Stats',
      level: `Level`,
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
      category: 'Hindering Nature',
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
      category: 'Neutral Nature',
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
      category: 'Beneficial Nature',
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
  }, [competitiveRanges, baseStats]);

  // Define table columns - stats as columns with rowspan support
  const columns = useMemo(
    (): Column<StatTableRow>[] => [
      {
        header: 'Stats',
        accessor: 'category',
        className: 'font-medium text-gray-900 dark:text-white',
        headerClassName: 'font-semibold',
        rowspan: (row) => {
          // Max Stats gets rowspan 1, Max Stats categories get rowspan 2
          if (row.isFirstRowOfGroup && row.category !== 'Max Stats') {
            return 2;
          }
          if (row.category === 'Max Stats') {
            return 1;
          }
          return undefined;
        },
        skipRender: (row) => {
          // Skip rendering for second rows of Max Stats groups (when category is empty)
          return row.category === '' && !row.isFirstRowOfGroup;
        },
        columnPadding: 'pr-2'
      },
      {
        header: '',
        accessor: 'level',
        className: 'text-center font-medium text-primary',
        headerClassName: 'text-center font-semibold',
        dividerBefore: true,
        noWrap: true,
        columnPadding: isMobile ? 'px-2' : 'px-4',
      },
      {
        header: 'HP',
        accessor: 'hp',
        className: 'text-center text-sm',
        headerClassName: 'text-center font-semibold',
        cellStyle: (row) => ({
          className:
            row.category === 'Max Stats'
              ? `${getStatColor(baseStats.hp, 'text')} font-bold`
              : undefined,
        }),
        dividerBefore: true,
        noWrap: true,
        columnPadding: isMobile ? 'px-2' : 'px-4',
      },
      {
        header: getStatName('attack'),
        accessor: 'attack',
        className: 'text-center text-sm',
        headerClassName: 'text-center font-semibold',
        cellStyle: (row) => ({
          className:
            row.category === 'Max Stats'
              ? `${getStatColor(baseStats.attack, 'text')} font-bold`
              : undefined,
        }),
        dividerBefore: true,
        noWrap: true,
        columnPadding: isMobile ? 'px-2' : 'px-4',
      },
      {
        header: getStatName('defense'),
        accessor: 'defense',
        className: 'text-center text-sm',
        headerClassName: 'text-center font-semibold',
        cellStyle: (row) => ({
          className:
            row.category === 'Max Stats'
              ? `${getStatColor(baseStats.defense, 'text')} font-bold`
              : undefined,
        }),
        dividerBefore: true,
        noWrap: true,
        columnPadding: isMobile ? 'px-2' : 'px-4',
      },
      {
        header: getStatName('special-attack'),
        accessor: 'specialAttack',
        className: 'text-center text-sm',
        headerClassName: 'text-center font-semibold',
        cellStyle: (row) => ({
          className:
            row.category === 'Max Stats'
              ? `${getStatColor(baseStats.specialAttack, 'text')} font-bold`
              : undefined,
        }),
        dividerBefore: true,
        noWrap: true,
        columnPadding: isMobile ? 'px-2' : 'px-4',
      },
      {
        header: getStatName('special-defense'),
        accessor: 'specialDefense',
        className: 'text-center text-sm',
        headerClassName: 'text-center font-semibold',
        cellStyle: (row) => ({
          className:
            row.category === 'Max Stats'
              ? `${getStatColor(baseStats.specialDefense, 'text')} font-bold`
              : undefined,
        }),
        dividerBefore: true,
        noWrap: true,
        columnPadding: isMobile ? 'px-2' : 'px-4',
      },
      {
        header: getStatName('speed'),
        accessor: 'speed',
        className: 'text-center text-sm',
        headerClassName: 'text-center font-semibold',
        cellStyle: (row) => ({
          className:
            row.category === 'Max Stats'
              ? `${getStatColor(baseStats.speed, 'text')} font-bold`
              : undefined,
        }),
        dividerBefore: true,
        noWrap: true,
        columnPadding: isMobile ? 'px-2' : 'px-4',
      },
    ],
    [baseStats, isMobile],
  );

  return (
    <SectionCard variant="wide" colorVariant="transparent" className='overflow-scroll'>
      <DataTable data={tableData} columns={columns} />
    </SectionCard>
  );
};

export default PokemonStatTable;
