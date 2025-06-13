import SectionCard from '../ui/SectionCard';

export default function LatestUpdates() {
  const updates = [
    {
      date: 'June 1, 2025',
      title: 'Daily Featured Pokémon Rotation',
      desc: 'Featured Pokémon now change daily with a curated selection from all generations.',
      type: 'feature',
    },
    {
      date: 'June 1, 2025',
      title: 'Complete Type System Updated',
      desc: 'Added support for all 20 Pokémon types including Stellar and Unknown types.',
      type: 'update',
    },
    {
      date: 'June 1, 2025',
      title: 'Enhanced Theme System',
      desc: 'Improved dark mode support with better contrast ratios and accessibility.',
      type: 'improvement',
    },
  ];

  return (
    <SectionCard
      title="Latest Updates"
      className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
    >
      <div className="space-y-4">
        {updates.map((update, index) => (
          <div
            key={index}
            className={`
              relative p-4 border-l-4 
              transition-all duration-200 hover:shadow-sm
              border-emerald-600 dark:border-emerald-500
            `}
            style={{
              backgroundColor: 'var(--color-update-card-bg)',
              color: 'var(--color-pokemon-card-text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-update-card-hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-update-card-bg)';
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <time className="text-sm font-medium" dateTime={update.date}>
                    {update.date}
                  </time>
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-700 px-2 py-0.5 rounded-full capitalize">
                    {update.type}
                  </span>
                </div>

                <h3 className="font-bold text-base mb-2">{update.title}</h3>

                <p className="text-sm  leading-relaxed">{update.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-emerald-200 dark:border-emerald-800 text-center">
        <p className="text-sm ">
          Stay updated with the latest features and improvements to the Pokédex
        </p>
      </div>
    </SectionCard>
  );
}
