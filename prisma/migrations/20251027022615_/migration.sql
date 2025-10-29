/*
  Warnings:

  - You are about to drop the column `location` on the `sector` table. All the data in the column will be lost.
  - Added the required column `description` to the `Sector` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `sector` DROP COLUMN `location`,
    ADD COLUMN `description` VARCHAR(191) NOT NULL;
