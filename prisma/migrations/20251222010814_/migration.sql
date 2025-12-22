/*
  Warnings:

  - You are about to drop the column `lastNotifiedAt` on the `ppa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ppa` DROP COLUMN `lastNotifiedAt`,
    ADD COLUMN `dayBeforeNotifiedAt` DATETIME(3) NULL,
    ADD COLUMN `hourBeforeNotifiedAt` DATETIME(3) NULL;
