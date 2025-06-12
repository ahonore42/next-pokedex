-- CreateTable
CREATE TABLE "pokemon_species_varieties" (
    "pokemon_species_id" INTEGER NOT NULL,
    "pokemon_id" INTEGER NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "pokemon_species_varieties_pkey" PRIMARY KEY ("pokemon_species_id","pokemon_id")
);

-- AddForeignKey
ALTER TABLE "pokemon_species_varieties" ADD CONSTRAINT "pokemon_species_varieties_pokemon_species_id_fkey" FOREIGN KEY ("pokemon_species_id") REFERENCES "pokemon_species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species_varieties" ADD CONSTRAINT "pokemon_species_varieties_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
