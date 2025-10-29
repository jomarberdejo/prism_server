/*
  Warnings:

  - You are about to drop the column `expectedOuput` on the `ppa` table. All the data in the column will be lost.
  - Added the required column `expectedOutput` to the `PPA` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ppa` DROP COLUMN `expectedOuput`,
    ADD COLUMN `expectedOutput` VARCHAR(191) NOT NULL;
