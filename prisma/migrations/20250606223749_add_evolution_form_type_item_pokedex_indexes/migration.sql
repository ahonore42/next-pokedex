-- CreateIndex
CREATE INDEX "idx_items_category" ON "items"("item_category_id");

-- CreateIndex
CREATE INDEX "idx_evolution_species" ON "pokemon_evolution"("pokemon_species_id");

-- CreateIndex
CREATE INDEX "idx_evolution_trigger" ON "pokemon_evolution"("evolution_trigger_id");

-- CreateIndex
CREATE INDEX "idx_forms_pokemon" ON "pokemon_forms"("pokemon_id");

-- CreateIndex
CREATE INDEX "idx_pokedex_numbers_number" ON "pokemon_species_pokedex_numbers"("pokedex_number");

-- CreateIndex
CREATE INDEX "idx_pokedex_numbers_pokedex" ON "pokemon_species_pokedex_numbers"("pokedex_id");

-- CreateIndex
CREATE INDEX "idx_type_efficacy_target" ON "type_efficacy"("target_type_id");
