// Pokemon Data Seeding System with Rate Limiting and Proxy
// Uses Prisma ORM and proper error handling

import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import {
  AppConfig,
  SeedingProgress,
  SeedingStats,
  NamedAPIResource,
  APIResourceList,
} from "@/lib/types/pokemon-seeder";

// Initialize Prisma
const prisma: PrismaClient = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Configuration
const CONFIG: AppConfig = {
  STANDARD_PROXY_BASE_URL: process.env.STANDARD_PROXY_BASE_URL || "",
  POKEAPI_BASE_URL: "https://pokeapi.co/api/v2/",
  RATE_LIMIT_MS: 1000,
  MAX_RETRIES: 3,
  BATCH_SIZE: 10,
  PREMIUM_PROXY: {
    host: process.env.PROXY_HOST || "",
    port: parseInt(process.env.PROXY_PORT || ""),
    username: process.env.PROXY_USERNAME || "",
    password: process.env.PROXY_PASSWORD || "",
  },
};

// Generic seed framework interfaces
interface SeedingConfig<T> {
  endpoint: string;
  categoryName: keyof SeedingProgress;
  mode?: "premium" | "standard";
  batchSize?: number;
  progressLogInterval?: number;
  timeoutMs?: number;
  maxRetries?: number;
}

interface SeedingProcessor<T, R = void> {
  processItem(item: NamedAPIResource, mode: "premium" | "standard"): Promise<R>;
  postProcess?(results: R[]): Promise<void>;
  getExistingIds?(): Promise<Set<number>>;
}

export class PokemonDataSeeder {
  // Typed class properties
  private cache: Map<string, any>;
  private processedUrls: Set<string>;
  public progress: SeedingProgress;
  public stats: SeedingStats;
  private evolutionMappings: Map<number, number>;
  private evolutionChainMappings: Map<number, number>;
  private isPerformingCleanup: boolean = false;
  constructor() {
    this.cache = new Map<string, any>();
    this.processedUrls = new Set<string>();
    this.progress = {
      languages: { completed: false, count: 0, failed: 0 },
      generations: { completed: false, count: 0, failed: 0 },
      regions: { completed: false, count: 0, failed: 0 },
      types: { completed: false, count: 0, failed: 0 },
      abilities: { completed: false, count: 0, failed: 0 },
      moves: { completed: false, count: 0, failed: 0 },
      machines: { completed: false, count: 0, failed: 0 },
      items: { completed: false, count: 0, failed: 0 },
      pokemonSpecies: { completed: false, count: 0, failed: 0 },
      pokemon: { completed: false, count: 0, failed: 0 },
      evolutionChains: { completed: false, count: 0, failed: 0 },
      locations: { completed: false, count: 0, failed: 0 },
      locationAreas: { completed: false, count: 0, failed: 0 },
      encounters: { completed: false, count: 0, failed: 0 },
      flavorTexts: { completed: false, count: 0, failed: 0 },
      gameIndices: { completed: false, count: 0, failed: 0 },
      pokemonForms: { completed: false, count: 0, failed: 0 },
      versionGroups: { completed: false, count: 0, failed: 0 },
      pokedexes: { completed: false, count: 0, failed: 0 },
      characteristics: { completed: false, count: 0, failed: 0 },
      genders: { completed: false, count: 0, failed: 0 },
      natures: { completed: false, count: 0, failed: 0 },
      pokeathlonStats: { completed: false, count: 0, failed: 0 },
      palParkAreas: { completed: false, count: 0, failed: 0 },
      berries: { completed: false, count: 0, failed: 0 },
    };
    this.stats = {
      totalRequests: 0,
      failedRequests: 0,
      startTime: null,
      errors: [],
    };
    this.evolutionMappings = new Map();
    this.evolutionChainMappings = new Map();
  }

  // ======================================================
  //                Primary Method
  // ======================================================

  // Modified run() method for incremental seed
  async run(): Promise<void> {
    // Set up process monitoring for unhandled errors
    process.on("unhandledRejection", (reason, promise) => {
      const errorMsg = `Unhandled Rejection at: ${promise}, reason: ${reason}`;
      console.error(errorMsg);
      this.log(errorMsg, "error");
      this.stats.errors.push({
        url: "unhandled-rejection",
        error: String(reason),
        timestamp: new Date(),
      });
    });

    process.on("uncaughtException", (error) => {
      const errorMsg = `Uncaught Exception: ${error.message}\nStack: ${error.stack}`;
      console.error(errorMsg);
      this.log(errorMsg, "error");
      this.stats.errors.push({
        url: "uncaught-exception",
        error: error.message,
        timestamp: new Date(),
      });
      // Don't exit immediately - let the process try to continue
    });
    try {
      this.stats.startTime = new Date();
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
      this.log("📡 Database connected successfully");
      // Check current state
      await this.getModelStatistics();
      this.log("🌱 Seeding the database...");
      // PHASE 1: Foundation (safe to re-run)
      this.log("\n\n=== 🧩 PHASE 1: Foundation Data ===\n\n");
      await this.delay(3000);
      await this.seedLanguages("premium");
      await this.seedRegions("premium");
      await this.seedGenerations("premium");

      // PHASE 2: Game Infrastructure (safe to re-run)
      this.log("\n\n=== 🧩 PHASE 2: Game Infrastructure ===\n\n");
      await this.delay(3000);
      await this.seedVersionGroups("premium");

      // PHASE 3: Supplementary Data (safe to re-run)
      this.log("\n\n=== 🧩 PHASE 3: Supplementary Data ===\n\n");
      await this.delay(3000);
      await this.seedSupplementaryData();
      await this.seedItemSupplementaryData();
      await this.seedStats("premium");

      // PHASE 4: Core Game Mechanics (safe to re-run)
      this.log("\n\n=== 🧩 PHASE 4: Core Game Mechanics ===\n\n");
      await this.delay(3000);
      await this.seedTypes("premium");
      await this.seedTypeEfficacyMatrix();
      await this.seedAbilities("premium");

      // PHASE 5: Move System (check for existing meta records)
      this.log("\n\n=== 🧩 PHASE 5: Move System ===\n\n");
      await this.delay(3000);
      await this.debugMoveMetaRecords();
      await this.seedMoves("premium");

      // PHASE 6: Item System (safe to re-run)
      this.log("\n\n=== 🧩 PHASE 6: Item System ===\n\n");
      await this.delay(3000);
      await this.seedItems("premium");
      await this.seedMachines("premium");

      // PHASE 7: Additional Game Systems (safe to re-run)
      this.log("\n\n=== 🧩 PHASE 7: Additional Game Systems ===\n\n");
      await this.delay(3000);
      await this.seedBerries("premium");
      await this.seedNatures("premium");
      await this.seedCharacteristics("premium");
      await this.seedGenders("premium");
      await this.seedPokeathlonStats("premium");

      // PHASE 8: Location System (safe to re-run)
      this.log("\n\n=== 🧩 PHASE 8: Location System ===\n\n");
      await this.delay(3000);
      await this.seedLocations("premium");
      await this.seedLocationAreas("premium");
      await this.seedPalParkAreas("premium");

      // PHASE 9: Encounter Setup (safe to re-run)
      this.log("\n\n=== 🧩 PHASE 9: Encounter Setup ===\n\n");
      await this.delay(3000);
      await this.seedEncounterConditions("premium");
      await this.seedEncounterMethods("premium");
      await this.seedEvolutionTriggers("premium");

      // PHASE 10: Pokemon Data (mostly safe with upsert)
      this.log("\n\n=== 🧩 PHASE 10: Pokemon Data ===\n\n");
      await this.delay(3000);
      await this.seedPokemonSpecies("premium");
      await this.seedEvolutionChains("premium");
      await this.seedPokedexes("premium");
      await this.seedPokemon("premium");
      await this.seedPokemonSpeciesVarieties("premium");
      await this.seedGenderSpeciesAssociations("premium");

      // // Final statistics
      await this.getModelStatistics();
      const summary = await this.getProgressSummary();
      this.log(`🌱 Database seed completed! ${summary}`);
    } catch (error: unknown) {
      this.log(`❌ Fatal error during seed: ${(error as Error).message}`, "error");
      throw error;
    } finally {
      await prisma.$disconnect();
      await this.cache.clear();
      this.log("Database connection closed");
      process.exit(0);
    }
  }

  // ======================================================
  //                Model Convenience Methods
  // ======================================================

  async getModelStatistics(): Promise<void> {
    try {
      const [
        languageCount,
        generationCount,
        regionCount,
        typeCount,
        abilityCount,
        moveCount,
        itemCount,
        speciesCount,
        pokemonCount,
        locationCount,
        encounterCount,
        totalRecords,
      ] = await Promise.all([
        prisma.language.count(),
        prisma.generation.count(),
        prisma.region.count(),
        prisma.type.count(),
        prisma.ability.count(),
        prisma.move.count(),
        prisma.item.count(),
        prisma.pokemonSpecies.count(),
        prisma.pokemon.count(),
        prisma.location.count(),
        prisma.pokemonEncounter.count(),
        prisma.$queryRaw`SELECT COUNT(*) FROM (
        SELECT 'language' as table_name UNION ALL
        SELECT 'generation' UNION ALL SELECT 'region' UNION ALL SELECT 'type' UNION ALL
        SELECT 'ability' UNION ALL SELECT 'move' UNION ALL SELECT 'item' UNION ALL
        SELECT 'pokemon_species' UNION ALL SELECT 'pokemon' UNION ALL SELECT 'location'
      ) tables`,
      ]);

      console.log("\n" + "=".repeat(50));
      console.log("📊 POKEMON DATABASE OVERVIEW");
      console.log("=".repeat(50));
      console.log(`Languages: ${languageCount}`);
      console.log(`Generations: ${generationCount}`);
      console.log(`Regions: ${regionCount}`);
      console.log(`Types: ${typeCount}`);
      console.log(`Abilities: ${abilityCount}`);
      console.log(`Moves: ${moveCount}`);
      console.log(`Items: ${itemCount}`);
      console.log(`Pokemon Species: ${speciesCount}`);
      console.log(`Pokemon: ${pokemonCount}`);
      console.log(`Locations: ${locationCount}`);
      console.log(`Encounters: ${encounterCount.toLocaleString()}`);
      console.log("=".repeat(50) + "\n");
    } catch (error: unknown) {
      this.log(`❌ Failed to generate database statistics: ${(error as Error).message}`, "error");
      throw error;
    }
  }

  // ======================================================
  //                Utility Methods
  // ======================================================

