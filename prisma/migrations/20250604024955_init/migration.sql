-- CreateTable
CREATE TABLE "languages" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "iso639" TEXT,
    "iso3166" TEXT,
    "official" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "language_names" (
    "language_id" INTEGER NOT NULL,
    "local_language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "language_names_pkey" PRIMARY KEY ("language_id","local_language_id")
);

-- CreateTable
CREATE TABLE "generations" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "main_region_id" INTEGER,
    "order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation_names" (
    "generation_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "generation_names_pkey" PRIMARY KEY ("generation_id","language_id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "region_names" (
    "region_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "region_names_pkey" PRIMARY KEY ("region_id","language_id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "region_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_names" (
    "location_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "location_names_pkey" PRIMARY KEY ("location_id","language_id")
);

-- CreateTable
CREATE TABLE "location_areas" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "location_id" INTEGER NOT NULL,
    "game_index" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_area_names" (
    "location_area_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "location_area_names_pkey" PRIMARY KEY ("location_area_id","language_id")
);

-- CreateTable
CREATE TABLE "types" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "generation_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "type_names" (
    "type_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "type_names_pkey" PRIMARY KEY ("type_id","language_id")
);

-- CreateTable
CREATE TABLE "type_efficacy" (
    "damage_type_id" INTEGER NOT NULL,
    "target_type_id" INTEGER NOT NULL,
    "damage_factor" INTEGER NOT NULL,

    CONSTRAINT "type_efficacy_pkey" PRIMARY KEY ("damage_type_id","target_type_id")
);

-- CreateTable
CREATE TABLE "type_efficacy_past" (
    "id" SERIAL NOT NULL,
    "damage_type_id" INTEGER NOT NULL,
    "target_type_id" INTEGER NOT NULL,
    "damage_factor" INTEGER NOT NULL,
    "generation_id" INTEGER NOT NULL,

    CONSTRAINT "type_efficacy_past_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abilities" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "generation_id" INTEGER NOT NULL,
    "is_main_series" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ability_names" (
    "ability_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ability_names_pkey" PRIMARY KEY ("ability_id","language_id")
);

-- CreateTable
CREATE TABLE "ability_effect_text" (
    "ability_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "short_effect" TEXT,
    "effect" TEXT,

    CONSTRAINT "ability_effect_text_pkey" PRIMARY KEY ("ability_id","language_id")
);

-- CreateTable
CREATE TABLE "ability_flavor_text" (
    "ability_id" INTEGER NOT NULL,
    "version_group_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "flavor_text" TEXT NOT NULL,

    CONSTRAINT "ability_flavor_text_pkey" PRIMARY KEY ("ability_id","version_group_id","language_id")
);

-- CreateTable
CREATE TABLE "ability_change_log" (
    "id" SERIAL NOT NULL,
    "ability_id" INTEGER NOT NULL,
    "changed_in_version_group_id" INTEGER NOT NULL,

    CONSTRAINT "ability_change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "move_attributes" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "move_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "move_attribute_names" (
    "move_attribute_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "move_attribute_names_pkey" PRIMARY KEY ("move_attribute_id","language_id")
);

-- CreateTable
CREATE TABLE "move_attribute_descriptions" (
    "move_attribute_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "move_attribute_descriptions_pkey" PRIMARY KEY ("move_attribute_id","language_id")
);

-- CreateTable
CREATE TABLE "move_attribute_map" (
    "move_id" INTEGER NOT NULL,
    "move_attribute_id" INTEGER NOT NULL,

    CONSTRAINT "move_attribute_map_pkey" PRIMARY KEY ("move_id","move_attribute_id")
);

-- CreateTable
CREATE TABLE "move_battle_styles" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "move_battle_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "move_battle_style_names" (
    "move_battle_style_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "move_battle_style_names_pkey" PRIMARY KEY ("move_battle_style_id","language_id")
);

-- CreateTable
CREATE TABLE "move_damage_classes" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "move_damage_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "move_damage_class_names" (
    "move_damage_class_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "move_damage_class_names_pkey" PRIMARY KEY ("move_damage_class_id","language_id")
);

-- CreateTable
CREATE TABLE "move_effects" (
    "id" INTEGER NOT NULL,

    CONSTRAINT "move_effects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "move_effect_prose" (
    "move_effect_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "short_effect" TEXT,
    "effect" TEXT,

    CONSTRAINT "move_effect_prose_pkey" PRIMARY KEY ("move_effect_id","language_id")
);

-- CreateTable
CREATE TABLE "move_learn_methods" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "move_learn_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "move_learn_method_names" (
    "move_learn_method_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "move_learn_method_names_pkey" PRIMARY KEY ("move_learn_method_id","language_id")
);

-- CreateTable
CREATE TABLE "move_learn_method_descriptions" (
    "move_learn_method_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "move_learn_method_descriptions_pkey" PRIMARY KEY ("move_learn_method_id","language_id")
);

-- CreateTable
CREATE TABLE "move_targets" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "move_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "move_target_names" (
    "move_target_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "move_target_names_pkey" PRIMARY KEY ("move_target_id","language_id")
);

-- CreateTable
CREATE TABLE "move_target_descriptions" (
    "move_target_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "move_target_descriptions_pkey" PRIMARY KEY ("move_target_id","language_id")
);

-- CreateTable
CREATE TABLE "moves" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "generation_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    "power" INTEGER,
    "pp" INTEGER,
    "accuracy" INTEGER,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "move_target_id" INTEGER NOT NULL,
    "move_damage_class_id" INTEGER NOT NULL,
    "move_effect_id" INTEGER NOT NULL,
    "effect_chance" INTEGER,
    "contest_type_id" INTEGER,
    "contest_effect_id" INTEGER,
    "super_contest_effect_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "move_names" (
    "move_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "move_names_pkey" PRIMARY KEY ("move_id","language_id")
);

-- CreateTable
CREATE TABLE "move_flavor_text" (
    "move_id" INTEGER NOT NULL,
    "version_group_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "flavor_text" TEXT NOT NULL,

    CONSTRAINT "move_flavor_text_pkey" PRIMARY KEY ("move_id","version_group_id","language_id")
);

-- CreateTable
CREATE TABLE "move_meta_ailments" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "move_meta_ailments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "move_meta_ailment_names" (
    "move_meta_ailment_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "move_meta_ailment_names_pkey" PRIMARY KEY ("move_meta_ailment_id","language_id")
);

-- CreateTable
CREATE TABLE "move_meta_categories" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "move_meta_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "move_meta_category_descriptions" (
    "move_meta_category_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "move_meta_category_descriptions_pkey" PRIMARY KEY ("move_meta_category_id","language_id")
);

-- CreateTable
CREATE TABLE "move_meta_data" (
    "move_id" INTEGER NOT NULL,
    "move_meta_ailment_id" INTEGER NOT NULL,
    "move_meta_category_id" INTEGER NOT NULL,
    "min_hits" INTEGER,
    "max_hits" INTEGER,
    "min_turns" INTEGER,
    "max_turns" INTEGER,
    "drain" INTEGER NOT NULL DEFAULT 0,
    "healing" INTEGER NOT NULL DEFAULT 0,
    "crit_rate" INTEGER NOT NULL DEFAULT 0,
    "ailment_chance" INTEGER NOT NULL DEFAULT 0,
    "flinch_chance" INTEGER NOT NULL DEFAULT 0,
    "stat_chance" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "move_meta_data_pkey" PRIMARY KEY ("move_id")
);

-- CreateTable
CREATE TABLE "move_stat_changes" (
    "move_id" INTEGER NOT NULL,
    "stat_id" INTEGER NOT NULL,
    "change" INTEGER NOT NULL,

    CONSTRAINT "move_stat_changes_pkey" PRIMARY KEY ("move_id","stat_id")
);

