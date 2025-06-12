/*
  Warnings:

  - You are about to drop the `evolution_trigger_names` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "evolution_trigger_names" DROP CONSTRAINT "evolution_trigger_names_evolution_trigger_id_fkey";

-- DropForeignKey
ALTER TABLE "evolution_trigger_names" DROP CONSTRAINT "evolution_trigger_names_language_id_fkey";

-- DropTable
DROP TABLE "evolution_trigger_names";
