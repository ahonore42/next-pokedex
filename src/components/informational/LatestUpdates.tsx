export default function LatestUpdates() {
  const updates = [
    {
      date: "June 1, 2025",
      title: "Daily Featured Pokémon Rotation",
      desc: "Featured Pokémon now change daily with a curated selection from all generations.",
    },
    {
      date: "June 1, 2025",
      title: "Complete Type System Updated",
      desc: "Added support for all 20 Pokémon types including Stellar and Unknown types.",
    },
  ];

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Latest Updates
      </h2>
      <div className="space-y-3">
        {updates.map((update, index) => (
          <div key={index} className="border-l-4 border-green-500 pl-4">
            <div className="text-sm text-gray-600">{update.date}</div>
            <div className="font-medium text-gray-900">{update.title}</div>
            <div className="text-sm text-gray-700">{update.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
