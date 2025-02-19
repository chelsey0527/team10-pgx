/*
  Warnings:

  - You are about to drop the column `stallNumber` on the `Garage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `EntranceAndExit` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `EntranceAndExit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `color` on table `EntranceAndExit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tag` on table `Garage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `color` on table `Garage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `zone` on table `Garage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `spots` on table `Garage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "EntranceAndExit" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "color" SET NOT NULL;

-- AlterTable
ALTER TABLE "Garage" DROP COLUMN "stallNumber",
ALTER COLUMN "tag" SET NOT NULL,
ALTER COLUMN "color" SET NOT NULL,
ALTER COLUMN "zone" SET NOT NULL,
ALTER COLUMN "spots" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EntranceAndExit_name_key" ON "EntranceAndExit"("name");

-- CreateIndex
CREATE INDEX "EntranceAndExit_color_idx" ON "EntranceAndExit"("color");

-- CreateIndex
CREATE INDEX "Garage_color_tag_idx" ON "Garage"("color", "tag");

-- CreateIndex
CREATE INDEX "Garage_zone_spots_idx" ON "Garage"("zone", "spots");
