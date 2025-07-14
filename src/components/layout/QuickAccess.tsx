import SectionCard from '../ui/SectionCard';

export default function QuickAccess() {
  const sections = [
    {
      name: 'Pokédex',
      desc: 'Complete species information',
      href: '/pokedex',
      icon: '📚',
    },
    {
      name: 'Movedex',
      desc: 'All moves and their effects',
      href: '/movedex',
      icon: '⚔️',
    },
    {
      name: 'Type Chart',
      desc: 'Effectiveness and resistances',
      href: '/pokemon-types',
      icon: '♻️',
    },
    {
      name: 'Abilitydex',
      desc: 'All abilities and descriptions',
      href: '/abilitydex',
      icon: '✨',
    },
    {
      name: 'Itemdex',
      desc: 'Complete item information',
      href: '/itemdex',
      icon: '🍬',
    },
    {
      name: 'Location Guide',
      desc: 'Where to find Pokémon',
      href: '/locations',
      icon: '📍',
    },
    {
      name: 'Evolution Trees',
      desc: 'Evolution chains and methods',
      href: '/evolutions',
      icon: '🧬',
    },
    {
      name: 'Random Pokémon',
      desc: 'Discover something new',
      href: '/random',
      icon: '🎲',
    },
  ];

  return (
    <SectionCard title="Quick Access" className="border-border">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((section) => (
          <a
            key={section.name}
            href={section.href}
            className="
          group p-4 border rounded-lg
          bg-pokemon hover:bg-pokemon-hover
          border-pokemon-border hover:border-pokemon-border-hover
          hover:shadow-md hover:-translate-y-1 
          active:scale-95
          transition-all duration-300
        "
            aria-label={`Navigate to ${section.name}: ${section.desc}`}
          >
            <div className="flex items-start gap-3 mb-2">
              <span
                className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                role="img"
                aria-hidden="true"
              >
                {section.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-base mb-1 text-pokemon-text group-hover:text-brand transition-colors duration-300">
                  {section.name}
                </div>
                <div className="text-sm text-pokemon-text-muted group-hover:text-muted transition-colors duration-300">
                  {section.desc}
                </div>
              </div>
            </div>

            {/* Arrow indicator */}
            <div className="flex justify-end mt-2">
              <svg
                className="w-4 h-4 text-pokemon-text-muted group-hover:text-brand transform group-hover:translate-x-1 transition-all duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </SectionCard>
  );
}
