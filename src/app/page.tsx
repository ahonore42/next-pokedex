"use client";

import { useState, useEffect } from "react";
import { getFeaturedPokemon, getAppStats } from "../lib/api/pokemon";
import type { FeaturedPokemon, AppStats } from "../lib/types/pokemon";
import Header from "@/components/layout/Header";
import SearchBar from "@/components/layout/SearchBar";
import DatabaseStats from "@/components/informational/DatabaseStats";
import QuickAccess from "@/components/layout/QuickAccess";
import FeaturedPokemonDisplay from "@/components/informational/FeaturedPokemonDisplay";
import LatestUpdates from "@/components/informational/LatestUpdates";
import Footer from "@/components/layout/Footer";

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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to the Pokédex Database
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Your comprehensive resource for Pokémon information. Search through
            our complete database of Pokémon species, moves, abilities, and
            more.
          </p>
          <SearchBar />
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="mb-8">
            <DatabaseStats stats={stats} />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Access */}
          <div className="lg:col-span-1">
            <QuickAccess />
          </div>

          {/* Right Column - Featured Pokemon and Updates */}
          <div className="lg:col-span-2 space-y-8">
            {isLoading ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-center">
                  <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
                </div>
              </div>
            ) : (
              <FeaturedPokemonDisplay pokemon={featuredPokemon} />
            )}

            <LatestUpdates />
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </div>
  );
}
