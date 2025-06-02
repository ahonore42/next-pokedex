"use client";

import { useState } from "react";
import Pokeball from "../ui/Pokeball";

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
    <header className="bg-white border-b-2 border-indigo-600 shadow-sm flex justify-center">
      <div className="mx-auto px-4 w-full">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <a
            href="/"
            className="flex items-center gap-x-2 focus:outline-none rounded-lg p-2 -m-2 transition-all duration-300 group"
            aria-label="Go to homepage"
          >
            <Pokeball size="sm" rotationDegrees={45}/>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Evolve Pokédex
              </h1>
              <p className="text-sm text-gray-600">
                Complete Pokémon Reference
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-x-2 xl:gap-x-4 items-center">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 font-medium focus:outline-none px-3 py-2 xl:px-4 rounded-lg transition-all duration-300 hover:-translate-y-0.5"
                aria-label={`Navigate to ${item.label}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden focus:outline-none p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span
                className={`bg-gray-700 block transition-all duration-300 h-0.5 w-6 rounded-sm ${
                  isMobileMenuOpen
                    ? "rotate-45 translate-y-1"
                    : "-translate-y-0.5"
                }`}
              ></span>
              <span
                className={`bg-gray-700 block transition-all duration-300 h-0.5 w-6 rounded-sm my-0.5 ${
                  isMobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              ></span>
              <span
                className={`bg-gray-700 block transition-all duration-300 h-0.5 w-6 rounded-sm ${
                  isMobileMenuOpen
                    ? "-rotate-45 -translate-y-1"
                    : "translate-y-0.5"
                }`}
              ></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden mt-4 transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col space-y-2 py-4 md:py-6 border-t border-gray-200 px-2">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium focus:outline-none px-4 py-3 md:px-6 md:py-4 rounded-lg transition-all duration-300"
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
