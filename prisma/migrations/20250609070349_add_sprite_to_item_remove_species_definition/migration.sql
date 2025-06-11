/*
  Warnings:

  - You are about to drop the `pokemon_species_descriptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "pokemon_species_descriptions" DROP CONSTRAINT "pokemon_species_descriptions_language_id_fkey";

-- DropForeignKey
ALTER TABLE "pokemon_species_descriptions" DROP CONSTRAINT "pokemon_species_descriptions_pokemon_species_id_fkey";

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "sprite" TEXT;

-- DropTable
DROP TABLE "pokemon_species_descriptions";
