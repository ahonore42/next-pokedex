import {
  Pokemon,
  PokemonListResponse,
  PokemonSpecies,
  Type,
  Generation,
  PokemonCard,
  FeaturedPokemon,
  AppStats,
} from "../types/pokemon";

const BASE_URL = "https://pokeapi.co/api/v2";

// Utility function to handle API responses
async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
}

// Get Pokemon by ID or name
export async function getPokemon(idOrName: string | number): Promise<Pokemon> {
  return fetchFromAPI<Pokemon>(`/pokemon/${idOrName}`);
}

// Get Pokemon species info
export async function getPokemonSpecies(
  idOrName: string | number
): Promise<PokemonSpecies> {
  return fetchFromAPI<PokemonSpecies>(`/pokemon-species/${idOrName}`);
}

// Get list of Pokemon with pagination
export async function getPokemonList(
  limit = 20,
  offset = 0
): Promise<PokemonListResponse> {
  return fetchFromAPI<PokemonListResponse>(
    `/pokemon?limit=${limit}&offset=${offset}`
  );
}

// Get all types
export async function getAllTypes(): Promise<{
  results: { name: string; url: string }[];
}> {
  return fetchFromAPI(`/type`);
}

// Get specific type info
export async function getType(idOrName: string | number): Promise<Type> {
  return fetchFromAPI<Type>(`/type/${idOrName}`);
}

// Get all generations
export async function getAllGenerations(): Promise<{
  results: { name: string; url: string }[];
}> {
  return fetchFromAPI(`/generation`);
}

// Get specific generation info
export async function getGeneration(
  idOrName: string | number
): Promise<Generation> {
  return fetchFromAPI<Generation>(`/generation/${idOrName}`);
}

// Get all moves
export async function getAllMoves(): Promise<{
  count: number;
  results: { name: string; url: string }[];
}> {
  return fetchFromAPI(`/move`);
}

// Get random Pokemon
export async function getRandomPokemon(): Promise<Pokemon> {
  const randomId = Math.floor(Math.random() * 1010) + 1; // As of 2025, there are ~1010 Pokemon
  return getPokemon(randomId);
}

// Helper function to extract Pokemon ID from URL
export function extractIdFromUrl(url: string): number {
  const matches = url.match(/\/(\d+)\/$/);
  return matches ? parseInt(matches[1], 10) : 0;
}

// Get Pokemon card data (simplified for lists)
export async function getPokemonCard(
  idOrName: string | number
): Promise<PokemonCard> {
  try {
    const pokemon = await getPokemon(idOrName);
    return {
      id: pokemon.id,
      name: pokemon.name,
      image:
        pokemon.sprites.other["official-artwork"].front_default ||
        pokemon.sprites.front_default ||
        "/placeholder-pokemon.png",
      types: pokemon.types.map((t) => t.type.name),
    };
  } catch (error) {
    console.error(`Failed to get Pokemon card for ${idOrName}:`, error);
    throw error;
  }
}

// Get multiple Pokemon cards efficiently
export async function getPokemonCards(
  idsOrNames: (string | number)[]
): Promise<PokemonCard[]> {
  try {
    const promises = idsOrNames.map((id) => getPokemonCard(id));
    return Promise.all(promises);
  } catch (error) {
    console.error("Failed to get Pokemon cards:", error);
    throw error;
  }
}

