export default function QuickAccess() {
  const sections = [
    {
      name: "Pokémon Database",
      desc: "Complete species information",
      href: "/pokemon",
      icon: "📚",
    },
    {
      name: "Move Database",
      desc: "All moves and their effects",
      href: "/moves",
      icon: "⚔️",
    },
    {
      name: "Type Chart",
      desc: "Effectiveness and resistances",
      href: "/types",
      icon: "🔥",
    },
    {
      name: "Ability List",
      desc: "All abilities and descriptions",
      href: "/abilities",
      icon: "⭐",
    },
    {
      name: "Item Database",
      desc: "Complete item information",
      href: "/items",
      icon: "🎒",
    },
    {
      name: "Location Guide",
      desc: "Where to find Pokémon",
      href: "/locations",
      icon: "🗺️",
    },
    {
      name: "Evolution Trees",
      desc: "Evolution chains and methods",
      href: "/evolution",
      icon: "🔄",
    },
    {
      name: "Random Pokémon",
      desc: "Discover something new",
      href: "/random",
      icon: "🎲",
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sections.map((section) => (
          <a
            key={section.name}
            href={section.href}
            className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="text-lg mb-1">{section.icon}</div>
            <div className="font-medium text-gray-900 text-sm">
              {section.name}
            </div>
            <div className="text-xs text-gray-600">{section.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
