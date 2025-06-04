/*
  Warnings:

  - You are about to drop the column `move_effect_id` on the `moves` table. All the data in the column will be lost.
  - You are about to drop the `move_effect_prose` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `move_effects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "move_effect_prose" DROP CONSTRAINT "move_effect_prose_language_id_fkey";

-- DropForeignKey
ALTER TABLE "move_effect_prose" DROP CONSTRAINT "move_effect_prose_move_effect_id_fkey";

-- DropForeignKey
ALTER TABLE "moves" DROP CONSTRAINT "moves_move_effect_id_fkey";

-- AlterTable
ALTER TABLE "moves" DROP COLUMN "move_effect_id";

-- DropTable
DROP TABLE "move_effect_prose";

-- DropTable
DROP TABLE "move_effects";

-- CreateTable
CREATE TABLE "move_effect_entries" (
    "move_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "effect" TEXT,
    "short_effect" TEXT,

    CONSTRAINT "move_effect_entries_pkey" PRIMARY KEY ("move_id","language_id")
);

-- AddForeignKey
ALTER TABLE "move_effect_entries" ADD CONSTRAINT "move_effect_entries_move_id_fkey" FOREIGN KEY ("move_id") REFERENCES "moves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_effect_entries" ADD CONSTRAINT "move_effect_entries_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
