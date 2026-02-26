# Evolve — Pokédex & Team Builder

A full-stack Pokémon reference application and competitive team builder covering all nine generations.

**Live demo:** [evolve-pokedex.netlify.app](https://evolve-pokedex.netlify.app)

---

## Overview

Evolve is a production-quality web application built to demonstrate end-to-end TypeScript type safety, performant server-side data modelling, and a polished, accessible UI. It serves as both a comprehensive Pokémon reference (Pokédex, moves, abilities, items, locations, evolution chains) and a feature-rich competitive team builder — including PokePaste import/export, generation-aware stat systems, and live team coverage analysis.

The project prioritises real engineering concerns: lazy data loading to eliminate unnecessary network requests, Prisma selector discipline to avoid over-fetching, a fully inferred tRPC type chain from database to component, and interactive data visualisations built without charting libraries.

---

## Tech Stack

| Layer                 | Technology                                                                          |
| --------------------- | ----------------------------------------------------------------------------------- |
| Framework             | [Next.js](https://nextjs.org/) 16 (Pages Router)                                    |
| Language              | TypeScript 5                                                                        |
| API                   | [tRPC](https://trpc.io/) v11                                                        |
| ORM                   | [Prisma](https://www.prisma.io/) v6                                                 |
| Database              | PostgreSQL                                                                          |
| Styling               | [Tailwind CSS](https://tailwindcss.com/) v4                                         |
| State / data fetching | [TanStack Query](https://tanstack.com/query) v5 (via tRPC)                          |
| Schema validation     | [Zod](https://zod.dev/) v4                                                          |
| Graph layout          | [@xyflow/react](https://reactflow.dev/) + [Dagre](https://github.com/dagrejs/dagre) |
| Testing               | [Vitest](https://vitest.dev/)                                                       |
| Linting / formatting  | ESLint 10 + Prettier                                                                |

---

## Getting Started

### Requirements

- Node.js ≥ 18
- PostgreSQL
- pnpm

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd next-trpc-pokedex

# 2. Install dependencies
pnpm install

# 3. Create an environment file and fill in your DATABASE_URL
touch .env

# 4. Apply migrations and seed the database
pnpm db-reset

# 5. Start the development server
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Commands

```bash
pnpm dev          # prisma generate + start the Next.js development server
pnpm build        # prisma generate + next build
pnpm dx           # Run migrations + start dev server and Prisma Studio in parallel
pnpm db-reset     # Drop and recreate the local database
pnpm test-unit    # Run Vitest unit tests
```

---

## Features

### Pokédex & Reference

- **Pokédex browser** — national and regional Pokédex views with generation filtering, sprite display, and instant search backed by a client-side cache loaded lazily on demand
- **Pokémon detail pages** — base stats with interactive hexagon visualisation, abilities, full learnset by learn method, location encounters, evolution chains, Pokédex flavour text, and official artwork
- **Form switching** — Mega Evolutions, Gigantamax, regional variants (Alolan, Galarian, Hisuian, Paldean), and all alternate forms with sprite and stat updates
- **Type chart** — full 18×18 effectiveness matrix with a condensed interactive mobile view
- **Type detail pages** — all Pokémon and moves belonging to a type, with damage-class breakdown
- **Move database** — searchable and filterable move list; individual move pages show power, accuracy, PP, priority, effect chance, TM number, and every Pokémon that learns the move
- **Ability database** — generation-filtered ability list; individual pages list all Pokémon with that ability and whether it is hidden
- **Item catalog** — full item database with categories, descriptions, and sprites
- **Location encounters** — location listing with per-area encounter tables showing Pokémon, methods, encounter levels, and conditions
- **Evolution chains** — interactive branching trees rendered with React Flow and Dagre, displaying all evolution conditions (level, item, trade, friendship, time of day, and more)

### Team Builder

- **Generation selector (I–IX)** — all data (Pokémon, moves, items, abilities, natures, stat system) is scoped to the chosen generation; switching generation resets the team cleanly
- **Six-slot team grid** — add, remove, and switch between slots with duplicate-species prevention
- **Pokémon search** — filtered by generation availability; enforces one Mega/Gigantamax per team
- **Stat editor** — interactive hexagon drag-to-edit; supports Gen I–II DV system (0–15, no 510 EV cap) and Gen III+ IV/EV system (0–31, 510 total cap); displays calculated final stats at Level 50 or 100
- **Gender & shiny** — gender selection respecting per-species gender rates; shiny toggle with sprite (Gen II+) and gendered sprites where available
- **Ability, nature, and held-item pickers** — generation-gated; move picker filtered to moves learnable in exactly the selected generation's games
- **Tera Type** — Gen IX only; pick any of the 18 standard types or Stellar via a visual type-badge grid
- **Mega / Primal / Gigantamax rules** — Mega Stones auto-assigned with item slot locked; Rayquaza-Mega enforces Dragon Ascent in slot 1 and no held item; only one special form permitted per team
- **Team type weaknesses** — live panel showing every offensive type that hits at least one team member super effectively and is not fully resisted by any member
- **PokePaste import / export** — paste a Pokémon Showdown / PokePaste formatted team to populate all six slots (species, ability, nature, item, moves, EVs, IVs, level, gender, shiny, Tera Type resolved lazily as API data loads); export the current team to clipboard in the same format

---

## Architecture

**End-to-end type safety** — tRPC v11 with Zod validation means every API procedure has a fully inferred input and output type. Output types are exported from the root router and consumed directly by frontend components, eliminating all manual type duplication. The Prisma ORM and tRPC type chain are kept clean: `any` is banned at the router boundary so type inference flows through to React components without escape hatches.

**Lazy cache loading** — the global Pokédex cache (three heavy queries totalling ~4 MB) is gated behind an `ensureCacheLoaded()` callback and fires only when a user first opens the search modal or visits a Pokédex page. Pokémon detail, move, ability, and location pages load without triggering the cache at all.

**Lean Prisma selectors** — every router procedure uses a minimal `select` object. The Pokémon detail selector, for example, omits `typePast`, `abilityPast`, `forms`, `gameIndices`, `heldItems`, and audit timestamps that the UI never reads. The moveset selector omits `machines`, version group version arrays, and learn-method localised name arrays, reducing payload size significantly.

**Interactive hexagon stat editor** — the stat hexagon is built from scratch using SVG with pointer-event drag handlers, no charting library. Dragging a vertex updates the corresponding stat in real time with EV/IV constraints enforced.

**React Flow evolution graphs** — evolution chains are laid out automatically by Dagre and rendered as interactive node graphs. The layout algorithm accounts for branching width, rank count, and viewport size to fill the container without overflow. Cross-chain evolution edge cases (Pokémon whose DB chain ID differs from their evolutionary family) are detected and merged at the API layer.

**Generation-aware team builder** — a single `getGenFeatures(gen)` utility drives conditional rendering of ability, nature, and item pickers; DV vs IV max values; EV cap presence; and stat formula selection. Changing generation clears the team and re-scopes all queries.

---

## Project Structure

```
src/
├── pages/                   # Next.js pages (file-system routing)
│   ├── index.tsx            # Home — featured Pokémon, quick-access navigation
│   ├── pokedex/             # Pokédex browser (national + generation views)
│   ├── pokemon/[id].tsx     # Pokémon detail
│   ├── pokemon-types/       # Type listing + type detail
│   ├── moves/               # Move listing + move detail
│   ├── abilities/           # Ability listing + ability detail
│   ├── items/               # Item catalog + item detail
│   ├── locations/           # Location listing + encounter detail
│   ├── evolutions/          # Evolution chain browser
│   └── teams/               # Team builder
│
├── server/
│   ├── routers/             # tRPC procedure definitions
│   │   ├── pokemon.ts       # Pokémon data, moveset, featured
│   │   ├── pokedex.ts       # Pokédex entries, generation IDs, regional dexes
│   │   ├── pokemon-types.ts # Type effectiveness, type ↔ Pokémon/move associations
│   │   ├── moves.ts         # Move list and detail
│   │   ├── abilities.ts     # Ability list and detail
│   │   ├── items.ts         # Item list, holdable items (with generation filter)
│   │   ├── locations.ts     # Location list and encounter data
│   │   ├── evolution-chains.ts
│   │   └── _app.ts          # Root router + exported output types
│   ├── trpc.ts              # tRPC initialisation and context
│   └── prisma.ts            # Prisma client singleton
│
├── components/
│   ├── layout/              # PageHeading, PageContent, HeaderMenu, footer
│   ├── pokemon/             # Artwork, stats, abilities, moves, encounters, forms
│   ├── pokemon-types/       # TypeBadge, TypeBadgesDisplay, TypeEffectivenessChart
│   ├── evolutions/          # EvolutionChain, MobileEvolutionChain
│   ├── locations/           # LocationEncounterDetail
│   ├── pokedex/             # Generation browser components
│   ├── teams/               # TeamBuilder, SlotEditor, StatsEditor, StatTable,
│   │                        #   StatRow, TeamGrid, SlotCard, AbilityPicker,
│   │                        #   NaturePicker, ItemPicker, MoveSlot, GenderPicker,
│   │                        #   TeraPicker, GenerationFilter, ImportExportButtons,
│   │                        #   TeamTypeWeaknesses
│   └── ui/                  # Shared primitives — Badge, Button, DataTable, Modal,
│                            #   SearchBar, SectionCard, Sprite, TabView, icons
│
├── lib/
│   ├── contexts/            # PokedexCacheContext — lazy client-side Pokémon cache
│   └── types/               # Shared TypeScript types (PokemonListData, etc.)
│
└── utils/
    ├── pokemon-stats.ts     # Stat formula (Gen III+), DV/EV helpers
    ├── pokemon-types.ts     # Type efficacy map builder, truncateTypeName
    ├── generation-rules.ts  # getGenFeatures() — per-gen feature flags
    ├── mega-requirements.ts # Mega Stone lookup, isGmaxForm, MEGA_AVAILABLE_GENS
    ├── natures.ts           # Nature list with stat modifiers
    ├── pokepaste.ts         # PokePaste parser + team exporter
    ├── showdown-export.ts   # formatShowdownExport() — single-member serialiser
    ├── colors.ts            # getTypeColor(), getStatColor(), getDamageFactorColor()
    └── text.ts              # capitalizeName(), slug helpers
```

---

## Data Model

The database is seeded from [PokéAPI](https://pokeapi.co/) data. Key model groups:

| Group      | Models                                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Pokémon    | `Pokemon`, `PokemonSpecies`, `PokemonForm`, `PokemonSprites`, `PokemonAbility`, `PokemonType`, `PokemonStat`, `PokemonMove`, `PokemonEncounter` |
| Moves      | `Move`, `MoveMetaData`, `MoveDamageClass`, `MoveLearnMethod`, `MoveStatChange`, `Machine`                                                       |
| Types      | `Type`, `TypeEfficacy`, `TypeEfficacyPast`                                                                                                      |
| Abilities  | `Ability`, `AbilityEffectText`, `AbilityFlavorText`                                                                                             |
| Items      | `Item`, `ItemCategory`, `ItemAttribute`, `ItemFlavorText`, `Berry`                                                                              |
| Evolutions | `EvolutionChain`, `PokemonEvolution`, `EvolutionTrigger`                                                                                        |
| Locations  | `Location`, `LocationArea`, `PokemonEncounter`, `EncounterMethod`, `EncounterCondition`                                                         |
| Versions   | `Version`, `VersionGroup`, `Generation`, `Region`, `Pokedex`                                                                                    |
| Metadata   | `Nature`, `Stat`, `Language`, `EggGroup`, `GrowthRate`                                                                                          |

---

## Generation Support Matrix

| Feature         | Gen I   | Gen II  | Gen III–VIII    | Gen IX    |
| --------------- | ------- | ------- | --------------- | --------- |
| Pokémon & moves | ✓       | ✓       | ✓               | ✓         |
| Held items      | —       | ✓       | ✓               | ✓         |
| Abilities       | —       | —       | ✓               | ✓         |
| Natures         | —       | —       | ✓               | ✓         |
| Gender & shiny  | —       | ✓       | ✓               | ✓         |
| IV range        | DV 0–15 | DV 0–15 | IV 0–31         | IV 0–31   |
| EV cap          | none    | none    | 510 total       | 510 total |
| Mega Evolution  | —       | —       | Gen VI–VII only | ✓         |
| Gigantamax      | —       | —       | Gen VIII only   | —         |
| Tera Type       | —       | —       | —               | ✓         |

---

## API Reference

All endpoints are tRPC procedures accessed via the React Query hooks generated by `@trpc/react-query`. The root router is assembled in `src/server/routers/_app.ts`.

### Key procedures

```
pokemon.pokemonWithSpecies        { id: number } | { name: string }
pokemon.moveset                   { pokemonId: number, generationId: number }
pokemon.featured                  —
pokedex.pokedexByGeneration       —
pokedex.generationPokemonIds      —
types.getAllTypeEfficacies         —
types.getTypeWithPokemonAndMoves  { typeName: string }
moves.list                        { generationId?: number, typeId?: number }
moves.byName                      { name: string }
abilities.list                    { generationId?: number }
abilities.byName                  { name: string }
items.holdable                    { generationId: number }
items.byName                      { name: string }
locations.list                    —
locations.byName                  { name: string }
evolutionChains.bySpeciesId       { speciesId: number }
```

Output types for every procedure are exported from `src/server/routers/_app.ts` and consumed directly by frontend components, eliminating manual type duplication.

---

## Roadmap

- **AI-assisted team building** — suggest team compositions, coverage improvements, and EV spreads using an LLM with knowledge of the current metagame
- **Damage calculator** — compute damage ranges between two Pokémon given moves, items, abilities, EVs/IVs, natures, field conditions, and critical hit scenarios
- Pokémon comparison tool
- Saved teams with shareable URLs
- Move filter by learn method (TM, egg move, tutor)
- Held-item detail tooltips inline in the team builder

---

## License

MIT
