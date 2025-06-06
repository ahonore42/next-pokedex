/*
  Warnings:

  - You are about to drop the `gender_names` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "gender_names" DROP CONSTRAINT "gender_names_gender_id_fkey";

-- DropForeignKey
ALTER TABLE "gender_names" DROP CONSTRAINT "gender_names_language_id_fkey";

-- DropTable
DROP TABLE "gender_names";

-- CreateTable
CREATE TABLE "pokemon_species_gender_details" (
    "pokemon_species_id" INTEGER NOT NULL,
    "gender_id" INTEGER NOT NULL,
    "rate" INTEGER NOT NULL,

    CONSTRAINT "pokemon_species_gender_details_pkey" PRIMARY KEY ("pokemon_species_id","gender_id")
);

-- AddForeignKey
ALTER TABLE "pokemon_species_gender_details" ADD CONSTRAINT "pokemon_species_gender_details_pokemon_species_id_fkey" FOREIGN KEY ("pokemon_species_id") REFERENCES "pokemon_species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species_gender_details" ADD CONSTRAINT "pokemon_species_gender_details_gender_id_fkey" FOREIGN KEY ("gender_id") REFERENCES "genders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
