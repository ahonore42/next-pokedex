'use client';

import Link from 'next/link';
import { usePokemonCache } from '~/lib/contexts/PokemonCacheContext';
import Toolbar, { ToolbarGroup, ToolbarSection } from '../ui/toolbars';
import { DropdownTrigger } from '../ui/dropdowns';
import SearchBar, { pokemonTableFilter, renderPokemonTableResult } from '../ui/searchbars';
import Pokeball from '../ui/Pokeball';
import ThemeToggle from '../ui/ThemeToggle';
import Modal from '../ui/Modal';

export default function HeaderMenu() {
  const { searchArray } = usePokemonCache();

  const navigationItems = [
    { href: '/pokedex', label: 'Pokédex' },
    { href: '/moves', label: 'Moves' },
    { href: '/abilities', label: 'Abilities' },
    { href: '/pokemon-types', label: 'Types' },
    { href: '/items', label: 'Items' },
  ];

  return (
    <header className="border-b-2 border-indigo-600 dark:border-indigo-700 shadow-sm flex justify-center relative">
      <div className="mx-auto px-4 py-1 w-full">
        <Toolbar
          mobileBreakpoint={768}
          spacing="normal"
          justify="between"
          align="center"
          className="flex items-center"
          aria-label="Main navigation"
        >
          {/* Logo Section - Always visible */}
          <ToolbarSection>
            <Link
              href="/"
              className="flex items-center gap-x-2 focus-visible focus:outline-none rounded-lg m-0 group"
              aria-label="Go to homepage"
            >
              <Pokeball size="sm" rotationDegrees={45} />
              <div>
                <h1 className="text-xl font-bold tracking-tight indigo-gradient">Evolve Pokédex</h1>
                <p className="text-sm text-muted">Pokémon Reference</p>
              </div>
            </Link>
          </ToolbarSection>

          {/* Desktop Navigation - Hidden on mobile */}
          <ToolbarSection hideOnMobile>
            <ToolbarGroup>
              <nav className="flex gap-x-2 xl:gap-x-4 items-center">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-muted font-medium px-2 py-2 lg:px-3 xl:px-4 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 
                    focus-visible focus:outline-none hover:text-brand hover:-translate-y-0.5 transition-theme transition-interactive"
                    aria-label={`Navigate to ${item.label}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <Modal
                triggerIcon="search"
                triggerLabel="Search Pokémon"
                modalTitle="Search Pokémon"
                maxWidth="2xl"
                triggerClassName="w-8 h-8 bg-surface hover:bg-indigo-50 hover:text-brand dark:hover:bg-indigo-900/30 mr-2"
              >
                <SearchBar
                  data={searchArray}
                  filterFunction={pokemonTableFilter}
                  placeholder="Search Pokémon by name, number, type, or ability..."
                  renderResult={renderPokemonTableResult}
                  center
                  scroll
                  limit={200}
                  className="w-full"
                  resultsClassName="h-96"
                />
              </Modal>
              <ThemeToggle />
            </ToolbarGroup>
          </ToolbarSection>

          {/* Mobile Navigation - Hidden on desktop */}
          <ToolbarSection hideOnDesktop>
            <ToolbarGroup>
              <Modal
                triggerIcon="search"
                triggerLabel="Search Pokémon"
                modalTitle="Search Pokémon"
                maxWidth="lg"
                triggerClassName="w-8 h-8 bg-surface hover:bg-indigo-50 hover:text-brand dark:hover:bg-indigo-900/30 mr-2"
              >
                <SearchBar
                  data={searchArray}
                  filterFunction={pokemonTableFilter}
                  placeholder="Search Pokémon..."
                  renderResult={renderPokemonTableResult}
                  center
                  scroll
                  limit={200}
                  className="w-full"
                  resultsClassName="h-1/2"
                />
              </Modal>
              {/* Navigation Dropdown */}
              <DropdownTrigger
                triggerType="actions-button"
                triggerMode="click"
                placement="bottom"
                toolbar
                actionsButtonClassName="w-10 h-10"
                contentClassName="bg-background rounded-lg shadow-lg min-w-[200px] border-b-2 border-indigo-600 dark:border-indigo-700"
              >
                <div className="py-2">
                  {/* Navigation Links */}
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-3 text-sm font-medium text-primary hover:bg-brand/10 dark:hover:bg-brand/40 
                      transition-colors duration-200 focus:outline-none active:bg-brand/20 dark:active:bg-brand/50"
                      aria-label={`Navigate to ${item.label}`}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {/* Theme Toggle */}
                  <div className="border-t border-border">
                    <ThemeToggle />
                  </div>
                </div>
              </DropdownTrigger>
            </ToolbarGroup>
          </ToolbarSection>
        </Toolbar>
      </div>
    </header>
  );
}
