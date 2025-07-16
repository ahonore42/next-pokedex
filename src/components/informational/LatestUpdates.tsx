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

  return (
    <SectionCard title="Latest Updates" colorVariant="transparent">
      <div className="space-y-4">
        {updates.map((update, index) => (
          <div
            key={index}
            className="
          relative p-4 border-l-4 rounded-sm
          bg-update hover:bg-update-hover
          text-pokemon-text-muted
          border-emerald-600 dark:border-emerald-500
          theme-transition hover:shadow-sm
        "
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <time className="text-sm font-medium text-primary" dateTime={update.date}>
                    {update.date}
                  </time>
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-700 px-2 py-0.5 rounded-full capitalize">
                    {update.type}
                  </span>
                </div>

                <h3 className="font-bold text-base mb-2 text-primary">{update.title}</h3>

                <p className="text-sm leading-relaxed text-muted">{update.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-emerald-200 dark:border-emerald-800 text-center">
        <p className="text-sm text-muted">
          Stay updated with the latest features and improvements to the Pokédex
        </p>
      </div>
    </SectionCard>
  );
}