// Get featured Pokemon for homepage with daily rotation
export async function getFeaturedPokemon(): Promise<FeaturedPokemon[]> {
  try {
    // Large pool of popular/notable Pokemon for daily rotation
    const pokemonPool = [
      // Kanto Starters & Legends
      25, 6, 9, 3, 150, 151, 144, 145, 146,
      // Johto Favorites
      243, 244, 245, 249, 250, 155, 158, 161,
      // Hoenn Icons
      384, 383, 382, 254, 257, 260, 448, 445,
      // Sinnoh Legends
      483, 484, 487, 490, 491, 492, 493,
      // Unova Starters & Dragons
      643, 644, 646, 494, 495, 498, 501,
      // Kalos Legends
      716, 717, 718, 658, 654, 650,
      // Alola Legends & UBs
      789, 791, 792, 800, 785, 786, 787, 788,
      // Galar Legends
      888, 889, 890, 898, 894, 895, 896,
      // Paldea New Legends
      1007, 1008, 1009, 1010, 999, 1000, 1001,
      // Fan Favorites
      94, 130, 149, 196, 197, 134, 135, 136, 448, 700, 282, 376, 373, 334, 445,
    ];

    // Use current date to create deterministic daily selection
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Create a simple seeded random number generator
    const seed = dayOfYear + today.getFullYear();
    const random = () => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    // Shuffle the pool using seeded random and take first 6
    const shuffled = [...pokemonPool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const dailySelection = shuffled.slice(0, 6);

    const pokemonPromises = dailySelection.map(async (id) => {
      const [pokemon, species] = await Promise.all([
        getPokemon(id),
        getPokemonSpecies(id),
      ]);

      // Get English flavor text
      const flavorText =
        species.flavor_text_entries
          .find((entry) => entry.language.name === "en")
          ?.flavor_text.replace(/\f/g, " ") || "A mysterious Pokémon.";

      // Get genus (category)
      const genus =
        species.genera.find((g) => g.language.name === "en")?.genus ||
        "Unknown Pokémon";

      return {
        id: pokemon.id,
        name: pokemon.name,
        image:
          pokemon.sprites.other["official-artwork"].front_default ||
          pokemon.sprites.front_default ||
          "/placeholder-pokemon.png",
        types: pokemon.types.map((t) => t.type.name),
        description: flavorText,
        category: genus,
      };
    });

    return Promise.all(pokemonPromises);
  } catch (error) {
    console.error("Failed to get featured Pokemon:", error);

    // Fallback to a default set if API fails
    const fallbackIds = [25, 6, 9, 150, 448, 445];
    const fallbackPromises = fallbackIds.map(async (id) => {
      try {
        const [pokemon, species] = await Promise.all([
          getPokemon(id),
          getPokemonSpecies(id),
        ]);

        const flavorText =
          species.flavor_text_entries
            .find((entry) => entry.language.name === "en")
            ?.flavor_text.replace(/\f/g, " ") || "A mysterious Pokémon.";

        const genus =
          species.genera.find((g) => g.language.name === "en")?.genus ||
          "Unknown Pokémon";

        return {
          id: pokemon.id,
          name: pokemon.name,
          image:
            pokemon.sprites.other["official-artwork"].front_default ||
            pokemon.sprites.front_default ||
            "/placeholder-pokemon.png",
          types: pokemon.types.map((t) => t.type.name),
          description: flavorText,
          category: genus,
        };
      } catch (err) {
        // Even more basic fallback
        return {
          id: id,
          name: `pokemon-${id}`,
          image: "/placeholder-pokemon.png",
          types: ["normal"],
          description: "A mysterious Pokémon.",
          category: "Unknown Pokémon",
        };
      }
    });

    return Promise.all(fallbackPromises);
  }
}

// Get app statistics for homepage
export async function getAppStats(): Promise<AppStats> {
  try {
    const [pokemonList, typesList, generationsList, movesList] =
      await Promise.all([
        getPokemonList(1, 0),
        getAllTypes(),
        getAllGenerations(),
        getAllMoves(),
      ]);

    return {
      totalPokemon: pokemonList.count,
      totalTypes: typesList.results.length,
      totalGenerations: generationsList.results.length,
      totalMoves: movesList.count,
    };
  } catch (error) {
    console.error("Failed to get app stats:", error);
    return {
      totalPokemon: 1010,
      totalTypes: 18,
      totalGenerations: 9,
      totalMoves: 919,
    };
  }
}

// Search Pokemon by name (for search functionality)
export async function searchPokemon(
  query: string,
  limit = 10
): Promise<PokemonCard[]> {
  try {
    // Get a larger list to search through
    const pokemonList = await getPokemonList(1000, 0);

    // Filter by name containing query
    const filtered = pokemonList.results
      .filter((pokemon) =>
        pokemon.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);

    // Get detailed info for filtered Pokemon
    const cards = await Promise.all(
      filtered.map((pokemon) => getPokemonCard(extractIdFromUrl(pokemon.url)))
    );

    return cards;
  } catch (error) {
    console.error("Failed to search Pokemon:", error);
    throw error;
  }
}

// Get Pokemon by type
export async function getPokemonByType(
  typeName: string
): Promise<PokemonCard[]> {
  try {
    const type = await getType(typeName);
    const pokemonPromises = type.pokemon
      .slice(0, 20) // Limit to first 20 for performance
      .map((p) => getPokemonCard(extractIdFromUrl(p.pokemon.url)));

    return Promise.all(pokemonPromises);
  } catch (error) {
    console.error(`Failed to get Pokemon by type ${typeName}:`, error);
    throw error;
  }
}

// Utility function to capitalize Pokemon names
export function capitalizeName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Utility function to get type color - Complete list
export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    normal: "#A8A878",
    fighting: "#C03028",
    flying: "#A890F0",
    poison: "#A040A0",
    ground: "#E0C068",
    rock: "#B8A038",
    bug: "#A8B820",
    ghost: "#705898",
    steel: "#B8B8D0",
    fire: "#F08030",
    water: "#6890F0",
    grass: "#78C850",
    electric: "#F8D030",
    psychic: "#F85888",
    ice: "#98D8D8",
    dragon: "#7038F8",
    dark: "#705848",
    fairy: "#EE99AC",
    stellar: "#40E0D0",
    unknown: "#68A090",
  };
  return colors[type] || "#68A090";
}
