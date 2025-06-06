-- CreateIndex
CREATE INDEX "idx_moves_type" ON "moves"("type_id");

-- CreateIndex
CREATE INDEX "idx_move_name" ON "moves"("name");

-- CreateIndex
CREATE INDEX "idx_moves_generation" ON "moves"("generation_id");

-- CreateIndex
CREATE INDEX "idx_moves_damage_class" ON "moves"("move_damage_class_id");

-- CreateIndex
CREATE INDEX "idx_moves_power" ON "moves"("power");

-- CreateIndex
CREATE INDEX "idx_pokemon_species" ON "pokemon"("pokemon_species_id");

-- CreateIndex
CREATE INDEX "idx_pokemon_name" ON "pokemon"("name");

-- CreateIndex
CREATE INDEX "idx_encounters_pokemon" ON "pokemon_encounters"("pokemon_id");

-- CreateIndex
CREATE INDEX "idx_encounters_location_area" ON "pokemon_encounters"("location_area_id");

-- CreateIndex
CREATE INDEX "idx_encounters_version" ON "pokemon_encounters"("version_id");

-- CreateIndex
CREATE INDEX "idx_encounters_method" ON "pokemon_encounters"("encounter_method_id");

-- CreateIndex
CREATE INDEX "idx_species_name" ON "pokemon_species"("name");

-- CreateIndex
CREATE INDEX "idx_species_generation" ON "pokemon_species"("generation_id");

-- CreateIndex
CREATE INDEX "idx_species_legendary" ON "pokemon_species"("is_legendary");

-- CreateIndex
CREATE INDEX "idx_species_mythical" ON "pokemon_species"("is_mythical");

-- CreateIndex
CREATE INDEX "idx_species_color" ON "pokemon_species"("color_id");

-- CreateIndex
CREATE INDEX "idx_species_evolves_from" ON "pokemon_species"("evolves_from_species_id");

-- CreateIndex
CREATE INDEX "idx_species_evolution_chain" ON "pokemon_species"("evolution_chain_id");

-- CreateIndex
CREATE INDEX "idx_pokemon_types" ON "pokemon_types"("pokemon_id");

-- CreateIndex
CREATE INDEX "idx_pokemon_types_type" ON "pokemon_types"("type_id");