-- CreateTable
CREATE TABLE "move_past_values" (
    "move_id" INTEGER NOT NULL,
    "version_group_id" INTEGER NOT NULL,
    "type_id" INTEGER,
    "power" INTEGER,
    "pp" INTEGER,
    "accuracy" INTEGER,
    "effect_chance" INTEGER,

    CONSTRAINT "move_past_values_pkey" PRIMARY KEY ("move_id","version_group_id")
);

-- CreateTable
CREATE TABLE "item_attributes" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "item_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_attribute_names" (
    "item_attribute_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "item_attribute_names_pkey" PRIMARY KEY ("item_attribute_id","language_id")
);

-- CreateTable
CREATE TABLE "item_attribute_descriptions" (
    "item_attribute_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "item_attribute_descriptions_pkey" PRIMARY KEY ("item_attribute_id","language_id")
);

-- CreateTable
CREATE TABLE "item_categories" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "pocket_id" INTEGER NOT NULL,

    CONSTRAINT "item_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_category_names" (
    "item_category_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "item_category_names_pkey" PRIMARY KEY ("item_category_id","language_id")
);

-- CreateTable
CREATE TABLE "item_fling_effects" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "item_fling_effects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_fling_effect_effect_text" (
    "item_fling_effect_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "effect" TEXT NOT NULL,

    CONSTRAINT "item_fling_effect_effect_text_pkey" PRIMARY KEY ("item_fling_effect_id","language_id")
);

-- CreateTable
CREATE TABLE "item_pockets" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "item_pockets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_pocket_names" (
    "item_pocket_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "item_pocket_names_pkey" PRIMARY KEY ("item_pocket_id","language_id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "item_category_id" INTEGER NOT NULL,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "fling_power" INTEGER,
    "fling_effect_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "generation_id" INTEGER,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_names" (
    "item_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "item_names_pkey" PRIMARY KEY ("item_id","language_id")
);

-- CreateTable
CREATE TABLE "item_effect_text" (
    "item_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "short_effect" TEXT,
    "effect" TEXT,

    CONSTRAINT "item_effect_text_pkey" PRIMARY KEY ("item_id","language_id")
);

-- CreateTable
CREATE TABLE "item_flavor_text" (
    "item_id" INTEGER NOT NULL,
    "version_group_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "flavor_text" TEXT NOT NULL,

    CONSTRAINT "item_flavor_text_pkey" PRIMARY KEY ("item_id","version_group_id","language_id")
);

-- CreateTable
CREATE TABLE "item_game_indices" (
    "item_id" INTEGER NOT NULL,
    "generation_id" INTEGER NOT NULL,
    "game_index" INTEGER NOT NULL,

    CONSTRAINT "item_game_indices_pkey" PRIMARY KEY ("item_id","generation_id")
);

-- CreateTable
CREATE TABLE "item_item_attribute_map" (
    "item_id" INTEGER NOT NULL,
    "item_attribute_id" INTEGER NOT NULL,

    CONSTRAINT "item_item_attribute_map_pkey" PRIMARY KEY ("item_id","item_attribute_id")
);

-- CreateTable
CREATE TABLE "egg_groups" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "egg_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "egg_group_names" (
    "egg_group_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "egg_group_names_pkey" PRIMARY KEY ("egg_group_id","language_id")
);

-- CreateTable
CREATE TABLE "growth_rates" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "formula" TEXT,

    CONSTRAINT "growth_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "growth_rate_descriptions" (
    "growth_rate_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "growth_rate_descriptions_pkey" PRIMARY KEY ("growth_rate_id","language_id")
);

-- CreateTable
CREATE TABLE "growth_rate_experience_levels" (
    "growth_rate_id" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "experience" INTEGER NOT NULL,

    CONSTRAINT "growth_rate_experience_levels_pkey" PRIMARY KEY ("growth_rate_id","level")
);

-- CreateTable
CREATE TABLE "pokemon_colors" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "pokemon_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokemon_color_names" (
    "pokemon_color_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "pokemon_color_names_pkey" PRIMARY KEY ("pokemon_color_id","language_id")
);

-- CreateTable
CREATE TABLE "pokemon_habitats" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "pokemon_habitats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokemon_habitat_names" (
    "pokemon_habitat_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "pokemon_habitat_names_pkey" PRIMARY KEY ("pokemon_habitat_id","language_id")
);

-- CreateTable
CREATE TABLE "pokemon_shapes" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "pokemon_shapes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokemon_shape_names" (
    "pokemon_shape_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "pokemon_shape_names_pkey" PRIMARY KEY ("pokemon_shape_id","language_id")
);

-- CreateTable
CREATE TABLE "pokemon_shape_awesome_names" (
    "pokemon_shape_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "awesome_name" TEXT NOT NULL,

    CONSTRAINT "pokemon_shape_awesome_names_pkey" PRIMARY KEY ("pokemon_shape_id","language_id")
);

-- CreateTable
CREATE TABLE "pokemon_species" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "generation_id" INTEGER NOT NULL,
    "evolves_from_species_id" INTEGER,
    "evolution_chain_id" INTEGER,
    "color_id" INTEGER NOT NULL,
    "shape_id" INTEGER NOT NULL,
    "habitat_id" INTEGER,
    "gender_rate" INTEGER NOT NULL,
    "capture_rate" INTEGER NOT NULL,
    "base_happiness" INTEGER NOT NULL,
    "is_baby" BOOLEAN NOT NULL DEFAULT false,
    "hatch_counter" INTEGER NOT NULL,
    "has_gender_differences" BOOLEAN NOT NULL DEFAULT false,
    "growth_rate_id" INTEGER NOT NULL,
    "forms_switchable" BOOLEAN NOT NULL DEFAULT false,
    "is_legendary" BOOLEAN NOT NULL DEFAULT false,
    "is_mythical" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pokemon_species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokemon_species_names" (
    "pokemon_species_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "genus" TEXT,

    CONSTRAINT "pokemon_species_names_pkey" PRIMARY KEY ("pokemon_species_id","language_id")
);

-- CreateTable
CREATE TABLE "pokemon_species_descriptions" (
    "pokemon_species_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "pokemon_species_descriptions_pkey" PRIMARY KEY ("pokemon_species_id","language_id")
);

-- CreateTable
CREATE TABLE "pokemon_species_flavor_text" (
    "pokemon_species_id" INTEGER NOT NULL,
    "version_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "flavor_text" TEXT NOT NULL,

    CONSTRAINT "pokemon_species_flavor_text_pkey" PRIMARY KEY ("pokemon_species_id","version_id","language_id")
);

-- CreateTable
CREATE TABLE "pokemon_species_egg_groups" (
    "pokemon_species_id" INTEGER NOT NULL,
    "egg_group_id" INTEGER NOT NULL,

    CONSTRAINT "pokemon_species_egg_groups_pkey" PRIMARY KEY ("pokemon_species_id","egg_group_id")
);

-- CreateTable
CREATE TABLE "pokemon" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "pokemon_species_id" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "base_experience" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokemon_abilities" (
    "pokemon_id" INTEGER NOT NULL,
    "ability_id" INTEGER NOT NULL,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "pokemon_abilities_pkey" PRIMARY KEY ("pokemon_id","slot")
);

-- CreateTable
CREATE TABLE "pokemon_ability_past" (
    "pokemon_id" INTEGER NOT NULL,
    "generation_id" INTEGER NOT NULL,
    "ability_id" INTEGER,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "pokemon_ability_past_pkey" PRIMARY KEY ("pokemon_id","generation_id","slot")
);

-- CreateTable
CREATE TABLE "pokemon_types" (
    "pokemon_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "pokemon_types_pkey" PRIMARY KEY ("pokemon_id","slot")
);

-- CreateTable
CREATE TABLE "pokemon_type_past" (
    "pokemon_id" INTEGER NOT NULL,
    "generation_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "pokemon_type_past_pkey" PRIMARY KEY ("pokemon_id","generation_id","slot")
);

