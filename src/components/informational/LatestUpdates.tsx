import SectionCard from '../ui/SectionCard';

export default function LatestUpdates() {
  const updates = [
    {
      date: 'February 24, 2026',
      title: 'New Feature: Comprehensive Itemdex',
      desc: 'Explore all in-game items with a dedicated item listing page that supports filtering and grouping by category. View detailed information for each item, including its effects and which Pokémon can hold it.',
      type: 'feature',
    },
    {
      date: 'February 24, 2026',
      title: 'Ability & Move Detail Pages',
      desc: 'Implemented dedicated pages for every Pokémon ability and move, providing detailed descriptions, stats, and lists of Pokémon that can learn or possess them.',
      type: 'feature',
    },
    {
      date: 'February 24, 2026',
      title: 'Data & Performance Enhancements',
      desc: 'Improved the data import process to include missing item sprites and optimized backend data selectors for better performance across the application.',
      type: 'enhancement',
    },
  ];

  const updatesDisplay = updates.map((update, index) => (
    <SectionCard key={index} colorVariant="update" className="transition-theme">
      <div className="flex flex-col gap-2">
        <span className="font-bold text-md text-primary">{update.title}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">{update.date}</span>
          <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-700 px-2 py-0.5 rounded-full capitalize">
            {update.type}
          </span>
        </div>
        <span className="text-sm text-muted">{update.desc}</span>
      </div>
    </SectionCard>
  ));

  return (
    <SectionCard title="Latest Updates" colorVariant="transparent">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">{updatesDisplay}</div>
        {/* Footer */}
        <div className="p-4 border-t border-emerald-200 dark:border-emerald-800 text-center">
          <span className="text-sm text-muted text-center">
            Stay updated with the latest features and improvements to the Pokédex
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
