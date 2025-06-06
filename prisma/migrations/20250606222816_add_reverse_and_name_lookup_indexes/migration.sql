-- CreateIndex
CREATE INDEX "idx_location_areas_location" ON "location_areas"("location_id");

-- CreateIndex
CREATE INDEX "idx_location_areas_name" ON "location_areas"("name");

-- CreateIndex
CREATE INDEX "idx_locations_region" ON "locations"("region_id");

-- CreateIndex
CREATE INDEX "idx_locations_name" ON "locations"("name");

-- CreateIndex
CREATE INDEX "idx_pokemon_abilities_ability" ON "pokemon_abilities"("ability_id");

-- CreateIndex
CREATE INDEX "idx_pokemon_abilities_hidden" ON "pokemon_abilities"("is_hidden");

-- CreateIndex
CREATE INDEX "idx_pokemon_moves_move" ON "pokemon_moves"("move_id");

-- CreateIndex
CREATE INDEX "idx_pokemon_moves_version" ON "pokemon_moves"("version_group_id");

-- CreateIndex
CREATE INDEX "idx_pokemon_moves_learn_method" ON "pokemon_moves"("move_learn_method_id");

-- CreateIndex
CREATE INDEX "idx_pokemon_moves_level" ON "pokemon_moves"("level_learned_at");

-- CreateIndex
CREATE INDEX "idx_pokemon_moves_composite" ON "pokemon_moves"("pokemon_id", "version_group_id");