-- CreateTable
CREATE TABLE "stats" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "is_battle_only" BOOLEAN NOT NULL DEFAULT false,
    "game_index" INTEGER NOT NULL,

    CONSTRAINT "stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stat_names" (
    "stat_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "stat_names_pkey" PRIMARY KEY ("stat_id","language_id")
);

-- CreateTable
CREATE TABLE "pokemon_stats" (
    "pokemon_id" INTEGER NOT NULL,
    "stat_id" INTEGER NOT NULL,
    "base_stat" INTEGER NOT NULL,
    "effort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "pokemon_stats_pkey" PRIMARY KEY ("pokemon_id","stat_id")
);

-- CreateTable
CREATE TABLE "pokemon_moves" (
    "pokemon_id" INTEGER NOT NULL,
    "version_group_id" INTEGER NOT NULL,
    "move_id" INTEGER NOT NULL,
    "move_learn_method_id" INTEGER NOT NULL,
    "level_learned_at" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER,

    CONSTRAINT "pokemon_moves_pkey" PRIMARY KEY ("pokemon_id","version_group_id","move_id","move_learn_method_id")
);

-- CreateTable
CREATE TABLE "pokemon_game_indices" (
    "pokemon_id" INTEGER NOT NULL,
    "version_id" INTEGER NOT NULL,
    "game_index" INTEGER NOT NULL,

    CONSTRAINT "pokemon_game_indices_pkey" PRIMARY KEY ("pokemon_id","version_id")
);

-- CreateTable
CREATE TABLE "pokemon_items" (
    "pokemon_id" INTEGER NOT NULL,
    "version_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "rarity" INTEGER NOT NULL,

    CONSTRAINT "pokemon_items_pkey" PRIMARY KEY ("pokemon_id","version_id","item_id")
);

-- CreateTable
CREATE TABLE "pokemon_sprites" (
    "pokemon_id" INTEGER NOT NULL,
    "front_default" TEXT,
    "front_shiny" TEXT,
    "front_female" TEXT,
    "front_shiny_female" TEXT,
    "back_default" TEXT,
    "back_shiny" TEXT,
    "back_female" TEXT,
    "back_shiny_female" TEXT,

    CONSTRAINT "pokemon_sprites_pkey" PRIMARY KEY ("pokemon_id")
);

-- CreateTable
CREATE TABLE "pokemon_forms" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "pokemon_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "form_order" INTEGER NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_battle_only" BOOLEAN NOT NULL DEFAULT false,
    "is_mega" BOOLEAN NOT NULL DEFAULT false,
    "form_name" TEXT,
    "version_group_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pokemon_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokemon_form_names" (
    "pokemon_form_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "pokemon_name" TEXT,

    CONSTRAINT "pokemon_form_names_pkey" PRIMARY KEY ("pokemon_form_id","language_id")
);

-- CreateTable
CREATE TABLE "pokemon_form_types" (
    "pokemon_form_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "pokemon_form_types_pkey" PRIMARY KEY ("pokemon_form_id","slot")
);

-- CreateTable
CREATE TABLE "pokemon_form_sprites" (
    "pokemon_form_id" INTEGER NOT NULL,
    "front_default" TEXT,
    "front_shiny" TEXT,
    "back_default" TEXT,
    "back_shiny" TEXT,

    CONSTRAINT "pokemon_form_sprites_pkey" PRIMARY KEY ("pokemon_form_id")
);

-- CreateTable
CREATE TABLE "evolution_chains" (
    "id" INTEGER NOT NULL,
    "baby_trigger_item_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evolution_chains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evolution_triggers" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "evolution_triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evolution_trigger_names" (
    "evolution_trigger_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "evolution_trigger_names_pkey" PRIMARY KEY ("evolution_trigger_id","language_id")
);

-- CreateTable
CREATE TABLE "pokemon_evolution" (
    "id" SERIAL NOT NULL,
    "pokemon_species_id" INTEGER NOT NULL,
    "evolution_trigger_id" INTEGER NOT NULL,
    "evolution_item_id" INTEGER,
    "min_level" INTEGER,
    "gender_id" INTEGER,
    "location_id" INTEGER,
    "held_item_id" INTEGER,
    "time_of_day" TEXT,
    "known_move_id" INTEGER,
    "known_move_type_id" INTEGER,
    "min_happiness" INTEGER,
    "min_beauty" INTEGER,
    "min_affection" INTEGER,
    "needs_overworld_rain" BOOLEAN NOT NULL DEFAULT false,
    "party_species_id" INTEGER,
    "party_type_id" INTEGER,
    "relative_physical_stats" INTEGER,
    "trade_species_id" INTEGER,
    "turn_upside_down" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pokemon_evolution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounter_methods" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER,

    CONSTRAINT "encounter_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounter_method_names" (
    "encounter_method_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "encounter_method_names_pkey" PRIMARY KEY ("encounter_method_id","language_id")
);

-- CreateTable
CREATE TABLE "encounter_conditions" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "encounter_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounter_condition_names" (
    "encounter_condition_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "encounter_condition_names_pkey" PRIMARY KEY ("encounter_condition_id","language_id")
);

-- CreateTable
CREATE TABLE "encounter_condition_values" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "encounter_condition_id" INTEGER NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "encounter_condition_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounter_condition_value_names" (
    "encounter_condition_value_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "encounter_condition_value_names_pkey" PRIMARY KEY ("encounter_condition_value_id","language_id")
);

-- CreateTable
CREATE TABLE "pokemon_encounters" (
    "id" SERIAL NOT NULL,
    "pokemon_id" INTEGER NOT NULL,
    "version_id" INTEGER NOT NULL,
    "location_area_id" INTEGER NOT NULL,
    "encounter_method_id" INTEGER NOT NULL,
    "min_level" INTEGER NOT NULL,
    "max_level" INTEGER NOT NULL,
    "chance" INTEGER NOT NULL,

    CONSTRAINT "pokemon_encounters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounter_condition_value_map" (
    "pokemon_encounter_id" INTEGER NOT NULL,
    "encounter_condition_value_id" INTEGER NOT NULL,

    CONSTRAINT "encounter_condition_value_map_pkey" PRIMARY KEY ("pokemon_encounter_id","encounter_condition_value_id")
);

-- CreateTable
CREATE TABLE "version_groups" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "generation_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "version_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "version_group_names" (
    "version_group_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "version_group_names_pkey" PRIMARY KEY ("version_group_id","language_id")
);

-- CreateTable
CREATE TABLE "versions" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "version_group_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "version_names" (
    "version_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "version_names_pkey" PRIMARY KEY ("version_id","language_id")
);

-- CreateTable
CREATE TABLE "version_group_move_learn_methods" (
    "version_group_id" INTEGER NOT NULL,
    "move_learn_method_id" INTEGER NOT NULL,

    CONSTRAINT "version_group_move_learn_methods_pkey" PRIMARY KEY ("version_group_id","move_learn_method_id")
);

-- CreateTable
CREATE TABLE "version_group_regions" (
    "version_group_id" INTEGER NOT NULL,
    "region_id" INTEGER NOT NULL,

    CONSTRAINT "version_group_regions_pkey" PRIMARY KEY ("version_group_id","region_id")
);

-- CreateTable
CREATE TABLE "machines" (
    "id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "move_id" INTEGER NOT NULL,
    "version_group_id" INTEGER NOT NULL,
    "machine_number" INTEGER NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_version_group_names" (
    "machine_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "machine_version_group_names_pkey" PRIMARY KEY ("machine_id","language_id")
);

-- CreateTable
CREATE TABLE "berry_firmnesses" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "berry_firmnesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "berry_firmness_names" (
    "berry_firmness_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "berry_firmness_names_pkey" PRIMARY KEY ("berry_firmness_id","language_id")
);

-- CreateTable
CREATE TABLE "berry_flavors" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "berry_flavors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "berry_flavor_names" (
    "berry_flavor_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "berry_flavor_names_pkey" PRIMARY KEY ("berry_flavor_id","language_id")
);

