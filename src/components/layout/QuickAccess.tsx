import SectionCard from '../ui/SectionCard';
import InteractiveLink from '../ui/InteractiveLink';
import RandomPokemonLink from '../ui/RandomPokemonLink';

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
      href: '/moves',
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
      href: '/abilities',
      icon: '✨',
    },
    {
      name: 'Itemdex',
      desc: 'Complete item information',
      href: '/items',
      icon: '🍬',
    },
    {
      name: 'Location Guide',
      desc: 'Where to find Pokémon',
      href: '/locations',
      icon: '📍',
    },
    {
      name: 'Evolution Chains',
      desc: 'Evolution chains and methods',
      href: '/evolutions',
      icon: '🧬',
    },
    {
      name: 'Random Pokémon',
      desc: 'Discover something new',
      href: null,
      icon: '🎲',
    },
  ];

  return (
    <SectionCard title="Quick Access" colorVariant="transparent">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((section) =>
          section.href === null ? (
            <RandomPokemonLink
              key={section.name}
              icon={<span className="text-2xl">{section.icon}</span>}
              title={section.name}
              description={section.desc}
              ariaLabel={`${section.name}: ${section.desc}`}
            />
          ) : (
            <InteractiveLink
              key={section.href}
              href={section.href}
              icon={<span className="text-2xl">{section.icon}</span>}
              title={section.name}
              description={section.desc}
              showArrow={true}
              ariaLabel={`Navigate to ${section.name}: ${section.desc}`}
              height="md"
            />
          ),
        )}
      </div>
    </SectionCard>
  );
}
