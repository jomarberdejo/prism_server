/*
  Warnings:

  - You are about to drop the column `sectorId` on the `implementingunit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `implementingunit` DROP FOREIGN KEY `ImplementingUnit_sectorId_fkey`;

-- DropIndex
DROP INDEX `ImplementingUnit_sectorId_fkey` ON `implementingunit`;

-- AlterTable
ALTER TABLE `implementingunit` DROP COLUMN `sectorId`;
