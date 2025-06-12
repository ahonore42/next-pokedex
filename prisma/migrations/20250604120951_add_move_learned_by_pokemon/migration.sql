/*
  Warnings:

  - You are about to drop the `move_attribute_descriptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `move_attribute_map` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `move_attribute_names` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `move_attributes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "move_attribute_descriptions" DROP CONSTRAINT "move_attribute_descriptions_language_id_fkey";

-- DropForeignKey
ALTER TABLE "move_attribute_descriptions" DROP CONSTRAINT "move_attribute_descriptions_move_attribute_id_fkey";

-- DropForeignKey
ALTER TABLE "move_attribute_map" DROP CONSTRAINT "move_attribute_map_move_attribute_id_fkey";

-- DropForeignKey
ALTER TABLE "move_attribute_map" DROP CONSTRAINT "move_attribute_map_move_id_fkey";

-- DropForeignKey
ALTER TABLE "move_attribute_names" DROP CONSTRAINT "move_attribute_names_language_id_fkey";

-- DropForeignKey
ALTER TABLE "move_attribute_names" DROP CONSTRAINT "move_attribute_names_move_attribute_id_fkey";

-- DropTable
DROP TABLE "move_attribute_descriptions";

-- DropTable
DROP TABLE "move_attribute_map";

-- DropTable
DROP TABLE "move_attribute_names";

-- DropTable
DROP TABLE "move_attributes";

-- CreateTable
CREATE TABLE "move_learned_by_pokemon" (
    "move_id" INTEGER NOT NULL,
    "pokemon_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "move_learned_by_pokemon_pkey" PRIMARY KEY ("move_id","pokemon_id")
);

-- AddForeignKey
ALTER TABLE "move_learned_by_pokemon" ADD CONSTRAINT "move_learned_by_pokemon_move_id_fkey" FOREIGN KEY ("move_id") REFERENCES "moves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_learned_by_pokemon" ADD CONSTRAINT "move_learned_by_pokemon_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
