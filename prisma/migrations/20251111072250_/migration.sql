/*
  Warnings:

  - You are about to drop the column `location` on the `ppa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ppa` DROP COLUMN `location`,
    ADD COLUMN `archivedAt` DATETIME(3) NULL;
