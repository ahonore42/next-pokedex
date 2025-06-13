export default function FooterMenu() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12 w-full">
      <div className="mx-auto px-4 py-8 flex flex-col items-center w-full gap-y-8">
        <div className="flex justify-around max-w-7xl w-full">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Database</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/pokemon" className="hover:text-blue-600">
                  Pokémon
                </a>
              </li>
              <li>
                <a href="/moves" className="hover:text-blue-600">
                  Moves
                </a>
              </li>
              <li>
                <a href="/abilities" className="hover:text-blue-600">
                  Abilities
                </a>
              </li>
              <li>
                <a href="/items" className="hover:text-blue-600">
                  Items
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Tools</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/type-chart" className="hover:text-blue-600">
                  Type Chart
                </a>
              </li>
              <li>
                <a href="/calculator" className="hover:text-blue-600">
                  Damage Calculator
                </a>
              </li>
              <li>
                <a href="/team-builder" className="hover:text-blue-600">
                  Team Builder
                </a>
              </li>
              <li>
                <a href="/random" className="hover:text-blue-600">
                  Random Pokémon
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Generations</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/generation/1" className="hover:text-blue-600">
                  Generation I
                </a>
              </li>
              <li>
                <a href="/generation/2" className="hover:text-blue-600">
                  Generation II
                </a>
              </li>
              <li>
                <a href="/generation/3" className="hover:text-blue-600">
                  Generation III
                </a>
              </li>
              <li>
                <a href="/generation/4" className="hover:text-blue-600">
                  Generation IV
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">About</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/about" className="hover:text-blue-600">
                  About This Site
                </a>
              </li>
              <li>
                <a href="/api" className="hover:text-blue-600">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-blue-600">
                  Contact
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-blue-600">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-300 m-8 pt-8 text-center text-sm text-gray-600">
          <p>© 2025 Pokédex Database. Built with Next.js and the PokéAPI.</p>
          <p>
            Pokémon and all related characters are trademarks of Nintendo, Game Freak, and Creatures
            Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
