'use client';

import Link from 'next/link';
import { useState } from 'react';
import Pokeball from '../ui/Pokeball';
import ThemeToggle from '../ui/ThemeToggle';

export default function HeaderMenu() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: '/pokedex', label: 'Pokédex' },
    { href: '/moves', label: 'Moves' },
    { href: '/abilities', label: 'Abilities' },
    { href: '/pokemon-types', label: 'Types' },
    { href: '/items', label: 'Items' },
    { href: '/locations', label: 'Locations' },
  ];

  return (
    <header className="border-b-2 border-indigo-600 dark:border-indigo-700 shadow-sm flex justify-center relative">
      <div className="mx-auto px-4 py-1 w-full">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-x-2 xl:gap-x-4 items-center">
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

            {/* Theme Toggle */}
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button and Theme Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              className="bg-pokemon hover:bg-pokemon-hover focus-visible focus:outline-none 
              p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 cursor-pointer transition-theme"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span
                  className={`bg-primary transition-interactive block h-0.5 w-6 rounded-sm ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
                  }`}
                ></span>
                <span
                  className={`bg-primary transition-interactive block h-0.5 w-6 rounded-sm my-0.5 ${
                    isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                ></span>
                <span
                  className={`bg-primary transition-interactive block h-0.5 w-6 rounded-sm ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-lg overflow-hidden 
            transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
        >
          <nav
            className={`flex flex-col space-y-2 py-4 border-t border-indigo-600 dark:border-indigo-700 px-2 transition-interactive 
              ${isMobileMenuOpen ? 'opacity-100 delay-100' : 'opacity-0'}`}
          >
            {navigationItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-muted hover:text-brand hover:bg-indigo-50 dark:hover:bg-indigo-900/30 font-medium 
                  focus-visible focus:outline-none px-4 py-3 md:px-6 md:py-4 rounded-lg transition-colors duration-200 
                  ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{
                  transition: `opacity 200ms ease-out ${isMobileMenuOpen ? `${index * 50}ms` : '0ms'}, 
                  transform 200ms ease-out ${isMobileMenuOpen ? `${index * 50}ms` : '0ms'}, 
                  background-color 200ms ease-out, color 200ms ease-out`,
                }}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label={`Navigate to ${item.label}`}
              >
                {item.label}
              </Link>
            ))}
            <div
              className={`cursor-pointer ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{
                transition: `opacity 200ms ease-out ${isMobileMenuOpen ? `${navigationItems.length * 50}ms` : '0ms'}, 
                transform 200ms ease-out ${isMobileMenuOpen ? `${navigationItems.length * 50}ms` : '0ms'}`,
              }}
            >
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
