export default function FooterMenu() {
  return (
    <footer className="bg-secondary border-t border-border mt-12 w-full transition-colors duration-300">
      <div className="mx-auto px-4 py-8 flex flex-col items-center w-full gap-y-8">
        <div className="flex justify-around max-w-7xl w-full">
          <div>
            <h3 className="font-semibold text-primary mb-3 transition-colors duration-300">
              Database
            </h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a href="/pokemon" className="hover:text-brand transition-colors duration-200">
                  Pokémon
                </a>
              </li>
              <li>
                <a href="/moves" className="hover:text-brand transition-colors duration-200">
                  Moves
                </a>
              </li>
              <li>
                <a href="/abilities" className="hover:text-brand transition-colors duration-200">
                  Abilities
                </a>
              </li>
              <li>
                <a href="/items" className="hover:text-brand transition-colors duration-200">
                  Items
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-3 transition-colors duration-300">
              Tools
            </h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a href="/type-chart" className="hover:text-brand transition-colors duration-200">
                  Type Chart
                </a>
              </li>
              <li>
                <a href="/calculator" className="hover:text-brand transition-colors duration-200">
                  Damage Calculator
                </a>
              </li>
              <li>
                <a href="/team-builder" className="hover:text-brand transition-colors duration-200">
                  Team Builder
                </a>
              </li>
              <li>
                <a href="/random" className="hover:text-brand transition-colors duration-200">
                  Random Pokémon
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-3 transition-colors duration-300">
              Generations
            </h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a href="/generation/1" className="hover:text-brand transition-colors duration-200">
                  Generation I
                </a>
              </li>
              <li>
                <a href="/generation/2" className="hover:text-brand transition-colors duration-200">
                  Generation II
                </a>
              </li>
              <li>
                <a href="/generation/3" className="hover:text-brand transition-colors duration-200">
                  Generation III
                </a>
              </li>
              <li>
                <a href="/generation/4" className="hover:text-brand transition-colors duration-200">
                  Generation IV
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-3 transition-colors duration-300">
              About
            </h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a href="/about" className="hover:text-brand transition-colors duration-200">
                  About This Site
                </a>
              </li>
              <li>
                <a href="/api" className="hover:text-brand transition-colors duration-200">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-brand transition-colors duration-200">
                  Contact
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-brand transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border m-8 pt-8 text-center text-sm text-subtle transition-colors duration-300">
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
