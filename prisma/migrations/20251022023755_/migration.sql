/*
  Warnings:

  - Added the required column `expectedOuput` to the `PPA` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ppa` ADD COLUMN `expectedOuput` VARCHAR(191) NOT NULL,
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `venue` VARCHAR(191) NULL;
