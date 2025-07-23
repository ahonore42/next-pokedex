export default function FooterMenu() {
  return (
    <footer className="bg-secondary border-t border-border mt-12 w-full transition-theme">
      <div className="mx-auto px-4 py-8 flex flex-col items-center w-full gap-y-8">
        <div className="flex flex-wrap gap-4 justify-around max-w-5xl w-full">
          <div>
            <h3 className="font-semibold text-primary mb-3">Database</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a href="/pokemon" className="hover:text-brand">
                  Pokémon
                </a>
              </li>
              <li>
                <a href="/moves" className="hover:text-brand">
                  Moves
                </a>
              </li>
              <li>
                <a href="/abilities" className="hover:text-brand">
                  Abilities
                </a>
              </li>
              <li>
                <a href="/items" className="hover:text-brand">
                  Items
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-3">Tools</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a href="/type-chart" className="hover:text-brand">
                  Type Chart
                </a>
              </li>
              <li>
                <a href="/calculator" className="hover:text-brand">
                  Damage Calculator
                </a>
              </li>
              <li>
                <a href="/team-builder" className="hover:text-brand">
                  Team Builder
                </a>
              </li>
              <li>
                <a href="/random" className="hover:text-brand">
                  Random Pokémon
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-3">Generations</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a href="/generation/1" className="hover:text-brand">
                  Generation I
                </a>
              </li>
              <li>
                <a href="/generation/2" className="hover:text-brand">
                  Generation II
                </a>
              </li>
              <li>
                <a href="/generation/3" className="hover:text-brand">
                  Generation III
                </a>
              </li>
              <li>
                <a href="/generation/4" className="hover:text-brand">
                  Generation IV
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-3">About</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a href="/about" className="hover:text-brand">
                  About This Site
                </a>
              </li>
              <li>
                <a href="/api" className="hover:text-brand">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-brand">
                  Contact
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-brand">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border m-8 pt-8 text-center text-sm text-subtle">
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
