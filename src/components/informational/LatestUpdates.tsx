import SectionCard from '../ui/SectionCard';

export default function LatestUpdates() {
  const updates = [
    {
      date: 'July 14, 2025',
      title: 'Completed Tailwind CSS Migration',
      desc: 'Migrated entire UI from inline styles to comprehensive Tailwind CSS classes with theme variables, enhanced animations, and improved component consistency.',
      type: 'major-refactor',
    },
    {
      date: 'July 13, 2025',
      title: 'Enhanced Pokemon Data Architecture',
      desc: 'Implemented species-centric data processing, comprehensive stat calculations, and database interactions for improved Pokemon information display.',
      type: 'feature',
    },
    {
      date: 'July 11, 2025',
      title: 'Advanced Evolution Visualization System',
      desc: 'Built comprehensive evolution chain system with ReactFlow desktop charts, mobile-optimized displays, and dynamic layout algorithms for complex evolution trees.',
      type: 'feature',
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
