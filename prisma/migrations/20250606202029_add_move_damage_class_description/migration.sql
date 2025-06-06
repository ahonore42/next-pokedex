/*
  Warnings:

  - You are about to drop the column `description` on the `move_damage_class_names` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "move_damage_class_names" DROP COLUMN "description";

-- CreateTable
CREATE TABLE "move_damage_class_descriptions" (
    "move_damage_class_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "move_damage_class_descriptions_pkey" PRIMARY KEY ("move_damage_class_id","language_id")
);

-- AddForeignKey
ALTER TABLE "move_damage_class_descriptions" ADD CONSTRAINT "move_damage_class_descriptions_move_damage_class_id_fkey" FOREIGN KEY ("move_damage_class_id") REFERENCES "move_damage_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_damage_class_descriptions" ADD CONSTRAINT "move_damage_class_descriptions_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
