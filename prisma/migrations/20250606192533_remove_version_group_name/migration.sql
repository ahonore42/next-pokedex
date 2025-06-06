/*
  Warnings:

  - You are about to drop the `version_group_names` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "version_group_names" DROP CONSTRAINT "version_group_names_language_id_fkey";

-- DropForeignKey
ALTER TABLE "version_group_names" DROP CONSTRAINT "version_group_names_version_group_id_fkey";

-- DropTable
DROP TABLE "version_group_names";
