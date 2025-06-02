"use client";

import { useState } from "react";
import Pokeball from "../ui/Pokeball";
import ThemeToggle from "../ui/ThemeToggle";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: "/pokemon", label: "Pokémon" },
    { href: "/moves", label: "Moves" },
    { href: "/abilities", label: "Abilities" },
    { href: "/types", label: "Types" },
    { href: "/items", label: "Items" },
    { href: "/locations", label: "Locations" },
  ];

  return (
    <header className="surface-elevated border-b-2 border-indigo-600 dark:border-indigo-500 shadow-sm flex justify-center transition-all duration-300">
      <div className="mx-auto px-4 w-full">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <a
            href="/"
            className="flex items-center gap-x-2 focus-visible focus:outline-none rounded-lg p-2 -m-2 transition-all duration-300 group"
            aria-label="Go to homepage"
          >
            <Pokeball size="sm" rotationDegrees={45} />
            <div>
              <h1 className="text-xl font-bold text-primary tracking-tight">
                Evolve Pokédex
              </h1>
              <p className="text-sm text-secondary">
                Complete Pokémon Reference
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-x-2 xl:gap-x-4 items-center">
            <nav className="flex gap-x-2 xl:gap-x-4 items-center">
              {navigationItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-secondary hover:text-primary-color hover:bg-indigo-50 dark:hover:bg-indigo-900/30 font-medium focus-visible focus:outline-none px-3 py-2 xl:px-4 rounded-lg transition-all duration-300 hover:-translate-y-0.5"
                  aria-label={`Navigate to ${item.label}`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Theme Toggle */}
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button and Theme Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="focus-visible focus:outline-none p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span
                  className={`bg-primary block transition-all duration-300 h-0.5 w-6 rounded-sm ${
                    isMobileMenuOpen
                      ? "rotate-45 translate-y-1"
                      : "-translate-y-0.5"
                  }`}
                ></span>
                <span
                  className={`bg-primary block transition-all duration-300 h-0.5 w-6 rounded-sm my-0.5 ${
                    isMobileMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  className={`bg-primary block transition-all duration-300 h-0.5 w-6 rounded-sm ${
                    isMobileMenuOpen
                      ? "-rotate-45 -translate-y-1"
                      : "translate-y-0.5"
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden mt-4 transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col space-y-2 py-4 md:py-6 border-t border-theme px-2">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-secondary hover:text-primary-color hover:bg-indigo-50 dark:hover:bg-indigo-900/30 font-medium focus-visible focus:outline-none px-4 py-3 md:px-6 md:py-4 rounded-lg transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label={`Navigate to ${item.label}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
