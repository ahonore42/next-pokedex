/*
  Warnings:

  - You are about to drop the column `order` on the `generations` table. All the data in the column will be lost.
  - You are about to drop the `generation_names` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `region_names` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "generation_names" DROP CONSTRAINT "generation_names_generation_id_fkey";

-- DropForeignKey
ALTER TABLE "generation_names" DROP CONSTRAINT "generation_names_language_id_fkey";

-- DropForeignKey
ALTER TABLE "region_names" DROP CONSTRAINT "region_names_language_id_fkey";

-- DropForeignKey
ALTER TABLE "region_names" DROP CONSTRAINT "region_names_region_id_fkey";

-- AlterTable
ALTER TABLE "generations" DROP COLUMN "order";

-- DropTable
DROP TABLE "generation_names";

-- DropTable
DROP TABLE "region_names";
