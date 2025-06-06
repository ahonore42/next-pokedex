/*
  Warnings:

  - You are about to drop the column `machine_number` on the `machines` table. All the data in the column will be lost.
  - You are about to drop the `machine_version_group_names` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "machine_version_group_names" DROP CONSTRAINT "machine_version_group_names_language_id_fkey";

-- AlterTable
ALTER TABLE "machines" DROP COLUMN "machine_number";

-- DropTable
DROP TABLE "machine_version_group_names";
