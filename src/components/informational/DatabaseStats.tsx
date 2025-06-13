import { DbStats } from '~/server/routers/_app';
import SectionCard from '../ui/SectionCard';

export default function DatabaseStats({ stats }: { stats: DbStats }) {
  const statItems = [
    {
      value: stats.pokemonSpecies.toLocaleString(),
      label: 'Pokémon Species',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      hoverBg: 'hover:bg-amber-100',
      borderColor: 'border-amber-200',
    },
    {
      value: stats.types.toString(),
      label: 'Types',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hoverBg: 'hover:bg-emerald-100',
      borderColor: 'border-emerald-200',
    },
    {
      value: stats.generations.toString(),
      label: 'Generations',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverBg: 'hover:bg-red-100',
      borderColor: 'border-red-200',
    },
    {
      value: stats.moves.toString(),
      label: 'Moves',
      color: 'text-fuchsia-600',
      bgColor: 'bg-fuchsia-50',
      hoverBg: 'hover:bg-fuchsia-100',
      borderColor: 'border-fuchsia-200',
    },
  ];

  return (
    <SectionCard title="Database Statistics" className="bg-indigo-50 border-indigo-200">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item, index) => (
          <div key={index} className={`text-center p-2 rounded-lg ${item.bgColor}`}>
            <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
            <div className="text-sm text-gray-600">{item.label}</div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
