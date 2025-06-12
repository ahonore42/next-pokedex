-- DropForeignKey
ALTER TABLE "locations" DROP CONSTRAINT "locations_region_id_fkey";

-- AlterTable
ALTER TABLE "locations" ALTER COLUMN "region_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
