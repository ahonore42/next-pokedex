"use client";

import { useState, useEffect } from "react";
import { getFeaturedPokemon, getAppStats } from "../lib/services/pokemon";
import type { FeaturedPokemon, AppStats } from "../lib/types/pokemon";
import Header from "@/components/layout/Header";
import SearchBar from "@/components/layout/SearchBar";
import DatabaseStats from "@/components/informational/DatabaseStats";
import QuickAccess from "@/components/layout/QuickAccess";
import FeaturedPokemonDisplay from "@/components/informational/FeaturedPokemonDisplay";
import LatestUpdates from "@/components/informational/LatestUpdates";
import Footer from "@/components/layout/Footer";
import Pokeball from "@/components/ui/Pokeball";

export default function Home() {
  const [featuredPokemon, setFeaturedPokemon] = useState<FeaturedPokemon[]>([]);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [featured, appStats] = await Promise.all([
          getFeaturedPokemon(),
          getAppStats(),
        ]);
        setFeaturedPokemon(featured);
        setStats(appStats);
      } catch (error) {
        console.error("Failed to load homepage data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <Header />

      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Pokeball size="xl" endlessSpin spinSpeed={1.5} />
        </div>
      ) : (
        <main className="mb-4 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 md:py-12 xl:py-16 2xl:py-20 max-w-7xl 2xl:max-w-[1400px] self-center">
          {/* Welcome Section */}
          <div className="sm:flex sm:items-start sm:gap-4 sm:py-8 mb-4">
            <div className="px-4 sm:px-0">
              <h1 className="text-3xl md:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-primary tracking-tight xl:tracking-tighter mb-4 text-gradient">
                Evolve Pokédex
              </h1>
              <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl xl:max-w-3xl mx-auto px-4">
                <p className="text-lg xl:text-xl 2xl:text-2xl text-secondary mx-auto text-left">
                  Your comprehensive resource for Pokémon information. Search
                  through our complete database of Pokémon species, moves,
                  abilities, and more.
                </p>
              </div>
            </div>
            {stats && <DatabaseStats stats={stats} />}
          </div>

          <div className="mb-4">
            <SearchBar />
          </div>

          {/* Main Content */}
          <div className="flex flex-col col-span-1 gap-4">
            <QuickAccess />
            <FeaturedPokemonDisplay pokemon={featuredPokemon} />
            <LatestUpdates />
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}