-- CreateTable
CREATE TABLE "berries" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "berry_firmness_id" INTEGER NOT NULL,
    "natural_gift_power" INTEGER NOT NULL,
    "natural_gift_type_id" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "max_harvest" INTEGER NOT NULL,
    "growth_time" INTEGER NOT NULL,
    "soil_dryness" INTEGER NOT NULL,
    "smoothness" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,

    CONSTRAINT "berries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "berry_flavor_map" (
    "berry_id" INTEGER NOT NULL,
    "berry_flavor_id" INTEGER NOT NULL,
    "potency" INTEGER NOT NULL,

    CONSTRAINT "berry_flavor_map_pkey" PRIMARY KEY ("berry_id","berry_flavor_id")
);

-- CreateTable
CREATE TABLE "contest_types" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "berry_flavor_id" INTEGER,

    CONSTRAINT "contest_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_type_names" (
    "contest_type_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "contest_type_names_pkey" PRIMARY KEY ("contest_type_id","language_id")
);

-- CreateTable
CREATE TABLE "contest_effects" (
    "id" INTEGER NOT NULL,
    "appeal" INTEGER NOT NULL,
    "jam" INTEGER NOT NULL,

    CONSTRAINT "contest_effects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_effect_entries" (
    "contest_effect_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "effect" TEXT,

    CONSTRAINT "contest_effect_entries_pkey" PRIMARY KEY ("contest_effect_id","language_id")
);

-- CreateTable
CREATE TABLE "contest_effect_flavor_text" (
    "contest_effect_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "flavor_text" TEXT,

    CONSTRAINT "contest_effect_flavor_text_pkey" PRIMARY KEY ("contest_effect_id","language_id")
);

-- CreateTable
CREATE TABLE "super_contest_effects" (
    "id" INTEGER NOT NULL,
    "appeal" INTEGER NOT NULL,

    CONSTRAINT "super_contest_effects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "super_contest_effect_flavor_text" (
    "super_contest_effect_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "flavor_text" TEXT,

    CONSTRAINT "super_contest_effect_flavor_text_pkey" PRIMARY KEY ("super_contest_effect_id","language_id")
);

-- CreateTable
CREATE TABLE "natures" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "decreased_stat_id" INTEGER,
    "increased_stat_id" INTEGER,
    "hates_flavor_id" INTEGER,
    "likes_flavor_id" INTEGER,
    "game_index" INTEGER NOT NULL,

    CONSTRAINT "natures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nature_names" (
    "nature_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "nature_names_pkey" PRIMARY KEY ("nature_id","language_id")
);

-- CreateTable
CREATE TABLE "nature_pokeathlon_stat_affects" (
    "nature_id" INTEGER NOT NULL,
    "pokeathlon_stat_id" INTEGER NOT NULL,
    "max_change" INTEGER NOT NULL,

    CONSTRAINT "nature_pokeathlon_stat_affects_pkey" PRIMARY KEY ("nature_id","pokeathlon_stat_id")
);

-- CreateTable
CREATE TABLE "nature_battle_style_preferences" (
    "nature_id" INTEGER NOT NULL,
    "move_battle_style_id" INTEGER NOT NULL,
    "low_hp_preference" INTEGER NOT NULL,
    "high_hp_preference" INTEGER NOT NULL,

    CONSTRAINT "nature_battle_style_preferences_pkey" PRIMARY KEY ("nature_id","move_battle_style_id")
);

-- CreateTable
CREATE TABLE "pokeathlon_stats" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "pokeathlon_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokeathlon_stat_names" (
    "pokeathlon_stat_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "pokeathlon_stat_names_pkey" PRIMARY KEY ("pokeathlon_stat_id","language_id")
);

-- CreateTable
CREATE TABLE "characteristics" (
    "id" INTEGER NOT NULL,
    "stat_id" INTEGER NOT NULL,
    "gene_modulo" INTEGER NOT NULL,
    "possible_values" TEXT NOT NULL,

    CONSTRAINT "characteristics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characteristic_descriptions" (
    "characteristic_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "characteristic_descriptions_pkey" PRIMARY KEY ("characteristic_id","language_id")
);

-- CreateTable
CREATE TABLE "genders" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "genders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gender_names" (
    "gender_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "gender_names_pkey" PRIMARY KEY ("gender_id","language_id")
);

-- CreateTable
CREATE TABLE "pokedexes" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "is_main_series" BOOLEAN NOT NULL DEFAULT true,
    "region_id" INTEGER,

    CONSTRAINT "pokedexes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokedex_names" (
    "pokedex_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "pokedex_names_pkey" PRIMARY KEY ("pokedex_id","language_id")
);

-- CreateTable
CREATE TABLE "pokedex_descriptions" (
    "pokedex_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "pokedex_descriptions_pkey" PRIMARY KEY ("pokedex_id","language_id")
);

-- CreateTable
CREATE TABLE "pokemon_species_pokedex_numbers" (
    "pokemon_species_id" INTEGER NOT NULL,
    "pokedex_id" INTEGER NOT NULL,
    "pokedex_number" INTEGER NOT NULL,

    CONSTRAINT "pokemon_species_pokedex_numbers_pkey" PRIMARY KEY ("pokemon_species_id","pokedex_id")
);

-- CreateTable
CREATE TABLE "version_group_pokedexes" (
    "version_group_id" INTEGER NOT NULL,
    "pokedex_id" INTEGER NOT NULL,

    CONSTRAINT "version_group_pokedexes_pkey" PRIMARY KEY ("version_group_id","pokedex_id")
);

-- CreateTable
CREATE TABLE "pal_park_areas" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "pal_park_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pal_park_area_names" (
    "pal_park_area_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "pal_park_area_names_pkey" PRIMARY KEY ("pal_park_area_id","language_id")
);

-- CreateTable
CREATE TABLE "pal_park_encounters" (
    "pokemon_species_id" INTEGER NOT NULL,
    "pal_park_area_id" INTEGER NOT NULL,
    "base_score" INTEGER NOT NULL,
    "rate" INTEGER NOT NULL,

    CONSTRAINT "pal_park_encounters_pkey" PRIMARY KEY ("pokemon_species_id","pal_park_area_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "languages_name_key" ON "languages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "generations_name_key" ON "generations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "regions_name_key" ON "regions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "types_name_key" ON "types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "abilities_name_key" ON "abilities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "move_attributes_name_key" ON "move_attributes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "move_battle_styles_name_key" ON "move_battle_styles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "move_damage_classes_name_key" ON "move_damage_classes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "move_learn_methods_name_key" ON "move_learn_methods"("name");

-- CreateIndex
CREATE UNIQUE INDEX "move_targets_name_key" ON "move_targets"("name");

-- CreateIndex
CREATE UNIQUE INDEX "moves_name_key" ON "moves"("name");

-- CreateIndex
CREATE UNIQUE INDEX "move_meta_ailments_name_key" ON "move_meta_ailments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "move_meta_categories_name_key" ON "move_meta_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "item_attributes_name_key" ON "item_attributes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "item_categories_name_key" ON "item_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "item_fling_effects_name_key" ON "item_fling_effects"("name");

-- CreateIndex
CREATE UNIQUE INDEX "item_pockets_name_key" ON "item_pockets"("name");

-- CreateIndex
CREATE UNIQUE INDEX "items_name_key" ON "items"("name");

-- CreateIndex
CREATE UNIQUE INDEX "egg_groups_name_key" ON "egg_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "growth_rates_name_key" ON "growth_rates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pokemon_colors_name_key" ON "pokemon_colors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pokemon_habitats_name_key" ON "pokemon_habitats"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pokemon_shapes_name_key" ON "pokemon_shapes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pokemon_species_name_key" ON "pokemon_species"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pokemon_name_key" ON "pokemon"("name");

-- CreateIndex
CREATE UNIQUE INDEX "stats_name_key" ON "stats"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pokemon_forms_name_key" ON "pokemon_forms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "evolution_triggers_name_key" ON "evolution_triggers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "encounter_methods_name_key" ON "encounter_methods"("name");

-- CreateIndex
CREATE UNIQUE INDEX "encounter_conditions_name_key" ON "encounter_conditions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "version_groups_name_key" ON "version_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "versions_name_key" ON "versions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "machines_item_id_version_group_id_key" ON "machines"("item_id", "version_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "berry_firmnesses_name_key" ON "berry_firmnesses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "berry_flavors_name_key" ON "berry_flavors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "berries_name_key" ON "berries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "contest_types_name_key" ON "contest_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "contest_types_berry_flavor_id_key" ON "contest_types"("berry_flavor_id");

-- CreateIndex
CREATE UNIQUE INDEX "natures_name_key" ON "natures"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pokeathlon_stats_name_key" ON "pokeathlon_stats"("name");

-- CreateIndex
CREATE UNIQUE INDEX "genders_name_key" ON "genders"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pokedexes_name_key" ON "pokedexes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pal_park_areas_name_key" ON "pal_park_areas"("name");

-- AddForeignKey
ALTER TABLE "language_names" ADD CONSTRAINT "language_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "language_names" ADD CONSTRAINT "language_names_local_language_id_fkey" FOREIGN KEY ("local_language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generations" ADD CONSTRAINT "generations_main_region_id_fkey" FOREIGN KEY ("main_region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_names" ADD CONSTRAINT "generation_names_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_names" ADD CONSTRAINT "generation_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "region_names" ADD CONSTRAINT "region_names_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "region_names" ADD CONSTRAINT "region_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_names" ADD CONSTRAINT "location_names_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_names" ADD CONSTRAINT "location_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_areas" ADD CONSTRAINT "location_areas_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_area_names" ADD CONSTRAINT "location_area_names_location_area_id_fkey" FOREIGN KEY ("location_area_id") REFERENCES "location_areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_area_names" ADD CONSTRAINT "location_area_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "types" ADD CONSTRAINT "types_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "type_names" ADD CONSTRAINT "type_names_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "type_names" ADD CONSTRAINT "type_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "type_efficacy" ADD CONSTRAINT "type_efficacy_damage_type_id_fkey" FOREIGN KEY ("damage_type_id") REFERENCES "types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "type_efficacy" ADD CONSTRAINT "type_efficacy_target_type_id_fkey" FOREIGN KEY ("target_type_id") REFERENCES "types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "type_efficacy_past" ADD CONSTRAINT "type_efficacy_past_damage_type_id_fkey" FOREIGN KEY ("damage_type_id") REFERENCES "types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "type_efficacy_past" ADD CONSTRAINT "type_efficacy_past_target_type_id_fkey" FOREIGN KEY ("target_type_id") REFERENCES "types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "type_efficacy_past" ADD CONSTRAINT "type_efficacy_past_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abilities" ADD CONSTRAINT "abilities_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ability_names" ADD CONSTRAINT "ability_names_ability_id_fkey" FOREIGN KEY ("ability_id") REFERENCES "abilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ability_names" ADD CONSTRAINT "ability_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ability_effect_text" ADD CONSTRAINT "ability_effect_text_ability_id_fkey" FOREIGN KEY ("ability_id") REFERENCES "abilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ability_effect_text" ADD CONSTRAINT "ability_effect_text_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ability_flavor_text" ADD CONSTRAINT "ability_flavor_text_ability_id_fkey" FOREIGN KEY ("ability_id") REFERENCES "abilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ability_flavor_text" ADD CONSTRAINT "ability_flavor_text_version_group_id_fkey" FOREIGN KEY ("version_group_id") REFERENCES "version_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ability_flavor_text" ADD CONSTRAINT "ability_flavor_text_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ability_change_log" ADD CONSTRAINT "ability_change_log_ability_id_fkey" FOREIGN KEY ("ability_id") REFERENCES "abilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ability_change_log" ADD CONSTRAINT "ability_change_log_changed_in_version_group_id_fkey" FOREIGN KEY ("changed_in_version_group_id") REFERENCES "version_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_attribute_names" ADD CONSTRAINT "move_attribute_names_move_attribute_id_fkey" FOREIGN KEY ("move_attribute_id") REFERENCES "move_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_attribute_names" ADD CONSTRAINT "move_attribute_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_attribute_descriptions" ADD CONSTRAINT "move_attribute_descriptions_move_attribute_id_fkey" FOREIGN KEY ("move_attribute_id") REFERENCES "move_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_attribute_descriptions" ADD CONSTRAINT "move_attribute_descriptions_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_attribute_map" ADD CONSTRAINT "move_attribute_map_move_id_fkey" FOREIGN KEY ("move_id") REFERENCES "moves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_attribute_map" ADD CONSTRAINT "move_attribute_map_move_attribute_id_fkey" FOREIGN KEY ("move_attribute_id") REFERENCES "move_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_battle_style_names" ADD CONSTRAINT "move_battle_style_names_move_battle_style_id_fkey" FOREIGN KEY ("move_battle_style_id") REFERENCES "move_battle_styles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_battle_style_names" ADD CONSTRAINT "move_battle_style_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_damage_class_names" ADD CONSTRAINT "move_damage_class_names_move_damage_class_id_fkey" FOREIGN KEY ("move_damage_class_id") REFERENCES "move_damage_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_damage_class_names" ADD CONSTRAINT "move_damage_class_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_effect_prose" ADD CONSTRAINT "move_effect_prose_move_effect_id_fkey" FOREIGN KEY ("move_effect_id") REFERENCES "move_effects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_effect_prose" ADD CONSTRAINT "move_effect_prose_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_learn_method_names" ADD CONSTRAINT "move_learn_method_names_move_learn_method_id_fkey" FOREIGN KEY ("move_learn_method_id") REFERENCES "move_learn_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_learn_method_names" ADD CONSTRAINT "move_learn_method_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_learn_method_descriptions" ADD CONSTRAINT "move_learn_method_descriptions_move_learn_method_id_fkey" FOREIGN KEY ("move_learn_method_id") REFERENCES "move_learn_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_learn_method_descriptions" ADD CONSTRAINT "move_learn_method_descriptions_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_target_names" ADD CONSTRAINT "move_target_names_move_target_id_fkey" FOREIGN KEY ("move_target_id") REFERENCES "move_targets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_target_names" ADD CONSTRAINT "move_target_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_target_descriptions" ADD CONSTRAINT "move_target_descriptions_move_target_id_fkey" FOREIGN KEY ("move_target_id") REFERENCES "move_targets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_target_descriptions" ADD CONSTRAINT "move_target_descriptions_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moves" ADD CONSTRAINT "moves_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moves" ADD CONSTRAINT "moves_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moves" ADD CONSTRAINT "moves_move_target_id_fkey" FOREIGN KEY ("move_target_id") REFERENCES "move_targets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moves" ADD CONSTRAINT "moves_move_damage_class_id_fkey" FOREIGN KEY ("move_damage_class_id") REFERENCES "move_damage_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moves" ADD CONSTRAINT "moves_move_effect_id_fkey" FOREIGN KEY ("move_effect_id") REFERENCES "move_effects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moves" ADD CONSTRAINT "moves_contest_type_id_fkey" FOREIGN KEY ("contest_type_id") REFERENCES "contest_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moves" ADD CONSTRAINT "moves_contest_effect_id_fkey" FOREIGN KEY ("contest_effect_id") REFERENCES "contest_effects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moves" ADD CONSTRAINT "moves_super_contest_effect_id_fkey" FOREIGN KEY ("super_contest_effect_id") REFERENCES "super_contest_effects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_names" ADD CONSTRAINT "move_names_move_id_fkey" FOREIGN KEY ("move_id") REFERENCES "moves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_names" ADD CONSTRAINT "move_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_flavor_text" ADD CONSTRAINT "move_flavor_text_move_id_fkey" FOREIGN KEY ("move_id") REFERENCES "moves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_flavor_text" ADD CONSTRAINT "move_flavor_text_version_group_id_fkey" FOREIGN KEY ("version_group_id") REFERENCES "version_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_flavor_text" ADD CONSTRAINT "move_flavor_text_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_meta_ailment_names" ADD CONSTRAINT "move_meta_ailment_names_move_meta_ailment_id_fkey" FOREIGN KEY ("move_meta_ailment_id") REFERENCES "move_meta_ailments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_meta_ailment_names" ADD CONSTRAINT "move_meta_ailment_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_meta_category_descriptions" ADD CONSTRAINT "move_meta_category_descriptions_move_meta_category_id_fkey" FOREIGN KEY ("move_meta_category_id") REFERENCES "move_meta_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_meta_category_descriptions" ADD CONSTRAINT "move_meta_category_descriptions_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_meta_data" ADD CONSTRAINT "move_meta_data_move_id_fkey" FOREIGN KEY ("move_id") REFERENCES "moves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_meta_data" ADD CONSTRAINT "move_meta_data_move_meta_ailment_id_fkey" FOREIGN KEY ("move_meta_ailment_id") REFERENCES "move_meta_ailments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_meta_data" ADD CONSTRAINT "move_meta_data_move_meta_category_id_fkey" FOREIGN KEY ("move_meta_category_id") REFERENCES "move_meta_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_stat_changes" ADD CONSTRAINT "move_stat_changes_move_id_fkey" FOREIGN KEY ("move_id") REFERENCES "moves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_stat_changes" ADD CONSTRAINT "move_stat_changes_stat_id_fkey" FOREIGN KEY ("stat_id") REFERENCES "stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_past_values" ADD CONSTRAINT "move_past_values_move_id_fkey" FOREIGN KEY ("move_id") REFERENCES "moves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_past_values" ADD CONSTRAINT "move_past_values_version_group_id_fkey" FOREIGN KEY ("version_group_id") REFERENCES "version_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_past_values" ADD CONSTRAINT "move_past_values_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_attribute_names" ADD CONSTRAINT "item_attribute_names_item_attribute_id_fkey" FOREIGN KEY ("item_attribute_id") REFERENCES "item_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_attribute_names" ADD CONSTRAINT "item_attribute_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_attribute_descriptions" ADD CONSTRAINT "item_attribute_descriptions_item_attribute_id_fkey" FOREIGN KEY ("item_attribute_id") REFERENCES "item_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_attribute_descriptions" ADD CONSTRAINT "item_attribute_descriptions_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_categories" ADD CONSTRAINT "item_categories_pocket_id_fkey" FOREIGN KEY ("pocket_id") REFERENCES "item_pockets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_category_names" ADD CONSTRAINT "item_category_names_item_category_id_fkey" FOREIGN KEY ("item_category_id") REFERENCES "item_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_category_names" ADD CONSTRAINT "item_category_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_fling_effect_effect_text" ADD CONSTRAINT "item_fling_effect_effect_text_item_fling_effect_id_fkey" FOREIGN KEY ("item_fling_effect_id") REFERENCES "item_fling_effects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_fling_effect_effect_text" ADD CONSTRAINT "item_fling_effect_effect_text_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_pocket_names" ADD CONSTRAINT "item_pocket_names_item_pocket_id_fkey" FOREIGN KEY ("item_pocket_id") REFERENCES "item_pockets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_pocket_names" ADD CONSTRAINT "item_pocket_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_item_category_id_fkey" FOREIGN KEY ("item_category_id") REFERENCES "item_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_fling_effect_id_fkey" FOREIGN KEY ("fling_effect_id") REFERENCES "item_fling_effects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_names" ADD CONSTRAINT "item_names_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_names" ADD CONSTRAINT "item_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_effect_text" ADD CONSTRAINT "item_effect_text_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_effect_text" ADD CONSTRAINT "item_effect_text_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_flavor_text" ADD CONSTRAINT "item_flavor_text_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_flavor_text" ADD CONSTRAINT "item_flavor_text_version_group_id_fkey" FOREIGN KEY ("version_group_id") REFERENCES "version_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_flavor_text" ADD CONSTRAINT "item_flavor_text_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_game_indices" ADD CONSTRAINT "item_game_indices_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_game_indices" ADD CONSTRAINT "item_game_indices_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_item_attribute_map" ADD CONSTRAINT "item_item_attribute_map_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_item_attribute_map" ADD CONSTRAINT "item_item_attribute_map_item_attribute_id_fkey" FOREIGN KEY ("item_attribute_id") REFERENCES "item_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "egg_group_names" ADD CONSTRAINT "egg_group_names_egg_group_id_fkey" FOREIGN KEY ("egg_group_id") REFERENCES "egg_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "egg_group_names" ADD CONSTRAINT "egg_group_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "growth_rate_descriptions" ADD CONSTRAINT "growth_rate_descriptions_growth_rate_id_fkey" FOREIGN KEY ("growth_rate_id") REFERENCES "growth_rates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "growth_rate_descriptions" ADD CONSTRAINT "growth_rate_descriptions_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "growth_rate_experience_levels" ADD CONSTRAINT "growth_rate_experience_levels_growth_rate_id_fkey" FOREIGN KEY ("growth_rate_id") REFERENCES "growth_rates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_color_names" ADD CONSTRAINT "pokemon_color_names_pokemon_color_id_fkey" FOREIGN KEY ("pokemon_color_id") REFERENCES "pokemon_colors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_color_names" ADD CONSTRAINT "pokemon_color_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_habitat_names" ADD CONSTRAINT "pokemon_habitat_names_pokemon_habitat_id_fkey" FOREIGN KEY ("pokemon_habitat_id") REFERENCES "pokemon_habitats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_habitat_names" ADD CONSTRAINT "pokemon_habitat_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_shape_names" ADD CONSTRAINT "pokemon_shape_names_pokemon_shape_id_fkey" FOREIGN KEY ("pokemon_shape_id") REFERENCES "pokemon_shapes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_shape_names" ADD CONSTRAINT "pokemon_shape_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_shape_awesome_names" ADD CONSTRAINT "pokemon_shape_awesome_names_pokemon_shape_id_fkey" FOREIGN KEY ("pokemon_shape_id") REFERENCES "pokemon_shapes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_shape_awesome_names" ADD CONSTRAINT "pokemon_shape_awesome_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species" ADD CONSTRAINT "pokemon_species_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species" ADD CONSTRAINT "pokemon_species_evolves_from_species_id_fkey" FOREIGN KEY ("evolves_from_species_id") REFERENCES "pokemon_species"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species" ADD CONSTRAINT "pokemon_species_evolution_chain_id_fkey" FOREIGN KEY ("evolution_chain_id") REFERENCES "evolution_chains"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species" ADD CONSTRAINT "pokemon_species_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "pokemon_colors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species" ADD CONSTRAINT "pokemon_species_shape_id_fkey" FOREIGN KEY ("shape_id") REFERENCES "pokemon_shapes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species" ADD CONSTRAINT "pokemon_species_habitat_id_fkey" FOREIGN KEY ("habitat_id") REFERENCES "pokemon_habitats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species" ADD CONSTRAINT "pokemon_species_growth_rate_id_fkey" FOREIGN KEY ("growth_rate_id") REFERENCES "growth_rates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species_names" ADD CONSTRAINT "pokemon_species_names_pokemon_species_id_fkey" FOREIGN KEY ("pokemon_species_id") REFERENCES "pokemon_species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species_names" ADD CONSTRAINT "pokemon_species_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species_descriptions" ADD CONSTRAINT "pokemon_species_descriptions_pokemon_species_id_fkey" FOREIGN KEY ("pokemon_species_id") REFERENCES "pokemon_species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species_descriptions" ADD CONSTRAINT "pokemon_species_descriptions_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species_flavor_text" ADD CONSTRAINT "pokemon_species_flavor_text_pokemon_species_id_fkey" FOREIGN KEY ("pokemon_species_id") REFERENCES "pokemon_species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species_flavor_text" ADD CONSTRAINT "pokemon_species_flavor_text_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species_flavor_text" ADD CONSTRAINT "pokemon_species_flavor_text_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species_egg_groups" ADD CONSTRAINT "pokemon_species_egg_groups_pokemon_species_id_fkey" FOREIGN KEY ("pokemon_species_id") REFERENCES "pokemon_species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species_egg_groups" ADD CONSTRAINT "pokemon_species_egg_groups_egg_group_id_fkey" FOREIGN KEY ("egg_group_id") REFERENCES "egg_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon" ADD CONSTRAINT "pokemon_pokemon_species_id_fkey" FOREIGN KEY ("pokemon_species_id") REFERENCES "pokemon_species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_abilities" ADD CONSTRAINT "pokemon_abilities_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_abilities" ADD CONSTRAINT "pokemon_abilities_ability_id_fkey" FOREIGN KEY ("ability_id") REFERENCES "abilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_ability_past" ADD CONSTRAINT "pokemon_ability_past_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_ability_past" ADD CONSTRAINT "pokemon_ability_past_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_ability_past" ADD CONSTRAINT "pokemon_ability_past_ability_id_fkey" FOREIGN KEY ("ability_id") REFERENCES "abilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_types" ADD CONSTRAINT "pokemon_types_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_types" ADD CONSTRAINT "pokemon_types_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_type_past" ADD CONSTRAINT "pokemon_type_past_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_type_past" ADD CONSTRAINT "pokemon_type_past_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_type_past" ADD CONSTRAINT "pokemon_type_past_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stat_names" ADD CONSTRAINT "stat_names_stat_id_fkey" FOREIGN KEY ("stat_id") REFERENCES "stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stat_names" ADD CONSTRAINT "stat_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_stats" ADD CONSTRAINT "pokemon_stats_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_stats" ADD CONSTRAINT "pokemon_stats_stat_id_fkey" FOREIGN KEY ("stat_id") REFERENCES "stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_moves" ADD CONSTRAINT "pokemon_moves_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_moves" ADD CONSTRAINT "pokemon_moves_version_group_id_fkey" FOREIGN KEY ("version_group_id") REFERENCES "version_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_moves" ADD CONSTRAINT "pokemon_moves_move_id_fkey" FOREIGN KEY ("move_id") REFERENCES "moves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_moves" ADD CONSTRAINT "pokemon_moves_move_learn_method_id_fkey" FOREIGN KEY ("move_learn_method_id") REFERENCES "move_learn_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_game_indices" ADD CONSTRAINT "pokemon_game_indices_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_game_indices" ADD CONSTRAINT "pokemon_game_indices_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_items" ADD CONSTRAINT "pokemon_items_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_items" ADD CONSTRAINT "pokemon_items_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_items" ADD CONSTRAINT "pokemon_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_sprites" ADD CONSTRAINT "pokemon_sprites_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_forms" ADD CONSTRAINT "pokemon_forms_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_forms" ADD CONSTRAINT "pokemon_forms_version_group_id_fkey" FOREIGN KEY ("version_group_id") REFERENCES "version_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_form_names" ADD CONSTRAINT "pokemon_form_names_pokemon_form_id_fkey" FOREIGN KEY ("pokemon_form_id") REFERENCES "pokemon_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_form_names" ADD CONSTRAINT "pokemon_form_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_form_types" ADD CONSTRAINT "pokemon_form_types_pokemon_form_id_fkey" FOREIGN KEY ("pokemon_form_id") REFERENCES "pokemon_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_form_types" ADD CONSTRAINT "pokemon_form_types_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_form_sprites" ADD CONSTRAINT "pokemon_form_sprites_pokemon_form_id_fkey" FOREIGN KEY ("pokemon_form_id") REFERENCES "pokemon_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolution_chains" ADD CONSTRAINT "evolution_chains_baby_trigger_item_id_fkey" FOREIGN KEY ("baby_trigger_item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolution_trigger_names" ADD CONSTRAINT "evolution_trigger_names_evolution_trigger_id_fkey" FOREIGN KEY ("evolution_trigger_id") REFERENCES "evolution_triggers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolution_trigger_names" ADD CONSTRAINT "evolution_trigger_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_evolution" ADD CONSTRAINT "pokemon_evolution_pokemon_species_id_fkey" FOREIGN KEY ("pokemon_species_id") REFERENCES "pokemon_species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_evolution" ADD CONSTRAINT "pokemon_evolution_evolution_trigger_id_fkey" FOREIGN KEY ("evolution_trigger_id") REFERENCES "evolution_triggers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_evolution" ADD CONSTRAINT "pokemon_evolution_evolution_item_id_fkey" FOREIGN KEY ("evolution_item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_evolution" ADD CONSTRAINT "pokemon_evolution_gender_id_fkey" FOREIGN KEY ("gender_id") REFERENCES "genders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_evolution" ADD CONSTRAINT "pokemon_evolution_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_evolution" ADD CONSTRAINT "pokemon_evolution_held_item_id_fkey" FOREIGN KEY ("held_item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_evolution" ADD CONSTRAINT "pokemon_evolution_known_move_id_fkey" FOREIGN KEY ("known_move_id") REFERENCES "moves"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_evolution" ADD CONSTRAINT "pokemon_evolution_known_move_type_id_fkey" FOREIGN KEY ("known_move_type_id") REFERENCES "types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_evolution" ADD CONSTRAINT "pokemon_evolution_party_type_id_fkey" FOREIGN KEY ("party_type_id") REFERENCES "types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_method_names" ADD CONSTRAINT "encounter_method_names_encounter_method_id_fkey" FOREIGN KEY ("encounter_method_id") REFERENCES "encounter_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_method_names" ADD CONSTRAINT "encounter_method_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_condition_names" ADD CONSTRAINT "encounter_condition_names_encounter_condition_id_fkey" FOREIGN KEY ("encounter_condition_id") REFERENCES "encounter_conditions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_condition_names" ADD CONSTRAINT "encounter_condition_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_condition_values" ADD CONSTRAINT "encounter_condition_values_encounter_condition_id_fkey" FOREIGN KEY ("encounter_condition_id") REFERENCES "encounter_conditions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_condition_value_names" ADD CONSTRAINT "encounter_condition_value_names_encounter_condition_value__fkey" FOREIGN KEY ("encounter_condition_value_id") REFERENCES "encounter_condition_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_condition_value_names" ADD CONSTRAINT "encounter_condition_value_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_encounters" ADD CONSTRAINT "pokemon_encounters_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_encounters" ADD CONSTRAINT "pokemon_encounters_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_encounters" ADD CONSTRAINT "pokemon_encounters_location_area_id_fkey" FOREIGN KEY ("location_area_id") REFERENCES "location_areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_encounters" ADD CONSTRAINT "pokemon_encounters_encounter_method_id_fkey" FOREIGN KEY ("encounter_method_id") REFERENCES "encounter_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_condition_value_map" ADD CONSTRAINT "encounter_condition_value_map_pokemon_encounter_id_fkey" FOREIGN KEY ("pokemon_encounter_id") REFERENCES "pokemon_encounters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_condition_value_map" ADD CONSTRAINT "encounter_condition_value_map_encounter_condition_value_id_fkey" FOREIGN KEY ("encounter_condition_value_id") REFERENCES "encounter_condition_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_groups" ADD CONSTRAINT "version_groups_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_group_names" ADD CONSTRAINT "version_group_names_version_group_id_fkey" FOREIGN KEY ("version_group_id") REFERENCES "version_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_group_names" ADD CONSTRAINT "version_group_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "versions" ADD CONSTRAINT "versions_version_group_id_fkey" FOREIGN KEY ("version_group_id") REFERENCES "version_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_names" ADD CONSTRAINT "version_names_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_names" ADD CONSTRAINT "version_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_group_move_learn_methods" ADD CONSTRAINT "version_group_move_learn_methods_version_group_id_fkey" FOREIGN KEY ("version_group_id") REFERENCES "version_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_group_move_learn_methods" ADD CONSTRAINT "version_group_move_learn_methods_move_learn_method_id_fkey" FOREIGN KEY ("move_learn_method_id") REFERENCES "move_learn_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_group_regions" ADD CONSTRAINT "version_group_regions_version_group_id_fkey" FOREIGN KEY ("version_group_id") REFERENCES "version_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_group_regions" ADD CONSTRAINT "version_group_regions_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_move_id_fkey" FOREIGN KEY ("move_id") REFERENCES "moves"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_version_group_id_fkey" FOREIGN KEY ("version_group_id") REFERENCES "version_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_version_group_names" ADD CONSTRAINT "machine_version_group_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berry_firmness_names" ADD CONSTRAINT "berry_firmness_names_berry_firmness_id_fkey" FOREIGN KEY ("berry_firmness_id") REFERENCES "berry_firmnesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berry_firmness_names" ADD CONSTRAINT "berry_firmness_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berry_flavor_names" ADD CONSTRAINT "berry_flavor_names_berry_flavor_id_fkey" FOREIGN KEY ("berry_flavor_id") REFERENCES "berry_flavors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berry_flavor_names" ADD CONSTRAINT "berry_flavor_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berries" ADD CONSTRAINT "berries_berry_firmness_id_fkey" FOREIGN KEY ("berry_firmness_id") REFERENCES "berry_firmnesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berries" ADD CONSTRAINT "berries_natural_gift_type_id_fkey" FOREIGN KEY ("natural_gift_type_id") REFERENCES "types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berries" ADD CONSTRAINT "berries_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berry_flavor_map" ADD CONSTRAINT "berry_flavor_map_berry_id_fkey" FOREIGN KEY ("berry_id") REFERENCES "berries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berry_flavor_map" ADD CONSTRAINT "berry_flavor_map_berry_flavor_id_fkey" FOREIGN KEY ("berry_flavor_id") REFERENCES "berry_flavors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_types" ADD CONSTRAINT "contest_types_berry_flavor_id_fkey" FOREIGN KEY ("berry_flavor_id") REFERENCES "berry_flavors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_type_names" ADD CONSTRAINT "contest_type_names_contest_type_id_fkey" FOREIGN KEY ("contest_type_id") REFERENCES "contest_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_type_names" ADD CONSTRAINT "contest_type_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_effect_entries" ADD CONSTRAINT "contest_effect_entries_contest_effect_id_fkey" FOREIGN KEY ("contest_effect_id") REFERENCES "contest_effects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_effect_entries" ADD CONSTRAINT "contest_effect_entries_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_effect_flavor_text" ADD CONSTRAINT "contest_effect_flavor_text_contest_effect_id_fkey" FOREIGN KEY ("contest_effect_id") REFERENCES "contest_effects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_effect_flavor_text" ADD CONSTRAINT "contest_effect_flavor_text_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "super_contest_effect_flavor_text" ADD CONSTRAINT "super_contest_effect_flavor_text_super_contest_effect_id_fkey" FOREIGN KEY ("super_contest_effect_id") REFERENCES "super_contest_effects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "super_contest_effect_flavor_text" ADD CONSTRAINT "super_contest_effect_flavor_text_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "natures" ADD CONSTRAINT "natures_decreased_stat_id_fkey" FOREIGN KEY ("decreased_stat_id") REFERENCES "stats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "natures" ADD CONSTRAINT "natures_increased_stat_id_fkey" FOREIGN KEY ("increased_stat_id") REFERENCES "stats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "natures" ADD CONSTRAINT "natures_hates_flavor_id_fkey" FOREIGN KEY ("hates_flavor_id") REFERENCES "berry_flavors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "natures" ADD CONSTRAINT "natures_likes_flavor_id_fkey" FOREIGN KEY ("likes_flavor_id") REFERENCES "berry_flavors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nature_names" ADD CONSTRAINT "nature_names_nature_id_fkey" FOREIGN KEY ("nature_id") REFERENCES "natures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nature_names" ADD CONSTRAINT "nature_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nature_pokeathlon_stat_affects" ADD CONSTRAINT "nature_pokeathlon_stat_affects_nature_id_fkey" FOREIGN KEY ("nature_id") REFERENCES "natures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nature_pokeathlon_stat_affects" ADD CONSTRAINT "nature_pokeathlon_stat_affects_pokeathlon_stat_id_fkey" FOREIGN KEY ("pokeathlon_stat_id") REFERENCES "pokeathlon_stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nature_battle_style_preferences" ADD CONSTRAINT "nature_battle_style_preferences_nature_id_fkey" FOREIGN KEY ("nature_id") REFERENCES "natures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nature_battle_style_preferences" ADD CONSTRAINT "nature_battle_style_preferences_move_battle_style_id_fkey" FOREIGN KEY ("move_battle_style_id") REFERENCES "move_battle_styles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokeathlon_stat_names" ADD CONSTRAINT "pokeathlon_stat_names_pokeathlon_stat_id_fkey" FOREIGN KEY ("pokeathlon_stat_id") REFERENCES "pokeathlon_stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokeathlon_stat_names" ADD CONSTRAINT "pokeathlon_stat_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characteristics" ADD CONSTRAINT "characteristics_stat_id_fkey" FOREIGN KEY ("stat_id") REFERENCES "stats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characteristic_descriptions" ADD CONSTRAINT "characteristic_descriptions_characteristic_id_fkey" FOREIGN KEY ("characteristic_id") REFERENCES "characteristics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characteristic_descriptions" ADD CONSTRAINT "characteristic_descriptions_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gender_names" ADD CONSTRAINT "gender_names_gender_id_fkey" FOREIGN KEY ("gender_id") REFERENCES "genders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gender_names" ADD CONSTRAINT "gender_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokedexes" ADD CONSTRAINT "pokedexes_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokedex_names" ADD CONSTRAINT "pokedex_names_pokedex_id_fkey" FOREIGN KEY ("pokedex_id") REFERENCES "pokedexes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokedex_names" ADD CONSTRAINT "pokedex_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokedex_descriptions" ADD CONSTRAINT "pokedex_descriptions_pokedex_id_fkey" FOREIGN KEY ("pokedex_id") REFERENCES "pokedexes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokedex_descriptions" ADD CONSTRAINT "pokedex_descriptions_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species_pokedex_numbers" ADD CONSTRAINT "pokemon_species_pokedex_numbers_pokemon_species_id_fkey" FOREIGN KEY ("pokemon_species_id") REFERENCES "pokemon_species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_species_pokedex_numbers" ADD CONSTRAINT "pokemon_species_pokedex_numbers_pokedex_id_fkey" FOREIGN KEY ("pokedex_id") REFERENCES "pokedexes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_group_pokedexes" ADD CONSTRAINT "version_group_pokedexes_version_group_id_fkey" FOREIGN KEY ("version_group_id") REFERENCES "version_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_group_pokedexes" ADD CONSTRAINT "version_group_pokedexes_pokedex_id_fkey" FOREIGN KEY ("pokedex_id") REFERENCES "pokedexes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pal_park_area_names" ADD CONSTRAINT "pal_park_area_names_pal_park_area_id_fkey" FOREIGN KEY ("pal_park_area_id") REFERENCES "pal_park_areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pal_park_area_names" ADD CONSTRAINT "pal_park_area_names_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pal_park_encounters" ADD CONSTRAINT "pal_park_encounters_pokemon_species_id_fkey" FOREIGN KEY ("pokemon_species_id") REFERENCES "pokemon_species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pal_park_encounters" ADD CONSTRAINT "pal_park_encounters_pal_park_area_id_fkey" FOREIGN KEY ("pal_park_area_id") REFERENCES "pal_park_areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
