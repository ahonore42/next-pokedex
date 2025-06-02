import SectionCard from "../ui/SectionCard";
export default function QuickAccess() {
  const sections = [
    {
      name: "Pokédex",
      desc: "Complete species information",
      href: "/pokemon",
      icon: "📚",
    },
    {
      name: "Movedex",
      desc: "All moves and their effects",
      href: "/moves",
      icon: "⚔️",
    },
    {
      name: "Type Chart",
      desc: "Effectiveness and resistances",
      href: "/types",
      icon: "♻",
    },
    {
      name: "Abilitydex",
      desc: "All abilities and descriptions",
      href: "/abilities",
      icon: "✨",
    },
    {
      name: "Itemdex",
      desc: "Complete item information",
      href: "/items",
      icon: "🍬",
    },
    {
      name: "Location Guide",
      desc: "Where to find Pokémon",
      href: "/locations",
      icon: "📍",
    },
    {
      name: "Evolution Trees",
      desc: "Evolution chains and methods",
      href: "/evolution",
      icon: "🧬",
    },
    {
      name: "Random Pokémon",
      desc: "Discover something new",
      href: "/random",
      icon: "🎲",
    },
  ];

  return (
      <SectionCard title="Quick Access" className="bg-white border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 m-4">
          {sections.map((section) => (
            <a
              key={section.name}
              href={section.href}
              className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 active:scale-95 transition-all duration-300 group"
              aria-label={`Navigate to ${section.name}: ${section.desc}`}
            >
              <div className="font-medium text-gray-900 text-sm mb-1">
                <span className="text-lg inline-block">
                  {section.icon}
                </span>
                {" "}{section.name}
              </div>
              <div className="text-xs text-gray-600">{section.desc}</div>
            </a>
          ))}
        </div>
      </SectionCard>
  );
}
