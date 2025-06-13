import { PokemonDataSeeder } from './pokemon-data';

async function main() {
  const seeder = new PokemonDataSeeder();
  try {
    await seeder.run();
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

main();