  async delay(ms: number = CONFIG.RATE_LIMIT_MS): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  log(message: string, level: "info" | "warn" | "error" | "debug" = "info"): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logMessage);
  }

  private async logMemoryUsage(context: string = ""): Promise<void> {
    const used = process.memoryUsage();
    const formatMB = (bytes: number) => Math.round((bytes / 1024 / 1024) * 100) / 100;

    const memoryInfo = [
      `Memory usage${context ? ` (${context})` : ""}:`,
      `  RSS: ${formatMB(used.rss)} MB`,
      `  Heap Used: ${formatMB(used.heapUsed)} MB`,
      `  Heap Total: ${formatMB(used.heapTotal)} MB`,
      `  External: ${formatMB(used.external)} MB`,
    ].join("\n");

    this.log(memoryInfo);

    // Warn if memory usage is getting high (over 1GB RSS)
    if (used.rss > 1024 * 1024 * 1024) {
      this.log(`⚠️ High memory usage detected: ${formatMB(used.rss)} MB RSS`, "warn");
    }
  }

  private async cleanupMemory(context: string = ""): Promise<void> {
    try {
      // More aggressive cache clearing
      const cacheSize = this.cache.size;
      this.cache.clear();
      this.log(`🧹 Cleared ALL cache: ${cacheSize} entries removed`);

      // Clear processed URLs completely
      const urlsSize = this.processedUrls.size;
      this.processedUrls.clear();
      this.log(`🧹 Cleared processed URLs: ${urlsSize} entries removed`);

      // Clear evolution mappings if they exist
      if (this.evolutionMappings && this.evolutionMappings.size > 0) {
        const evolutionSize = this.evolutionMappings.size;
        this.evolutionMappings.clear();
        this.log(`🧹 Cleared evolution mappings: ${evolutionSize} entries removed`);
      }

      if (this.evolutionChainMappings && this.evolutionChainMappings.size > 0) {
        const chainSize = this.evolutionChainMappings.size;
        this.evolutionChainMappings.clear();
        this.log(`🧹 Cleared evolution chain mappings: ${chainSize} entries removed`);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        this.log(`🗑️ Forced garbage collection ${context}`);
      }

      // Wait a bit longer for cleanup to take effect
      await this.delay(3000);

      // Log memory after cleanup
      this.logMemoryUsage(`After cleanup ${context}`);
    } catch (error) {
      this.log(`Failed to perform memory cleanup: ${(error as Error).message}`, "warn");
    }
  }

  // Force memory cleanup when memory gets high
  private async checkAndCleanupMemory(context: string = ""): Promise<void> {
    // Prevent duplicate cleanup calls
    if (this.isPerformingCleanup) {
      this.log(`Skipping cleanup (already in progress) ${context}`, "debug");
      return;
    }

    const used = process.memoryUsage();
    const rssGB = used.rss / (1024 * 1024 * 1024);

    // If RSS is over 800MB, perform cleanup
    if (used.rss > 800 * 1024 * 1024) {
      this.isPerformingCleanup = true;
      try {
        this.log(`🚨 High memory usage detected (${rssGB.toFixed(2)}GB), performing cleanup...`, "warn");
        await this.cleanupMemory(context);

        // Add a small delay to let cleanup take effect
        await this.delay(2000);
      } finally {
        this.isPerformingCleanup = false;
      }
    }
  }

  async getProgressSummary(): Promise<string> {
    const completed = Object.values(this.progress).filter((p) => p.completed).length;
    const total = Object.keys(this.progress).length;
    const totalProcessed = Object.values(this.progress).reduce((sum, p) => sum + p.count, 0);
    const totalFailed = Object.values(this.progress).reduce((sum, p) => sum + p.failed, 0);

    return `Progress: ${completed}/${total} categories completed, ${totalProcessed} items processed, ${totalFailed} failed`;
  }

  extractIdFromUrl(url: string | null | undefined): number | null {
    if (!url) return null;
    const match = url.match(/\/(\d+)\/$/);
    return match ? parseInt(match[1]) : null;
  }

  // ======================================================
  //                HTTP Methods
  // ======================================================

  async fetchWithStandardProxy(url: string, retries: number = 0): Promise<any> {
    try {
      this.stats.totalRequests++;
      const proxyUrl = `${CONFIG.STANDARD_PROXY_BASE_URL}${encodeURIComponent(url)}`;

      await this.delay();

      const response = await axios.get(proxyUrl, {
        headers: { Accept: "application/json" },
        timeout: 10000, // 10 second timeout
      });

      // For your allorigins proxy:
      if (response.data && response.data.contents) {
        const data = JSON.parse(response.data.contents);
        return data;
      }
      throw new Error("Invalid proxy response structure");
    } catch (error: unknown) {
      this.stats.failedRequests++;

      if (retries < CONFIG.MAX_RETRIES) {
        this.log(`Retry ${retries + 1}/${CONFIG.MAX_RETRIES} for ${url}: ${(error as Error).message}`, "warn");
        await this.delay(3000); // Wait longer before retry
        return this.fetchWithStandardProxy(url, retries + 1);
      }

      this.stats.errors.push({
        url,
        error: (error as Error).message,
        timestamp: new Date(),
      });
      this.log(`Failed to fetch ${url} after ${CONFIG.MAX_RETRIES} retries: ${(error as Error).message}`, "error");
      throw error;
    }
  }

  async fetchWithPremiumProxy(url: string, retries: number = 0): Promise<any> {
    const { host, port, username, password } = CONFIG.PREMIUM_PROXY;

    if (!host || !port || !username || !password) {
      throw new Error("Missing premium proxy configuration");
    }

    try {
      this.stats.totalRequests++;
      await this.delay(50 + Math.random() * 50);
      const proxyUrl = `http://${username}:${password}@${host}:${port}`;
      const agent = new HttpsProxyAgent(proxyUrl);

      const response = await axios.get(url, {
        httpsAgent: agent,
        headers: { Accept: "application/json" },
        timeout: 10000, // 10 second timeout
      });

      if (!response.data) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.data;
    } catch (error: unknown) {
      this.stats.failedRequests++;

      if (retries < CONFIG.MAX_RETRIES) {
        this.log(`Retry ${retries + 1}/${CONFIG.MAX_RETRIES} for ${url}: ${(error as Error).message}`, "warn");
        await this.delay(1000);
        return this.fetchWithPremiumProxy(url, retries + 1);
      }

      throw error;
    }
  }

  async fetchWithProxy(url: string, mode: "standard" | "premium" = "standard"): Promise<any> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    try {
      if (mode === "premium") {
        return await this.fetchWithPremiumProxy(url);
      } else {
        return await this.fetchWithStandardProxy(url);
      }
    } catch (error) {
      throw error;
    }
  }

  async fetchAllFromEndpoint(
    endpoint: string,
    mode: "standard" | "premium" = "standard",
    pageSize: number = 200, // More reasonable default page size
    maxRequests: number = 30 // Safety limit to prevent infinite loops
  ): Promise<NamedAPIResource[]> {
    let allResults: NamedAPIResource[] = [];
    let offset = 0;
    let requestsMade = 0;

    while (requestsMade < maxRequests) {
      try {
        const url = `${CONFIG.POKEAPI_BASE_URL}${endpoint}?limit=${pageSize}&offset=${offset}`;
        console.log(`Fetching ${url}`); // Debug logging

        const data: APIResourceList = await this.fetchWithProxy(url, mode);
        allResults = [...allResults, ...data.results];

        // Stop if we've gotten all results (fewer results than requested page size)
        if (data.results.length < pageSize) {
          break;
        }

        offset += pageSize;
        requestsMade++;

        // Add a small delay between requests to be API-friendly
        mode === "premium" ? await this.delay(100) : await this.delay(1000);
      } catch (error) {
        console.error(`Failed to fetch page at offset ${offset}:`, error);
        throw error;
      }
    }

    if (requestsMade >= maxRequests) {
      console.warn(`Reached maximum request limit (${maxRequests}) for ${endpoint}`);
    }

    return allResults;
  }

  // ======================================================
  //                Generic Seeding Methods
  // ======================================================

  private async getExistingIds(modelName: keyof PrismaClient): Promise<Set<number>> {
    // Use bracket notation to dynamically access the correct Prisma model.
    // Use `as any` here as a controlled way to tell TypeScript we know
    // this dynamic property will have a `findMany` method.
    const modelDelegate = (prisma as any)[modelName];
    if (!modelDelegate || typeof modelDelegate.findMany !== "function") {
      throw new Error(`Model '${String(modelName)}' not found on Prisma client or it does not have a findMany method.`);
    }
    const existing: { id: number }[] = await modelDelegate.findMany({
      select: { id: true },
    });
    return new Set(existing.map((item: { id: number }) => item.id));
  }

  // Generic seed method
  async seedGenericCore<T, R = void>(
    config: Omit<SeedingConfig<T>, "timeoutMs" | "maxRetries">,
    processor: SeedingProcessor<T, R>
  ): Promise<void> {
    const {
      endpoint,
      categoryName,
      mode = "standard",
      batchSize = CONFIG.BATCH_SIZE,
      progressLogInterval = 25,
    } = config;

    this.log(`Seeding ${categoryName}...`);

    // Get all items and filter out existing ones
    const allItems = await this.fetchAllFromEndpoint(endpoint, mode);
    let itemsToProcess = allItems;

    if (processor.getExistingIds) {
      const existingIds = await processor.getExistingIds();
      itemsToProcess = allItems.filter((item) => {
        const itemId = this.extractIdFromUrl(item.url);
        return itemId && !existingIds.has(itemId);
      });
      this.log(`Processing ${itemsToProcess.length} new ${categoryName} (${existingIds.size} already exist)`);
    }

    if (itemsToProcess.length === 0) {
      this.progress[categoryName].completed = true;
      return;
    }

    // Initialize progress
    this.progress[categoryName] = {
      completed: false,
      count: 0,
      failed: 0,
      expectedCount: allItems.length,
    };

    const results: R[] = [];

    if (mode === "premium") {
      // Process in batches with Promise.all
      for (let i = 0; i < itemsToProcess.length; i += batchSize) {
        const batch = itemsToProcess.slice(i, i + batchSize);

        const batchResults = await Promise.all(
          batch.map(async (item) => {
            try {
              const result = await processor.processItem(item, mode);
              this.progress[categoryName].count++;
              return result;
            } catch (error) {
              this.progress[categoryName].failed++;
              this.log(`Failed to process ${item.name}: ${(error as Error).message}`, "error");
              return null;
            }
          })
        );

        // Collect non-null results
        results.push(...batchResults.filter((result) => result !== null && result !== undefined));

        // Progress logging
        if ((i + batchSize) % progressLogInterval === 0) {
          this.log(`${categoryName} progress: ${i + batchSize} processed`);
        }
      }
    } else {
      // Process sequentially
      for (const item of itemsToProcess) {
        try {
          const result = await processor.processItem(item, mode);
          if (result !== null && result !== undefined) {
            results.push(result);
          }
          this.progress[categoryName].count++;

          if (this.progress[categoryName].count % (progressLogInterval / 5) === 0) {
            this.log(`${categoryName} progress: ${this.progress[categoryName].count} processed`);
          }
        } catch (error) {
          this.progress[categoryName].failed++;
          this.log(`Failed to process ${item.name}: ${(error as Error).message}`, "error");
        }
      }
    }

    // Post-processing
    if (processor.postProcess && results.length > 0) {
      this.log(`Running post-processing for ${categoryName}...`);
      await processor.postProcess(results);
    }

    // Mark as completed
    this.progress[categoryName].completed = true;
    this.log(
      `✅ Completed ${categoryName}: ${this.progress[categoryName].count} processed, ${this.progress[categoryName].failed} failed`
    );
  }

  // Timeout and retry utility method
  private async withTimeoutAndRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    timeoutMs: number = 10000,
    maxRetries: number = 2
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Operation '${operationName}' timed out after ${timeoutMs}ms (attempt ${attempt})`));
          }, timeoutMs);
        });

        // Race the operation against the timeout
        const result = await Promise.race([operation(), timeoutPromise]);

        return result;
      } catch (error: unknown) {
        const isLastAttempt = attempt === maxRetries + 1;
        const errorMsg = (error as Error).message;

        if (isLastAttempt) {
          this.log(`❌ ${operationName} failed after ${maxRetries + 1} attempts: ${errorMsg}`, "error");
          throw error;
        } else {
          this.log(`⚠️ ${operationName} attempt ${attempt} failed: ${errorMsg}. Retrying...`, "warn");

          // Progressive backoff: wait longer between retries
          const backoffMs = 5000 * attempt; // 5s, 10s, 15s...
          await this.delay(backoffMs);

          // Force memory cleanup before retry
          await this.checkAndCleanupMemory(`Retry ${attempt} for ${operationName}`);
        }
      }
    }

    // TypeScript exhaustiveness check
    throw new Error(`Unexpected end of retry loop for ${operationName}`);
  }

  // Generic seed method with timeout and retry
  async seedGeneric<T, R = void>(config: SeedingConfig<T>, processor: SeedingProcessor<T, R>): Promise<void> {
    const { timeoutMs = 10000, maxRetries = 2, ...seedConfig } = config;
    return await this.withTimeoutAndRetry(
      () => this.seedGenericCore(seedConfig, processor),
      `Seeding ${config.categoryName}`,
      timeoutMs,
      maxRetries
    );
  }

  // ======================================================
  //          Model Specific Seeding Methods
  // ======================================================

  // 1. POKEMON SPECIES (most complex - with evolution post-processing)
  async seedPokemonSpecies(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "pokemon-species",
        categoryName: "pokemonSpecies",
        mode,
        batchSize: CONFIG.BATCH_SIZE,
        progressLogInterval: 50,
      },
      {
        getExistingIds: async () => this.getExistingIds("pokemonSpecies"),
        processItem: async (speciesItem: NamedAPIResource, mode: "premium" | "standard") => {
          const speciesId = this.extractIdFromUrl(speciesItem.url);
          if (!speciesId) return;

          // Check if species exists
          const existingSpecies = await prisma.pokemonSpecies.findUnique({
            where: { id: speciesId },
            select: { id: true, name: true },
          });

          if (existingSpecies) {
            // Check if relationships are complete
            const [hasNames, hasEggGroups, hasFlavorTexts] = await Promise.all([
              prisma.pokemonSpeciesName.findFirst({
                where: { pokemonSpeciesId: speciesId },
                select: { pokemonSpeciesId: true },
              }),
              prisma.pokemonSpeciesEggGroup.findFirst({
                where: { pokemonSpeciesId: speciesId },
                select: { pokemonSpeciesId: true },
              }),
              prisma.pokemonSpeciesFlavorText.findFirst({
                where: { pokemonSpeciesId: speciesId },
                select: { pokemonSpeciesId: true },
              }),
            ]);

            const missingRelationships: string[] = [];
            if (!hasNames) missingRelationships.push("names");
            if (!hasEggGroups) missingRelationships.push("egg-groups");
            if (!hasFlavorTexts) missingRelationships.push("flavor-texts");

            if (missingRelationships.length > 0) {
              this.log(`Species ${existingSpecies.name} missing: ${missingRelationships.join(", ")}`);
              await this.processPokemonSpecies(speciesItem, mode);
            }
          } else {
            // Species doesn't exist, do full processing
            await this.processPokemonSpecies(speciesItem, mode);
          }
        },

        postProcess: async () => {
          this.log("All species processed. Now processing evolution relationships...");
          await this.processEvolutionRelationships();
          this.evolutionMappings.clear();
          this.evolutionChainMappings.clear();
        },
      }
    );
  }

  async seedPokemon(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "pokemon",
        categoryName: "pokemon",
        mode,
        batchSize: 1,
        progressLogInterval: 50,
        timeoutMs: 60000, // 60s timeout
        maxRetries: 2, // 2 retries
      },
      {
        getExistingIds: async () => this.getExistingIds("pokemon"),
        processItem: async (pokemonItem: NamedAPIResource, mode: "premium" | "standard") => {
          const pokemonId = this.extractIdFromUrl(pokemonItem.url);
          if (!pokemonId) return null;

          // Check and cleanup memory every 5 Pokemon
          if (this.progress.pokemon.count % 5 === 0 && this.progress.pokemon.count > 0) {
            await this.checkAndCleanupMemory(`Pokemon #${this.progress.pokemon.count}`);
          }

          let pokemonName = "unknown";
          let pokemonData: any = null;

          try {
            // Check if Pokemon exists
            const existingPokemon = await prisma.pokemon.findUnique({
              where: { id: pokemonId },
              select: { id: true, name: true },
            });

            if (existingPokemon) {
              pokemonName = existingPokemon.name;
              this.log(`Processing existing Pokemon: ${pokemonName} (ID: ${pokemonId})`);

              // Check if relationships are complete
              const [hasAbilities, hasTypes, hasStats, hasMoves, hasSprites] = await Promise.all([
                prisma.pokemonAbility.findFirst({
                  where: { pokemonId },
                  select: { pokemonId: true },
                }),
                prisma.pokemonType.findFirst({
                  where: { pokemonId },
                  select: { pokemonId: true },
                }),
                prisma.pokemonStat.findFirst({
                  where: { pokemonId },
                  select: { pokemonId: true },
                }),
                prisma.pokemonMove.findFirst({
                  where: { pokemonId },
                  select: { pokemonId: true },
                }),
                prisma.pokemonSprites.findFirst({
                  where: { pokemonId },
                  select: { pokemonId: true },
                }),
              ]);

              const missingRelationships: string[] = [];
              if (!hasAbilities) missingRelationships.push("abilities");
              if (!hasTypes) missingRelationships.push("types");
              if (!hasStats) missingRelationships.push("stats");
              if (!hasMoves) missingRelationships.push("moves");
              if (!hasSprites) missingRelationships.push("sprites");

              if (missingRelationships.length > 0) {
                this.log(`Pokemon ${pokemonName} missing: ${missingRelationships.join(", ")}`);

                pokemonData = await this.fetchWithProxy(pokemonItem.url, mode);
                pokemonName = pokemonData.name;

                this.log(`\n\n === Seeding Pokemon #${pokemonId}: ${pokemonName} ===\n\n`);

                // Process only missing relationships
                if (!hasAbilities || !hasTypes || !hasStats || !hasSprites) {
                  await this.processPokemonCoreData(pokemonData);
                }
                if (!hasMoves) {
                  await this.processPokemonMovesets(pokemonData);
                  await this.processPokemonEncounters(pokemonData, mode);
                }
                await this.processPokemonForms(pokemonData, mode);
              }
            } else {
              // Pokemon doesn't exist, do full processing
              this.log(`Processing new Pokemon: ID ${pokemonId}`);
              await this.processPokemon(pokemonItem, mode);

              // Get the name after processing
              const processedPokemon = await prisma.pokemon.findUnique({
                where: { id: pokemonId },
                select: { name: true },
              });
              pokemonName = processedPokemon?.name || `ID-${pokemonId}`;
            }

            this.log(`✅ Successfully processed Pokemon: ${pokemonName} (ID: ${pokemonId})`);

            // Clear local variables to help GC
            pokemonData = null;
            return null;
          } catch (error: unknown) {
            this.log(`❌ CRITICAL: Pokemon ${pokemonName} (ID: ${pokemonId}) processing failed`, "error");
            this.log(`Error: ${(error as Error).message}`, "error");

            if ((error as Error).stack) {
              this.log(`Stack trace: ${(error as Error).stack}`, "error");
            }

            this.stats.errors.push({
              url: pokemonItem.url,
              error: `Pokemon ${pokemonName} (${pokemonId}): ${(error as Error).message}`,
              timestamp: new Date(),
            });

            // Force memory cleanup on errors
            await this.checkAndCleanupMemory(`ERROR - Pokemon ${pokemonName}`);

            // Clear local variables
            pokemonData = null;
            throw error; // Re-throw to be handled by seedGenericWithTimeout
          }
        },

        postProcess: async () => {
          // Process species varieties for ALL Pokemon
          this.log("Creating Pokemon species variety relationships...");
          await this.processPokemonSpeciesVarieties();
        },
      }
    );
  }

  async seedPokemonSpeciesVarieties(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "pokemon-species",
        categoryName: "pokemonSpecies", // Reuse existing category or create new one
        mode,
        batchSize: CONFIG.BATCH_SIZE,
        progressLogInterval: 50,
      },
      {
        getExistingIds: async () => {
          // Get species that already have variety relationships
          const speciesWithVarieties: { pokemonSpeciesId: number }[] = await prisma.pokemonSpeciesVariety.findMany({
            select: { pokemonSpeciesId: true },
            distinct: ["pokemonSpeciesId"],
          });
          return new Set(speciesWithVarieties.map((sv) => sv.pokemonSpeciesId));
        },

        processItem: async (
          speciesItem: NamedAPIResource,
          mode: "premium" | "standard"
        ): Promise<{
          speciesId: number;
          varietiesCreated: number;
        } | null> => {
          const speciesId = this.extractIdFromUrl(speciesItem.url);
          if (!speciesId) return null;

          try {
            // Fetch the species data to get varieties
            const speciesData = await this.fetchWithProxy(speciesItem.url, mode);
            let varietiesCreated = 0;

            if (speciesData.varieties && Array.isArray(speciesData.varieties)) {
              // Process each variety
              for (const variety of speciesData.varieties) {
                const pokemonId = this.extractIdFromUrl(variety.pokemon.url);

                if (pokemonId) {
                  // Verify Pokemon exists
                  const pokemonExists = await prisma.pokemon.findUnique({
                    where: { id: pokemonId },
                    select: { id: true, name: true },
                  });

                  if (pokemonExists) {
                    // Create or update the variety relationship
                    try {
                      await prisma.pokemonSpeciesVariety.upsert({
                        where: {
                          pokemonSpeciesId_pokemonId: {
                            pokemonSpeciesId: speciesId,
                            pokemonId,
                          },
                        },
                        update: {
                          isDefault: variety.is_default,
                        },
                        create: {
                          pokemonSpeciesId: speciesId,
                          pokemonId,
                          isDefault: variety.is_default,
                        },
                      });

                      varietiesCreated++;

                      this.log(
                        `Created variety: ${pokemonExists.name} (${pokemonId}) for species ${speciesData.name} (default: ${variety.is_default})`,
                        "debug"
                      );
                    } catch (varietyError: unknown) {
                      this.log(
                        `Failed to create variety ${pokemonId} for species ${speciesId}: ${
                          (varietyError as Error).message
                        }`,
                        "warn"
                      );
                    }
                  } else {
                    this.log(
                      `Pokemon ${pokemonId} (${variety.pokemon.name}) not found for species ${speciesData.name}`,
                      "warn"
                    );
                  }
                }
              }
            }

            return {
              speciesId,
              varietiesCreated,
            };
          } catch (error: unknown) {
            this.log(`Failed to process varieties for species ${speciesId}: ${(error as Error).message}`, "error");
            throw error;
          }
        },

        postProcess: async (
          results: Array<{
            speciesId: number;
            varietiesCreated: number;
          } | null>
        ) => {
          // Summarize the variety creation results
          const validResults = results.filter((r) => r !== null);
          const totalVarietiesCreated = validResults.reduce((sum, result) => sum + result.varietiesCreated, 0);
          const speciesProcessed = validResults.length;
          const speciesWithVarieties = validResults.filter((r) => r.varietiesCreated > 0).length;

          this.log(
            `✅ Species varieties completed: ${totalVarietiesCreated} varieties created for ${speciesWithVarieties}/${speciesProcessed} species`
          );
        },
      }
    );
  }

  async seedLocations(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "location",
        categoryName: "locations",
        mode,
        batchSize: CONFIG.BATCH_SIZE,
        progressLogInterval: 25,
      },
      {
        getExistingIds: async () => this.getExistingIds("location"),
        processItem: async (location: NamedAPIResource, mode: "premium" | "standard") => {
          const locationData = await this.fetchWithProxy(location.url, mode);

          // Handle optional region - can be null
          const regionId = locationData.region ? this.extractIdFromUrl(locationData.region.url) : null;

          // Only validate if region is provided but invalid
          if (locationData.region && !regionId) {
            this.log(`Invalid region data for location ${locationData.name}, skipping`, "warn");
            return null;
          }

          await prisma.location.upsert({
            where: { id: locationData.id },
            update: {
              name: locationData.name,
              regionId,
            },
            create: {
              id: locationData.id,
              name: locationData.name,
              regionId,
            },
          });

          if (locationData.names && Array.isArray(locationData.names)) {
            for (const nameEntry of locationData.names) {
              const languageId = this.extractIdFromUrl(nameEntry.language?.url);
              if (languageId) {
                // Verify language exists
                const languageExists = await prisma.language.findUnique({
                  where: { id: languageId },
                  select: { id: true },
                });

                if (languageExists) {
                  await prisma.locationName.upsert({
                    where: {
                      locationId_languageId: {
                        locationId: locationData.id,
                        languageId,
                      },
                    },
                    update: { name: nameEntry.name },
                    create: {
                      locationId: locationData.id,
                      languageId,
                      name: nameEntry.name,
                    },
                  });
                } else {
                  this.log(`Language ${languageId} not found for location ${locationData.name}, skipping name`, "warn");
                }
              }
            }
          }
        },
      }
    );
  }

  async seedLocationAreas(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "location-area",
        categoryName: "locationAreas",
        mode,
        batchSize: CONFIG.BATCH_SIZE,
        progressLogInterval: 25,
      },
      {
        getExistingIds: async () => this.getExistingIds("locationArea"),
        processItem: async (locationArea: NamedAPIResource, mode: "premium" | "standard") => {
          const locationAreaData = await this.fetchWithProxy(locationArea.url, mode);

          // Required field
          const locationId = this.extractIdFromUrl(locationAreaData.location.url);
          if (!locationId) {
            throw new Error(`Missing location ID for area ${locationAreaData.name}`);
          }

          await prisma.locationArea.upsert({
            where: { id: locationAreaData.id },
            update: {
              name: locationAreaData.name,
              locationId,
              gameIndex: locationAreaData.game_index,
            },
            create: {
              id: locationAreaData.id,
              name: locationAreaData.name,
              locationId,
              gameIndex: locationAreaData.game_index,
            },
          });

          if (locationAreaData.names && Array.isArray(locationAreaData.names)) {
            for (const nameEntry of locationAreaData.names) {
              const languageId = this.extractIdFromUrl(nameEntry.language?.url);
              if (languageId) {
                // Verify language exists
                const languageExists = await prisma.language.findUnique({
                  where: { id: languageId },
                  select: { id: true },
                });

                if (languageExists) {
                  await prisma.locationAreaName.upsert({
                    where: {
                      locationAreaId_languageId: {
                        locationAreaId: locationAreaData.id,
                        languageId,
                      },
                    },
                    update: { name: nameEntry.name },
                    create: {
                      locationAreaId: locationAreaData.id,
                      languageId,
                      name: nameEntry.name,
                    },
                  });
                }
              }
            }
          }
        },
      }
    );
  }

  async seedEncounterMethods(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "encounter-method",
        categoryName: "encounters", // Note: using encounters category
        mode,
        batchSize: CONFIG.BATCH_SIZE,
        progressLogInterval: 25,
      },
      {
        getExistingIds: async () => this.getExistingIds("encounterMethod"),
        processItem: async (method: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processEncounterMethod(method, mode);
          // No return needed - just processing encounter method data
        },
      }
    );
  }

  async seedPokedexes(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "pokedex",
        categoryName: "pokedexes",
        mode,
        batchSize: CONFIG.BATCH_SIZE,
        progressLogInterval: 5,
      },
      {
        getExistingIds: async () => this.getExistingIds("pokedex"),
        processItem: async (pokedex: NamedAPIResource, mode: "premium" | "standard") => {
          const pokedexId = this.extractIdFromUrl(pokedex.url);
          if (!pokedexId) return null;

          // Check if pokedex exists
          const existingPokedex = await prisma.pokedex.findUnique({
            where: { id: pokedexId },
            select: { id: true, name: true },
          });

          if (existingPokedex) {
            // Check if relationships are complete
            const [hasVersionGroups, hasPokemonEntries] = await Promise.all([
              prisma.versionGroupPokedex.findFirst({
                where: { pokedexId },
                select: { pokedexId: true },
              }),
              prisma.pokemonSpeciesPokedexNumber.findFirst({
                where: { pokedexId },
                select: { pokedexId: true },
              }),
            ]);

            const missingRelationships: string[] = [];
            if (!hasVersionGroups) missingRelationships.push("version-groups");
            if (!hasPokemonEntries) missingRelationships.push("pokemon-entries");

            if (missingRelationships.length > 0) {
              this.log(`Pokedex ${existingPokedex.name} missing: ${missingRelationships.join(", ")}`);
              return await this.processPokedex(pokedex, mode);
            }
            return null;
          } else {
            // Pokedex doesn't exist, do full processing
            return await this.processPokedex(pokedex, mode);
          }
        },

        postProcess: async (
          results: Array<{
            pokedexId: number;
            pokemonEntries: { pokedexId: number; pokedexNumber: number }[];
          } | null>
        ) => {
          const pokemonSpeciesUpdates = new Map<number, { pokedexId: number; pokedexNumber: number }[]>();

          results.forEach((result) => {
            if (result) {
              pokemonSpeciesUpdates.set(result.pokedexId, result.pokemonEntries);
            }
          });

          this.log("Updating Pokemon species with pokedex numbers...");
          await this.processPokemonSpeciesPokedexNumbers(pokemonSpeciesUpdates);
        },
      }
    );
  }

  async seedEvolutionChains(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "evolution-chain",
        categoryName: "evolutionChains",
        mode,
        batchSize: CONFIG.BATCH_SIZE,
        progressLogInterval: 25,
      },
      {
        getExistingIds: async () => this.getExistingIds("evolutionChain"),
        processItem: async (chain: NamedAPIResource, mode: "premium" | "standard") => {
          const chainData = await this.fetchWithProxy(chain.url, mode);

          // Create the evolution chain record
          await this.processEvolutionChainRecord(chainData);

          // Process all species in the chain and their evolution details
          await this.processEvolutionChainSpecies(chainData);
        },
      }
    );
  }

  async seedLanguages(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "language",
        categoryName: "languages",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("language"),
        processItem: async (language: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processLanguage(language, mode);
        },

        // Two-phase processing for language names
        postProcess: async () => {
          this.log("Phase 2: Creating language names...");
          const allLanguages = await this.fetchAllFromEndpoint("language");

          for (const lang of allLanguages) {
            try {
              const langData = await this.fetchWithProxy(lang.url, mode);
              await this.processLanguageNames(langData);
            } catch (error: unknown) {
              this.log(`Failed to create language names for ${lang.name}: ${(error as Error).message}`, "error");
            }
          }
        },
      }
    );
  }

  async seedRegions(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "region",
        categoryName: "regions",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("region"),
        processItem: async (region: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processRegion(region, mode);
        },
      }
    );
  }

  async seedGenerations(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "generation",
        categoryName: "generations",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("generation"),
        processItem: async (generation: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processGeneration(generation, mode);
        },
      }
    );
  }

  async seedVersionGroups(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "version-group",
        categoryName: "versionGroups",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("versionGroup"),
        processItem: async (versionGroup: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processVersionGroup(versionGroup, mode);
        },
      }
    );
  }

  async seedTypes(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "type",
        categoryName: "types",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("type"),
        processItem: async (type: NamedAPIResource, mode: "premium" | "standard") => {
          const typeId = this.extractIdFromUrl(type.url);
          if (!typeId) return;

          // Check if type exists
          const existingType = await prisma.type.findUnique({
            where: { id: typeId },
            select: { id: true, name: true },
          });

          if (existingType) {
            // Check if relationships are complete
            const [hasNames, hasEffectiveness] = await Promise.all([
              prisma.typeName.findFirst({
                where: { typeId },
                select: { typeId: true },
              }),
              prisma.typeEfficacy.findFirst({
                where: {
                  OR: [{ damageTypeId: typeId }, { targetTypeId: typeId }],
                },
                select: { damageTypeId: true },
              }),
            ]);

            const missingRelationships: string[] = [];
            if (!hasNames) missingRelationships.push("names");
            if (!hasEffectiveness) missingRelationships.push("effectiveness");

            if (missingRelationships.length > 0) {
              this.log(`Type ${existingType.name} missing: ${missingRelationships.join(", ")}`);

              // Process the type data
              await this.processType(type, mode);

              // If effectiveness is missing, process it separately
              if (!hasEffectiveness) {
                await this.processTypeEffectiveness(type, mode);
              }
            }
          } else {
            // Type doesn't exist, do full processing
            await this.processType(type, mode);
          }
        },

        postProcess: async () => {
          this.log("Phase 2: Processing type effectiveness relationships...");
          const allTypes = await this.fetchAllFromEndpoint("type");

          for (const type of allTypes) {
            try {
              const typeId = this.extractIdFromUrl(type.url);
              if (typeId) {
                // Check if effectiveness already exists for this type
                const hasEffectiveness = await prisma.typeEfficacy.findFirst({
                  where: {
                    OR: [{ damageTypeId: typeId }, { targetTypeId: typeId }],
                  },
                  select: { damageTypeId: true },
                });

                if (!hasEffectiveness) {
                  this.log(`Processing effectiveness for type ${type.name}`);
                  await this.processTypeEffectiveness(type, mode);
                }
              }
            } catch (error: unknown) {
              this.log(`Failed to create effectiveness for type ${type.name}: ${(error as Error).message}`, "error");
            }
          }
        },
      }
    );
  }

  async seedAbilities(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "ability",
        categoryName: "abilities",
        mode,
        progressLogInterval: 25,
      },
      {
        getExistingIds: async () => this.getExistingIds("ability"),
        processItem: async (ability: NamedAPIResource, mode: "premium" | "standard") => {
          const abilityId = this.extractIdFromUrl(ability.url);
          if (!abilityId) return;

          // Check if ability exists
          const existingAbility = await prisma.ability.findUnique({
            where: { id: abilityId },
            select: { id: true, name: true },
          });

          if (existingAbility) {
            // Check if relationships are complete
            const [hasNames, hasEffectTexts, hasFlavorTexts] = await Promise.all([
              prisma.abilityName.findFirst({
                where: { abilityId },
                select: { abilityId: true },
              }),
              prisma.abilityEffectText.findFirst({
                where: { abilityId },
                select: { abilityId: true },
              }),
              prisma.abilityFlavorText.findFirst({
                where: { abilityId },
                select: { abilityId: true },
              }),
            ]);

            const missingRelationships: string[] = [];
            if (!hasNames) missingRelationships.push("names");
            if (!hasEffectTexts) missingRelationships.push("effect-texts");
            if (!hasFlavorTexts) missingRelationships.push("flavor-texts");

            if (missingRelationships.length > 0) {
              this.log(`Ability ${existingAbility.name} missing: ${missingRelationships.join(", ")}`);
              await this.processAbility(ability, mode);
            }
          } else {
            await this.processAbility(ability, mode);
          }
        },
      }
    );
  }

  async seedMoves(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "move",
        categoryName: "moves",
        mode,
        progressLogInterval: 50,
      },
      {
        getExistingIds: async () => this.getExistingIds("move"),
        processItem: async (move: NamedAPIResource, mode: "premium" | "standard") => {
          const moveId = this.extractIdFromUrl(move.url);
          if (!moveId) return;

          // Check if move exists
          const existingMove = await prisma.move.findUnique({
            where: { id: moveId },
            select: { id: true, name: true },
          });

          if (existingMove) {
            // Check if relationships are complete
            const [hasNames, hasEffectEntries, hasMetaData] = await Promise.all([
              prisma.moveName.findFirst({
                where: { moveId },
                select: { moveId: true },
              }),
              prisma.moveEffectEntry.findFirst({
                where: { moveId },
                select: { moveId: true },
              }),
              prisma.moveMetaData.findFirst({
                where: { moveId },
                select: { moveId: true },
              }),
            ]);

            const missingRelationships: string[] = [];
            if (!hasNames) missingRelationships.push("names");
            if (!hasEffectEntries) missingRelationships.push("effect-entries");
            if (!hasMetaData) missingRelationships.push("meta-data");

            if (missingRelationships.length > 0) {
              this.log(`Move ${existingMove.name} missing: ${missingRelationships.join(", ")}`);
              await this.processMove(move, mode);
            }
          } else {
            await this.processMove(move, mode);
          }
        },
      }
    );
  }

  async seedItems(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "item",
        categoryName: "items",
        mode,
        progressLogInterval: 50,
      },
      {
        getExistingIds: async () => this.getExistingIds("item"),
        processItem: async (item: NamedAPIResource, mode: "premium" | "standard") => {
          const itemId = this.extractIdFromUrl(item.url);
          if (!itemId) return;

          // Check if item exists
          const existingItem = await prisma.item.findUnique({
            where: { id: itemId },
            select: { id: true, name: true },
          });

          if (existingItem) {
            // Check if relationships are complete
            const [hasNames, hasEffectTexts, hasFlavorTexts, hasGameIndices] = await Promise.all([
              prisma.itemName.findFirst({
                where: { itemId },
                select: { itemId: true },
              }),
              prisma.itemEffectText.findFirst({
                where: { itemId },
                select: { itemId: true },
              }),
              prisma.itemFlavorText.findFirst({
                where: { itemId },
                select: { itemId: true },
              }),
              prisma.itemGameIndex.findFirst({
                where: { itemId },
                select: { itemId: true },
              }),
            ]);

            const missingRelationships: string[] = [];
            if (!hasNames) missingRelationships.push("names");
            if (!hasEffectTexts) missingRelationships.push("effect-texts");
            if (!hasFlavorTexts) missingRelationships.push("flavor-texts");
            if (!hasGameIndices) missingRelationships.push("game-indices");

            if (missingRelationships.length > 0) {
              this.log(`Item ${existingItem.name} missing: ${missingRelationships.join(", ")}`);
              await this.processItem(item, mode);
            }
          } else {
            // Item doesn't exist, do full processing
            await this.processItem(item, mode);
          }
        },
      }
    );
  }

  async seedItemAttributes(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "item-attribute",
        categoryName: "items",
        mode,
        progressLogInterval: 4,
      },
      {
        getExistingIds: async () => this.getExistingIds("itemAttribute"),
        processItem: async (machine: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processMachine(machine, mode);
        },
      }
    );
  }

  async seedMachines(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "machine",
        categoryName: "machines",
        mode,
        progressLogInterval: 25,
      },
      {
        getExistingIds: async () => this.getExistingIds("machine"),
        processItem: async (machine: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processMachine(machine, mode);
        },
      }
    );
  }

  async seedMoveBattleStyles(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "move-battle-style",
        categoryName: "moves",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("moveBattleStyle"),
        processItem: async (mbs: NamedAPIResource, mode: "premium" | "standard") => {
          const mbsData = await this.fetchWithProxy(mbs.url, mode);

          await prisma.moveBattleStyle.upsert({
            where: { id: mbsData.id },
            update: { name: mbsData.name },
            create: { id: mbsData.id, name: mbsData.name },
          });

          // Create move battle style names
          if (mbsData.names && Array.isArray(mbsData.names)) {
            for (const nameEntry of mbsData.names) {
              const languageId = this.extractIdFromUrl(nameEntry.language.url);
              if (languageId) {
                const languageExists = await prisma.language.findUnique({
                  where: { id: languageId },
                  select: { id: true },
                });

                if (languageExists) {
                  await prisma.moveBattleStyleName.upsert({
                    where: {
                      moveBattleStyleId_languageId: {
                        moveBattleStyleId: mbsData.id,
                        languageId,
                      },
                    },
                    update: { name: nameEntry.name },
                    create: {
                      moveBattleStyleId: mbsData.id,
                      languageId,
                      name: nameEntry.name,
                    },
                  });
                }
              }
            }
          }
        },
      }
    );
  }

  // ======================================================
  // SUPPLEMENTARY DATA SEEDING METHODS (Multiple Endpoints)
  // ======================================================

  async seedSupplementaryData(mode: "premium" | "standard" = "standard"): Promise<void> {
    this.log("Seeding supplementary data...");

    // These methods handle multiple endpoints, so we'll call them sequentially
    await this.seedMoveDamageClasses(mode);
    await this.seedMoveTargets(mode);
    await this.seedStats(mode);
    await this.seedMoveLearnMethods(mode);
    await this.seedEggGroups(mode);
    await this.seedGrowthRates(mode);
    await this.seedPokemonColors(mode);
    await this.seedPokemonShapes(mode);
    await this.seedPokemonHabitats(mode);
    await this.seedBerryFlavors(mode);
    await this.seedBerryFirmnesses(mode);
    await this.seedMoveMetaAilments(mode);
    await this.seedMoveMetaCategories(mode);
    await this.seedContestTypes(mode);
    await this.seedContestEffects(mode);
    await this.seedSuperContestEffects(mode);
    await this.seedMoveBattleStyles(mode);

    // Create default move meta category (ID: 0, name: "damage")
    await prisma.moveMetaCategory.upsert({
      where: { id: 0 },
      update: { name: "damage" },
      create: {
        id: 0,
        name: "damage",
      },
    });

    this.log("Completed supplementary data seed");
  }

  async seedItemSupplementaryData(mode: "premium" | "standard" = "standard"): Promise<void> {
    this.log("Seeding item supplementary data...");

    await this.seedItemPockets(mode);
    await this.seedItemCategories(mode);
    await this.seedItemFlingEffects(mode);

    this.log("Completed item supplementary data seed");
  }

  async seedMoveDamageClasses(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "move-damage-class",
        categoryName: "moves",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("moveDamageClass"),
        processItem: async (mdc: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processMoveDamageClass(mdc, mode);
        },
      }
    );
  }

  async seedMoveTargets(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "move-target",
        categoryName: "moves",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("moveTarget"),
        processItem: async (mt: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processMoveTargetItem(mt, mode);
        },
      }
    );
  }

  async seedStats(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "stat",
        categoryName: "moves", // Using moves category for game mechanics
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("stat"),
        processItem: async (stat: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processStat(stat, mode);
        },
      }
    );
  }

  async seedCharacteristics(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "characteristic", // ← Fixed: correct endpoint
        categoryName: "characteristics", // ← Fixed: correct category name
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("characteristic"),
        processItem: async (characteristic: NamedAPIResource, mode: "premium" | "standard") => {
          // FIXED: Handle missing name field
          const characteristicId = this.extractIdFromUrl(characteristic.url);
          if (!characteristicId) {
            this.log(`Skipping characteristic with invalid URL: ${characteristic.url}`, "warn");
            return;
          }

          // Fetch the full characteristic data
          const characteristicData = await this.fetchWithProxy(characteristic.url, mode);

          // Extract stat ID (required) - note: API uses "highest_stat" not "stat"
          const statId = this.extractIdFromUrl(characteristicData.highest_stat?.url);
          if (!statId) {
            this.log(`Missing stat ID for characteristic ${characteristicId}, skipping`, "warn");
            return;
          }

          // Verify stat exists
          const statExists = await prisma.stat.findUnique({
            where: { id: statId },
            select: { id: true },
          });

          if (!statExists) {
            this.log(`Stat ${statId} not found for characteristic ${characteristicId}, skipping`, "warn");
            return;
          }

          // Create the characteristic
          await prisma.characteristic.upsert({
            where: { id: characteristicData.id },
            update: {
              statId,
              geneModulo: characteristicData.gene_modulo,
              possibleValues: JSON.stringify(characteristicData.possible_values),
            },
            create: {
              id: characteristicData.id,
              statId,
              geneModulo: characteristicData.gene_modulo,
              possibleValues: JSON.stringify(characteristicData.possible_values),
            },
          });

          // Create characteristic descriptions
          if (characteristicData.descriptions && Array.isArray(characteristicData.descriptions)) {
            for (const descEntry of characteristicData.descriptions) {
              if (!descEntry || !descEntry.language || !descEntry.language.url) {
                continue;
              }

              const languageId = this.extractIdFromUrl(descEntry.language.url);
              if (languageId) {
                // Verify language exists
                const languageExists = await prisma.language.findUnique({
                  where: { id: languageId },
                  select: { id: true },
                });

                if (languageExists) {
                  await prisma.characteristicDescription.upsert({
                    where: {
                      characteristicId_languageId: {
                        characteristicId: characteristicData.id,
                        languageId,
                      },
                    },
                    update: { description: descEntry.description },
                    create: {
                      characteristicId: characteristicData.id,
                      languageId,
                      description: descEntry.description,
                    },
                  });
                }
              }
            }
          }

          this.log(`Processed characteristic ${characteristicId} for stat ${statId}`, "debug");
        },
      }
    );
  }

  async seedGenders(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "gender",
        categoryName: "pokemonSpecies", // Related to Pokemon breeding
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("gender"),
        processItem: async (gender: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processGender(gender, mode);
        },
      }
    );
  }

  async seedPokeathlonStats(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "pokeathlon-stat",
        categoryName: "pokemon", // Related to Pokemon stats
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("pokeathlonStat"),
        processItem: async (stat: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processPokeathlonStat(stat, mode);
        },
      }
    );
  }

  async seedPalParkAreas(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "pal-park-area",
        categoryName: "locations", // Related to locations
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("palParkArea"),
        processItem: async (area: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processPalParkArea(area, mode);
        },
      }
    );
  }

  async seedNatures(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "nature",
        categoryName: "pokemon", // Related to Pokemon stats/behavior
        mode,
        progressLogInterval: 25,
      },
      {
        getExistingIds: async () => this.getExistingIds("nature"),
        processItem: async (nature: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processNature(nature, mode);
        },
      }
    );
  }

  async seedBerries(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "berry",
        categoryName: "items", // Berry-related items
        mode,
        progressLogInterval: 25,
      },
      {
        getExistingIds: async () => this.getExistingIds("berry"),
        processItem: async (berry: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processBerry(berry, mode);
        },
      }
    );
  }

  async seedMoveLearnMethods(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "move-learn-method",
        categoryName: "moves",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("moveLearnMethod"),
        processItem: async (mlm: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processMoveLearnMethod(mlm, mode);
        },
      }
    );
  }

  async seedEggGroups(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "egg-group",
        categoryName: "pokemonSpecies", // Related to species breeding
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("eggGroup"),
        processItem: async (eg: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processEggGroup(eg, mode);
        },
      }
    );
  }

  async seedGrowthRates(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "growth-rate",
        categoryName: "pokemonSpecies",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("growthRate"),
        processItem: async (gr: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processGrowthRate(gr, mode);
        },
      }
    );
  }

  async seedPokemonColors(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "pokemon-color",
        categoryName: "pokemonSpecies",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("pokemonColor"),
        processItem: async (pc: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processPokemonColor(pc, mode);
        },
      }
    );
  }

  async seedPokemonShapes(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "pokemon-shape",
        categoryName: "pokemonSpecies",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("pokemonShape"),
        processItem: async (ps: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processPokemonShape(ps, mode);
        },
      }
    );
  }

  async seedPokemonHabitats(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "pokemon-habitat",
        categoryName: "pokemonSpecies",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("pokemonHabitat"),
        processItem: async (ph: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processPokemonHabitat(ph, mode);
        },
      }
    );
  }

  async seedBerryFlavors(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "berry-flavor",
        categoryName: "items", // Berry-related
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("berryFlavor"),
        processItem: async (bf: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processBerryFlavor(bf, mode);
        },
      }
    );
  }

  async seedBerryFirmnesses(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "berry-firmness",
        categoryName: "items",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("berryFirmness"),
        processItem: async (bfirm: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processBerryFirmness(bfirm, mode);
        },
      }
    );
  }

  async seedMoveMetaAilments(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "move-ailment",
        categoryName: "moves",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("moveMetaAilment"),
        processItem: async (mma: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processMoveMetaAilment(mma, mode);
        },
      }
    );
  }

  async seedMoveMetaCategories(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "move-category",
        categoryName: "moves",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("moveMetaCategory"),
        processItem: async (mmc: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processMoveMetaCategory(mmc, mode);
        },
      }
    );
  }

  async seedContestTypes(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "contest-type",
        categoryName: "moves", // Contest-related
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("contestType"),
        processItem: async (ct: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processContestType(ct, mode);
        },
      }
    );
  }

  async seedContestEffects(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "contest-effect",
        categoryName: "moves",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("contestEffect"),
        processItem: async (ce: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processContestEffect(ce, mode);
        },
      }
    );
  }

  async seedSuperContestEffects(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "super-contest-effect",
        categoryName: "moves",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("superContestEffect"),
        processItem: async (sce: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processSuperContestEffect(sce, mode);
        },
      }
    );
  }

  async seedItemPockets(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "item-pocket",
        categoryName: "items",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("itemPocket"),
        processItem: async (pocket: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processItemPocket(pocket, mode);
        },
      }
    );
  }

  async seedItemCategories(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "item-category",
        categoryName: "items",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("itemCategory"),
        processItem: async (category: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processItemCategory(category, mode);
        },
      }
    );
  }

  async seedItemFlingEffects(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "item-fling-effect",
        categoryName: "items",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("itemFlingEffect"),
        processItem: async (flingEffect: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processItemFlingEffect(flingEffect, mode);
        },
      }
    );
  }

  async seedGenderSpeciesAssociations(mode: "premium" | "standard" = "standard"): Promise<void> {
    this.log("Creating gender-species associations...");

    // Get existing associations
    const existingAssociations: {
      pokemonSpeciesId: number;
      genderId: number;
    }[] = await prisma.pokemonSpeciesGenderDetails.findMany({
      select: { pokemonSpeciesId: true, genderId: true },
    });
    const existingKeys = new Set(existingAssociations.map((a) => `${a.pokemonSpeciesId}-${a.genderId}`));

    this.log(`Found ${existingKeys.size} existing gender-species associations`);

    const allGenders = await this.fetchAllFromEndpoint("gender");
    let created = 0;
    let skipped = 0;

    for (const genderRef of allGenders) {
      try {
        const genderData = await this.fetchWithProxy(genderRef.url, mode);

        if (genderData.pokemon_species_details && Array.isArray(genderData.pokemon_species_details)) {
          for (const speciesDetail of genderData.pokemon_species_details) {
            const pokemonSpeciesId = this.extractIdFromUrl(speciesDetail.pokemon_species.url);

            if (pokemonSpeciesId) {
              const compositeKey = `${pokemonSpeciesId}-${genderData.id}`;

              if (existingKeys.has(compositeKey)) {
                skipped++;
                continue;
              }

              // Verify species exists
              const speciesExists = await prisma.pokemonSpecies.findUnique({
                where: { id: pokemonSpeciesId },
                select: { id: true },
              });

              if (speciesExists) {
                await prisma.pokemonSpeciesGenderDetails.create({
                  data: {
                    pokemonSpeciesId,
                    genderId: genderData.id,
                  },
                });
                created++;
              }
            }
          }
        }

        this.log(`Processed gender ${genderData.name}`);
      } catch (error: unknown) {
        this.log(`Failed to process gender ${genderRef.name}: ${(error as Error).message}`, "error");
      }
    }

    this.log(`✅ Gender-species associations completed: ${created} created, ${skipped} skipped`);
  }

  async seedEncounterConditions(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "encounter-condition",
        categoryName: "encounters",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("encounterCondition"),
        processItem: async (condition: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processEncounterCondition(condition, mode);
        },
      }
    );
  }

  async seedEvolutionTriggers(mode: "premium" | "standard" = "standard"): Promise<void> {
    await this.seedGeneric(
      {
        endpoint: "evolution-trigger",
        categoryName: "evolutionChains",
        mode,
        progressLogInterval: 10,
      },
      {
        getExistingIds: async () => this.getExistingIds("evolutionTrigger"),
        processItem: async (trigger: NamedAPIResource, mode: "premium" | "standard") => {
          await this.processEvolutionTrigger(trigger, mode);
        },
      }
    );
  }

  async seedTypeEfficacyMatrix(): Promise<void> {
    this.log("Checking type efficacy matrix for missing relationships...");

    try {
      // Get all types and existing efficacy count with just 2 queries
      const [allTypes, existingRelations] = await Promise.all([
        prisma.type.findMany({
          select: { id: true, name: true },
          orderBy: { id: "asc" },
        }),
        prisma.typeEfficacy.count(),
      ]);

      const expectedTotal = allTypes.length * allTypes.length;

      // If we have the expected number of relationships, matrix is complete
      if (existingRelations === expectedTotal) {
        this.log(`✅ Type efficacy matrix already complete: ${existingRelations}/${expectedTotal} relationships exist`);
        return;
      }

      this.log(
        `Type efficacy matrix incomplete: ${existingRelations}/${expectedTotal} relationships exist. Finding missing relationships...`
      );

      // Get all existing relationships (regardless of damage factor)
      const existingEfficacies = await prisma.typeEfficacy.findMany({
        select: {
          damageTypeId: true,
          targetTypeId: true,
          damageFactor: true,
        },
      });

      // Create a Set for O(1) lookup of existing relationships
      const existingSet = new Set(
        existingEfficacies.map(
          (rel: { damageTypeId: number; targetTypeId: number; damageFactor: number }) =>
            `${rel.damageTypeId}-${rel.targetTypeId}`
        )
      );

      this.log(
        `Found ${existingEfficacies.length} existing efficacy relationships (including 0x, 0.5x, 2x special cases)`
      );

      // Find and create ONLY missing relationships (no relationship exists at all)
      let created = 0;
      for (const damageType of allTypes) {
        for (const targetType of allTypes) {
          const key = `${damageType.id}-${targetType.id}`;

          // Only create if NO relationship exists (preserves 0x, 0.5x, 2x)
          if (!existingSet.has(key)) {
            await prisma.typeEfficacy.create({
              data: {
                damageTypeId: damageType.id,
                targetTypeId: targetType.id,
                damageFactor: 1.0,
              },
            });
            created++;

            if (created % 10 === 0) {
              this.log(`  Created ${created} default 1.0x relationships...`);
            }
          }
        }
      }

      if (created === 0) {
        this.log(`✅ No missing relationships found - all type combinations have efficacy values`);
      } else {
        this.log(`✅ Type efficacy matrix completed: ${created} new 1.0x default relationships added`);
      }

      // Final verification
      const finalTotal = await prisma.typeEfficacy.count();
      this.log(`Final matrix: ${finalTotal}/${expectedTotal} relationships (preserving 0x, 0.5x, 2x efficacies)`);
    } catch (error: unknown) {
      this.log(`❌ Failed to complete type efficacy matrix: ${(error as Error).message}`, "error");
      throw error;
    }
  }

  // ======================================================
  //                Processing Methods
  // ======================================================

  private async processLanguage(language: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const langData = await this.fetchWithProxy(language.url, mode);

    // Create ONLY the basic language record, skip names for now
    await prisma.language.upsert({
      where: { id: langData.id },
      update: {
        name: langData.name,
        iso639: langData.iso639,
        iso3166: langData.iso3166,
        official: langData.official,
      },
      create: {
        id: langData.id,
        name: langData.name,
        iso639: langData.iso639,
        iso3166: langData.iso3166,
        official: langData.official,
      },
    });
  }

  private async processLanguageNames(langData: any): Promise<void> {
    // Create language names - all languages should exist now
    if (langData.names && Array.isArray(langData.names)) {
      for (const nameEntry of langData.names) {
        const localLanguageId = this.extractIdFromUrl(nameEntry.language.url);
        if (localLanguageId) {
          // Verify the local language exists before creating the name
          const localLanguageExists = await prisma.language.findUnique({
            where: { id: localLanguageId },
            select: { id: true },
          });

          if (localLanguageExists) {
            await prisma.languageName.upsert({
              where: {
                languageId_localLanguageId: {
                  languageId: langData.id,
                  localLanguageId,
                },
              },
              update: { name: nameEntry.name },
              create: {
                languageId: langData.id,
                localLanguageId,
                name: nameEntry.name,
              },
            });
          }
        }
      }
    }
  }

  private async processRegion(region: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const regionData = await this.fetchWithProxy(region.url, mode);

    await prisma.region.upsert({
      where: { id: regionData.id },
      update: { name: regionData.name },
      create: {
        id: regionData.id,
        name: regionData.name,
      },
    });
  }

  private async processGeneration(generation: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const genData = await this.fetchWithProxy(generation.url, mode);
    let mainRegionId = genData.main_region ? this.extractIdFromUrl(genData.main_region.url) : null;

    // Verify the region exists
    if (mainRegionId) {
      const regionExists = await prisma.region.findUnique({
        where: { id: mainRegionId },
      });
      if (!regionExists) {
        this.log(`Region ${mainRegionId} not found, skipping main_region reference`, "warn");
        mainRegionId = null;
      }
    }

    await prisma.generation.upsert({
      where: { id: genData.id },
      update: {
        name: genData.name,
        mainRegionId,
      },
      create: {
        id: genData.id,
        name: genData.name,
        mainRegionId,
      },
    });
  }

  private async processVersionGroup(versionGroup: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const vgData = await this.fetchWithProxy(versionGroup.url, mode);

    // Required field
    const generationId = this.extractIdFromUrl(vgData.generation.url);
    if (!generationId) {
      throw new Error(`Missing generation ID for version group ${vgData.name}`);
    }

    await prisma.versionGroup.upsert({
      where: { id: vgData.id },
      update: {
        name: vgData.name,
        order: vgData.order,
        generationId,
      },
      create: {
        id: vgData.id,
        name: vgData.name,
        order: vgData.order,
        generationId,
      },
    });

    // Create versions
    for (const version of vgData.versions) {
      const versionData = await this.fetchWithProxy(version.url, mode);
      await prisma.version.upsert({
        where: { id: versionData.id },
        update: {
          name: versionData.name,
          versionGroupId: vgData.id,
        },
        create: {
          id: versionData.id,
          name: versionData.name,
          versionGroupId: vgData.id,
        },
      });
      if (versionData.names && Array.isArray(versionData.names)) {
        for (const nameEntry of versionData.names) {
          const languageId = this.extractIdFromUrl(nameEntry.language?.url);
          if (languageId) {
            // Verify language exists
            const languageExists = await prisma.language.findUnique({
              where: { id: languageId },
              select: { id: true },
            });

            if (languageExists) {
              await prisma.versionName.upsert({
                where: {
                  versionId_languageId: {
                    versionId: versionData.id,
                    languageId,
                  },
                },
                update: { name: nameEntry.name },
                create: {
                  versionId: versionData.id,
                  languageId,
                  name: nameEntry.name,
                },
              });
            }
          }
        }
      }
    }
  }

  private async processType(type: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const typeData = await this.fetchWithProxy(type.url, mode);
    const generationId = typeData.generation ? this.extractIdFromUrl(typeData.generation.url) : null;

    // Create the type
    await prisma.type.upsert({
      where: { id: typeData.id },
      update: {
        name: typeData.name,
        ...(generationId !== null && { generationId }),
      },
      create: {
        id: typeData.id,
        name: typeData.name,
        ...(generationId !== null && { generationId }),
      },
    });

    // Create type names
    for (const nameEntry of typeData.names) {
      const languageId = this.extractIdFromUrl(nameEntry.language.url);
      if (languageId) {
        // Verify language exists
        const languageExists = await prisma.language.findUnique({
          where: { id: languageId },
          select: { id: true },
        });

        if (languageExists) {
          await prisma.typeName.upsert({
            where: {
              typeId_languageId: {
                typeId: typeData.id,
                languageId,
              },
            },
            update: { name: nameEntry.name },
            create: {
              typeId: typeData.id,
              languageId,
              name: nameEntry.name,
            },
          });
        } else {
          this.log(`Language ${languageId} not found for type ${typeData.name}, skipping name`, "warn");
        }
      }
    }
  }

  private async processTypeEffectiveness(type: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const typeData = await this.fetchWithProxy(type.url, mode);

    // Create ALL type effectiveness relationships (both "to" and "from")
    const effectivenessRelations = [
      // "To" relationships (this type attacking other types)
      {
        relations: typeData.damage_relations.double_damage_to,
        factor: 2.0,
        isFromRelation: false,
      },
      {
        relations: typeData.damage_relations.half_damage_to,
        factor: 0.5,
        isFromRelation: false,
      },
      {
        relations: typeData.damage_relations.no_damage_to,
        factor: 0.0,
        isFromRelation: false,
      },
      // "From" relationships (other types attacking this type)
      {
        relations: typeData.damage_relations.double_damage_from,
        factor: 2.0,
        isFromRelation: true,
      },
      {
        relations: typeData.damage_relations.half_damage_from,
        factor: 0.5,
        isFromRelation: true,
      },
      {
        relations: typeData.damage_relations.no_damage_from,
        factor: 0.0,
        isFromRelation: true,
      },
    ];

    for (const { relations, factor, isFromRelation } of effectivenessRelations) {
      for (const relatedType of relations) {
        const relatedTypeId = this.extractIdFromUrl(relatedType.url);
        if (relatedTypeId) {
          const damageTypeId = isFromRelation ? relatedTypeId : typeData.id;
          const targetTypeId = isFromRelation ? typeData.id : relatedTypeId;

          // Verify both types exist before creating relationship
          const [damageTypeExists, targetTypeExists] = await Promise.all([
            prisma.type.findUnique({
              where: { id: damageTypeId },
              select: { id: true },
            }),
            prisma.type.findUnique({
              where: { id: targetTypeId },
              select: { id: true },
            }),
          ]);

          if (damageTypeExists && targetTypeExists) {
            await prisma.typeEfficacy.upsert({
              where: {
                damageTypeId_targetTypeId: { damageTypeId, targetTypeId },
              },
              update: { damageFactor: factor },
              create: { damageTypeId, targetTypeId, damageFactor: factor },
            });
          }
        }
      }
    }

    // Create past type effectiveness relationships
    if (typeData.past_damage_relations && Array.isArray(typeData.past_damage_relations)) {
      for (const pastRelation of typeData.past_damage_relations) {
        const generationId = this.extractIdFromUrl(pastRelation.generation.url);

        if (generationId) {
          // Verify generation exists
          const generationExists = await prisma.generation.findUnique({
            where: { id: generationId },
            select: { id: true },
          });

          if (!generationExists) {
            this.log(`Generation ${generationId} not found for past type effectiveness, skipping`, "warn");
            continue;
          }

          const pastEffectivenessRelations = [
            // Past "to" relationships
            {
              relations: pastRelation.damage_relations.double_damage_to || [],
              factor: 2.0,
              isFromRelation: false,
            },
            {
              relations: pastRelation.damage_relations.half_damage_to || [],
              factor: 0.5,
              isFromRelation: false,
            },
            {
              relations: pastRelation.damage_relations.no_damage_to || [],
              factor: 0.0,
              isFromRelation: false,
            },
            // Past "from" relationships
            {
              relations: pastRelation.damage_relations.double_damage_from || [],
              factor: 2.0,
              isFromRelation: true,
            },
            {
              relations: pastRelation.damage_relations.half_damage_from || [],
              factor: 0.5,
              isFromRelation: true,
            },
            {
              relations: pastRelation.damage_relations.no_damage_from || [],
              factor: 0.0,
              isFromRelation: true,
            },
          ];

          for (const { relations, factor, isFromRelation } of pastEffectivenessRelations) {
            for (const relatedType of relations) {
              const relatedTypeId = this.extractIdFromUrl(relatedType.url);
              if (relatedTypeId) {
                const damageTypeId = isFromRelation ? relatedTypeId : typeData.id;
                const targetTypeId = isFromRelation ? typeData.id : relatedTypeId;

                // Verify both types exist
                const [damageTypeExists, targetTypeExists] = await Promise.all([
                  prisma.type.findUnique({
                    where: { id: damageTypeId },
                    select: { id: true },
                  }),
                  prisma.type.findUnique({
                    where: { id: targetTypeId },
                    select: { id: true },
                  }),
                ]);

                if (damageTypeExists && targetTypeExists) {
                  try {
                    await prisma.typeEfficacyPast.create({
                      data: {
                        damageTypeId,
                        targetTypeId,
                        damageFactor: factor,
                        generationId,
                      },
                    });
                  } catch (error: unknown) {
                    // Might be duplicate - log but don't fail
                    this.log(`Past type effectiveness already exists or failed: ${(error as Error).message}`, "debug");
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  private async processAbility(ability: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const abilityData = await this.fetchWithProxy(ability.url, mode);
    const generationId = abilityData.generation ? this.extractIdFromUrl(abilityData.generation.url) : null;

    // Create the ability
    await prisma.ability.upsert({
      where: { id: abilityData.id },
      update: {
        name: abilityData.name,
        ...(generationId !== null && { generationId }),
        isMainSeries: abilityData.is_main_series,
      },
      create: {
        id: abilityData.id,
        name: abilityData.name,
        ...(generationId !== null && { generationId }),
        isMainSeries: abilityData.is_main_series,
      },
    });

    // Create ability names
    for (const nameEntry of abilityData.names) {
      const languageId = this.extractIdFromUrl(nameEntry.language.url);
      if (languageId) {
        // Verify language exists first
        const languageExists = await prisma.language.findUnique({
          where: { id: languageId },
        });
        if (!languageExists) {
          this.log(`Language ${languageId} not found, skipping name`, "warn");
          continue;
        }

        await prisma.abilityName.upsert({
          where: {
            abilityId_languageId: { abilityId: abilityData.id, languageId },
          },
          update: { name: nameEntry.name },
          create: {
            abilityId: abilityData.id,
            languageId,
            name: nameEntry.name,
          },
        });
      }
    }

    // Create ability effect texts
    for (const effectEntry of abilityData.effect_entries) {
      const languageId = this.extractIdFromUrl(effectEntry.language.url);
      if (languageId) {
        await prisma.abilityEffectText.upsert({
          where: {
            abilityId_languageId: {
              abilityId: abilityData.id,
              languageId,
            },
          },
          update: {
            shortEffect: effectEntry.short_effect,
            effect: effectEntry.effect,
          },
          create: {
            abilityId: abilityData.id,
            languageId,
            shortEffect: effectEntry.short_effect,
            effect: effectEntry.effect,
          },
        });
      }
    }

    // Create ability flavor texts
    if (abilityData.flavor_text_entries && Array.isArray(abilityData.flavor_text_entries)) {
      for (const flavorEntry of abilityData.flavor_text_entries) {
        const languageId = this.extractIdFromUrl(flavorEntry.language?.url);
        const versionGroupId = this.extractIdFromUrl(flavorEntry.version_group?.url);

        if (languageId && versionGroupId) {
          // Verify version group exists first
          const versionGroupExists = await prisma.versionGroup.findUnique({
            where: { id: versionGroupId },
          });
          if (!versionGroupExists) {
            this.log(
              `Version group ${versionGroupId} not found for ability ${abilityData.name}, skipping flavor text`,
              "warn"
            );
            continue;
          }

          await prisma.abilityFlavorText.upsert({
            where: {
              abilityId_versionGroupId_languageId: {
                abilityId: abilityData.id,
                versionGroupId,
                languageId,
              },
            },
            update: {
              flavorText: flavorEntry.flavor_text,
            },
            create: {
              abilityId: abilityData.id,
              versionGroupId,
              languageId,
              flavorText: flavorEntry.flavor_text,
            },
          });
        }
      }
    }

    // Create ability change log entries
    if (abilityData.effect_changes && Array.isArray(abilityData.effect_changes)) {
      for (const effectChange of abilityData.effect_changes) {
        const versionGroupId = this.extractIdFromUrl(effectChange.version_group?.url);

        if (versionGroupId) {
          // Verify version group exists first
          const versionGroupExists = await prisma.versionGroup.findUnique({
            where: { id: versionGroupId },
          });
          if (!versionGroupExists) {
            this.log(
              `Version group ${versionGroupId} not found for ability ${abilityData.name}, skipping change log`,
              "warn"
            );
            continue;
          }

          // Check if this change log entry already exists
          const existingChangeLog = await prisma.abilityChangeLog.findFirst({
            where: {
              abilityId: abilityData.id,
              changedIn: versionGroupId,
            },
          });

          // Only create if it doesn't exist
          if (!existingChangeLog) {
            await prisma.abilityChangeLog.create({
              data: {
                abilityId: abilityData.id,
                changedIn: versionGroupId,
              },
            });
          }
        }
      }
    }
  }

  private async processMove(move: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const moveData = await this.fetchWithProxy(move.url, mode);

    // Extract required IDs with null checks
    const generationId = moveData.generation ? this.extractIdFromUrl(moveData.generation.url) : null;
    const typeId = moveData.type ? this.extractIdFromUrl(moveData.type.url) : null;
    const moveDamageClassId = moveData.damage_class ? this.extractIdFromUrl(moveData.damage_class.url) : null;
    const moveTargetId = moveData.target ? this.extractIdFromUrl(moveData.target.url) : null;

    // Extract optional contest-related IDs
    const contestTypeId = moveData.contest_type ? this.extractIdFromUrl(moveData.contest_type.url) : null;
    const contestEffectId = moveData.contest_effect ? this.extractIdFromUrl(moveData.contest_effect.url) : null;
    const superContestEffectId = moveData.super_contest_effect
      ? this.extractIdFromUrl(moveData.super_contest_effect.url)
      : null;

    // Skip if any required fields are missing
    if (!generationId || !typeId || !moveDamageClassId || !moveTargetId) {
      this.log(
        `Skipping move ${moveData.name}: Missing required fields (gen: ${generationId}, type: ${typeId}, damageClass: ${moveDamageClassId}, target: ${moveTargetId})`,
        "warn"
      );
      return;
    }

    // Create the move with all available fields
    await prisma.move.create({
      data: {
        id: moveData.id,
        name: moveData.name,
        generationId,
        typeId,
        moveDamageClassId,
        moveTargetId,
        power: moveData.power,
        pp: moveData.pp,
        accuracy: moveData.accuracy,
        priority: moveData.priority,
        effectChance: moveData.effect_chance,
        contestTypeId,
        contestEffectId,
        superContestEffectId,
      },
    });

    // Create move names
    if (moveData.names && Array.isArray(moveData.names)) {
      for (const nameEntry of moveData.names) {
        const languageId = this.extractIdFromUrl(nameEntry.language?.url);
        if (languageId) {
          await prisma.moveName.create({
            data: {
              moveId: moveData.id,
              languageId,
              name: nameEntry.name,
            },
          });
        }
      }
    }

    // Create move effect entries from effect_entries
    if (moveData.effect_entries && Array.isArray(moveData.effect_entries)) {
      for (const effectEntry of moveData.effect_entries) {
        const languageId = this.extractIdFromUrl(effectEntry.language?.url);
        if (languageId) {
          await prisma.moveEffectEntry.upsert({
            where: {
              moveId_languageId: {
                moveId: moveData.id,
                languageId,
              },
            },
            update: {
              effect: effectEntry.effect,
              shortEffect: effectEntry.short_effect,
            },
            create: {
              moveId: moveData.id,
              languageId,
              effect: effectEntry.effect,
              shortEffect: effectEntry.short_effect,
            },
          });
        }
      }
    }

    // Create move flavor texts
    if (moveData.flavor_text_entries && Array.isArray(moveData.flavor_text_entries)) {
      for (const flavorEntry of moveData.flavor_text_entries) {
        const languageId = this.extractIdFromUrl(flavorEntry.language?.url);
        const versionGroupId = this.extractIdFromUrl(flavorEntry.version_group?.url);

        if (languageId && versionGroupId) {
          await prisma.moveFlavorText.upsert({
            where: {
              moveId_versionGroupId_languageId: {
                moveId: moveData.id,
                versionGroupId,
                languageId,
              },
            },
            update: {
              flavorText: flavorEntry.flavor_text,
            },
            create: {
              moveId: moveData.id,
              versionGroupId,
              languageId,
              flavorText: flavorEntry.flavor_text,
            },
          });
        }
      }
    }

    // Create move stat changes
    if (moveData.stat_changes && Array.isArray(moveData.stat_changes)) {
      for (const statChange of moveData.stat_changes) {
        const statId = this.extractIdFromUrl(statChange.stat?.url);

        if (statId) {
          await prisma.moveStatChange.upsert({
            where: {
              moveId_statId: {
                moveId: moveData.id,
                statId,
              },
            },
            update: {
              change: statChange.change,
            },
            create: {
              moveId: moveData.id,
              statId,
              change: statChange.change,
            },
          });
        }
      }
    }

    // Create move meta data with improved handling
    if (moveData.meta) {
      const meta = moveData.meta;

      try {
        // Get default IDs from what's actually available in the database
        const { ailmentId: defaultAilmentId, categoryId: defaultCategoryId } = await this.getDefaultMetaIds();

        // Extract ailment and category IDs with safe fallbacks
        let moveMetaAilmentId = defaultAilmentId; // Use actual available default
        let moveMetaCategoryId = defaultCategoryId; // Use actual available default

        if (meta.ailment) {
          const extractedAilmentId = this.extractIdFromUrl(meta.ailment.url);
          if (extractedAilmentId) {
            // Verify the ailment exists in our database
            const ailmentExists = await prisma.moveMetaAilment.findUnique({
              where: { id: extractedAilmentId },
            });
            if (ailmentExists) {
              moveMetaAilmentId = extractedAilmentId;
            } else {
              this.log(
                `Move meta ailment ${extractedAilmentId} not found for move ${moveData.name}, using default ${defaultAilmentId}`,
                "warn"
              );
            }
          }
        }

        if (meta.category) {
          const extractedCategoryId = this.extractIdFromUrl(meta.category.url);
          if (extractedCategoryId) {
            // Verify the category exists in our database
            const categoryExists = await prisma.moveMetaCategory.findUnique({
              where: { id: extractedCategoryId },
            });
            if (categoryExists) {
              moveMetaCategoryId = extractedCategoryId;
            } else {
              this.log(
                `Move meta category ${extractedCategoryId} not found for move ${moveData.name}, using default ${defaultCategoryId}`,
                "warn"
              );
            }
          }
        }

        await prisma.moveMetaData.upsert({
          where: { moveId: moveData.id },
          update: {
            moveMetaAilmentId,
            moveMetaCategoryId,
            minHits: meta.min_hits,
            maxHits: meta.max_hits,
            minTurns: meta.min_turns,
            maxTurns: meta.max_turns,
            drain: meta.drain || 0,
            healing: meta.healing || 0,
            critRate: meta.crit_rate || 0,
            ailmentChance: meta.ailment_chance || 0,
            flinchChance: meta.flinch_chance || 0,
            statChance: meta.stat_chance || 0,
          },
          create: {
            moveId: moveData.id,
            moveMetaAilmentId,
            moveMetaCategoryId,
            minHits: meta.min_hits,
            maxHits: meta.max_hits,
            minTurns: meta.min_turns,
            maxTurns: meta.max_turns,
            drain: meta.drain || 0,
            healing: meta.healing || 0,
            critRate: meta.crit_rate || 0,
            ailmentChance: meta.ailment_chance || 0,
            flinchChance: meta.flinch_chance || 0,
            statChance: meta.stat_chance || 0,
          },
        });
      } catch (error: unknown) {
        this.log(`Failed to create meta data for move ${moveData.name}: ${(error as Error).message}`, "error");
        // Don't throw - just skip meta data for this move
      }
    }

    // Create move past values
    if (moveData.past_values && Array.isArray(moveData.past_values)) {
      for (const pastValue of moveData.past_values) {
        const versionGroupId = this.extractIdFromUrl(pastValue.version_group?.url);
        const typeId = pastValue.type ? this.extractIdFromUrl(pastValue.type.url) : null;

        if (versionGroupId) {
          await prisma.movePastValue.upsert({
            where: {
              moveId_versionGroupId: {
                moveId: moveData.id,
                versionGroupId,
              },
            },
            update: {
              typeId,
              power: pastValue.power,
              pp: pastValue.pp,
              accuracy: pastValue.accuracy,
              effectChance: pastValue.effect_chance,
            },
            create: {
              moveId: moveData.id,
              versionGroupId,
              typeId,
              power: pastValue.power,
              pp: pastValue.pp,
              accuracy: pastValue.accuracy,
              effectChance: pastValue.effect_chance,
            },
          });
        }
      }
    }
  }

  private async processItem(item: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const itemData = await this.fetchWithProxy(item.url, mode);

    // Check for existing item with same name
    const existingItemWithName = await prisma.item.findUnique({
      where: { name: itemData.name },
      select: { id: true, name: true, generationId: true, createdAt: true },
    });

    if (existingItemWithName) {
      this.log(`⚠️ Name conflict detected:`, "error");
      this.log(
        `  - Existing: ID ${existingItemWithName.id}, name "${existingItemWithName.name}", generation: ${existingItemWithName.generationId}`,
        "error"
      );
      this.log(
        `  - New: ID ${itemData.id}, name "${itemData.name}", generation: ${
          itemData.generation ? this.extractIdFromUrl(itemData.generation.url) : "null"
        }`,
        "error"
      );
      // Skip this item since it would violate the constraint
      return;
    }

    // Check if ID already exists (shouldn't happen based on your filtering)
    const existingItemWithId = await prisma.item.findUnique({
      where: { id: itemData.id },
      select: { id: true, name: true },
    });

    if (existingItemWithId) {
      this.log(
        `⚠️ ID ${itemData.id} already exists with name "${existingItemWithId.name}", skipping "${itemData.name}"`,
        "warn"
      );
      return;
    }

    // Required field
    const itemCategoryId = itemData.category ? this.extractIdFromUrl(itemData.category.url) : undefined;

    if (!itemCategoryId) {
      throw new Error(`Missing required item category for ${itemData.name}`);
    }

    // Optional field
    let flingEffectId = itemData.fling_effect ? this.extractIdFromUrl(itemData.fling_effect.url) : undefined;

    if (flingEffectId) {
      const flingEffectExists = await prisma.itemFlingEffect.findUnique({
        where: { id: flingEffectId },
      });
      if (!flingEffectExists) {
        this.log(`Fling effect ${flingEffectId} not found for item ${itemData.name}, skipping fling effect`, "warn");
        flingEffectId = undefined;
      }
    }

    // Add generation ID to the main item if available
    const generationId = itemData.generation ? this.extractIdFromUrl(itemData.generation.url) : undefined;

    // Prepare base data
    const baseData = {
      name: itemData.name,
      cost: itemData.cost,
      flingPower: itemData.fling_power,
    };

    await prisma.item.upsert({
      where: { id: itemData.id },
      update: {
        ...baseData,
        itemCategoryId,
        ...(flingEffectId !== undefined && { flingEffectId }),
        ...(generationId !== undefined && { generationId }),
      },
      create: {
        id: itemData.id,
        ...baseData,
        itemCategoryId,
        flingEffectId,
        generationId,
      },
    });

    // Create item names
    for (const nameEntry of itemData.names) {
      const languageId = this.extractIdFromUrl(nameEntry.language.url);
      if (languageId) {
        await prisma.itemName.upsert({
          where: {
            itemId_languageId: {
              itemId: itemData.id,
              languageId,
            },
          },
          update: { name: nameEntry.name },
          create: {
            itemId: itemData.id,
            languageId,
            name: nameEntry.name,
          },
        });
      }
    }

    // Create item effect texts
    if (itemData.effect_entries && Array.isArray(itemData.effect_entries)) {
      for (const effectEntry of itemData.effect_entries) {
        const languageId = this.extractIdFromUrl(effectEntry.language.url);
        if (languageId) {
          await prisma.itemEffectText.upsert({
            where: {
              itemId_languageId: {
                itemId: itemData.id,
                languageId,
              },
            },
            update: {
              shortEffect: effectEntry.short_effect,
              effect: effectEntry.effect,
            },
            create: {
              itemId: itemData.id,
              languageId,
              shortEffect: effectEntry.short_effect,
              effect: effectEntry.effect,
            },
          });
        }
      }
    }

    // Create item flavor texts
    if (itemData.flavor_text_entries && Array.isArray(itemData.flavor_text_entries)) {
      for (const flavorEntry of itemData.flavor_text_entries) {
        const languageId = this.extractIdFromUrl(flavorEntry.language.url);
        const versionGroupId = this.extractIdFromUrl(flavorEntry.version_group.url);
        if (languageId && versionGroupId) {
          await prisma.itemFlavorText.upsert({
            where: {
              itemId_versionGroupId_languageId: {
                itemId: itemData.id,
                versionGroupId,
                languageId,
              },
            },
            update: {
              flavorText: flavorEntry.text,
            },
            create: {
              itemId: itemData.id,
              versionGroupId,
              languageId,
              flavorText: flavorEntry.text,
            },
          });
        }
      }
    }

    // Create item game indices
    if (itemData.game_indices && Array.isArray(itemData.game_indices)) {
      for (const gameIndex of itemData.game_indices) {
        const generationId = this.extractIdFromUrl(gameIndex.generation.url);
        if (generationId) {
          await prisma.itemGameIndex.upsert({
            where: {
              itemId_generationId: {
                itemId: itemData.id,
                generationId,
              },
            },
            update: {
              gameIndex: gameIndex.game_index,
            },
            create: {
              itemId: itemData.id,
              generationId,
              gameIndex: gameIndex.game_index,
            },
          });
        }
      }
    }
  }

  private async processItemAttribute(attribute: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const attributeData = await this.fetchWithProxy(attribute.url, mode);

    // Extract and validate fields
    const itemId = this.extractIdFromUrl(attributeData.item?.url);
    const moveId = this.extractIdFromUrl(attributeData.move?.url);
    const versionGroupId = this.extractIdFromUrl(attributeData.version_group?.url);

    if (!itemId || !moveId || !versionGroupId) {
      throw new Error(`Missing required fields for machine ${attributeData.id}`);
    }

    // Verify referenced records exist
    const [itemExists, moveExists, versionGroupExists] = await Promise.all([
      prisma.item.findUnique({
        where: { id: itemId },
        select: { id: true },
      }),
      prisma.move.findUnique({
        where: { id: moveId },
        select: { id: true },
      }),
      prisma.versionGroup.findUnique({
        where: { id: versionGroupId },
        select: { id: true },
      }),
    ]);

    if (!itemExists || !moveExists || !versionGroupExists) {
      throw new Error(`Referenced records not found for machine ${attributeData.id}`);
    }

    // Create machine record
    await prisma.machine.upsert({
      where: { id: attributeData.id },
      update: { itemId, moveId, versionGroupId },
      create: { id: attributeData.id, itemId, moveId, versionGroupId },
    });
  }

  private async processMachine(machine: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const machineData = await this.fetchWithProxy(machine.url, mode);

    // Extract and validate fields
    const itemId = this.extractIdFromUrl(machineData.item?.url);
    const moveId = this.extractIdFromUrl(machineData.move?.url);
    const versionGroupId = this.extractIdFromUrl(machineData.version_group?.url);

    if (!itemId || !moveId || !versionGroupId) {
      throw new Error(`Missing required fields for machine ${machineData.id}`);
    }

    // Verify referenced records exist
    const [itemExists, moveExists, versionGroupExists] = await Promise.all([
      prisma.item.findUnique({
        where: { id: itemId },
        select: { id: true },
      }),
      prisma.move.findUnique({
        where: { id: moveId },
        select: { id: true },
      }),
      prisma.versionGroup.findUnique({
        where: { id: versionGroupId },
        select: { id: true },
      }),
    ]);

    if (!itemExists || !moveExists || !versionGroupExists) {
      throw new Error(`Referenced records not found for machine ${machineData.id}`);
    }

    // Create machine record
    await prisma.machine.upsert({
      where: { id: machineData.id },
      update: { itemId, moveId, versionGroupId },
      create: { id: machineData.id, itemId, moveId, versionGroupId },
    });
  }

  private async processPokemon(pokemonItem: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const pokemonData = await this.fetchWithProxy(pokemonItem.url, mode);
    const pokemonSpeciesId = this.extractIdFromUrl(pokemonData.species.url);

    if (!pokemonSpeciesId) {
      throw new Error(`Missing species ID for Pokemon ${pokemonData.name}`);
    }

    // Create the Pokemon
    await prisma.pokemon.upsert({
      where: { id: pokemonData.id },
      update: {
        name: pokemonData.name,
        pokemonSpeciesId,
        height: pokemonData.height,
        weight: pokemonData.weight,
        baseExperience: pokemonData.base_experience,
        order: pokemonData.order,
        isDefault: pokemonData.is_default,
        criesLatest: pokemonData.cries?.latest,
        criesLegacy: pokemonData.cries?.legacy,
      },
      create: {
        id: pokemonData.id,
        name: pokemonData.name,
        pokemonSpeciesId,
        height: pokemonData.height,
        weight: pokemonData.weight,
        baseExperience: pokemonData.base_experience,
        order: pokemonData.order,
        isDefault: pokemonData.is_default,
        criesLatest: pokemonData.cries?.latest,
        criesLegacy: pokemonData.cries?.legacy,
      },
    });

    // Create Pokemon stats
    for (const statEntry of pokemonData.stats) {
      const statId = this.extractIdFromUrl(statEntry.stat.url);
      if (statId) {
        await prisma.pokemonStat.upsert({
          where: {
            pokemonId_statId: {
              pokemonId: pokemonData.id,
              statId,
            },
          },
          update: {
            baseStat: statEntry.base_stat,
            effort: statEntry.effort,
          },
          create: {
            pokemonId: pokemonData.id,
            statId,
            baseStat: statEntry.base_stat,
            effort: statEntry.effort,
          },
        });
      }
    }

    // Create Pokemon types
    for (const typeEntry of pokemonData.types) {
      const typeId = this.extractIdFromUrl(typeEntry.type.url);
      if (typeId) {
        await prisma.pokemonType.upsert({
          where: {
            pokemonId_slot: {
              pokemonId: pokemonData.id,
              slot: typeEntry.slot,
            },
          },
          update: { typeId },
          create: {
            pokemonId: pokemonData.id,
            typeId,
            slot: typeEntry.slot,
          },
        });
      }
    }

    // Create Pokemon abilities
    for (const abilityEntry of pokemonData.abilities) {
      const abilityId = this.extractIdFromUrl(abilityEntry.ability.url);
      if (abilityId) {
        await prisma.pokemonAbility.upsert({
          where: {
            pokemonId_slot: {
              pokemonId: pokemonData.id,
              slot: abilityEntry.slot,
            },
          },
          update: {
            abilityId,
            isHidden: abilityEntry.is_hidden,
          },
          create: {
            pokemonId: pokemonData.id,
            abilityId,
            slot: abilityEntry.slot,
            isHidden: abilityEntry.is_hidden,
          },
        });
      }
    }

    // Create Pokemon sprites
    const sprites = pokemonData.sprites;
    if (sprites) {
      await prisma.pokemonSprites.upsert({
        where: { pokemonId: pokemonData.id },
        update: {
          frontDefault: sprites.front_default,
          frontShiny: sprites.front_shiny,
          frontFemale: sprites.front_female,
          frontShinyFemale: sprites.front_shiny_female,
          backDefault: sprites.back_default,
          backShiny: sprites.back_shiny,
          backFemale: sprites.back_female,
          backShinyFemale: sprites.back_shiny_female,
        },
        create: {
          pokemonId: pokemonData.id,
          frontDefault: sprites.front_default,
          frontShiny: sprites.front_shiny,
          frontFemale: sprites.front_female,
          frontShinyFemale: sprites.front_shiny_female,
          backDefault: sprites.back_default,
          backShiny: sprites.back_shiny,
          backFemale: sprites.back_female,
          backShinyFemale: sprites.back_shiny_female,
        },
      });
    }

    // Process game indices
    for (const gameIndex of pokemonData.game_indices) {
      const versionId = this.extractIdFromUrl(gameIndex.version.url);

      if (versionId) {
        await prisma.pokemonGameIndex.upsert({
          where: {
            pokemonId_versionId: {
              pokemonId: pokemonData.id,
              versionId,
            },
          },
          update: {
            gameIndex: gameIndex.game_index,
          },
          create: {
            pokemonId: pokemonData.id,
            versionId,
            gameIndex: gameIndex.game_index,
          },
        });
      }
    }

    // Process Pokemon Forms inline
    await this.processPokemonForms(pokemonData, mode);

    // Process Pokemon Movesets
    await this.processPokemonMovesets(pokemonData);

    // Process Pokemon Encounters
    await this.processPokemonEncounters(pokemonData, mode);

    // 1. Fix Pokemon Game Indices processing (in processPokemon or wherever this is called)
    // Process game indices
    if (pokemonData.game_indices && Array.isArray(pokemonData.game_indices)) {
      for (const gameIndex of pokemonData.game_indices) {
        // ADD NULL CHECK
        if (!gameIndex || !gameIndex.version || !gameIndex.version.url) {
          this.log(`Skipping game index with missing version data for Pokemon ${pokemonData.name}`, "warn");
          continue;
        }

        const versionId = this.extractIdFromUrl(gameIndex.version.url);

        if (versionId) {
          await prisma.pokemonGameIndex.upsert({
            where: {
              pokemonId_versionId: {
                pokemonId: pokemonData.id,
                versionId,
              },
            },
            update: {
              gameIndex: gameIndex.game_index,
            },
            create: {
              pokemonId: pokemonData.id,
              versionId,
              gameIndex: gameIndex.game_index,
            },
          });
        }
      }
    }

    // Pokemon Past Types processing
    if (pokemonData.past_types && Array.isArray(pokemonData.past_types)) {
      for (const pastTypeEntry of pokemonData.past_types) {
        // ADD NULL CHECK FOR GENERATION
        if (!pastTypeEntry || !pastTypeEntry.generation || !pastTypeEntry.generation.url) {
          this.log(`Skipping past type entry with missing generation data for Pokemon ${pokemonData.name}`, "warn");
          continue;
        }

        const generationId = this.extractIdFromUrl(pastTypeEntry.generation.url);

        if (generationId && pastTypeEntry.types && Array.isArray(pastTypeEntry.types)) {
          for (const typeEntry of pastTypeEntry.types) {
            // ADD NULL CHECK FOR TYPE
            if (!typeEntry || !typeEntry.type || !typeEntry.type.url) {
              this.log(`Skipping past type with missing type data for Pokemon ${pokemonData.name}`, "warn");
              continue;
            }

            const typeId = this.extractIdFromUrl(typeEntry.type.url);

            if (typeId) {
              await prisma.pokemonTypePast.upsert({
                where: {
                  pokemonId_generationId_slot: {
                    pokemonId: pokemonData.id,
                    generationId,
                    slot: typeEntry.slot,
                  },
                },
                update: { typeId },
                create: {
                  pokemonId: pokemonData.id,
                  generationId,
                  typeId,
                  slot: typeEntry.slot,
                },
              });
            }
          }
        }
      }
    }

    // Pokemon Past Abilities
    if (pokemonData.past_abilities && Array.isArray(pokemonData.past_abilities)) {
      for (const pastAbilityEntry of pokemonData.past_abilities) {
        // ADD NULL CHECK FOR GENERATION
        if (!pastAbilityEntry || !pastAbilityEntry.generation || !pastAbilityEntry.generation.url) {
          this.log(`Skipping past ability entry with missing generation data for Pokemon ${pokemonData.name}`, "warn");
          continue;
        }

        const generationId = this.extractIdFromUrl(pastAbilityEntry.generation.url);

        if (generationId && pastAbilityEntry.abilities && Array.isArray(pastAbilityEntry.abilities)) {
          for (const abilityEntry of pastAbilityEntry.abilities) {
            // ADD NULL CHECK FOR ABILITY
            if (!abilityEntry || !abilityEntry.ability || !abilityEntry.ability.url) {
              this.log(`Skipping past ability with missing ability data for Pokemon ${pokemonData.name}`, "warn");
              continue;
            }

            const abilityId = this.extractIdFromUrl(abilityEntry.ability.url);

            if (abilityId) {
              await prisma.pokemonAbilityPast.upsert({
                where: {
                  pokemonId_generationId_slot: {
                    pokemonId: pokemonData.id,
                    generationId,
                    slot: abilityEntry.slot,
                  },
                },
                update: {
                  abilityId,
                  isHidden: abilityEntry.is_hidden,
                },
                create: {
                  pokemonId: pokemonData.id,
                  generationId,
                  abilityId,
                  slot: abilityEntry.slot,
                  isHidden: abilityEntry.is_hidden,
                },
              });
            }
          }
        }
      }
    }
  }

  private async processPokemonCoreData(pokemonData: any): Promise<void> {
    // Create Pokemon abilities
    for (const abilityEntry of pokemonData.abilities) {
      const abilityId = this.extractIdFromUrl(abilityEntry.ability.url);
      if (abilityId) {
        await prisma.pokemonAbility.upsert({
          where: {
            pokemonId_slot: {
              pokemonId: pokemonData.id,
              slot: abilityEntry.slot,
            },
          },
          update: {
            abilityId,
            isHidden: abilityEntry.is_hidden,
          },
          create: {
            pokemonId: pokemonData.id,
            abilityId,
            slot: abilityEntry.slot,
            isHidden: abilityEntry.is_hidden,
          },
        });
      }
    }

    // Create Pokemon types
    for (const typeEntry of pokemonData.types) {
      const typeId = this.extractIdFromUrl(typeEntry.type.url);
      if (typeId) {
        await prisma.pokemonType.upsert({
          where: {
            pokemonId_slot: {
              pokemonId: pokemonData.id,
              slot: typeEntry.slot,
            },
          },
          update: { typeId },
          create: {
            pokemonId: pokemonData.id,
            typeId,
            slot: typeEntry.slot,
          },
        });
      }
    }

    // Create Pokemon stats
    for (const statEntry of pokemonData.stats) {
      const statId = this.extractIdFromUrl(statEntry.stat.url);
      if (statId) {
        await prisma.pokemonStat.upsert({
          where: {
            pokemonId_statId: {
              pokemonId: pokemonData.id,
              statId,
            },
          },
          update: {
            baseStat: statEntry.base_stat,
            effort: statEntry.effort,
          },
          create: {
            pokemonId: pokemonData.id,
            statId,
            baseStat: statEntry.base_stat,
            effort: statEntry.effort,
          },
        });
      }
    }

    // Create Pokemon sprites
    const sprites = pokemonData.sprites;
    if (sprites) {
      await prisma.pokemonSprites.upsert({
        where: { pokemonId: pokemonData.id },
        update: {
          frontDefault: sprites.front_default,
          frontShiny: sprites.front_shiny,
          frontFemale: sprites.front_female,
          frontShinyFemale: sprites.front_shiny_female,
          backDefault: sprites.back_default,
          backShiny: sprites.back_shiny,
          backFemale: sprites.back_female,
          backShinyFemale: sprites.back_shiny_female,
        },
        create: {
          pokemonId: pokemonData.id,
          frontDefault: sprites.front_default,
          frontShiny: sprites.front_shiny,
          frontFemale: sprites.front_female,
          frontShinyFemale: sprites.front_shiny_female,
          backDefault: sprites.back_default,
          backShiny: sprites.back_shiny,
          backFemale: sprites.back_female,
          backShinyFemale: sprites.back_shiny_female,
        },
      });
    }
  }

  async processPokemonEncounters(pokemonData: any, mode: "premium" | "standard"): Promise<void> {
    try {
      const encountersUrl = `${CONFIG.POKEAPI_BASE_URL}pokemon/${pokemonData.id}/encounters`;
      const encountersData = await this.fetchWithProxy(encountersUrl, mode);

      if (!Array.isArray(encountersData) || encountersData.length === 0) {
        this.log(`No encounters found for Pokemon ${pokemonData.name}`, "debug");
        return;
      }

      let encounterCount = 0;
      let locationCount = 0;

      // Process each location area where this Pokemon can be encountered
      for (const locationEncounter of encountersData) {
        try {
          locationCount++;

          // Check if location_area exists and has url
          if (!locationEncounter.location_area || !locationEncounter.location_area.url) {
            this.log(`Missing location area data for Pokemon ${pokemonData.name} at location ${locationCount}`, "warn");
            continue;
          }

          const locationAreaId = this.extractIdFromUrl(locationEncounter.location_area.url);

          if (!locationAreaId) {
            this.log(`Invalid location area URL for Pokemon ${pokemonData.name} at location ${locationCount}`, "warn");
            continue;
          }

          // Verify location area exists
          const locationAreaExists = await prisma.locationArea.findUnique({
            where: { id: locationAreaId },
            select: { id: true, name: true },
          });

          if (!locationAreaExists) {
            this.log(
              `Location area ${locationAreaId} not found for Pokemon ${pokemonData.name}, skipping encounters`,
              "warn"
            );
            continue;
          }

          // Process each version where encounters occur in this location
          for (const versionDetail of locationEncounter.version_details || []) {
            try {
              // Check if version exists and has url
              if (!versionDetail.version || !versionDetail.version.url) {
                this.log(`Missing version data for Pokemon ${pokemonData.name} at ${locationAreaExists.name}`, "warn");
                continue;
              }

              const versionId = this.extractIdFromUrl(versionDetail.version.url);

              if (!versionId) {
                this.log(`Invalid version URL for Pokemon ${pokemonData.name} at ${locationAreaExists.name}`, "warn");
                continue;
              }

              // Verify version exists
              const versionExists = await prisma.version.findUnique({
                where: { id: versionId },
                select: { id: true, name: true },
              });

              if (!versionExists) {
                this.log(`Version ${versionId} not found for Pokemon ${pokemonData.name}, skipping encounters`, "warn");
                continue;
              }

              // Process each specific encounter detail
              for (const encounterDetail of versionDetail.encounter_details || []) {
                try {
                  // Check if method exists and has url
                  if (!encounterDetail.method || !encounterDetail.method.url) {
                    this.log(
                      `Missing encounter method for Pokemon ${pokemonData.name} in ${versionExists.name}`,
                      "warn"
                    );
                    continue;
                  }

                  const encounterMethodId = this.extractIdFromUrl(encounterDetail.method.url);

                  if (!encounterMethodId) {
                    this.log(`Invalid encounter method URL for Pokemon ${pokemonData.name}`, "warn");
                    continue;
                  }

                  // Verify encounter method exists
                  const encounterMethodExists = await prisma.encounterMethod.findUnique({
                    where: { id: encounterMethodId },
                    select: { id: true, name: true },
                  });

                  if (!encounterMethodExists) {
                    this.log(
                      `Encounter method ${encounterMethodId} not found for Pokemon ${pokemonData.name}, skipping encounter`,
                      "warn"
                    );
                    continue;
                  }

                  // Create or update the Pokemon encounter record
                  let pokemonEncounter;

                  try {
                    // Try to find existing encounter first
                    const existingEncounter = await prisma.pokemonEncounter.findFirst({
                      where: {
                        pokemonId: pokemonData.id,
                        locationAreaId,
                        encounterMethodId,
                        versionId,
                        minLevel: encounterDetail.min_level,
                        maxLevel: encounterDetail.max_level,
                      },
                    });

                    if (existingEncounter) {
                      pokemonEncounter = await prisma.pokemonEncounter.update({
                        where: { id: existingEncounter.id },
                        data: { chance: encounterDetail.chance },
                      });
                    } else {
                      pokemonEncounter = await prisma.pokemonEncounter.create({
                        data: {
                          pokemonId: pokemonData.id,
                          locationAreaId,
                          encounterMethodId,
                          versionId,
                          minLevel: encounterDetail.min_level,
                          maxLevel: encounterDetail.max_level,
                          chance: encounterDetail.chance,
                        },
                      });
                    }

                    encounterCount++;

                    // Process encounter condition values with null checks
                    if (encounterDetail.condition_values && Array.isArray(encounterDetail.condition_values)) {
                      for (const conditionValue of encounterDetail.condition_values) {
                        // NULL CHECK HERE
                        if (!conditionValue || !conditionValue.url) {
                          this.log(`Skipping condition value with null/missing URL for ${pokemonData.name}`, "debug");
                          continue;
                        }

                        const conditionValueId = this.extractIdFromUrl(conditionValue.url);

                        if (conditionValueId && pokemonEncounter) {
                          // Verify condition value exists
                          const conditionValueExists = await prisma.encounterConditionValue.findUnique({
                            where: { id: conditionValueId },
                            select: { id: true, name: true },
                          });

                          if (conditionValueExists) {
                            try {
                              await prisma.encounterConditionValueMap.upsert({
                                where: {
                                  pokemonEncounterId_encounterConditionValueId: {
                                    pokemonEncounterId: pokemonEncounter.id,
                                    encounterConditionValueId: conditionValueId,
                                  },
                                },
                                update: {},
                                create: {
                                  pokemonEncounterId: pokemonEncounter.id,
                                  encounterConditionValueId: conditionValueId,
                                },
                              });
                            } catch (conditionError) {
                              this.log(
                                `Failed to create encounter condition mapping: ${(conditionError as Error).message}`,
                                "warn"
                              );
                            }
                          }
                        }
                      }
                    }
                  } catch (encounterError) {
                    this.log(
                      `Failed to create encounter for ${pokemonData.name}: ${(encounterError as Error).message}`,
                      "warn"
                    );
                  }
                } catch (encounterDetailError) {
                  this.log(
                    `Failed to process encounter detail for ${pokemonData.name}: ${
                      (encounterDetailError as Error).message
                    }`,
                    "warn"
                  );
                }
              }
            } catch (versionError) {
              this.log(
                `Failed to process version detail for ${pokemonData.name}: ${(versionError as Error).message}`,
                "warn"
              );
            }
          }
        } catch (locationError) {
          this.log(
            `Failed to process location encounter for ${pokemonData.name}: ${(locationError as Error).message}`,
            "warn"
          );
        }
      }

      this.log(
        `Completed encounters for ${pokemonData.name}: ${encounterCount} total encounters across ${locationCount} locations`,
        "info"
      );
    } catch (error: unknown) {
      this.log(`Failed to process encounters for Pokemon ${pokemonData.name}: ${(error as Error).message}`, "error");
      // Don't throw - just log and continue with other Pokemon data
    }
  }

  async processPokemonMovesets(pokemonData: any): Promise<void> {
    try {
      // Track unique moves for learned-by relationships
      const uniqueMoveIds = new Set<number>();

      // Process moves from the pokemon data
      for (const moveEntry of pokemonData.moves) {
        const moveId = this.extractIdFromUrl(moveEntry.move.url);

        if (moveId) {
          // Add to unique moves set for learned-by relationships
          uniqueMoveIds.add(moveId);

          // Process each version group detail for detailed movesets
          for (const versionDetail of moveEntry.version_group_details) {
            const versionGroupId = this.extractIdFromUrl(versionDetail.version_group.url);
            const moveLearnMethodId = this.extractIdFromUrl(versionDetail.move_learn_method.url);

            if (!pokemonData.id || !versionGroupId || !moveId || !moveLearnMethodId) {
              throw new Error(`Missing required fields for Pokemon move`);
            }

            if (versionGroupId && moveLearnMethodId) {
              await prisma.pokemonMove.upsert({
                where: {
                  pokemonId_versionGroupId_moveId_moveLearnMethodId: {
                    pokemonId: pokemonData.id,
                    versionGroupId,
                    moveId,
                    moveLearnMethodId,
                  },
                },
                update: {
                  levelLearnedAt: versionDetail.level_learned_at || 0,
                  order: versionDetail.order,
                },
                create: {
                  pokemonId: pokemonData.id,
                  versionGroupId,
                  moveId,
                  moveLearnMethodId,
                  levelLearnedAt: versionDetail.level_learned_at || 0,
                  order: versionDetail.order,
                },
              });
            }
          }
        }
      }

      // CREATE LEARNED-BY RELATIONSHIPS for unique moves
      for (const moveId of uniqueMoveIds) {
        try {
          // Verify move exists before creating relationship
          const moveExists = await prisma.move.findUnique({
            where: { id: moveId },
            select: { id: true },
          });

          if (moveExists) {
            await prisma.moveLearnedByPokemon.upsert({
              where: {
                moveId_pokemonId: {
                  moveId,
                  pokemonId: pokemonData.id,
                },
              },
              update: {}, // No fields to update
              create: {
                moveId,
                pokemonId: pokemonData.id,
              },
            });
          } else {
            this.log(
              `Move ${moveId} not found for Pokemon ${pokemonData.name}, skipping learned-by relationship`,
              "warn"
            );
          }
        } catch (error: unknown) {
          this.log(
            `Failed to create learned-by relationship for Pokemon ${pokemonData.name} and move ${moveId}: ${
              (error as Error).message
            }`,
            "warn"
          );
        }
      }

      this.log(`Processed ${uniqueMoveIds.size} unique moves and movesets for Pokemon ${pokemonData.name}`);
    } catch (error: unknown) {
      this.log(`Failed to process movesets for Pokemon ${pokemonData.name}: ${(error as Error).message}`, "error");
      throw error; // Re-throw to be handled by calling method
    }
  }

  async processPokemonForms(pokemonData: any, mode: "standard" | "premium"): Promise<void> {
    try {
      if (pokemonData.forms && Array.isArray(pokemonData.forms)) {
        for (const formRef of pokemonData.forms) {
          // ADD NULL CHECK
          if (!formRef || !formRef.url) {
            this.log(`Skipping form with missing URL for Pokemon ${pokemonData.name}`, "warn");
            continue;
          }

          const formId = this.extractIdFromUrl(formRef.url);
          if (formId) {
            try {
              // Fetch the detailed form data
              const formData = await this.fetchWithProxy(formRef.url, mode);

              // Extract version group ID (optional) with null check
              let versionGroupId: number | undefined = undefined;
              if (formData.version_group && formData.version_group.url) {
                const extractedVersionGroupId = this.extractIdFromUrl(formData.version_group.url);
                versionGroupId = extractedVersionGroupId !== null ? extractedVersionGroupId : undefined;
              }

              // Create/update the Pokemon form
              await prisma.pokemonForm.upsert({
                where: { id: formData.id },
                update: {
                  name: formData.name,
                  pokemonId: pokemonData.id,
                  formName: formData.form_name,
                  versionGroupId,
                  isDefault: formData.is_default,
                  isBattleOnly: formData.is_battle_only,
                  isMega: formData.is_mega,
                  formOrder: formData.form_order,
                  order: formData.order,
                },
                create: {
                  id: formData.id,
                  name: formData.name,
                  pokemonId: pokemonData.id,
                  formName: formData.form_name,
                  versionGroupId,
                  isDefault: formData.is_default,
                  isBattleOnly: formData.is_battle_only,
                  isMega: formData.is_mega,
                  formOrder: formData.form_order,
                  order: formData.order,
                },
              });

              // Create form names with null checks
              if (formData.names && Array.isArray(formData.names)) {
                for (const nameEntry of formData.names) {
                  if (!nameEntry || !nameEntry.language || !nameEntry.language.url) {
                    continue;
                  }

                  const languageId = this.extractIdFromUrl(nameEntry.language.url);
                  if (languageId) {
                    await prisma.pokemonFormName.upsert({
                      where: {
                        pokemonFormId_languageId: {
                          pokemonFormId: formData.id,
                          languageId,
                        },
                      },
                      update: {
                        name: nameEntry.name,
                        pokemonName: nameEntry.pokemon_name,
                      },
                      create: {
                        pokemonFormId: formData.id,
                        languageId,
                        name: nameEntry.name,
                        pokemonName: nameEntry.pokemon_name,
                      },
                    });
                  }
                }
              }

              // Create form types with null checks
              if (formData.types && Array.isArray(formData.types)) {
                for (const typeEntry of formData.types) {
                  if (!typeEntry || !typeEntry.type || !typeEntry.type.url) {
                    continue;
                  }

                  const typeId = this.extractIdFromUrl(typeEntry.type.url);
                  if (typeId) {
                    await prisma.pokemonFormType.upsert({
                      where: {
                        pokemonFormId_slot: {
                          pokemonFormId: formData.id,
                          slot: typeEntry.slot,
                        },
                      },
                      update: { typeId },
                      create: {
                        pokemonFormId: formData.id,
                        typeId,
                        slot: typeEntry.slot,
                      },
                    });
                  }
                }
              }

              // Create form sprites (sprites shouldn't have URL issues, but being safe)
              if (formData.sprites) {
                await prisma.pokemonFormSprites.upsert({
                  where: { pokemonFormId: formData.id },
                  update: {
                    frontDefault: formData.sprites.front_default,
                    frontShiny: formData.sprites.front_shiny,
                    backDefault: formData.sprites.back_default,
                    backShiny: formData.sprites.back_shiny,
                  },
                  create: {
                    pokemonFormId: formData.id,
                    frontDefault: formData.sprites.front_default,
                    frontShiny: formData.sprites.front_shiny,
                    backDefault: formData.sprites.back_default,
                    backShiny: formData.sprites.back_shiny,
                  },
                });
              }
            } catch (formError) {
              this.log(
                `Failed to process form ${formId} for Pokemon ${pokemonData.name}: ${(formError as Error).message}`,
                "warn"
              );
            }
          }
        }
      }
    } catch (error: unknown) {
      this.log(`Failed to process forms for Pokemon ${pokemonData.name}: ${(error as Error).message}`, "error");
    }
  }

  async processPokemonSpeciesVarieties(): Promise<void> {
    this.log("Processing Pokemon species variety relationships...");

    const allPokemon = await prisma.pokemon.findMany({
      select: {
        id: true,
        name: true,
        pokemonSpeciesId: true,
        isDefault: true,
      },
    });

    let created = 0;
    let updated = 0;

    for (const pokemon of allPokemon) {
      try {
        const existingVariety = await prisma.pokemonSpeciesVariety.findUnique({
          where: {
            pokemonSpeciesId_pokemonId: {
              pokemonSpeciesId: pokemon.pokemonSpeciesId,
              pokemonId: pokemon.id,
            },
          },
        });

        if (existingVariety) {
          // Update existing
          await prisma.pokemonSpeciesVariety.update({
            where: {
              pokemonSpeciesId_pokemonId: {
                pokemonSpeciesId: pokemon.pokemonSpeciesId,
                pokemonId: pokemon.id,
              },
            },
            data: {
              isDefault: pokemon.isDefault,
            },
          });
          updated++;
        } else {
          // Create new
          await prisma.pokemonSpeciesVariety.create({
            data: {
              pokemonSpeciesId: pokemon.pokemonSpeciesId,
              pokemonId: pokemon.id,
              isDefault: pokemon.isDefault,
            },
          });
          created++;
        }
      } catch (error: unknown) {
        this.log(`Failed to create species variety for Pokemon ${pokemon.name}: ${(error as Error).message}`, "error");
      }
    }

    this.log(`Pokemon species varieties: ${created} created, ${updated} updated`);
  }

  async processVersionGroupPokedexRelationships(pokedexData: any): Promise<void> {
    if (pokedexData.version_groups && Array.isArray(pokedexData.version_groups)) {
      for (const vgRef of pokedexData.version_groups) {
        const versionGroupId = this.extractIdFromUrl(vgRef.url);

        if (versionGroupId) {
          // Verify version group exists
          const versionGroupExists = await prisma.versionGroup.findUnique({
            where: { id: versionGroupId },
            select: { id: true },
          });

          if (versionGroupExists) {
            try {
              await prisma.versionGroupPokedex.upsert({
                where: {
                  versionGroupId_pokedexId: {
                    versionGroupId,
                    pokedexId: pokedexData.id,
                  },
                },
                update: {},
                create: {
                  versionGroupId,
                  pokedexId: pokedexData.id,
                },
              });
            } catch (error: unknown) {
              this.log(`Failed to create version group pokedex relationship: ${(error as Error).message}`, "warn");
            }
          } else {
            this.log(`Version group ${versionGroupId} not found for pokedex ${pokedexData.name}`, "warn");
          }
        }
      }
    }
  }

  async processEvolutionRelationships(): Promise<void> {
    this.log("Processing evolution relationships...");

    // Process evolves-from relationships
    for (const [pokemonId, evolvesFromId] of this.evolutionMappings) {
      try {
        // Verify both Pokemon exist
        const [pokemon, evolvesFrom] = await Promise.all([
          prisma.pokemonSpecies.findUnique({
            where: { id: pokemonId },
            select: { id: true, name: true },
          }),
          prisma.pokemonSpecies.findUnique({
            where: { id: evolvesFromId },
            select: { id: true, name: true },
          }),
        ]);

        if (!pokemon || !evolvesFrom) {
          this.log(`Skipping evolution relationship: Pokemon ${pokemonId} or ${evolvesFromId} not found`, "warn");
          continue;
        }

        await prisma.pokemonSpecies.update({
          where: { id: pokemonId },
          data: { evolvesFromSpeciesId: evolvesFromId },
        });

        this.log(`Set evolution: ${pokemon.name} (${pokemonId}) evolves from ${evolvesFrom.name} (${evolvesFromId})`);
      } catch (error: unknown) {
        this.log(`Failed to set evolution relationship for Pokemon ${pokemonId}: ${(error as Error).message}`, "error");
      }
    }

    this.log(`Completed evolution relationships: ${this.evolutionMappings.size} processed`);
  }

  private async processPokemonSpecies(speciesItem: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const speciesData = await this.fetchWithProxy(speciesItem.url, mode);

    // REQUIRED FIELDS (must not be null)
    const generationId = this.extractIdFromUrl(speciesData.generation.url);
    const colorId = this.extractIdFromUrl(speciesData.color.url);
    const shapeId = this.extractIdFromUrl(speciesData.shape.url);
    const growthRateId = this.extractIdFromUrl(speciesData.growth_rate.url);

    // Validate required fields
    if (!generationId || !colorId || !shapeId || !growthRateId) {
      throw new Error(`Missing required fields for species ${speciesData.name}`);
    }

    // OPTIONAL FIELDS (can be null)
    const evolvesFromSpeciesId = speciesData.evolves_from_species
      ? this.extractIdFromUrl(speciesData.evolves_from_species.url)
      : undefined;
    const evolutionChainId = speciesData.evolution_chain
      ? this.extractIdFromUrl(speciesData.evolution_chain.url)
      : undefined;

    // Store mappings for later processing
    if (evolvesFromSpeciesId) {
      this.evolutionMappings.set(speciesData.id, evolvesFromSpeciesId);
    }
    if (evolutionChainId) {
      this.evolutionChainMappings.set(speciesData.id, evolutionChainId);
    }

    const habitatId = speciesData.habitat ? this.extractIdFromUrl(speciesData.habitat.url) : undefined;

    // Prepare base data
    const speciesBaseData = {
      name: speciesData.name,
      captureRate: speciesData.capture_rate,
      baseHappiness: speciesData.base_happiness,
      isBaby: speciesData.is_baby,
      isLegendary: speciesData.is_legendary,
      isMythical: speciesData.is_mythical,
      hatchCounter: speciesData.hatch_counter,
      hasGenderDifferences: speciesData.has_gender_differences,
      formsSwitchable: speciesData.forms_switchable,
      genderRate: speciesData.gender_rate,
      order: speciesData.order,
    };

    const createData = {
      ...speciesBaseData,
      id: speciesData.id,
      generationId,
      colorId,
      shapeId,
      growthRateId,
      habitatId,
    };

    const updateData = {
      ...speciesBaseData,
      generationId: generationId,
      colorId: colorId,
      shapeId: shapeId,
      growthRateId: growthRateId,
      ...(habitatId !== undefined && {
        habitatId: { set: habitatId },
      }),
    };

    // Create/update species
    await prisma.pokemonSpecies.upsert({
      where: { id: speciesData.id },
      update: updateData,
      create: createData,
    });

    // Create species names
    for (const nameEntry of speciesData.names) {
      const languageId = this.extractIdFromUrl(nameEntry.language.url);
      if (languageId) {
        await prisma.pokemonSpeciesName.upsert({
          where: {
            pokemonSpeciesId_languageId: {
              pokemonSpeciesId: speciesData.id,
              languageId,
            },
          },
          update: {
            name: nameEntry.name,
            genus: speciesData.genera.find(
              (g: { genus: string; language: NamedAPIResource }) => this.extractIdFromUrl(g.language.url) === languageId
            )?.genus,
          },
          create: {
            pokemonSpeciesId: speciesData.id,
            languageId,
            name: nameEntry.name,
            genus: speciesData.genera.find(
              (g: { genus: string; language: NamedAPIResource }) => this.extractIdFromUrl(g.language.url) === languageId
            )?.genus,
          },
        });
      }
    }

    // Create egg group relationships
    for (const eggGroup of speciesData.egg_groups) {
      const eggGroupId = this.extractIdFromUrl(eggGroup.url);
      if (eggGroupId) {
        await prisma.pokemonSpeciesEggGroup.upsert({
          where: {
            pokemonSpeciesId_eggGroupId: {
              pokemonSpeciesId: speciesData.id,
              eggGroupId,
            },
          },
          update: {},
          create: {
            pokemonSpeciesId: speciesData.id,
            eggGroupId,
          },
        });
      }
    }

    // Add flavor text entries
    for (const flavorEntry of speciesData.flavor_text_entries) {
      const languageId = this.extractIdFromUrl(flavorEntry.language.url);
      const versionId = this.extractIdFromUrl(flavorEntry.version.url);

      if (languageId && versionId) {
        await prisma.pokemonSpeciesFlavorText.upsert({
          where: {
            pokemonSpeciesId_versionId_languageId: {
              pokemonSpeciesId: speciesData.id,
              versionId,
              languageId,
            },
          },
          update: { flavorText: flavorEntry.flavor_text },
          create: {
            pokemonSpeciesId: speciesData.id,
            versionId,
            languageId,
            flavorText: flavorEntry.flavor_text,
          },
        });
      }
    }
  }

  private async processPokedex(
    pokedex: NamedAPIResource,
    mode: "premium" | "standard"
  ): Promise<{
    pokedexId: number;
    pokemonEntries: { pokedexId: number; pokedexNumber: number }[];
  } | null> {
    const pokedexData = await this.fetchWithProxy(pokedex.url, mode);

    // Extract region ID (optional)
    const regionId = pokedexData.region ? this.extractIdFromUrl(pokedexData.region.url) : undefined;

    // Verify region exists if provided
    if (pokedexData.region && regionId) {
      const regionExists = await prisma.region.findUnique({
        where: { id: regionId },
        select: { id: true },
      });

      if (!regionExists) {
        this.log(`Region ${regionId} not found for pokedex ${pokedexData.name}, setting region to null`, "warn");
      }
    }

    // Create/update the pokedex
    await prisma.pokedex.upsert({
      where: { id: pokedexData.id },
      update: {
        name: pokedexData.name,
        isMainSeries: pokedexData.is_main_series,
        regionId: regionId || undefined,
      },
      create: {
        id: pokedexData.id,
        name: pokedexData.name,
        isMainSeries: pokedexData.is_main_series,
        regionId: regionId || undefined,
      },
    });

    // Create pokedex names
    if (pokedexData.names && Array.isArray(pokedexData.names)) {
      for (const nameEntry of pokedexData.names) {
        const languageId = this.extractIdFromUrl(nameEntry.language.url);
        if (languageId) {
          // Verify language exists
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.pokedexName.upsert({
              where: {
                pokedexId_languageId: {
                  pokedexId: pokedexData.id,
                  languageId,
                },
              },
              update: { name: nameEntry.name },
              create: {
                pokedexId: pokedexData.id,
                languageId,
                name: nameEntry.name,
              },
            });
          }
        }
      }
    }

    // Create pokedex descriptions
    if (pokedexData.descriptions && Array.isArray(pokedexData.descriptions)) {
      for (const descEntry of pokedexData.descriptions) {
        const languageId = this.extractIdFromUrl(descEntry.language.url);
        if (languageId) {
          // Verify language exists
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.pokedexDescription.upsert({
              where: {
                pokedexId_languageId: {
                  pokedexId: pokedexData.id,
                  languageId,
                },
              },
              update: { description: descEntry.description },
              create: {
                pokedexId: pokedexData.id,
                languageId,
                description: descEntry.description,
              },
            });
          }
        }
      }

      await this.processVersionGroupPokedexRelationships(pokedexData);
    }

    // Collect Pokemon entries for later bulk processing
    const pokemonEntries: { pokedexId: number; pokedexNumber: number }[] = [];
    if (pokedexData.pokemon_entries && Array.isArray(pokedexData.pokemon_entries)) {
      for (const entry of pokedexData.pokemon_entries) {
        const pokemonSpeciesId = this.extractIdFromUrl(entry.pokemon_species.url);
        if (pokemonSpeciesId) {
          pokemonEntries.push({
            pokedexId: pokemonSpeciesId,
            pokedexNumber: entry.entry_number,
          });
        }
      }
    }

    this.log(`Created pokedex: ${pokedexData.name} with ${pokemonEntries.length} Pokemon entries`);

    return {
      pokedexId: pokedexData.id,
      pokemonEntries,
    };
  }

  private async processPokemonSpeciesPokedexNumbers(
    pokemonSpeciesUpdates: Map<number, { pokedexId: number; pokedexNumber: number }[]>
  ): Promise<void> {
    let totalUpdates = 0;
    let successfulUpdates = 0;

    for (const [pokedexId, pokemonEntries] of pokemonSpeciesUpdates) {
      for (const entry of pokemonEntries) {
        try {
          totalUpdates++;

          // Verify Pokemon species exists
          const pokemonSpeciesExists = await prisma.pokemonSpecies.findUnique({
            where: { id: entry.pokedexId },
            select: { id: true, name: true },
          });

          if (!pokemonSpeciesExists) {
            this.log(`Pokemon species ${entry.pokedexId} not found, skipping pokedex entry`, "warn");
            continue;
          }

          // Create the pokedex number entry
          await prisma.pokemonSpeciesPokedexNumber.upsert({
            where: {
              pokemonSpeciesId_pokedexId: {
                pokemonSpeciesId: entry.pokedexId,
                pokedexId,
              },
            },
            update: { pokedexNumber: entry.pokedexNumber },
            create: {
              pokemonSpeciesId: entry.pokedexId,
              pokedexId,
              pokedexNumber: entry.pokedexNumber,
            },
          });

          successfulUpdates++;
        } catch (error: unknown) {
          this.log(
            `Failed to update pokedex number for species ${entry.pokedexId} in pokedex ${pokedexId}: ${
              (error as Error).message
            }`,
            "error"
          );
        }
      }

      // Progress logging for large pokedexes
      if (pokemonEntries.length > 50) {
        this.log(`Updated ${pokemonEntries.length} Pokemon entries for pokedex ${pokedexId}`);
      }
    }

    this.log(`Completed Pokemon species pokedex number updates: ${successfulUpdates}/${totalUpdates} successful`);
  }

  private async processEncounterMethod(method: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const methodData = await this.fetchWithProxy(method.url, mode);

    await prisma.encounterMethod.upsert({
      where: { id: methodData.id },
      update: {
        name: methodData.name,
        order: methodData.order,
      },
      create: {
        id: methodData.id,
        name: methodData.name,
        order: methodData.order,
      },
    });

    // Create encounter method names if they exist
    if (methodData.names && Array.isArray(methodData.names)) {
      for (const nameEntry of methodData.names) {
        const languageId = this.extractIdFromUrl(nameEntry.language.url);
        if (languageId) {
          // Verify language exists first
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.encounterMethodName.upsert({
              where: {
                encounterMethodId_languageId: {
                  encounterMethodId: methodData.id,
                  languageId,
                },
              },
              update: { name: nameEntry.name },
              create: {
                encounterMethodId: methodData.id,
                languageId,
                name: nameEntry.name,
              },
            });
          }
        }
      }
    }
  }

  private async processEvolutionChainRecord(chainData: any): Promise<void> {
    const babyTriggerItemId = chainData.baby_trigger_item
      ? this.extractIdFromUrl(chainData.baby_trigger_item.url)
      : null;

    // Verify baby trigger item exists if provided
    if (babyTriggerItemId) {
      const itemExists = await prisma.item.findUnique({
        where: { id: babyTriggerItemId },
        select: { id: true },
      });

      if (!itemExists) {
        this.log(
          `Baby trigger item ${babyTriggerItemId} not found for evolution chain ${chainData.id}, setting to null`,
          "warn"
        );
      }
    }

    // Create/update the evolution chain
    await prisma.evolutionChain.upsert({
      where: { id: chainData.id },
      update: { babyTriggerItemId: babyTriggerItemId },
      create: {
        id: chainData.id,
        babyTriggerItemId: babyTriggerItemId,
      },
    });
  }

  private async processEvolutionChainSpecies(chainData: any): Promise<void> {
    // Recursively process the evolution chain
    const processChainNode = async (chainNode: any): Promise<void> => {
      if (!chainNode || !chainNode.species) return;

      const speciesId = this.extractIdFromUrl(chainNode.species.url);
      if (!speciesId) return;

      // Update Pokemon species with evolution chain ID
      try {
        await prisma.pokemonSpecies.update({
          where: { id: speciesId },
          data: { evolutionChainId: chainData.id },
        });

        this.log(
          `Updated species ${chainNode.species.name} (${speciesId}) with evolution chain ${chainData.id}`,
          "debug"
        );
      } catch (error) {
        this.log(
          `Failed to update species ${speciesId} with evolution chain ${chainData.id}: ${(error as Error).message}`,
          "warn"
        );
      }

      // Process evolution details for this species
      if (chainNode.evolves_to && Array.isArray(chainNode.evolves_to)) {
        for (const evolvedForm of chainNode.evolves_to) {
          await this.processEvolutionDetails(speciesId, evolvedForm);
          await processChainNode(evolvedForm);
        }
      }
    };

    // Start from the root of the chain
    await processChainNode(chainData.chain);
  }

  private async processEvolutionDetails(fromSpeciesId: number, evolvedForm: any): Promise<void> {
    if (!evolvedForm.species || !evolvedForm.evolution_details) return;

    const toSpeciesId = this.extractIdFromUrl(evolvedForm.species.url);
    if (!toSpeciesId) return;

    // Process each evolution detail (there can be multiple ways to evolve)
    for (const detail of evolvedForm.evolution_details) {
      try {
        // Extract all the evolution requirements
        const evolutionTriggerId = detail.trigger ? this.extractIdFromUrl(detail.trigger.url) : null;

        if (!evolutionTriggerId) {
          this.log(`Missing evolution trigger for ${evolvedForm.species.name}, skipping`, "warn");
          continue;
        }

        // Extract optional IDs
        const evolutionItemId = detail.item ? this.extractIdFromUrl(detail.item.url) : null;
        const genderId = detail.gender ? this.extractIdFromUrl(detail.gender.url) : null;
        const locationId = detail.location ? this.extractIdFromUrl(detail.location.url) : null;
        const heldItemId = detail.held_item ? this.extractIdFromUrl(detail.held_item.url) : null;
        const knownMoveId = detail.known_move ? this.extractIdFromUrl(detail.known_move.url) : null;
        const knownMoveTypeId = detail.known_move_type ? this.extractIdFromUrl(detail.known_move_type.url) : null;
        const partySpeciesId = detail.party_species ? this.extractIdFromUrl(detail.party_species.url) : null;
        const partyTypeId = detail.party_type ? this.extractIdFromUrl(detail.party_type.url) : null;
        const tradeSpeciesId = detail.trade_species ? this.extractIdFromUrl(detail.trade_species.url) : null;

        // Create the evolution record
        await prisma.pokemonEvolution.create({
          data: {
            pokemonSpeciesId: toSpeciesId, // The species this evolves TO
            evolutionTriggerId,
            evolutionItemId,
            minLevel: detail.min_level,
            genderId,
            locationId,
            heldItemId,
            timeOfDay: detail.time_of_day || null,
            knownMoveId,
            knownMoveTypeId,
            minHappiness: detail.min_happiness,
            minBeauty: detail.min_beauty,
            minAffection: detail.min_affection,
            needsOverworldRain: detail.needs_overworld_rain || false,
            partySpeciesId,
            partyTypeId,
            relativePhysicalStats: detail.relative_physical_stats,
            tradeSpeciesId,
            turnUpsideDown: detail.turn_upside_down || false,
          },
        });

        this.log(
          `Created evolution: ${evolvedForm.species.name} (${toSpeciesId}) from species ${fromSpeciesId} via ${detail.trigger?.name}`,
          "debug"
        );
      } catch (error) {
        this.log(`Failed to create evolution for ${evolvedForm.species.name}: ${(error as Error).message}`, "error");
      }
    }
  }

  private async processMoveDamageClass(mdc: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const mdcData = await this.fetchWithProxy(mdc.url, mode);

    // Create/update the move damage class
    await prisma.moveDamageClass.upsert({
      where: { id: mdcData.id },
      update: { name: mdcData.name },
      create: { id: mdcData.id, name: mdcData.name },
    });

    // Create move damage class names
    if (mdcData.names && Array.isArray(mdcData.names)) {
      for (const nameEntry of mdcData.names) {
        const languageId = this.extractIdFromUrl(nameEntry.language?.url);
        if (languageId) {
          // Verify language exists
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.moveDamageClassName.upsert({
              where: {
                moveDamageClassId_languageId: {
                  moveDamageClassId: mdcData.id,
                  languageId,
                },
              },
              update: { name: nameEntry.name },
              create: {
                moveDamageClassId: mdcData.id,
                languageId,
                name: nameEntry.name,
              },
            });
          }
        }
      }
    }

    // Create move damage class descriptions
    if (mdcData.descriptions && Array.isArray(mdcData.descriptions)) {
      for (const descEntry of mdcData.descriptions) {
        const languageId = this.extractIdFromUrl(descEntry.language?.url);
        if (languageId) {
          // Verify language exists
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.moveDamageClassDescription.upsert({
              where: {
                moveDamageClassId_languageId: {
                  moveDamageClassId: mdcData.id,
                  languageId,
                },
              },
              update: { description: descEntry.description },
              create: {
                moveDamageClassId: mdcData.id,
                languageId,
                description: descEntry.description,
              },
            });
          }
        }
      }
    }
  }

  private async processMoveTargetItem(mt: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const mtData = await this.fetchWithProxy(mt.url, mode);
    await prisma.moveTarget.upsert({
      where: { id: mtData.id },
      update: { name: mtData.name },
      create: { id: mtData.id, name: mtData.name },
    });
  }

  private async processStat(stat: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const statData = await this.fetchWithProxy(stat.url, mode);

    // Create the stat
    await prisma.stat.upsert({
      where: { id: statData.id },
      update: {
        name: statData.name,
        isBattleOnly: statData.is_battle_only,
        gameIndex: statData.game_index,
      },
      create: {
        id: statData.id,
        name: statData.name,
        isBattleOnly: statData.is_battle_only,
        gameIndex: statData.game_index,
      },
    });

    // Create stat names
    if (statData.names && Array.isArray(statData.names)) {
      for (const nameEntry of statData.names) {
        const languageId = this.extractIdFromUrl(nameEntry.language?.url);
        if (languageId) {
          // Verify language exists
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.statName.upsert({
              where: {
                statId_languageId: {
                  statId: statData.id,
                  languageId,
                },
              },
              update: { name: nameEntry.name },
              create: {
                statId: statData.id,
                languageId,
                name: nameEntry.name,
              },
            });
          } else {
            this.log(`Language ${languageId} not found for stat ${statData.name}, skipping name`, "warn");
          }
        }
      }
    }
  }

  private async processGender(gender: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const genderData = await this.fetchWithProxy(gender.url, mode);

    // Create only the gender - no species relationships yet
    await prisma.gender.upsert({
      where: { id: genderData.id },
      update: { name: genderData.name },
      create: {
        id: genderData.id,
        name: genderData.name,
      },
    });
  }

  private async processNature(nature: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const natureData = await this.fetchWithProxy(nature.url, mode);

    // Extract optional stat and flavor references
    const decreasedStatId = natureData.decreased_stat ? this.extractIdFromUrl(natureData.decreased_stat.url) : null;
    const increasedStatId = natureData.increased_stat ? this.extractIdFromUrl(natureData.increased_stat.url) : null;
    const hatesFlavorId = natureData.hates_flavor ? this.extractIdFromUrl(natureData.hates_flavor.url) : null;
    const likesFlavorId = natureData.likes_flavor ? this.extractIdFromUrl(natureData.likes_flavor.url) : null;

    // Create the nature (removed gameIndex)
    await prisma.nature.upsert({
      where: { id: natureData.id },
      update: {
        name: natureData.name,
        decreasedStatId,
        increasedStatId,
        hatesFlavorId,
        likesFlavorId,
      },
      create: {
        id: natureData.id,
        name: natureData.name,
        decreasedStatId,
        increasedStatId,
        hatesFlavorId,
        likesFlavorId,
      },
    });

    // Create nature names
    if (natureData.names && Array.isArray(natureData.names)) {
      for (const nameEntry of natureData.names) {
        const languageId = this.extractIdFromUrl(nameEntry.language.url);
        if (languageId) {
          // Verify language exists
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.natureName.upsert({
              where: {
                natureId_languageId: {
                  natureId: natureData.id,
                  languageId,
                },
              },
              update: { name: nameEntry.name },
              create: {
                natureId: natureData.id,
                languageId,
                name: nameEntry.name,
              },
            });
          }
        }
      }
    }

    // Create nature pokeathlon stat affects (if any)
    if (natureData.pokeathlon_stat_changes && Array.isArray(natureData.pokeathlon_stat_changes)) {
      for (const statChange of natureData.pokeathlon_stat_changes) {
        const pokeathlonStatId = this.extractIdFromUrl(statChange.pokeathlon_stat.url);
        if (pokeathlonStatId) {
          // Verify pokeathlon stat exists
          const pokeathlonStatExists = await prisma.pokeathlonStat.findUnique({
            where: { id: pokeathlonStatId },
            select: { id: true },
          });

          if (pokeathlonStatExists) {
            await prisma.naturePokeathlonStatAffect.upsert({
              where: {
                natureId_pokeathlonStatId: {
                  natureId: natureData.id,
                  pokeathlonStatId,
                },
              },
              update: { maxChange: statChange.max_change },
              create: {
                natureId: natureData.id,
                pokeathlonStatId,
                maxChange: statChange.max_change,
              },
            });
          }
        }
      }
    }

    // Create nature battle style preferences (if any)
    if (natureData.move_battle_style_preferences && Array.isArray(natureData.move_battle_style_preferences)) {
      for (const preference of natureData.move_battle_style_preferences) {
        const moveBattleStyleId = this.extractIdFromUrl(preference.move_battle_style.url);
        if (moveBattleStyleId) {
          // Verify MoveBattleStyle exists before creating relationship
          const moveBattleStyleExists = await prisma.moveBattleStyle.findUnique({
            where: { id: moveBattleStyleId },
            select: { id: true },
          });

          if (moveBattleStyleExists) {
            await prisma.natureBattleStylePreference.upsert({
              where: {
                natureId_moveBattleStyleId: {
                  natureId: natureData.id,
                  moveBattleStyleId,
                },
              },
              update: {
                lowHpPreference: preference.low_hp_preference,
                highHpPreference: preference.high_hp_preference,
              },
              create: {
                natureId: natureData.id,
                moveBattleStyleId,
                lowHpPreference: preference.low_hp_preference,
                highHpPreference: preference.high_hp_preference,
              },
            });
          } else {
            this.log(
              `MoveBattleStyle ${moveBattleStyleId} not found for nature ${natureData.name}, skipping battle style preference`,
              "warn"
            );
          }
        }
      }
    }
  }

  private async processPokeathlonStat(stat: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const statData = await this.fetchWithProxy(stat.url, mode);

    // Create the pokeathlon stat
    await prisma.pokeathlonStat.upsert({
      where: { id: statData.id },
      update: { name: statData.name },
      create: {
        id: statData.id,
        name: statData.name,
      },
    });

    // Create pokeathlon stat names
    if (statData.names && Array.isArray(statData.names)) {
      for (const nameEntry of statData.names) {
        const languageId = this.extractIdFromUrl(nameEntry.language.url);
        if (languageId) {
          // Verify language exists
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.pokeathlonStatName.upsert({
              where: {
                pokeathlonStatId_languageId: {
                  pokeathlonStatId: statData.id,
                  languageId,
                },
              },
              update: { name: nameEntry.name },
              create: {
                pokeathlonStatId: statData.id,
                languageId,
                name: nameEntry.name,
              },
            });
          }
        }
      }
    }
  }

  private async processPalParkArea(area: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const areaData = await this.fetchWithProxy(area.url, mode);

    // Create the pal park area
    await prisma.palParkArea.upsert({
      where: { id: areaData.id },
      update: { name: areaData.name },
      create: {
        id: areaData.id,
        name: areaData.name,
      },
    });

    // Create pal park area names
    if (areaData.names && Array.isArray(areaData.names)) {
      for (const nameEntry of areaData.names) {
        const languageId = this.extractIdFromUrl(nameEntry.language.url);
        if (languageId) {
          // Verify language exists
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.palParkAreaName.upsert({
              where: {
                palParkAreaId_languageId: {
                  palParkAreaId: areaData.id,
                  languageId,
                },
              },
              update: { name: nameEntry.name },
              create: {
                palParkAreaId: areaData.id,
                languageId,
                name: nameEntry.name,
              },
            });
          }
        }
      }
    }
  }

  private async processBerry(berry: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const berryData = await this.fetchWithProxy(berry.url, mode);

    // Extract required IDs
    const berryFirmnessId = this.extractIdFromUrl(berryData.firmness.url);
    const naturalGiftTypeId = this.extractIdFromUrl(berryData.natural_gift_type.url);
    const itemId = this.extractIdFromUrl(berryData.item.url);

    if (!berryFirmnessId || !naturalGiftTypeId || !itemId) {
      throw new Error(`Missing required fields for berry ${berryData.name}`);
    }

    // Create the berry
    await prisma.berry.upsert({
      where: { id: berryData.id },
      update: {
        name: berryData.name,
        berryFirmnessId,
        naturalGiftPower: berryData.natural_gift_power,
        naturalGiftTypeId,
        size: berryData.size,
        maxHarvest: berryData.max_harvest,
        growthTime: berryData.growth_time,
        soilDryness: berryData.soil_dryness,
        smoothness: berryData.smoothness,
        itemId,
      },
      create: {
        id: berryData.id,
        name: berryData.name,
        berryFirmnessId,
        naturalGiftPower: berryData.natural_gift_power,
        naturalGiftTypeId,
        size: berryData.size,
        maxHarvest: berryData.max_harvest,
        growthTime: berryData.growth_time,
        soilDryness: berryData.soil_dryness,
        smoothness: berryData.smoothness,
        itemId,
      },
    });

    // Create berry flavor mappings
    if (berryData.flavors && Array.isArray(berryData.flavors)) {
      for (const flavorEntry of berryData.flavors) {
        const berryFlavorId = this.extractIdFromUrl(flavorEntry.flavor.url);
        if (berryFlavorId) {
          // Verify berry flavor exists
          const berryFlavorExists = await prisma.berryFlavor.findUnique({
            where: { id: berryFlavorId },
            select: { id: true },
          });

          if (berryFlavorExists) {
            await prisma.berryFlavorMap.upsert({
              where: {
                berryId_berryFlavorId: {
                  berryId: berryData.id,
                  berryFlavorId,
                },
              },
              update: { potency: flavorEntry.potency },
              create: {
                berryId: berryData.id,
                berryFlavorId,
                potency: flavorEntry.potency,
              },
            });
          }
        }
      }
    }
  }

  private async processMoveLearnMethod(mlm: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const mlmData = await this.fetchWithProxy(mlm.url, mode);
    await prisma.moveLearnMethod.upsert({
      where: { id: mlmData.id },
      update: { name: mlmData.name },
      create: { id: mlmData.id, name: mlmData.name },
    });
  }

  private async processEggGroup(eggGroup: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const eggGroupData = await this.fetchWithProxy(eggGroup.url, mode);
    await prisma.eggGroup.upsert({
      where: { id: eggGroupData.id },
      update: { name: eggGroupData.name },
      create: { id: eggGroupData.id, name: eggGroupData.name },
    });

    // Upsert egg group names
    if (eggGroupData.names && Array.isArray(eggGroupData.names)) {
      for (const nameEntry of eggGroupData.names) {
        const languageId = this.extractIdFromUrl(nameEntry.language.url);
        if (languageId) {
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.eggGroupName.upsert({
              where: {
                eggGroupId_languageId: {
                  // This composite key is based on your schema update
                  eggGroupId: eggGroupData.id,
                  languageId,
                },
              },
              update: {
                name: nameEntry.name,
              },
              create: {
                eggGroupId: eggGroupData.id,
                languageId,
                name: nameEntry.name,
              },
            });
          } else {
            this.log(`Language ${languageId} not found for egg group ${eggGroupData.name}, skipping name`, "warn");
          }
        }
      }
    }
  }

  private async processGrowthRate(growthRate: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const growthRateData = await this.fetchWithProxy(growthRate.url, mode);
    await prisma.growthRate.upsert({
      where: { id: growthRateData.id },
      update: { name: growthRateData.name, formula: growthRateData.formula },
      create: {
        id: growthRateData.id,
        name: growthRateData.name,
        formula: growthRateData.formula,
      },
    });

    // Upsert growth rate descriptions
    if (growthRateData.descriptions && Array.isArray(growthRateData.descriptions)) {
      for (const description of growthRateData.descriptions) {
        const languageId = this.extractIdFromUrl(description.language.url);
        if (languageId) {
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.growthRateDescription.upsert({
              where: {
                growthRateId_languageId: {
                  // This is the composite key from your schema
                  growthRateId: growthRateData.id,
                  languageId,
                },
              },
              update: {
                description: description.description,
              },
              create: {
                growthRateId: growthRateData.id,
                languageId,
                description: description.description,
              },
            });
          } else {
            this.log(
              `Language ${languageId} not found for growth rate ${growthRateData.name}, skipping description`,
              "warn"
            );
          }
        }
      }
    }

    // Upsert growth rate experience levels
    if (growthRateData.levels && Array.isArray(growthRateData.levels)) {
      for (const growthRateLevel of growthRateData.levels) {
        await prisma.growthRateExperienceLevel.upsert({
          where: {
            growthRateId_level: {
              // This is the composite key from your schema
              growthRateId: growthRateData.id,
              level: growthRateLevel.level,
            },
          },
          update: {
            experience: growthRateLevel.experience,
          },
          create: {
            growthRateId: growthRateData.id,
            level: growthRateLevel.level,
            experience: growthRateLevel.experience,
          },
        });
      }
    }
  }

  private async processPokemonColor(pkmnColor: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const pkmnColorData = await this.fetchWithProxy(pkmnColor.url, mode);
    await prisma.pokemonColor.upsert({
      where: { id: pkmnColorData.id },
      update: { name: pkmnColorData.name },
      create: {
        id: pkmnColorData.id,
        name: pkmnColorData.name,
      },
    });
  }

  private async processPokemonShape(pkmnShape: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const pkmnShapeData = await this.fetchWithProxy(pkmnShape.url, mode);
    await prisma.pokemonShape.upsert({
      where: { id: pkmnShapeData.id },
      update: { name: pkmnShapeData.name },
      create: {
        id: pkmnShapeData.id,
        name: pkmnShapeData.name,
      },
    });
  }

  private async processPokemonHabitat(pkmnHabitat: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const pkmnHabitatData = await this.fetchWithProxy(pkmnHabitat.url, mode);
    await prisma.pokemonHabitat.upsert({
      where: { id: pkmnHabitatData.id },
      update: { name: pkmnHabitatData.name },
      create: {
        id: pkmnHabitatData.id,
        name: pkmnHabitatData.name,
      },
    });
  }

  private async processBerryFlavor(bflav: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const bflavData = await this.fetchWithProxy(bflav.url, mode);

    // Create the berry flavor
    await prisma.berryFlavor.create({
      data: { id: bflavData.id, name: bflavData.name },
    });

    // Create berry flavor names
    if (bflavData.names && Array.isArray(bflavData.names)) {
      for (const nameEntry of bflavData.names) {
        const languageId = this.extractIdFromUrl(nameEntry.language.url);
        if (languageId) {
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.berryFlavorName.create({
              data: {
                berryFlavorId: bflavData.id,
                languageId,
                name: nameEntry.name,
              },
            });
          } else {
            this.log(`Language ${languageId} not found for berry flavor ${bflavData.name}, skipping name`, "warn");
          }
        }
      }
    }
  }

  private async processBerryFirmness(bfirm: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const bfirmData = await this.fetchWithProxy(bfirm.url, mode);

    // Create the berry firmness
    await prisma.berryFirmness.create({
      data: { id: bfirmData.id, name: bfirmData.name },
    });

    // Create berry firmness names
    if (bfirmData.names && Array.isArray(bfirmData.names)) {
      for (const nameEntry of bfirmData.names) {
        const languageId = this.extractIdFromUrl(nameEntry.language.url);
        if (languageId) {
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.berryFirmnessName.create({
              data: {
                berryFirmnessId: bfirmData.id,
                languageId,
                name: nameEntry.name,
              },
            });
          } else {
            this.log(`Language ${languageId} not found for berry firmness ${bfirmData.name}, skipping name`, "warn");
          }
        }
      }
    }
  }

  private async processMoveMetaAilment(mma: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const mmaData = await this.fetchWithProxy(mma.url, mode);

    // Create the move meta ailment
    await prisma.moveMetaAilment.create({
      data: { id: mmaData.id, name: mmaData.name },
    });

    // Create move meta ailment names with validation
    if (mmaData.names && Array.isArray(mmaData.names)) {
      for (const nameEntry of mmaData.names) {
        const languageId = this.extractIdFromUrl(nameEntry.language.url);
        if (languageId) {
          // Validate existing language
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.moveMetaAilmentName.create({
              data: {
                moveMetaAilmentId: mmaData.id,
                languageId,
                name: nameEntry.name,
              },
            });
          } else {
            this.log(`Language ${languageId} not found for move meta ailment ${mmaData.name}, skipping name`, "warn");
          }
        }
      }
    }
  }

  private async processMoveMetaCategory(mmc: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const mmcData = await this.fetchWithProxy(mmc.url, mode);

    // Create the move meta category
    await prisma.moveMetaCategory.create({
      data: { id: mmcData.id, name: mmcData.name },
    });

    // Create move meta category descriptions
    if (mmcData.descriptions && Array.isArray(mmcData.descriptions)) {
      for (const descEntry of mmcData.descriptions) {
        const languageId = this.extractIdFromUrl(descEntry.language.url);
        if (languageId) {
          await prisma.moveMetaCategoryDescription.create({
            data: {
              moveMetaCategoryId: mmcData.id,
              languageId,
              description: descEntry.description,
            },
          });
        }
      }
    }
  }

  private async processContestType(ct: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const ctData = await this.fetchWithProxy(ct.url, mode);

    // Extract berry flavor ID (optional)
    const berryFlavorId = ctData.berry_flavor ? this.extractIdFromUrl(ctData.berry_flavor.url) : null;

    await prisma.contestType.create({
      data: {
        id: ctData.id,
        name: ctData.name,
        berryFlavorId,
      },
    });

    // Create contest type names
    if (ctData.names && Array.isArray(ctData.names)) {
      for (const nameEntry of ctData.names) {
        const languageId = this.extractIdFromUrl(nameEntry.language.url);
        if (languageId) {
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.contestTypeName.create({
              data: {
                contestTypeId: ctData.id,
                languageId,
                name: nameEntry.name,
                color: nameEntry.color,
              },
            });
          }
        }
      }
    }
  }

  private async processContestEffect(ce: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const ceData = await this.fetchWithProxy(ce.url, mode);

    await prisma.contestEffect.create({
      data: {
        id: ceData.id,
        appeal: ceData.appeal,
        jam: ceData.jam,
      },
    });

    // Create contest effect entries
    if (ceData.effect_entries && Array.isArray(ceData.effect_entries)) {
      for (const effectEntry of ceData.effect_entries) {
        const languageId = this.extractIdFromUrl(effectEntry.language.url);
        if (languageId) {
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.contestEffectEntry.create({
              data: {
                contestEffectId: ceData.id,
                languageId,
                effect: effectEntry.effect,
              },
            });
          }
        }
      }
    }

    // Create contest effect flavor texts
    if (ceData.flavor_text_entries && Array.isArray(ceData.flavor_text_entries)) {
      for (const flavorEntry of ceData.flavor_text_entries) {
        const languageId = this.extractIdFromUrl(flavorEntry.language.url);
        if (languageId) {
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.contestEffectFlavorText.create({
              data: {
                contestEffectId: ceData.id,
                languageId,
                flavorText: flavorEntry.flavor_text,
              },
            });
          }
        }
      }
    }
  }

  private async processSuperContestEffect(sce: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const sceData = await this.fetchWithProxy(sce.url, mode);

    await prisma.superContestEffect.create({
      data: {
        id: sceData.id,
        appeal: sceData.appeal,
      },
    });

    // Create super contest effect flavor texts
    if (sceData.flavor_text_entries && Array.isArray(sceData.flavor_text_entries)) {
      for (const flavorEntry of sceData.flavor_text_entries) {
        const languageId = this.extractIdFromUrl(flavorEntry.language.url);
        if (languageId) {
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.superContestEffectFlavorText.create({
              data: {
                superContestEffectId: sceData.id,
                languageId,
                flavorText: flavorEntry.flavor_text,
              },
            });
          }
        }
      }
    }
  }

  private async processItemPocket(pocket: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const pocketData = await this.fetchWithProxy(pocket.url, mode);
    await prisma.itemPocket.upsert({
      where: { id: pocketData.id },
      update: { name: pocketData.name },
      create: { id: pocketData.id, name: pocketData.name },
    });
  }

  private async processItemCategory(category: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const categoryData = await this.fetchWithProxy(category.url, mode);

    // Required field
    const pocketId = this.extractIdFromUrl(categoryData.pocket.url);
    if (!pocketId) {
      throw new Error(`Missing pocket ID for category ${categoryData.name}`);
    }

    await prisma.itemCategory.upsert({
      where: { id: categoryData.id },
      update: {
        name: categoryData.name,
        pocketId: pocketId,
      },
      create: {
        id: categoryData.id,
        name: categoryData.name,
        pocketId: pocketId,
      },
    });
  }

  private async processItemFlingEffect(flingEffect: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const flingEffectData = await this.fetchWithProxy(flingEffect.url, mode);
    await prisma.itemFlingEffect.upsert({
      where: { id: flingEffectData.id },
      update: { name: flingEffectData.name },
      create: {
        id: flingEffectData.id,
        name: flingEffectData.name,
      },
    });

    // Create fling effect entries
    if (flingEffectData.effect_entries && Array.isArray(flingEffectData.effect_entries)) {
      for (const flingEffectEntry of flingEffectData.effect_entries) {
        const languageId = this.extractIdFromUrl(flingEffectEntry.language.url);
        if (languageId) {
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            console.log({ languageId, itemFlingEffectId: flingEffectData.id, effect: flingEffectEntry.effect });
            await prisma.itemFlingEffectEffectText.upsert({
              where: {
                itemFlingEffectId_languageId: {
                  itemFlingEffectId: flingEffectData.id,
                  languageId,
                },
              },
              update: { effect: flingEffectEntry.effect },
              create: {
                itemFlingEffectId: flingEffectData.id,
                languageId,
                effect: flingEffectEntry.effect,
              },
            });
          }
        }
      }
    }
  }

  private async processEncounterCondition(condition: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const conditionData = await this.fetchWithProxy(condition.url, mode);

    // Create the encounter condition
    await prisma.encounterCondition.upsert({
      where: { id: conditionData.id },
      update: { name: conditionData.name },
      create: {
        id: conditionData.id,
        name: conditionData.name,
      },
    });

    // Create encounter condition names
    if (conditionData.names && Array.isArray(conditionData.names)) {
      for (const nameEntry of conditionData.names) {
        const languageId = this.extractIdFromUrl(nameEntry.language.url);
        if (languageId) {
          const languageExists = await prisma.language.findUnique({
            where: { id: languageId },
            select: { id: true },
          });

          if (languageExists) {
            await prisma.encounterConditionName.upsert({
              where: {
                encounterConditionId_languageId: {
                  encounterConditionId: conditionData.id,
                  languageId,
                },
              },
              update: { name: nameEntry.name },
              create: {
                encounterConditionId: conditionData.id,
                languageId,
                name: nameEntry.name,
              },
            });
          }
        }
      }
    }

    // Create encounter condition values
    if (conditionData.values && Array.isArray(conditionData.values)) {
      for (const valueRef of conditionData.values) {
        const valueData = await this.fetchWithProxy(valueRef.url, mode);

        await prisma.encounterConditionValue.upsert({
          where: { id: valueData.id },
          update: {
            name: valueData.name,
            encounterConditionId: conditionData.id,
            isDefault: valueData.is_default,
          },
          create: {
            id: valueData.id,
            name: valueData.name,
            encounterConditionId: conditionData.id,
            isDefault: valueData.is_default,
          },
        });

        // Create encounter condition value names
        if (valueData.names && Array.isArray(valueData.names)) {
          for (const nameEntry of valueData.names) {
            const languageId = this.extractIdFromUrl(nameEntry.language.url);
            if (languageId) {
              const languageExists = await prisma.language.findUnique({
                where: { id: languageId },
                select: { id: true },
              });

              if (languageExists) {
                await prisma.encounterConditionValueName.upsert({
                  where: {
                    encounterConditionValueId_languageId: {
                      encounterConditionValueId: valueData.id,
                      languageId,
                    },
                  },
                  update: { name: nameEntry.name },
                  create: {
                    encounterConditionValueId: valueData.id,
                    languageId,
                    name: nameEntry.name,
                  },
                });
              }
            }
          }
        }
      }
    }
  }

  private async processEvolutionTrigger(trigger: NamedAPIResource, mode: "premium" | "standard"): Promise<void> {
    const triggerData = await this.fetchWithProxy(trigger.url, mode);

    await prisma.evolutionTrigger.upsert({
      where: { id: triggerData.id },
      update: { name: triggerData.name },
      create: {
        id: triggerData.id,
        name: triggerData.name,
      },
    });
  }

  // ======================================================
  //                Helper Methods
  // ======================================================

  // Configuration for all major models

  async debugMoveMetaRecords(): Promise<void> {
    this.log("Debugging move meta records...");

    try {
      // Check what move meta ailments exist
      const ailments = await prisma.moveMetaAilment.findMany({
        orderBy: { id: "asc" },
        take: 10,
      });
      this.log(`Found ${ailments.length} move meta ailments:`);
      ailments.forEach((ailment: { id: number; name: string }) => {
        this.log(`  - ID ${ailment.id}: ${ailment.name}`);
      });

      // Check what move meta categories exist
      const categories = await prisma.moveMetaCategory.findMany({
        orderBy: { id: "asc" },
        take: 10,
      });
      this.log(`Found ${categories.length} move meta categories:`);
      categories.forEach((category: { id: number; name: string }) => {
        this.log(`  - ID ${category.id}: ${category.name}`);
      });

      // Check if ID 0 specifically exists
      const ailment0 = await prisma.moveMetaAilment.findUnique({
        where: { id: 0 },
      });
      const category0 = await prisma.moveMetaCategory.findUnique({
        where: { id: 0 },
      });

      // Always create the "none" ailment with ID 0 if it doesn't exist
      if (!ailment0) {
        this.log("Creating default 'none' ailment with ID 0");
        await prisma.moveMetaAilment.create({
          data: { id: 0, name: "none" },
        });
      }

      // Always create the "damage" category with ID 0 if it doesn't exist
      if (!category0) {
        this.log("Creating default 'damage' category with ID 0");
        await prisma.moveMetaCategory.create({
          data: { id: 0, name: "damage" },
        });
      }

      // Re-check after creation
      const finalAilment0 = await prisma.moveMetaAilment.findUnique({
        where: { id: 0 },
      });
      const finalCategory0 = await prisma.moveMetaCategory.findUnique({
        where: { id: 0 },
      });

      this.log(`✅ Final check - Ailment ID 0: ${!!finalAilment0}, Category ID 0: ${!!finalCategory0}`);
    } catch (error: unknown) {
      this.log(`❌ Error debugging meta records: ${(error as Error).message}`, "error");
      throw error;
    }
  }

  async getDefaultMetaIds(): Promise<{
    ailmentId: number;
    categoryId: number;
  }> {
    // Always use ID 0 for defaults since we ensure they exist
    const ailment0 = await prisma.moveMetaAilment.findUnique({
      where: { id: 0 },
    });
    const category0 = await prisma.moveMetaCategory.findUnique({
      where: { id: 0 },
    });

    if (!ailment0 || !category0) {
      throw new Error("Default meta records with ID 0 not found - run debugMoveMetaRecords first");
    }

    this.log(`Using default meta IDs - Ailment: 0 (${ailment0.name}), Category: 0 (${category0.name})`);

    return {
      ailmentId: 0,
      categoryId: 0,
    };
  }
}
