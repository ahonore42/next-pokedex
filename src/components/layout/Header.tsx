export default function Header() {
  return (
    <header className="bg-white border-b-2 border-blue-600 shadow-sm flex justify-center">
      <div className="mx-auto px-4 py-4 w-full ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full relative border-2 border-gray-800">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-red-500 rounded-t-full"></div>
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gray-100 rounded-b-full"></div>
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 rounded-full border border-gray-600">
                <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-gray-600 rounded-full"></div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Evolve Pokédex
              </h1>
              <p className="text-sm text-gray-600">
                Complete Pokémon Reference
              </p>
            </div>
          </div>
          <nav className="hidden md:flex gap-x-2">
            <a
              href="/pokemon"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Pokémon
            </a>
            <a
              href="/moves"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Moves
            </a>
            <a
              href="/abilities"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Abilities
            </a>
            <a
              href="/types"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Types
            </a>
            <a
              href="/items"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Items
            </a>
            <a
              href="/locations"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Locations
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
